/**
 * Workflow Executor.
 * Executes a DAG-based workflow by running nodes in topological order
 */

/**
 * Performs topological sort on the workflow DAG
 * Returns nodes in execution order (dependencies first)
 */
export function topologicalSort(nodes, edges) {
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  const inDegree = new Map();
  const adjacencyList = new Map();
  
  // Initialize
  nodes.forEach(node => {
    inDegree.set(node.id, 0);
    adjacencyList.set(node.id, []);
  });
  
  // Build graph
  edges.forEach(edge => {
    adjacencyList.get(edge.source).push(edge.target);
    inDegree.set(edge.target, inDegree.get(edge.target) + 1);
  });
  
  // Find nodes with no dependencies
  const queue = [];
  nodes.forEach(node => {
    if (inDegree.get(node.id) === 0) {
      queue.push(node.id);
    }
  });
  
  const sorted = [];
  while (queue.length > 0) {
    const nodeId = queue.shift();
    sorted.push(nodeMap.get(nodeId));
    
    // Reduce in-degree for neighbors
    adjacencyList.get(nodeId).forEach(neighborId => {
      inDegree.set(neighborId, inDegree.get(neighborId) - 1);
      if (inDegree.get(neighborId) === 0) {
        queue.push(neighborId);
      }
    });
  }
  
  return sorted;
}

/**
 * Execute an HTTP request node
 */
async function executeHttpNode(node, inputs) {
  const { method = 'GET', url, headers = {} } = node.data;
  
  if (!url) {
    throw new Error('HTTP node requires a URL');
  }
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...parseHeaders(headers),
      },
    };
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    return {
      status: response.status,
      statusText: response.statusText,
      data,
    };
  } catch (error) {
    throw new Error(`HTTP request failed: ${error.message}`);
  }
}

/**
 * Execute a transform node
 */
function executeTransformNode(node, inputs, sourceNodeIds = []) {
  const { transformLogic } = node.data;
  
  if (!transformLogic) {
    return inputs[0] || null;
  }
  
  try {
    // Create context with upstream node references
    const context = { inputs };
    
    // Add $nodeId references for each source node
    sourceNodeIds.forEach((nodeId, index) => {
      if (inputs[index] !== undefined) {
        context[`$${nodeId}`] = inputs[index];
      }
    });
    
    // Execute transform logic
    const func = new Function('context', `
      with(context) {
        return ${transformLogic};
      }
    `);
    
    return func(context);
  } catch (error) {
    throw new Error(`Transform failed: ${error.message}`);
  }
}

/**
 * Execute a filter node
 */
function executeFilterNode(node, inputs) {
  const { filterType = 'array', condition, fields } = node.data;
  let input = inputs[0];
  
  if (!input) {
    return null;
  }
  
  try {
    // If input is a response object from HTTP node, extract the data
    if (input && typeof input === 'object' && 'data' in input && Array.isArray(input.data)) {
      input = input.data;
    }
    
    if (filterType === 'array') {
      // Filter array based on condition
      if (!Array.isArray(input)) {
        throw new Error(`Filter input must be an array, got ${typeof input}`);
      }
      
      if (!condition) {
        return input;
      }
      
      // Create filter function
      const filterFunc = new Function('item', `
        return ${condition};
      `);
      
      return input.filter(filterFunc);
    } else if (filterType === 'object') {
      // Remove fields from object
      if (typeof input !== 'object') {
        throw new Error('Filter input must be an object');
      }
      
      if (!fields) {
        return input;
      }
      
      const fieldsToRemove = fields.split(',').map(f => f.trim());
      const result = { ...input };
      fieldsToRemove.forEach(field => {
        delete result[field];
      });
      
      return result;
    }
    
    return input;
  } catch (error) {
    throw new Error(`Filter failed: ${error.message}`);
  }
}

/**
 * Execute a single node
 */
async function executeNode(node, inputs, sourceNodeIds = []) {
  switch (node.type) {
    case 'httpNode':
      return await executeHttpNode(node, inputs);
    case 'transformNode':
      return executeTransformNode(node, inputs, sourceNodeIds);
    case 'filterNode':
      return executeFilterNode(node, inputs);
    default:
      throw new Error(`Unknown node type: ${node.type}`);
  }
}

/**
 * Execute the entire workflow
 */
export async function execute(nodes, edges, onProgress) {
  const sortedNodes = topologicalSort(nodes, edges);
  const results = new Map();
  const errors = new Map();
  
  // Build edge map for quick lookup
  const edgeMap = new Map();
  edges.forEach(edge => {
    if (!edgeMap.has(edge.target)) {
      edgeMap.set(edge.target, []);
    }
    edgeMap.get(edge.target).push(edge.source);
  });
  
  // Execute nodes in order
  for (const node of sortedNodes) {
    try {
      // Notify progress
      if (onProgress) {
        onProgress(node.id, 'running');
      }
      
      // Get inputs from upstream nodes
      const sourceNodes = edgeMap.get(node.id) || [];
      const inputs = sourceNodes.map(sourceId => results.get(sourceId));
      
      // Execute node
      const result = await executeNode(node, inputs, sourceNodes);
      results.set(node.id, result);
      
      // Notify success
      if (onProgress) {
        onProgress(node.id, 'success', result);
      }
    } catch (error) {
      errors.set(node.id, error.message);
      
      // Notify error
      if (onProgress) {
        onProgress(node.id, 'error', error.message);
      }
      
      // Continue execution
      // ...
    }
  }
  
  return {
    results: Object.fromEntries(results),
    errors: Object.fromEntries(errors),
  };
}

/**
 * Parse headers string into object
 */
function parseHeaders(headers) {
  if (typeof headers === 'object') {
    return headers;
  }
  
  if (typeof headers === 'string') {
    try {
      return JSON.parse(headers);
    } catch {
      // Parse as key:value pairs
      const result = {};
      headers.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length > 0) {
          result[key.trim()] = valueParts.join(':').trim();
        }
      });
      return result;
    }
  }
  
  return {};
}
