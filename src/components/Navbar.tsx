import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, ScanLine, Menu, X, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ThemeToggle from './ThemeToggle';
import UserDropdown from './UserDropdown';
import type { UserDropdownItem } from './UserDropdown';

const HASH_LINKS = [
  { href: 'home', label: 'Public' },
];

const ROLE_LINKS = [
  { to: '/advertiser', label: 'Advertiser' },
  { to: '/vendor', label: 'Vendor' },
  { to: '/admin', label: 'Admin' },
  { to: '/investor', label: 'Investor' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, signOut, setAuthMode } = useApp();

  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    if (location.pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(`/#${id}`);
    }
  };


  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`vp-nav${menuOpen ? ' is-open' : ''}`} aria-label="Primary navigation">
      {/* Brand */}
      <a className="vp-brand" href="/#home" onClick={scrollTo('home')}>
        <span className="vp-mark"><ScanLine /></span>
        <span>Vantage Point</span>
      </a>

      {/* Desktop nav links */}
      <div className="vp-nav-links">
        {HASH_LINKS.map(({ href, label }) => (
          <a key={href} href={`#${href}`} onClick={scrollTo(href)}
            className={location.pathname === '/' ? '' : ''}>
            {label}
          </a>
        ))}
        <Link to="/booking" className={isActive('/booking') ? 'active' : ''}>
          Booking
        </Link>
        {ROLE_LINKS.map(({ to, label }) => (
          <Link key={to} to={to} className={isActive(to) ? 'active' : ''}>
            {label}
          </Link>
        ))}
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
        {HASH_LINKS.map(({ href, label }) => (
          <a key={href} href={`#${href}`} onClick={scrollTo(href)}>{label}</a>
        ))}
        <Link to="/booking" onClick={() => setMenuOpen(false)}
          className={isActive('/booking') ? 'active' : ''}>
          Booking
        </Link>
        {ROLE_LINKS.map(({ to, label }) => (
          <Link key={to} to={to} onClick={() => setMenuOpen(false)}
            className={isActive(to) ? 'active' : ''}>
            {label}
          </Link>
        ))}
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
