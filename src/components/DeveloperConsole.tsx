import { useState, useRef, useEffect } from 'react';
import { INITIAL_GATEWAY_LOGS } from '../data';
import { GatewayLog } from '../types';
import { Code2, Server, Database, Activity, Play, Trash2, ArrowUpRight, CheckCircle, Smartphone } from 'lucide-react';

export default function DeveloperConsole() {
  const [logs, setLogs] = useState<GatewayLog[]>(INITIAL_GATEWAY_LOGS);
  const [activeTab, setActiveTab] = useState<'gateway' | 'monolith' | 'db_schema'>('gateway');
  const [isSimulatingRequest, setIsSimulatingRequest] = useState(false);
  const loggerEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loggerEndRef.current) {
      loggerEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Simulate an API Request flow
  const handleTriggerSimulatedRequest = (
    endpoint: string,
    method: 'GET' | 'POST',
    module: 'Auth' | 'Billboards' | 'Bookings' | 'Payments' | 'Analytics',
    payload: string
  ) => {
    setIsSimulatingRequest(true);
    setTimeout(() => {
      const date = new Date();
      const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
      
      const newLog: GatewayLog = {
        id: `log-${Date.now()}`,
        timestamp: timeStr,
        method,
        endpoint,
        module,
        status: method === 'POST' ? 201 : 200,
        latencyMs: Math.floor(Math.random() * 95) + 12,
        payload
      };

      setLogs((prev) => [...prev, newLog]);
      setIsSimulatingRequest(false);
    }, 450);
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  return (
    <div id="dev-portal" className="glass-panel clip-reveal rounded-2xl p-6 border border-[var(--color-border)] relative overflow-hidden">
      {/* Visual Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--color-border)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-ping" />
            <span className="font-mono text-caption uppercase text-[var(--color-text-secondary)] tracking-[0.3em] font-semibold">ARCHITECTURE PLAYGROUND</span>
          </div>
          <h3 className="font-semibold text-2xl text-[var(--color-text-primary)] tracking-tight uppercase">
            API Gateway & Modular monolith
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] font-sans">
            Rate-limiting, RPC boundaries, and database models in real-time.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 bg-[var(--color-surface)]/50 p-1 rounded border border-[var(--color-border)] self-start">
          <button
            type="button"
            onClick={() => setActiveTab('gateway')}
            className={`px-3 py-1.5 text-xs font-mono rounded cursor-pointer transition-all ${
              activeTab === 'gateway'
                ? 'bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] font-semibold'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]/50'
            }`}
          >
            Terminal Logs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('monolith')}
            className={`px-3 py-1.5 text-xs font-mono rounded cursor-pointer transition-all ${
              activeTab === 'monolith'
                ? 'bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] font-semibold'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]/50'
            }`}
          >
            Monolith Blueprint
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('db_schema')}
            className={`px-3 py-1.5 text-xs font-mono rounded cursor-pointer transition-all ${
              activeTab === 'db_schema'
                ? 'bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] font-semibold'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]/50'
            }`}
          >
            Prisma Schema
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side Controls (Trigger scenarios) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[var(--color-black)] rounded-xl p-5 border border-[var(--color-border)] space-y-4">
            <span className="font-mono text-caption text-[var(--color-text-muted)] uppercase tracking-[0.2em] block font-semibold">
              TRIGGER CLIENT SCENARIOS
            </span>

            {/* Scenario 1: Search */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-sans font-medium text-[var(--color-text-secondary)]">Discover Billboards</span>
                <span className="font-mono text-caption text-[var(--color-text-muted)] font-semibold">GET /api/v1/billboards</span>
              </div>
              <button
                type="button"
                onClick={() => handleTriggerSimulatedRequest('/api/v1/billboards?country=Nigeria&type=Digital', 'GET', 'Billboards', '{"query": {"country": "Nigeria", "type": "Digital"}}')}
                disabled={isSimulatingRequest}
                className="w-full py-2.5 px-3.5 text-xs font-mono bg-[var(--color-surface)]/50 border border-[var(--color-border)] hover:border-[var(--color-border-hover)] text-[var(--color-text-primary)] flex items-center justify-between rounded cursor-pointer transition-all text-left uppercase tracking-wider"
              >
                <span>EXECUTE SEARCH ENDPOINT</span>
                <Play className="w-3 h-3 fill-current" />
              </button>
            </div>

            {/* Scenario 2: Generate Auth Token */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-sans font-medium text-[var(--color-text-secondary)]">Issue Encrypted JWT</span>
                <span className="font-mono text-caption text-[var(--color-text-muted)] font-semibold">POST /api/v1/auth/exchange</span>
              </div>
              <button
                type="button"
                onClick={() => handleTriggerSimulatedRequest('/api/v1/auth/exchange', 'POST', 'Auth', '{"userId": "usr_9921", "role": "Advertiser", "issuer": "OOH-Gateway"}' )}
                disabled={isSimulatingRequest}
                className="w-full py-2.5 px-3.5 text-xs font-mono bg-[var(--color-surface)]/50 border border-[var(--color-border)] hover:border-[var(--color-border-hover)] text-[var(--color-text-primary)] flex items-center justify-between rounded cursor-pointer transition-all text-left uppercase tracking-wider"
              >
                <span>INIT SECURE GATEWAY</span>
                <Play className="w-3 h-3 fill-current" />
              </button>
            </div>

            {/* Scenario 3: Paystack checkout init */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-sans font-medium text-[var(--color-text-secondary)]">Initialize Escrow Outflow</span>
                <span className="font-mono text-caption text-[var(--color-text-muted)] font-semibold">POST /api/v1/payments/paystack</span>
              </div>
              <button
                type="button"
                onClick={() => handleTriggerSimulatedRequest('/api/v1/payments/paystack/initialize', 'POST', 'Payments', '{"reference": "trx_ref_9921b3", "channel": "Card", "currency": "USD"}' )}
                disabled={isSimulatingRequest}
                className="w-full py-2.5 px-3.5 text-xs font-mono bg-[var(--color-surface)]/50 border border-[var(--color-border)] hover:border-[var(--color-border-hover)] text-[var(--color-text-primary)] flex items-center justify-between rounded cursor-pointer transition-all text-left uppercase tracking-wider"
              >
                <span>MOCK PAYSTACK DATA</span>
                <Play className="w-3 h-3 fill-current" />
              </button>
            </div>

            {/* Scenario 4: Heartbeat metrics */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-sans font-medium text-[var(--color-text-secondary)]">Gather Telemetry Heatmap</span>
                <span className="font-mono text-caption text-[var(--color-text-muted)] font-semibold">GET /api/v1/analytics/dwell-times</span>
              </div>
              <button
                type="button"
                onClick={() => handleTriggerSimulatedRequest('/api/v1/analytics/dwell-times?city=Nairobi', 'GET', 'Analytics', '{"metric": "traffic_density", "sampleRangeHours": 24}' )}
                disabled={isSimulatingRequest}
                className="w-full py-2.5 px-3.5 text-xs font-mono bg-[var(--color-surface)]/50 border border-[var(--color-border)] hover:border-[var(--color-border-hover)] text-[var(--color-text-primary)] flex items-center justify-between rounded cursor-pointer transition-all text-left uppercase tracking-wider"
              >
                <span>POLL TELEMETRY HOVER</span>
                <Play className="w-3 h-3 fill-current" />
              </button>
            </div>
          </div>

          <div className="bg-[var(--color-surface)]/50 rounded-xl p-5 border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] space-y-2">
            <span className="font-mono text-caption uppercase tracking-[0.2em] block text-[var(--color-text-primary)] font-semibold mb-2">Gateway Middlewares:</span>
            <div className="flex gap-2 items-center text-[var(--color-text-primary)] font-mono text-caption">
              <CheckCircle className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
              <span>IP Rate Limiting (100reqs/15m)</span>
            </div>
            <div className="flex gap-2 items-center text-[var(--color-text-primary)] font-mono text-caption">
              <CheckCircle className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
              <span>Modular Monolith Encryption</span>
            </div>
          </div>
        </div>

        {/* Right Side Display screen */}
        <div className="lg:col-span-8 bg-zinc-950/60 border border-[var(--color-border)] rounded-xl p-5 overflow-hidden relative flex flex-col min-h-[400px]">
          {activeTab === 'gateway' && (
            <div className="flex-1 flex flex-col h-full font-mono text-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--color-border)] text-[var(--color-text-secondary)] text-xs">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[var(--color-text-primary)] animate-pulse" />
                  <span className="tracking-wider uppercase text-caption font-semibold text-[var(--color-text-secondary)]">GATEWAY STREAM // LIVE SERVICE METRICS</span>
                </div>
                <button
                  type="button"
                  onClick={handleClearLogs}
                  className="hover:text-[var(--color-text-primary)] text-[var(--color-text-muted)] flex items-center gap-1.5 transition-colors font-mono uppercase text-caption cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Stream
                </button>
              </div>

              {/* Logs Stream display */}
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 max-h-[300px]">
                {logs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-[var(--color-text-muted)] py-12 text-center">
                    <p className="mb-2 text-[var(--color-text-muted)] font-semibold">// NO INCOMING PACKETS DETECTED</p>
                    <p className="text-caption text-[var(--color-text-muted)]">Execute scenarios on the left dashboard to trigger monolith Gateway logs.</p>
                  </div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="border-l bg-[var(--color-surface)]/50 hover:bg-[var(--color-surface-hover)]/50 duration-150 p-3 rounded-r-lg border-[var(--color-border-hover)] space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-body-xs">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded text-caption font-bold bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)]">
                            {log.method}
                          </span>
                          <span className="text-[var(--color-text-primary)] font-semibold">{log.endpoint}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                          <span className="text-[var(--color-text-muted)] text-caption">{log.timestamp}</span>
                          <span>{log.latencyMs}ms</span>
                          <span className="text-[var(--color-text-primary)] bg-[var(--color-surface)]/15 px-1.5 py-0.5 rounded text-caption font-semibold">{log.status}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 text-caption text-[var(--color-text-secondary)] gap-2 font-mono">
                        <div>MODULE BOUNDARY: <span className="text-[var(--color-text-primary)] font-medium">{log.module}Router</span></div>
                      </div>
                      
                      {log.payload && (
                        <div className="bg-[var(--color-surface)]/40 p-2.5 rounded text-caption text-[var(--color-text-muted)] overflow-x-auto whitespace-pre">
                          {log.payload}
                        </div>
                      )}
                    </div>
                  ))
                )}
                <div ref={loggerEndRef} />
              </div>
            </div>
          )}

          {activeTab === 'monolith' && (
            <div className="flex-1 flex flex-col justify-between py-2 text-sm">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[var(--color-text-primary)] pb-2 border-b border-[var(--color-border)]">
                  <Server className="w-4 h-4 text-[var(--color-text-secondary)]" />
                  <span className="font-mono text-caption uppercase tracking-wider font-semibold">Modular Monolith Controller Blueprint</span>
                </div>
                <p className="text-[var(--color-text-secondary)] text-xs font-sans leading-relaxed">
                  The architecture isolates routes, service boundaries, and schemas within a single node compilation.
                  This ensures immediate execution without distributed network failure rates:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-2">
                  <div className="p-3 bg-[var(--color-surface)]/50 rounded border border-[var(--color-border)] space-y-1">
                    <div className="font-mono text-caption text-[var(--color-text-primary)] uppercase tracking-wider font-semibold">AuthModule</div>
                    <div className="text-caption text-[var(--color-text-secondary)] font-sans">Enforces JWT signatures, verifies accounts, rate limits.</div>
                  </div>
                  <div className="p-3 bg-[var(--color-surface)]/50 rounded border border-[var(--color-border)] space-y-1">
                    <div className="font-mono text-caption text-[var(--color-text-primary)] uppercase tracking-wider font-semibold">BillboardModule</div>
                    <div className="text-caption text-[var(--color-text-secondary)] font-sans">Hosts discovery geo-nodes, filters inventory classes.</div>
                  </div>
                  <div className="p-3 bg-[var(--color-surface)]/50 rounded border border-[var(--color-border)] space-y-1">
                    <div className="font-mono text-caption text-[var(--color-text-primary)] uppercase tracking-wider font-semibold">BookingModule</div>
                    <div className="text-caption text-[var(--color-text-secondary)] font-sans">Tracks date calendars & schedules. Prevents overlaps.</div>
                  </div>
                  <div className="p-3 bg-[var(--color-surface)]/50 rounded border border-[var(--color-border)] space-y-1">
                    <div className="font-mono text-caption text-[var(--color-text-primary)] uppercase tracking-wider font-semibold">PaymentExporter</div>
                    <div className="text-caption text-[var(--color-text-secondary)] font-sans">Bridges secure multi-regional payout parameters.</div>
                  </div>
                  <div className="p-3 bg-[var(--color-surface)]/50 rounded border border-[var(--color-border)] space-y-1">
                    <div className="font-mono text-caption text-[var(--color-text-primary)] uppercase tracking-wider font-semibold">MetricsEngine</div>
                    <div className="text-caption text-[var(--color-text-secondary)] font-sans">Aggregates regional mobile signals.</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-[var(--color-surface)]/50 text-[var(--color-text-secondary)] text-body-xs rounded border border-[var(--color-border)] flex items-center justify-between font-mono">
                <span>Migration path to microservices on Series-A: extraction via Prisma isolated databases.</span>
                <ArrowUpRight className="w-4 h-4 ml-1 text-[var(--color-text-secondary)]" />
              </div>
            </div>
          )}

          {activeTab === 'db_schema' && (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-2 text-[var(--color-text-primary)] pb-2 border-b border-[var(--color-border)] mb-3">
                <Database className="w-4 h-4 text-[var(--color-text-secondary)]" />
                <span className="font-mono text-caption uppercase tracking-wider font-semibold">PRISMA ORM SCHEMAS (POSTGRESQL MODELING)</span>
              </div>
              <pre className="text-caption text-[var(--color-text-secondary)] overflow-y-auto max-h-[280px] font-mono leading-relaxed bg-[var(--color-surface)]/40 p-4 rounded flex-1">
{`datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Billboard {
  id           String    @id @default(uuid())
  title        String
  location     String
  city         String
  country      String
  dailyRate    Decimal
  sizeFormat   String    // LED, Spectacular, Bridge
  impressions  Int
  bookings     Booking[]
  status       Status    @default(ACTIVE)
  createdAt    DateTime  @default(now())
}

model Booking {
  id           String    @id @default(uuid())
  billboardId  String
  billboard    Billboard @relation(fields: [billboardId], references: [id])
  campaignName String
  startDate    DateTime
  endDate      DateTime
  totalAmount  Decimal
  paymentState String    // PENDING, PAID, ESCROWED
  invoiceCode  String    @unique
}`}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
