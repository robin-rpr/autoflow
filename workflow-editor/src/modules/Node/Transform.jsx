import { Handle, Position } from 'reactflow';
import './Node.scss';

export default function Transform({ data, selected }) {
  const displayLabel = data.label || 'Transform';
  const borderColor = '#0659f3';

  return (
    <div
      className={`node node--transform ${selected ? 'node--selected' : ''}`}
      style={{ borderLeftColor: borderColor }}
    >
      <div className="node__header">
        <img className="header__icon" src="gear.svg" alt="Transform" />
        <span className="header__title">{displayLabel}</span>
      </div>
      <div className="node__body">
        <div className="body__info">
          {data.description && <div className="info__description">{data.description}</div>}
          {data.upstreamRefs && data.upstreamRefs.length > 0 && (
            <div className="info__refs">
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
