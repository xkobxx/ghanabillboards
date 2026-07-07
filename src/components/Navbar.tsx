import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, ScanLine, Menu, X, LogOut, ChevronDown, LayoutDashboard } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ThemeToggle from './ThemeToggle';
import UserDropdown from './UserDropdown';
import type { UserDropdownItem } from './UserDropdown';

const primaryLinks = [
  { to: '/booking', label: 'Billboards' },
  { to: '/blueprint', label: 'Platform' },
  { to: '/pricing', label: 'Pricing' },
];

const resourceLinks = [
  { to: '/about', label: 'About' },
  { to: '/locations', label: 'Locations' },
  { to: '/blog', label: 'Blog' },
  { to: '/case-studies', label: 'Case Studies' },
];


export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, signOut, setAuthMode } = useApp();

  const isActive = (path: string) => location.pathname === path;
  const closeMenu = () => setMenuOpen(false);
  const navLinks = [...primaryLinks, ...resourceLinks];

  useEffect(() => {
    setMenuOpen(false);
    setResourcesOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  const userItems = useMemo<UserDropdownItem[]>(
    () => currentUser
      ? [
          { label: 'Dashboard', icon: <LayoutDashboard size={14} />, onClick: () => navigate(`/${currentUser.role}`) },
          { label: 'Sign Out', icon: <LogOut size={14} />, onClick: signOut, variant: 'danger', divider: true },
        ]
      : [],
    [currentUser, navigate, signOut],
  );

  return (
    <nav className={`vp-nav${menuOpen ? ' is-open' : ''}`} aria-label="Primary navigation">
      {/* Brand */}
      <Link className="vp-brand" to="/" onClick={closeMenu}>
        <span className="vp-mark"><ScanLine /></span>
        <span>Vantage Point</span>
      </Link>

      {/* Desktop nav links */}
      <div className="vp-nav-links">
        {primaryLinks.map((link) => (
          <Link key={link.to} to={link.to} className={isActive(link.to) ? 'active' : ''}>
            {link.label}
          </Link>
        ))}
        <div
          className="vp-nav-dropdown"
          onMouseEnter={() => setResourcesOpen(true)}
          onMouseLeave={() => setResourcesOpen(false)}
        >
          <button
            type="button"
            className="vp-nav-dropdown-trigger"
            aria-expanded={resourcesOpen}
            aria-haspopup="menu"
          >
            Resources <ChevronDown size={13} />
          </button>
          {resourcesOpen && (
            <div className="vp-nav-dropdown-panel" role="menu">
              {resourceLinks.map((link) => (
                <Link key={link.to} to={link.to} role="menuitem" onClick={() => setResourcesOpen(false)}>
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop actions */}
      <div className="vp-nav-actions">
        {currentUser ? (
          <UserDropdown
            currentUser={currentUser}
            items={userItems}
          />
        ) : (
          <>
            <button type="button" className="vp-btn sm vp-desktop-auth-action" onClick={() => setAuthMode('signin')}>Login</button>
            <button type="button" className="vp-btn sm primary vp-desktop-auth-action" onClick={() => setAuthMode('register')}>Sign up <ArrowUpRight className="w-3 h-3" /></button>
          </>
        )}
        <ThemeToggle />
        <button
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="primary-mobile-menu"
          className="vp-btn sm icon vp-menu-btn" onClick={() => setMenuOpen(o => !o)}
        >
          <span className="vp-menu-icon" aria-hidden="true">
            <Menu className="vp-menu-icon-menu" />
            <X className="vp-menu-icon-close" />
          </span>
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="vp-mobile-layer">
          <button
            type="button"
            className="vp-mobile-backdrop"
            aria-label="Close navigation menu"
            onClick={closeMenu}
          />
          <div id="primary-mobile-menu" className="vp-mobile-links" role="dialog" aria-label="Navigation menu">
            <div className="vp-mobile-link-list">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={closeMenu}
                  className={isActive(link.to) ? 'active' : ''}
                >
                  <span>{link.label}</span>
                  {isActive(link.to) && <span className="vp-mobile-current">Current</span>}
                </Link>
              ))}
            </div>
            <div className="vp-mobile-actions">
              {currentUser ? (
                <UserDropdown
                  currentUser={currentUser}
                  items={userItems}
                />
              ) : (
                <>
                  <button
                    type="button"
                    className="vp-btn vp-mobile-action"
                    onClick={() => { setAuthMode('signin'); closeMenu(); }}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    className="vp-btn primary vp-mobile-action"
                    onClick={() => { setAuthMode('register'); closeMenu(); }}
                  >
                    Sign up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
