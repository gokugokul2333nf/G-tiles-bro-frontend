'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext({ showToast: () => {} });

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

/* ============ Toast UI ============ */

const iconMap = {
  success: <CheckCircle2 className="w-5 h-5" />,
  error: <XCircle className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
};

const colorMap = {
  success: { bg: 'var(--toast-success-bg)', border: 'var(--toast-success-border)', icon: '#10b981', text: 'var(--toast-success-text)' },
  error:   { bg: 'var(--toast-error-bg)',   border: 'var(--toast-error-border)',   icon: '#ef4444', text: 'var(--toast-error-text)' },
  warning: { bg: 'var(--toast-warn-bg)',    border: 'var(--toast-warn-border)',    icon: '#f59e0b', text: 'var(--toast-warn-text)' },
  info:    { bg: 'var(--toast-info-bg)',     border: 'var(--toast-info-border)',    icon: '#3b82f6', text: 'var(--toast-info-text)' },
};

function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 24,
      right: 24,
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      pointerEvents: 'none',
      maxWidth: 420,
    }}>
      {toasts.map((toast) => {
        const colors = colorMap[toast.type] || colorMap.info;
        return (
          <div
            key={toast.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 18px',
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: 14,
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              color: colors.text,
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'Inter, sans-serif',
              pointerEvents: 'auto',
              animation: 'toastSlideIn 0.35s cubic-bezier(0.16,1,0.3,1)',
              minWidth: 280,
            }}
          >
            <span style={{ color: colors.icon, flexShrink: 0 }}>
              {iconMap[toast.type]}
            </span>
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                color: colors.text,
                cursor: 'pointer',
                opacity: 0.5,
                padding: 0,
                display: 'flex',
                flexShrink: 0,
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}

      <style jsx global>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(100%) scale(0.95); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
