// Lightweight UI components replacing shadcn/ui dependencies
// These work with our custom CSS only

/**
 * Card - Simple container component
 */
export const Card = ({ children, className = '' }) => (
  <div className={`card ${className}`} >
    {children}
  </div>
);

/**
 * CardContent - Content wrapper for cards
 */
export const CardContent = ({ children, className = '' }) => (
  <div className={`card-content ${className}`}>
    {children}
  </div>
);

/**
 * Button - Simple button component
 */
export const Button = ({ children, className = '', ...props }) => (
  <button className={`btn ${className}`} {...props}>
    {children}
  </button>
);

/**
 * PageLayout - Layout wrapper for pages
 */
export const PageLayout = ({ children, className = '', hasBottomNav = false }) => (
  <div className={`page-layout ${hasBottomNav ? 'has-bottom-nav' : ''} ${className}`}>
    {children}
  </div>
);

/**
 * Badge - Status badge component
 */
export const Badge = ({ children, className = '', variant = 'default' }) => (
  <span className={`badge badge-${variant} ${className}`}>
    {children}
  </span>
);

/**
 * Tabs - Tabbed interface
 */
export const Tabs = ({ tabs, activeTab, onChange, className = '' }) => (
  <div className={`tabs-container ${className}`}>
    {tabs.map((tab) => (
      <button
        key={tab.id}
        className={`tab ${activeTab === tab.id ? 'active' : ''}`}
        onClick={() => onChange(tab.id)}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

/**
 * BalanceCard - Card showing balance split between two currencies
 */
export const BalanceCard = ({ leftContent, rightContent, onLeftClick, onRightClick, className = '' }) => (
  <div className={`balance-card ${className}`} style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1px 1fr',
    gap: '1rem',
    padding: '1.5rem',
    background: 'var(--card-bg)',
    border: '1px solid var(--border-primary)',
    borderRadius: '12px',
    boxShadow: '0 1px 3px var(--card-shadow)'
  }}>
    {/* Left section */}
    <div onClick={onLeftClick} style={{ cursor: onLeftClick ? 'pointer' : 'default' }}>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
        {leftContent.subtitle}
      </div>
      <div style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
        {leftContent.label}
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-primary)' }}>
        {leftContent.value}
      </div>
    </div>

    {/* Divider */}
    <div style={{
      backgroundColor: 'var(--border-primary)',
      margin: '0.5rem 0'
    }} />

    {/* Right section */}
    <div onClick={onRightClick} style={{ cursor: onRightClick ? 'pointer' : 'default', textAlign: 'right' }}>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
        {rightContent.subtitle}
      </div>
      <div style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
        {rightContent.label}
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-primary)' }}>
        {rightContent.value}
      </div>
      {rightContent.conversion && (
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          ≈ {rightContent.conversion?.toFixed(4)}
        </div>
      )}
    </div>
  </div>
);

/**
 * Stack - Vertical spacing container
 */
export const Stack = ({ children, spacing = 'md', className = '' }) => {
  const spacingMap = {
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  };

  return (
    <div
      className={`stack ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacingMap[spacing] || spacing
      }}
    >
      {children}
    </div>
  );
};

/**
 * PageHeader - Header section with title, subtitle and action
 */
export const PageHeader = ({ icon = '', title = '', subtitle = '', action, className = '' }) => (
  <div className={`page-header ${className}`} style={{
    padding: '1.5rem',
    background: 'var(--card-bg)',
    border: '1px solid var(--border-primary)',
    borderRadius: '12px',
    marginBottom: '1.5rem'
  }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          {icon}
        </div>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: 'var(--text-primary)',
          margin: '0 0 0.25rem 0'
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
            margin: '0'
          }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div style={{ minWidth: '150px' }}>
          {action}
        </div>
      )}
    </div>
  </div>
);
