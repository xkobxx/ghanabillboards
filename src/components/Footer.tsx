import { Link } from 'react-router-dom'

const TICKER = [
  { city: 'ACCRA',        route: 'AIRPORT-RD-01',  fmt: 'digital', price: 'GHS 2,400/wk',    chg: '▲ 2.1%', dir: 'up'   },
  { city: 'LAGOS',        route: 'V/I-LINK-EXPR',  fmt: 'static',  price: 'NGN 185,000/wk',  chg: '─ 0.0%', dir: 'flat' },
  { city: 'NAIROBI',      route: 'WAIYAKI-WAY-03', fmt: 'bridge',  price: 'KES 48,000/wk',   chg: '▲ 5.3%', dir: 'up'   },
  { city: 'JOHANNESBURG', route: 'N1-HWY-07',      fmt: 'digital', price: 'ZAR 12,400/wk',   chg: '▲ 1.8%', dir: 'up'   },
  { city: 'ABIDJAN',      route: 'PLATEAU-BLVD',   fmt: 'static',  price: 'XOF 820,000/wk',  chg: '─ 0.0%', dir: 'flat' },
  { city: 'DAKAR',        route: 'AUTOROUTE-02',   fmt: 'pillar',  price: 'XOF 640,000/wk',  chg: '▼ 1.2%', dir: 'down' },
] as const

export function Footer() {
  const items = [...TICKER, ...TICKER]

  return (
    <footer className="fp-footer" role="contentinfo">
      {/* Live ticker — decorative, screen readers skip it */}
      <div className="fp-ticker" aria-hidden="true">
        <div className="fp-ticker-badge">
          <span className="fp-live-dot" />
          Live
        </div>
        <div className="fp-ticker-scroll">
          <div className="fp-ticker-track">
            {items.map((item, i) => (
              <span key={i} className="fp-tick-group">
                <span className="fp-tick-city">{item.city}</span>
                <span className="fp-tick-sep">·</span>
                <span className="fp-tick-route">{item.route}</span>
                <span className="fp-tick-sep">·</span>
                <span className={`fp-tick-fmt fp-tick-fmt--${item.fmt}`}>{item.fmt}</span>
                <span className="fp-tick-price">{item.price}</span>
                <span className={`fp-tick-chg fp-tick-chg--${item.dir}`}>{item.chg}</span>
                <span className="fp-tick-diamond">◆</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main columns ── */}
      <div className="fp-body">
        {/* Brand + stats */}
        <div className="fp-col fp-col--brand">
          <p className="fp-eyebrow">Vantage Point · Est. 2025</p>
          <div className="fp-brand-row">
            <div className="fp-brand-mark">
              <div className="fp-brand-diamond" />
            </div>
            <span className="fp-brand-name">Vantage Point</span>
          </div>
          <p className="fp-brand-desc">
            Africa's first programmatic outdoor advertising exchange.
            Search, price, and book across 47 cities in under 5 minutes.
          </p>
          <div className="fp-stats">
            <div className="fp-stat">
              <span className="fp-stat-label">Active markets</span>
              <span className="fp-stat-val">47</span>
            </div>
            <div className="fp-stat">
              <span className="fp-stat-label">Live inventory</span>
              <span className="fp-stat-val">230+</span>
            </div>
            <div className="fp-stat">
              <span className="fp-stat-label">Avg. booking time</span>
              <span className="fp-stat-val">&lt;5 min</span>
            </div>
          </div>
        </div>

        {/* Platform links */}
        <div className="fp-col">
          <p className="fp-col-head">Platform</p>
          <ul className="fp-links">
            <li><Link to="/booking">Book a campaign</Link></li>
            <li><Link to="/booking">Browse inventory</Link></li>
            <li><Link to="/blueprint">Blueprint</Link></li>
            <li><Link to="/pricing">Pricing</Link></li>
            <li><Link to="/locations">Locations</Link></li>
            <li><Link to="/publish">List a billboard</Link></li>
            <li><Link to="/developer">Developer API</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div className="fp-col">
          <p className="fp-col-head">Company</p>
          <ul className="fp-links">
            <li><Link to="/about">About</Link></li>
            <li><a href="mailto:hello@vantagepoint.media">Contact</a></li>
            <li><a href="mailto:partners@vantagepoint.media">Partners</a></li>
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/case-studies">Case Studies</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/investor">Investors</Link></li>
          </ul>
          <div className="fp-address">
            <span className="fp-address-label">HQ</span>
            <span>Accra, Ghana · West Africa</span>
          </div>
        </div>
      </div>

      {/* ── Bottom strip ── */}
      <div className="fp-bottom">
        <div className="fp-bottom-inner">
          <span>© 2026 Vantage Point Media Ltd</span>
          <ul className="fp-legal">
            <li><Link to="/privacy">Privacy</Link></li>
            <li><Link to="/terms">Terms</Link></li>
          </ul>
          <div className="fp-status">
            <span className="fp-status-dot" aria-hidden="true" />
            Exchange active
          </div>
        </div>
      </div>
    </footer>
  )
}
