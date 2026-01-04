import './Palette.scss';

export default function Palette() {
  // On drag start.
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Node types.
  const nodeTypes = [
    { type: 'httpNode', label: 'HTTP Request', icon: 'globe.svg', color: '#3649d7' },
    { type: 'transformNode', label: 'Transform', icon: 'gear.svg', color: '#0659f3' },
    { type: 'filterNode', label: 'Filter', icon: 'filter.svg', color: '#a187e3' },
  ];

  // Render.
  return (
    <div className="palette">
      {/* Title */}
      <h3 className="palette__title">Node Palette</h3>
      <p className="palette__description">Drag nodes onto the canvas</p>
      {/* Items */}
      <div className="palette__items">
        {nodeTypes.map((node) => (
          <div
            key={node.type}
            className="items__item"
            draggable
            onDragStart={(event) => onDragStart(event, node.type)}
            style={{ borderLeftColor: node.color }}
          >
            <img className="item__icon" src={node.icon} alt="Icon" />
            <span className="item__label">{node.label}</span>
          </div>
        ))}
      </div>
      {/* Info */}
      <div className="palette__info">
        <h4 className="info__title">Need Help?</h4>
        <div className="info__content">
           Drag a node onto the canvas, then connect, configure, and remove nodes as needed to build your workflow.
        </div>
        {/* TODO(rroeper): This is a fantastic spot to capture lost/frustrated users.
                           Consider adding a help center link here. */}
      </div>
      {/* Legal */}
      <div className="palette__legal">
        <p>© {new Date().getFullYear()} Autoflow, Inc.</p>
        <p>All rights reserved.</p>
      </div>
    </div>
  );
}
