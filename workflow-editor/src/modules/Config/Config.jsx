import { useState, useEffect } from 'react';
import './Config.scss';

export default function Config({ node, onUpdate, onClose }) {
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

  const handleChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
  };

  const handleSave = () => {
    onUpdate(node.id, formData);
  };

  const renderHTTPConfig = () => (
    <>
      <div className="form">
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
      <div className="form">
        <label className="form__label">URL</label>
        <input
          className="form__input"
          type="text"
          value={formData.url || ''}
          onChange={(e) => handleChange('url', e.target.value)}
          placeholder="https://api.example.com/endpoint"
        />
      </div>
      <div className="form">
        <label className="form__label">Headers (JSON)</label>
        <textarea
          className="form__textarea"
          value={formData.headers || ''}
          onChange={(e) => handleChange('headers', e.target.value)}
          placeholder='{"Content-Type": "application/json"}'
          rows={3}
        />
      </div>
    </>
  );

  const renderTransformConfig = () => (
    <>
      <div className="form">
        <label className="form__label">Description</label>
        <input
          className="form__input"
          type="text"
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="What does this transformation do?"
        />
      </div>
      <div className="form">
        <label className="form__label">Upstream Node References</label>
        <input
          className="form__input"
          type="text"
          value={formData.upstreamRefs || ''}
          onChange={(e) => handleChange('upstreamRefs', e.target.value)}
          placeholder="e.g., $node1, $node2 (comma-separated)"
        />
        <small className="form__help-text">Reference upstream nodes using $nodeId syntax</small>
      </div>
      <div className="form">
        <label className="form__label">Transform Expression (JavaScript)</label>
        <textarea
          className="form__textarea"
          value={formData.expression || ''}
          onChange={(e) => handleChange('expression', e.target.value)}
          placeholder="// Access upstream data: $node1.data&#10;// Conditional: $node1.status === 'active' ? $node1.total * 0.9 : $node1.total&#10;return data.map(item => ({ ...item, processed: true }));"
          rows={8}
        />
        <small className="form__help-text">Use conditional expressions and reference upstream nodes</small>
      </div>
    </>
  );

  const renderFilterConfig = () => (
    <>
      <div className="form">
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
        <div className="form">
          <label className="form__label">Array Filter Condition</label>
          <input
            className="form__input"
            type="text"
            value={formData.condition || ''}
            onChange={(e) => handleChange('condition', e.target.value)}
            placeholder="e.g., item.status === 'active' && item.total > 100"
          />
          <small className="form__help-text">Filters array items that match the condition</small>
        </div>
      ) : (
        <div className="form">
          <label className="form__label">Fields to Keep (comma-separated)</label>
          <input
            className="form__input"
            type="text"
            value={formData.fields || ''}
            onChange={(e) => handleChange('fields', e.target.value)}
            placeholder="id, name, email, status"
          />
          <small className="form__help-text">Only these fields will be kept in the object</small>
        </div>
      )}
    </>
  );

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
          <p className="content__description">Edit the selected node.</p>
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
