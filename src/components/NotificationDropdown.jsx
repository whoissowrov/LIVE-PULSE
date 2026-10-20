import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, Sparkles, Droplet, Info, AlertCircle, Clock, CheckCheck, X } from 'lucide-react';

export default function NotificationDropdown({ notifications = [], onMarkAsRead, onClearAll }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const getIcon = (type) => {
    switch (type) {
      case 'eligibility':
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
      case 'donation':
        return <Droplet className="w-4 h-4 text-red-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-sky-400" />;
      default:
        return <Bell className="w-4 h-4 text-amber-400" />;
    }
  };

  const formatTimestamp = (dateString) => {
    if (!dateString) return 'Just now';
    try {
      const d = new Date(dateString);
      const diffMs = Date.now() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch (e) {
      return 'Recently';
    }
  };

  return (
    <div className="notification-dropdown-container" ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        type="button"
        className="nav-icon-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View website messages and notifications"
        title="Website Messages & Eligibility Notifications"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: isOpen ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)',
          border: '1px solid ' + (isOpen ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.1)'),
          color: isOpen ? '#f87171' : 'var(--text-main)',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              minWidth: '18px',
              height: '18px',
              padding: '0 4px',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: '#fff',
              fontSize: '0.68rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(239, 68, 68, 0.8)',
              animation: 'pulse 1.8s infinite'
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Floating Dropdown Panel */}
      {isOpen && (
        <div
          className="notification-dropdown-panel"
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: '350px',
            maxWidth: 'calc(100vw - 24px)',
            background: 'rgba(15, 20, 31, 0.96)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            borderRadius: '16px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65), 0 0 30px rgba(239, 68, 68, 0.12)',
            zIndex: 1000,
            animation: 'fadeInSlide 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(255, 255, 255, 0.02)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell className="w-4 h-4 text-red-500" />
              <strong style={{ fontSize: '0.92rem', color: '#fff' }}>Website Messages</strong>
              {unreadCount > 0 && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '999px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: '#fca5a5',
                    border: '1px solid rgba(239, 68, 68, 0.35)'
                  }}
                >
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {unreadCount > 0 && onMarkAsRead && (
                <button
                  type="button"
                  onClick={() => notifications.forEach((n) => onMarkAsRead(n.id))}
                  title="Mark all as read"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.72rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    padding: '4px 6px',
                    borderRadius: '6px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Read all</span>
                </button>
              )}
              {notifications.length > 0 && onClearAll && (
                <button
                  type="button"
                  onClick={onClearAll}
                  title="Clear all messages"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px 6px',
                    borderRadius: '6px'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Messages List */}
          <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '6px' }}>
            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                <p style={{ margin: '0 0 4px 0', fontSize: '0.88rem', fontWeight: 600, color: '#e2e8f0' }}>
                  No messages yet
                </p>
                <p style={{ margin: 0, fontSize: '0.78rem', lineHeight: 1.4 }}>
                  When you record a blood donation, automated eligibility and recovery messages will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => onMarkAsRead && onMarkAsRead(notif.id)}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '10px',
                    marginBottom: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: notif.read ? 'transparent' : 'rgba(239, 68, 68, 0.08)',
                    border: notif.read
                      ? '1px solid transparent'
                      : '1px solid rgba(239, 68, 68, 0.22)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = notif.read
                      ? 'transparent'
                      : 'rgba(239, 68, 68, 0.08)';
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background:
                        notif.type === 'eligibility'
                          ? 'rgba(16, 185, 129, 0.15)'
                          : notif.type === 'donation'
                          ? 'rgba(239, 68, 68, 0.15)'
                          : 'rgba(14, 165, 233, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {getIcon(notif.type)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                      <h5
                        style={{
                          margin: 0,
                          fontSize: '0.84rem',
                          fontWeight: 700,
                          color: notif.read ? '#cbd5e1' : '#fff'
                        }}
                      >
                        {notif.title}
                      </h5>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          color: 'var(--text-muted)',
                          flexShrink: 0
                        }}
                      >
                        {formatTimestamp(notif.createdAt)}
                      </span>
                    </div>

                    <p
                      style={{
                        margin: '4px 0 0 0',
                        fontSize: '0.78rem',
                        color: notif.read ? '#94a3b8' : '#e2e8f0',
                        lineHeight: 1.45
                      }}
                    >
                      {notif.message}
                    </p>
                  </div>

                  {!notif.read && (
                    <div
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: '#ef4444',
                        boxShadow: '0 0 8px #ef4444',
                        marginTop: '6px',
                        flexShrink: 0
                      }}
                      title="Unread"
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
