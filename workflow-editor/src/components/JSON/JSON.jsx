import { useState, useEffect } from 'react';
import './JSON.scss';

export default function JSON({ value, onChange, placeholder, rows = 4 }) {
  const [localValue, setLocalValue] = useState(value || '');
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setLocalValue(value || '');
    validateJSON(value || '');
  }, [value]);

  const validateJSON = (text) => {
    if (!text || text.trim() === '') {
      setError('');
      setIsValid(true);
      return true;
    }

    try {
      JSON.parse(text);
      setError('');
      setIsValid(true);
      return true;
    } catch (e) {
      setError(e.message);
      setIsValid(false);
      return false;
    }
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    validateJSON(newValue);
    onChange(newValue);
  };

  const handleFormat = () => {
    if (!localValue || localValue.trim() === '') return;

    try {
      const parsed = JSON.parse(localValue);
      const formatted = JSON.stringify(parsed, null, 2);
      setLocalValue(formatted);
      onChange(formatted);
      setError('');
      setIsValid(true);
    } catch (e) {
      setError(e.message);
      setIsValid(false);
    }
  };

  const handleMinify = () => {
    if (!localValue || localValue.trim() === '') return;

    try {
      const parsed = JSON.parse(localValue);
      const minified = JSON.stringify(parsed);
      setLocalValue(minified);
      onChange(minified);
      setError('');
      setIsValid(true);
    } catch (e) {
      setError(e.message);
      setIsValid(false);
    }
  };

  return (
    <div className="json">
      <div className="json__wrapper">
        <textarea
          className={`json__field ${!isValid ? 'json__field--error' : ''}`}
          value={localValue}
          onChange={handleChange}
          placeholder={placeholder}
          rows={rows}
          spellCheck="false"
        />
        {localValue && localValue.trim() !== '' && (
          <div className="json__actions">
            <button
              type="button"
              className="actions__button"
              onClick={handleFormat}
              title="Format JSON"
            >
              Format
            </button>
            <button
              type="button"
              className="actions__button"
              onClick={handleMinify}
              title="Minify JSON"
            >
              Minify
            </button>
          </div>
        )}
      </div>
      {error && (
        <div className="json__error">
          <span className="error__icon">⚠</span>
          <span className="error__message">{error}</span>
        </div>
      )}
    </div>
  );
}
