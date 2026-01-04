import { useState } from 'react';
import './Results.scss';

export default function Results({ results, errors, onClose, nodes = [] }) {
  const [activeTab, setActiveTab] = useState('results');

  if (!results && !errors) {
    return null;
  }

  const hasResults = results && Object.keys(results).length > 0;
  const hasErrors = errors && Object.keys(errors).length > 0;

  // Retrieve node label
  const getNodeLabel = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    return node?.data?.label || 'Unnamed Node';
  };

  return (
    <div className="results">
      <div className="results__overlay" onClick={onClose}></div>
      <div className="results__content">
        <div className="results__header">
          <h2 className="header__title">Workflow Results</h2>
          <button className="header__close" onClick={onClose}>
            <img src="close.svg" alt="Close" />
          </button>
        </div>

        <div className="results__tabs">
          <button
            className={`tabs__item ${activeTab === 'results' ? 'tabs__item--active' : ''}`}
            onClick={() => setActiveTab('results')}
          >
            Results {hasResults && `(${Object.keys(results).length})`}
          </button>
          <button
            className={`tabs__item ${activeTab === 'errors' ? 'tabs__item--active' : ''}`}
            onClick={() => setActiveTab('errors')}
          >
            Errors {hasErrors && `(${Object.keys(errors).length})`}
          </button>
        </div>

        <div className="results__body">
          {activeTab === 'results' && (
            <div className="body__section">
              {hasResults ? (
                Object.entries(results).map(([nodeId, result]) => (
                  <div key={nodeId} className="body__item">
                    <div className="item__header">
                      <span className="header__label">
                        {getNodeLabel(nodeId)} <span className="header__id">({nodeId})</span>
                      </span>
                      <span className="header__status header__status--success">
                        ✓ Success
                      </span>
                    </div>
                    <pre className="item__data">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                ))
              ) : (
                <div className="section__empty">
                  No results to display
                </div>
              )}
            </div>
          )}

          {activeTab === 'errors' && (
            <div className="body__section">
              {hasErrors ? (
                Object.entries(errors).map(([nodeId, error]) => (
                  <div key={nodeId} className="body__item body__item--error">
                    <div className="item__header">
                      <span className="header__label">
                        {getNodeLabel(nodeId)} <span className="header__id">({nodeId})</span>
                      </span>
                      <span className="header__status header__status--error">
                        ✕ Error
                      </span>
                    </div>
                    <div className="item__error">
                      {error}
                    </div>
                  </div>
                ))
              ) : (
                <div className="section__empty">
                  No errors occurred
                </div>
              )}
            </div>
          )}
        </div>

        <div className="results__footer">
          <button className="footer__button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
