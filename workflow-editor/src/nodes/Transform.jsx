import { Handle, Position } from 'reactflow';
import './Node.scss';

export default function Transform({ data, selected }) {
  const displayLabel = data.label || 'Transform';
  
  return (
    <div className={`custom-node custom-node--transform ${selected ? 'custom-node--selected' : ''}`}>
      <div className="custom-node__header">
        <span className="custom-node__icon">⚙️</span>
        <span className="custom-node__title">{displayLabel}</span>
      </div>
      <div className="custom-node__body">
        <div className="custom-node__info">
          {data.description && <div className="custom-node__description">{data.description}</div>}
          {data.upstreamRefs && data.upstreamRefs.length > 0 && (
            <div className="custom-node__refs">
              <small>References: {data.upstreamRefs.join(', ')}</small>
            </div>
          )}
        </div>
      </div>
      <Handle type="target" position={Position.Top} id="input" />
      <Handle type="source" position={Position.Bottom} id="output" />
    </div>
  );
}
