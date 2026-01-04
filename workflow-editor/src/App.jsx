import { useState, useCallback, useEffect } from 'react';
import './App.scss';
import Palette from './modules/Palette/Palette';
import Editor from './modules/Editor/Editor';
import Config from './modules/Config/Config';
import Results from './components/Results/Results';
import { execute } from './utils/executor';

const STORAGE_KEY = 'workflow';

const initialNodes = [
  {
    id: 'node_1',
    type: 'httpNode',
    position: { x: 50, y: 50 },
    data: { 
      label: 'Fetch Weather',
      method: 'GET',
      url: 'https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m',
      headers: ''
    },
  },
  {
    id: 'node_2',
    type: 'httpNode',
    position: { x: 400, y: 50 },
    data: { 
      label: 'Fetch Clothing Products',
      method: 'GET',
      url: 'https://fakestoreapi.com/products/category/men\'s%20clothing',
      headers: ''
    },
  },
  {
    id: 'node_3',
    type: 'transformNode',
    position: { x: 50, y: 250 },
    data: { 
      label: 'Determine Season',
      description: 'Check if temperature > 20°C for summer',
      transformLogic: 'inputs[0].data.current.temperature_2m > 20 ? "summer" : "winter"',
      nodeRefs: ''
    },
  },
  {
    id: 'node_4',
    type: 'filterNode',
    position: { x: 225, y: 450 },
    data: { 
      label: 'Filter by Season',
      filterType: 'array',
      condition: 'item.category === "men\'s clothing"',
      fields: ''
    },
  },
];

const initialEdges = [
  {
    id: 'edge_1',
    source: 'node_1',
    target: 'node_3',
    type: 'smoothstep',
    animated: true,
    markerEnd: {
      type: 'arrowclosed',
      color: '#000000',
    },
  },
  {
    id: 'edge_2',
    source: 'node_2',
    target: 'node_4',
    type: 'smoothstep',
    animated: true,
    markerEnd: {
      type: 'arrowclosed',
      color: '#000000',
    },
  },
  {
    id: 'edge_3',
    source: 'node_3',
    target: 'node_4',
    type: 'smoothstep',
    animated: true,
    markerEnd: {
      type: 'arrowclosed',
      color: '#000000',
    },
  },
];

let id = 4;
const getId = () => `node_${id++}`;

function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [workflowResults, setWorkflowResults] = useState(null);
  const [workflowErrors, setWorkflowErrors] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Load saved.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.nodes) setNodes(data.nodes);
        if (data.edges) setEdges(data.edges);
        // Update id counter to avoid conflicts
        const maxId = Math.max(
          0,
          ...data.nodes.map(n => {
            const match = n.id.match(/node_(\d+)/);
            return match ? parseInt(match[1]) : 0;
          })
        );
        id = maxId + 1;
      }
    } catch (error) {
      console.error('Failed to load workflow:', error);
    }
  }, []);

  const handleNodesChange = useCallback((changes, applyChanges) => {
    setNodes((nds) => applyChanges(changes, nds));
  }, []);

  const handleEdgesChange = useCallback((changes, applyChanges) => {
    setEdges((eds) => applyChanges(changes, eds));
  }, []);

  const handleConnect = useCallback((connection, addEdgeCallback) => {
    setEdges((eds) => addEdgeCallback(connection, eds));
  }, []);

  const handleNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleNodeDrop = useCallback((type, position) => {
    const newNode = {
      id: getId(),
      type,
      position,
      data: {
        label:
          type === 'httpNode'
            ? 'HTTP Request'
            : type === 'transformNode'
            ? 'Transform'
            : type === 'filterNode'
            ? 'Filter'
            : `${type} node`
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, []);

  const handleNodeUpdate = useCallback((nodeId, newData) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: newData,
          };
        }
        return node;
      })
    );
  }, []);

  const handleConfigClose = useCallback(() => {
    setSelectedNode(null);
  }, []); 

  const handleSave = useCallback(() => {
    try {
      const data = {
        nodes,
        edges,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      
      // Visual feedback
      const button = document.querySelector('.controls__button:not(.controls__button--primary)');
      if (button) {
        const originalText = button.textContent;
        button.textContent = 'Saved';
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to save workflow:', error);
      alert('Failed to save workflow');
    }
  }, [nodes, edges]);

  const handleExecute = useCallback(async () => {
    if (nodes.length === 0) {
      alert('No nodes to execute');
      return;
    }

    setIsExecuting(true);
    setWorkflowResults(null);
    setWorkflowErrors(null);

    try {
      const { results, errors } = await execute(nodes, edges);
      setWorkflowResults(results);
      setWorkflowErrors(errors);
    } catch (error) {
      console.error('Workflow execution failed:', error);
      setWorkflowErrors({ _global: error.message });
    } finally {
      setIsExecuting(false);
    }
  }, [nodes, edges]);

  const handleCloseResults = useCallback(() => {
    setWorkflowResults(null);
    setWorkflowErrors(null);
  }, []);

  return (
    <div className="app">
      {/* Header */}
      <header className="app__header">
        <img src="logo.svg" alt="Logo" className="header__logo" />
        <div className="header__about">
          <h1 className="about__title">Weather Outfit Analysis</h1>
          <div className="about__delimiter"></div>
          <p className="about__subtitle">Find the best outfit based on the weather</p>
        </div>
        <div className="header__controls">
          <button onClick={handleSave} className="controls__button">
            Save
          </button>
          <button 
            onClick={handleExecute} 
            className="controls__button controls__button--primary"
            disabled={isExecuting}
          >
            {isExecuting ? 'Running...' : 'Execute'}
          </button>
        </div>
      </header>
      {/* Content */}
      <div className="app__content">
        <div className="content__sidebar">
          <Palette />
        </div>
        <div className="content__canvas">
          <Editor
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={handleConnect}
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
            onNodeDrop={handleNodeDrop}
          />
        </div>
        <div className="content__config">
          <Config
            node={selectedNode}
            onUpdate={handleNodeUpdate}
            onClose={handleConfigClose}
          />
        </div>
      </div>

      {/* Results */}
      {(workflowResults || workflowErrors) && (
        <Results
          results={workflowResults}
          errors={workflowErrors}
          onClose={handleCloseResults}
        />
      )}
    </div>
  );
}

export default App;
