import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, ScanLine, Menu, X, LogOut, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ThemeToggle from './ThemeToggle';
import UserDropdown from './UserDropdown';
import type { UserDropdownItem } from './UserDropdown';


export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, signOut, setAuthMode } = useApp();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`vp-nav${menuOpen ? ' is-open' : ''}`} aria-label="Primary navigation">
      {/* Brand */}
      <a className="vp-brand" href="/">
        <span className="vp-mark"><ScanLine /></span>
        <span>Vantage Point</span>
      </a>

      {/* Desktop nav links */}
      <div className="vp-nav-links">
        <Link to="/booking" className={isActive('/booking') ? 'active' : ''}>
          Billboards
        </Link>
        <Link to="/blueprint" className={isActive('/blueprint') ? 'active' : ''}>
          Platform
        </Link>
        <Link to="/pricing" className={isActive('/pricing') ? 'active' : ''}>
          Pricing
        </Link>
        <div className="vp-nav-dropdown" onMouseEnter={() => setResourcesOpen(true)} onMouseLeave={() => setResourcesOpen(false)}>
          <button type="button" className="vp-nav-dropdown-trigger">
            Resources <ChevronDown size={13} />
          </button>
          {resourcesOpen && (
            <div className="vp-nav-dropdown-panel">
              <Link to="/about" onClick={() => setResourcesOpen(false)}>About</Link>
              <Link to="/locations" onClick={() => setResourcesOpen(false)}>Locations</Link>
              <Link to="/blog" onClick={() => setResourcesOpen(false)}>Blog</Link>
              <Link to="/case-studies" onClick={() => setResourcesOpen(false)}>Case Studies</Link>
            </div>
          )}
        </div>
      </div>

      {/* Desktop actions */}
      <div className="vp-nav-actions">
        {currentUser ? (
          <UserDropdown
            currentUser={currentUser}
            items={
              [
                { label: 'Dashboard', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>, onClick: () => navigate(`/${currentUser.role}`) },
                { label: 'Sign Out', icon: <LogOut size={14} />, onClick: signOut, variant: 'danger', divider: true },
              ] satisfies UserDropdownItem[]
            }
          />
        ) : (
          <>
            <button type="button" className="vp-btn sm" onClick={() => setAuthMode('signin')}>Login</button>
            <button type="button" className="vp-btn sm primary" onClick={() => setAuthMode('register')}>Sign up <ArrowUpRight className="w-3 h-3" /></button>
          </>
        )}
        <ThemeToggle />
        <button
          type="button" aria-label="Toggle menu" aria-expanded={menuOpen}
          className="vp-btn sm icon vp-menu-btn" onClick={() => setMenuOpen(o => !o)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile dropdown */}
      <div className="vp-mobile-links" role="dialog" aria-label="Navigation menu">
        <Link to="/booking" onClick={() => setMenuOpen(false)}
          className={isActive('/booking') ? 'active' : ''}>
          Billboards
        </Link>
        <Link to="/blueprint" onClick={() => setMenuOpen(false)}
          className={isActive('/blueprint') ? 'active' : ''}>
          Platform
        </Link>
        <Link to="/pricing" onClick={() => setMenuOpen(false)}
          className={isActive('/pricing') ? 'active' : ''}>
          Pricing
        </Link>
        <Link to="/about" onClick={() => setMenuOpen(false)}
          className={isActive('/about') ? 'active' : ''}>
          About
        </Link>
        <Link to="/locations" onClick={() => setMenuOpen(false)}
          className={isActive('/locations') ? 'active' : ''}>
          Locations
        </Link>
        <Link to="/blog" onClick={() => setMenuOpen(false)}
          className={isActive('/blog') ? 'active' : ''}>
          Blog
        </Link>
        <Link to="/case-studies" onClick={() => setMenuOpen(false)}
          className={isActive('/case-studies') ? 'active' : ''}>
          Case Studies
        </Link>
        <div className="vp-mobile-actions">
          {currentUser ? (
            <UserDropdown
              currentUser={currentUser}
              items={
                [
                  { label: 'Dashboard', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>, onClick: () => navigate(`/${currentUser.role}`) },
                  { label: 'Sign Out', icon: <LogOut size={14} />, onClick: signOut, variant: 'danger', divider: true },
                ] satisfies UserDropdownItem[]
              }
            />
          ) : (
            <>
              <button type="button" className="vp-btn sm" style={{ flex: 1 }}
                onClick={() => { setAuthMode('signin'); setMenuOpen(false); }}>Login</button>
              <button type="button" className="vp-btn sm primary" style={{ flex: 1 }}
                onClick={() => { setAuthMode('register'); setMenuOpen(false); }}>Sign up</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
