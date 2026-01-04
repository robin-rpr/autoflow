import { Handle, Position } from 'reactflow';
import './Node.scss';

export default function HTTP({ data, selected }) {
  const displayLabel = data.label || 'HTTP Request';
  const borderColor = '#3649d7';
  
  return (
    <div
      className={`node node--http ${selected ? 'node--selected' : ''}`}
      style={{ borderLeftColor: borderColor }}
    >
      <div className="node__header">
        <img className="header__icon" src="globe.svg" alt="HTTP Request" />
        <span className="header__title">{displayLabel}</span>
      </div>
      <div className="node__body">
        <div className="body__info">
          {data.method && <span className="info__badge info__badge--method">{data.method}</span>}
          {data.url && <div className="info__url">{data.url}</div>}
          {data.headers && (
            <div className="info__detail">
              <small>Custom headers configured</small>
            </div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} id="output" />
    </div>
  );
}
