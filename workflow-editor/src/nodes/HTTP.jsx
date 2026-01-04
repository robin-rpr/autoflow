import { Handle, Position } from 'reactflow';
import './Node.scss';

export default function HTTP({ data, selected }) {
  const displayLabel = data.label || 'HTTP Request';
  
  return (
    <div className={`custom-node custom-node--http ${selected ? 'custom-node--selected' : ''}`}>
      <div className="custom-node__header">
        <span className="custom-node__icon">🌐</span>
        <span className="custom-node__title">{displayLabel}</span>
      </div>
      <div className="custom-node__body">
        <div className="custom-node__info">
          {data.method && <span className="badge badge--method">{data.method}</span>}
          {data.url && <div className="custom-node__url">{data.url}</div>}
          {data.headers && (
            <div className="custom-node__detail">
              <small>Custom headers configured</small>
            </div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} id="output" />
    </div>
  );
}
