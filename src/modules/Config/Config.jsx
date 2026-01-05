import { useState, useEffect } from 'react';
import './Config.scss';
import JSON from '../../components/JSON/JSON';

export default function Config({ node, nodes = [], edges = [], onUpdate, onClose }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (node) {
      setFormData(node.data || {});
    }
  }, [node]);

  if (!node) {
    return (
      <div className="config config--empty">
        <p>Select a node to configure</p>
      </div>
    );
  }

  // Get upstream nodes
  const getUpstreamNodes = () => {
    const upstreamEdges = edges.filter(edge => edge.target === node.id);
    return upstreamEdges.map(edge => {
      const upstreamNode = nodes.find(n => n.id === edge.source);
      return {
        id: edge.source,
        label: upstreamNode?.data?.label || 'Unnamed Node'
      };
    });
  };

  const handleChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
  };

  const handleSave = () => {
    onUpdate(node.id, formData);
  };

  const renderHTTPConfig = () => (
    <>
      <div className="body__form">
        <label className="form__label">Method</label>
        <select
          className="form__select"
          value={formData.method || 'GET'}
          onChange={(e) => handleChange('method', e.target.value)}
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
        </select>
      </div>
      <div className="body__form">
        <label className="form__label">URL</label>
        <input
          className="form__input"
          type="text"
          value={formData.url || ''}
          onChange={(e) => handleChange('url', e.target.value)}
          placeholder="https://api.example.com/endpoint"
        />
      </div>
      <div className="body__form">
        <label className="form__label">Headers (JSON)</label>
        <JSON
          value={formData.headers || ''}
          onChange={(value) => handleChange('headers', value)}
          placeholder={'{\n  "Content-Type": "application/json"\n}'}
          rows={3}
        />
        <div className="form__help">
          <img src="info.svg" alt="Info" className="help__icon" />
          <p className="help__text">Optional JSON object for custom headers</p>
        </div>
      </div>
    </>
  );

  const renderTransformConfig = () => {
    const upstreamNodes = getUpstreamNodes();
    
    return (
      <>
        <div className="body__form">
          <label className="form__label">Description</label>
          <input
            className="form__input"
            type="text"
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="What does this transformation do?"
          />
        </div>
        
        {upstreamNodes.length > 0 && (
          <div className="body__form">
            <label className="form__label">Upstream Nodes</label>
            <div className="form__info">
              {upstreamNodes.map((upstream, index) => (
                <div key={upstream.id} className="info__row">
                  <span className="row__name">{upstream.label}</span>
                  <span className="row__reference">${upstream.id}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="body__form">
          <label className="form__label">Transform Logic (JavaScript)</label>
          <textarea
            className="form__textarea"
            value={formData.transformLogic || ''}
            onChange={(e) => handleChange('transformLogic', e.target.value)}
            placeholder={upstreamNodes.length > 0 
              ? `inputs[0].data // Access first upstream node\n$${upstreamNodes[0]?.id}.data` 
              : 'inputs[0] // Access upstream node data'}
            rows={8}
          />
          <div className="form__help">
            <img className="help__icon" src="info.svg" alt="Info" />
            <div className="help__text">
              Access upstream nodes using <code>inputs[index]</code> or <code>$node_id</code> syntax
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderFilterConfig = () => {
    const upstreamNodes = getUpstreamNodes();
    
    return (
      <>
        {upstreamNodes.length > 0 && (
          <div className="body__form">
            <label className="form__label">Upstream Nodes</label>
            <div className="form__info">
              {upstreamNodes.map((upstream, index) => (
                <div key={upstream.id} className="info__row">
                  <span className="row__name">{upstream.label}</span>
                  <span className="row__reference">${upstream.id}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="body__form">
          <label className="form__label">Filter Type</label>
          <select
            className="form__select"
            value={formData.filterType || 'array'}
            onChange={(e) => handleChange('filterType', e.target.value)}
          >
            <option value="array">Array Filter (filter items based on condition)</option>
            <option value="object">Object Filter (remove/keep fields)</option>
          </select>
        </div>
        {formData.filterType === 'array' || !formData.filterType ? (
          <div className="body__form">
            <label className="form__label">Array Filter Condition</label>
            <input
              className="form__input"
              type="text"
              value={formData.condition || ''}
              onChange={(e) => handleChange('condition', e.target.value)}
              placeholder="e.g., item.price > 100 || $node_3.result === 'winter'"
            />
            <small className="form__help">
              <img className="help__icon" src="info.svg" alt="Info" />
              <div className="help__text">
                Access upstream nodes using <code>inputs[index]</code> or <code>$node_id</code> syntax
              </div>
            </small>
          </div>
        ) : (
          <div className="body__form">
            <label className="form__label">Fields to Keep (comma-separated)</label>
            <input
              className="form__input"
              type="text"
              value={formData.fields || ''}
              onChange={(e) => handleChange('fields', e.target.value)}
              placeholder="id, name, email, status"
            />
            <small className="form__help">
              <img className="help__icon" src="info.svg" alt="Info" />
              <div className="help__text">Only these fields will be kept in the object</div>
            </small>
          </div>
        )}
      </>
    );
  };

  const renderConfigForm = () => {
    switch (node.type) {
      case 'httpNode':
        return renderHTTPConfig();
      case 'transformNode':
        return renderTransformConfig();
      case 'filterNode':
        return renderFilterConfig();
      default:
        return <p>Unknown node type</p>;
    }
  };

  return (
    <div className="config">
      <div className="config__header">
        <div className="header__content">
          <h3 className="content__title">Configure Node</h3>
          <p className="content__description">Edit the selected node</p>
        </div>
        <button className="header__close" onClick={onClose}>
          <img src="close.svg" alt="Close" />
        </button>
      </div>
      <div className="config__body">
        <div className="body__form">
          <label className="form__label">Node Label</label>
          <input
            className="form__input"
            type="text"
            value={formData.label || ''}
            onChange={(e) => handleChange('label', e.target.value)}
            placeholder="Enter node label"
          />
        </div>
        {renderConfigForm()}
        <div className="body__actions">
          <button 
            className="actions__button actions__button--primary" 
            onClick={handleSave}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
