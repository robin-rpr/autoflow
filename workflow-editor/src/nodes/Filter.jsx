import { Handle, Position } from 'reactflow';
import './Node.scss';

export default function Filter({ data, selected }) {
  const displayLabel = data.label || 'Filter';
  
  return (
    <div className={`custom-node custom-node--filter ${selected ? 'custom-node--selected' : ''}`}>
      <div className="custom-node__header">
        <img className="custom-node__icon" src="filter.svg" alt="Filter" />
        <span className="custom-node__title">{displayLabel}</span>
      </div>
      <div className="custom-node__body">
        <div className="custom-node__info">
          {data.filterType && (
            <span className="badge badge--filter-type">{data.filterType === 'array' ? 'Array' : 'Object'}</span>
          )}
          {data.condition && <div className="custom-node__condition">{data.condition}</div>}
          {data.fields && <div className="custom-node__fields"><small>{data.fields}</small></div>}
        </div>
      </div>
      <Handle type="target" position={Position.Top} id="input" />
      <Handle type="source" position={Position.Bottom} id="output" />
    </div>
  );
}
