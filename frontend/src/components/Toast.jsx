import { useEffect } from 'react';

function Toast({ message, type = 'success', visible, onClose }) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [visible, onClose]);

  if (!visible || !message) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '1rem',
      right: '1rem',
      zIndex: 2000,
      minWidth: '240px',
      maxWidth: '320px',
      padding: '1rem 1.25rem',
      borderRadius: '10px',
      backgroundColor: type === 'success' ? '#1f9d55' : '#dc3545',
      color: 'white',
      boxShadow: '0 12px 30px rgba(0, 0, 0, 0.18)',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.75rem'
    }}>
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          border: 'none',
          background: 'transparent',
          color: 'white',
          cursor: 'pointer',
          fontSize: '1rem',
          lineHeight: 1
        }}
      >
        ✕
      </button>
    </div>
  );
}

export default Toast;
