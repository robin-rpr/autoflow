import { useState, useCallback } from 'react';
import './App.scss';
import Palette from './modules/Palette/Palette';
import Editor from './modules/Editor/Editor';
import Config from './modules/Config/Config';

const initialNodes = [
  {
    id: 'example-1',
    type: 'httpNode',
    position: { x: 250, y: 50 },
    data: { 
      label: 'Fetch Orders',
      method: 'GET',
      url: 'https://api.example.com/orders'
    },
  },
];

const initialEdges = [];

let id = 1;
const getId = () => `node_${id++}`;

function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);

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
    console.log('Save');
  }, []);

  const handleExecute = useCallback(() => {
    console.log('Execute');
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
          <button onClick={handleSave} className="controls__button">Save</button>
          <button onClick={handleExecute} className="controls__button controls__button--primary">Execute</button>
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
    </div>
  );
}

export default App;
