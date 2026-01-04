import { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './Editor.scss';

import HTTP from '../../nodes/HTTP';
import Transform from '../../nodes/Transform';
import Filter from '../../nodes/Filter';

const nodeTypes = {
  httpNode: HTTP,
  transformNode: Transform,
  filterNode: Filter,
};

export default function Editor({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onPaneClick,
  onNodeDrop,
}) {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // Detect if adding an edge would create a cycle
  const wouldCreateCycle = useCallback((source, target, currentEdges) => {
    // Build adjacency list from current edges
    const adjacencyList = {};
    currentEdges.forEach(edge => {
      if (!adjacencyList[edge.source]) {
        adjacencyList[edge.source] = [];
      }
      adjacencyList[edge.source].push(edge.target);
    });

    // Check if there's a path from target to source (which would create a cycle)
    const visited = new Set();
    const stack = [target];

    while (stack.length > 0) {
      const current = stack.pop();
      
      if (current === source) {
        return true; // Cycle detected
      }

      if (visited.has(current)) {
        continue;
      }

      visited.add(current);

      if (adjacencyList[current]) {
        stack.push(...adjacencyList[current]);
      }
    }

    return false; // No cycle
  }, []);

  const handleNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes, applyNodeChanges);
    },
    [onNodesChange]
  );

  const handleEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes, applyEdgeChanges);
    },
    [onEdgesChange]
  );

  const handleConnect = useCallback(
    (params) => {
      // Check if connection would create a cycle (DAG validation)
      if (wouldCreateCycle(params.source, params.target, edges)) {
        console.warn('Connection rejected: would create a cycle');
        return;
      }

      const edge = {
        ...params,
        type: 'smoothstep',
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
      };
      
      onConnect(edge, addEdge);
    },
    [edges, onConnect, wouldCreateCycle]
  );

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      onNodeDrop(type, position);
    },
    [reactFlowInstance, onNodeDrop]
  );

  return (
    <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onInit={setReactFlowInstance}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        nodeTypes={nodeTypes}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
      >
        <Background variant="dots" gap={12} size={1} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
