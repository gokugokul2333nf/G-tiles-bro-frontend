'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function ElegantSelect({ 
  value, 
  onChange, 
  options, 
  label, 
  icon: Icon,
  variant = 'default', // 'default' or 'small'
  className = '' 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`elegant-select-container ${variant} ${className} ${isOpen ? 'z-[100]' : 'z-10'}`} ref={containerRef} style={{ position: 'relative' }}>
      {label && <label className="elegant-select-label">{label}</label>}
      
      <div className="elegant-select-relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`elegant-select-trigger ${isOpen ? 'active' : ''}`}
        >
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            {Icon && <Icon className="elegant-select-icon" />}
            <span className="elegant-select-value">{selectedOption?.label}</span>
          </div>
          <ChevronDown className={`elegant-select-chevron ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="elegant-select-dropdown custom-scrollbar">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`elegant-select-option ${value === option.value ? 'selected' : ''}`}
              >
                <span>{option.label}</span>
                {value === option.value && <Check className="w-3.5 h-3.5 text-indigo-400" />}
              </button>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .elegant-select-container {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 140px;
        }

        .elegant-select-label {
          font-size: 10px;
          font-weight: 900;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .elegant-select-relative {
          position: relative;
        }

        .elegant-select-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: var(--bg-input);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border-input);
          border-radius: 12px;
          color: var(--text-primary);
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }

        .small .elegant-select-trigger {
          padding: 6px 10px;
          font-size: 11px;
          border-radius: 10px;
        }

        .elegant-select-trigger:hover {
          background: var(--bg-input-focus);
          border-color: var(--border-focus);
          transform: translateY(-1px);
        }

        .elegant-select-trigger.active {
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px var(--accent-glow);
          background: var(--bg-input-focus);
        }

        .elegant-select-icon {
          width: 14px;
          height: 14px;
          color: var(--accent-primary);
          flex-shrink: 0;
        }

        .small .elegant-select-icon {
          width: 12px;
          height: 12px;
        }

        .elegant-select-value {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .elegant-select-chevron {
          width: 14px;
          height: 14px;
          color: var(--text-muted);
          transition: transform 0.3s ease;
          flex-shrink: 0;
        }

        .small .elegant-select-chevron {
          width: 12px;
          height: 12px;
        }

        .elegant-select-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: var(--bg-secondary);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border-subtle);
          border-radius: 16px;
          padding: 6px;
          max-height: 240px;
          overflow-y: auto;
          z-index: 1000;
          box-shadow: var(--shadow-lg), 0 0 0 1px var(--accent-glow);
          animation: slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .elegant-select-option {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          border-radius: 10px;
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 500;
          text-align: left;
          transition: all 0.15s ease;
          cursor: pointer;
          background: transparent;
          border: none;
        }

        .small .elegant-select-option {
          padding: 8px 10px;
          font-size: 11px;
        }

        .elegant-select-option:hover {
          background: var(--bg-card-hover);
          color: var(--text-primary);
        }

        .elegant-select-option.selected {
          background: var(--accent-glow);
          color: var(--accent-primary);
          font-weight: 700;
        }

        @media (max-width: 640px) {
          .elegant-select-container {
             min-width: 100px;
          }
          .elegant-select-trigger {
            padding: 12px 16px;
            font-size: 14px;
          }
          .small .elegant-select-trigger {
            padding: 8px 12px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
}
