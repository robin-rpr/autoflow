import { Handle, Position } from 'reactflow';
import './Node.scss';

export default function Filter({ data, selected }) {
  const displayLabel = data.label || 'Filter';
  const borderColor = '#a187e3';

  return (
    <div
      className={`node node--filter ${selected ? 'node--selected' : ''}`}
      style={{ borderLeftColor: borderColor }}
    >
      <div className="node__header">
        <img className="header__icon" src="filter.svg" alt="Filter" />
        <span className="header__title">{displayLabel}</span>
      </div>
      <div className="node__body">
        <div className="body__info">
          {data.filterType && (
            <span className="info__badge info__badge--filter-type">
              {data.filterType === 'array' ? 'Array' : 'Object'}
            </span>
          )}
          {data.condition && <div className="info__condition">{data.condition}</div>}
          {data.fields && <div className="info__fields"><small>{data.fields}</small></div>}
        </div>
      </div>
      <Handle type="target" position={Position.Top} id="input" />
      <Handle type="source" position={Position.Bottom} id="output" />
    </div>
  );
}
