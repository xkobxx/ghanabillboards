import { useState } from 'react';
import { INVESTMENT_DECK } from '../data';
import { ChevronLeft, ChevronRight, Presentation, Users, DollarSign, PieChart, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PitchDeck() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const activeSlide = INVESTMENT_DECK[currentSlideIndex];

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev === INVESTMENT_DECK.length - 1 ? 0 : prev + 1));
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev === 0 ? INVESTMENT_DECK.length - 1 : prev - 1));
  };

  return (
    <div id="investor-terminal" className="glass-panel clip-reveal rounded-2xl p-6 border border-[var(--color-border)] relative overflow-hidden">
      {/* Decorative ambient visual tag */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-[var(--color-surface)]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Slide Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2.5">
          <Presentation className="w-5 h-5 text-[var(--color-text-primary)]" />
          <div>
            <h4 className="font-semibold text-xl text-[var(--color-text-primary)] uppercase tracking-tight">Investor Presentation</h4>
            <span className="font-mono text-caption text-[var(--color-text-muted)] uppercase tracking-[0.3em] font-semibold">SERIES A STRATEGY DECK (V4.0)</span>
          </div>
        </div>

        {/* Slide Counter Dots */}
        <div className="flex items-center gap-1">
          {INVESTMENT_DECK.map((slide, idx) => (
            <button
              key={slide.slideNumber}
              type="button"
              onClick={() => setCurrentSlideIndex(idx)}
              className={`h-1.5 transition-all rounded cursor-pointer ${
                currentSlideIndex === idx ? 'w-6 bg-[var(--color-text-primary)]' : 'w-1.5 bg-[var(--color-border)] hover:bg-[var(--color-border-hover)]'
              }`}
              title={`Skip to slide ${slide.slideNumber}`}
            />
          ))}
        </div>
      </div>

      {/* Main Slide Stage */}
      <div className="relative bg-[var(--color-surface)] rounded-xl p-6 md:p-8 border border-[var(--color-border)] min-h-[380px] flex flex-col justify-between overflow-hidden">
        
        {/* Subtle Slide watermark */}
        <div className="absolute right-4 bottom-4 font-mono text-display font-bold text-[var(--color-text-primary)]/[0.02] leading-none select-none">
          0{activeSlide.slideNumber}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.slideNumber}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10 flex-1"
          >
            {/* Left Content Column */}
            <div className="md:col-span-7 flex flex-col justify-center space-y-4">
              <div className="space-y-1.5">
                <span className="font-mono text-caption text-[var(--color-text-muted)] uppercase tracking-[0.2em] font-semibold block">
                  SECTION 0{activeSlide.slideNumber} // {activeSlide.graphicType}
                </span>
                <h3 className="text-2xl font-semibold text-[var(--color-text-primary)] tracking-tight uppercase leading-tight">
                  {activeSlide.title}
                </h3>
                {activeSlide.subtitle && (
                  <p className="text-xs font-sans text-[var(--color-text-secondary)] italic">
                    "{activeSlide.subtitle}"
                  </p>
                )}
              </div>

              <ul className="space-y-2.5 pt-2">
                {activeSlide.bullets.map((bullet, i) => (
                  <li key={i} className="flex gap-2 text-xs md:text-sm text-[var(--color-text-secondary)] leading-relaxed font-sans">
                    <span className="text-[var(--color-text-primary)] font-mono text-xs select-none">▪</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Graphic Representation Column */}
            <div className="md:col-span-5 flex items-center justify-center bg-[var(--color-surface)]/50 rounded-xl border border-[var(--color-border)] p-6 min-h-[200px]">
              {activeSlide.graphicType === 'problem' && (
                <div className="text-center space-y-4 w-full">
                  <span className="font-mono text-caption text-[var(--color-text-muted)] block tracking-[0.2em] font-semibold uppercase">OPACITY INDEX</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-[var(--color-surface)] rounded border border-[var(--color-border)] text-center space-y-1">
                      <span className="font-mono text-xs text-[var(--color-text-primary)] font-semibold">18 Days</span>
                      <p className="text-caption text-[var(--color-text-secondary)] font-sans">Traditional Booking Loop</p>
                    </div>
                    <div className="p-3 bg-[var(--color-surface)] rounded border border-[var(--color-border)] text-center space-y-1">
                      <span className="font-mono text-xs text-[var(--color-text-primary)] font-semibold">42% Void</span>
                      <p className="text-caption text-[var(--color-text-secondary)] font-sans">Average Annual Empty Supply</p>
                    </div>
                  </div>
                  <div className="text-caption font-mono text-[var(--color-text-muted)]">
                    Opaque physical negotiations dominate regional sales.
                  </div>
                </div>
              )}

              {activeSlide.graphicType === 'solution' && (
                <div className="text-center space-y-4 w-full">
                  <span className="font-mono text-caption text-[var(--color-text-muted)] block tracking-[0.2em] font-semibold uppercase">PROGRAMMATIC DISPATCH</span>
                  <div className="relative py-2">
                    <div className="h-1 bg-[var(--color-border)] w-full rounded relative overflow-hidden">
                      <div className="absolute bg-[var(--color-primary)] h-full w-[85%] rounded animate-pulse" />
                    </div>
                    <div className="flex justify-between text-caption font-mono text-[var(--color-text-secondary)] mt-2">
                      <span>Search Node</span>
                      <span>JWT Key Sign</span>
                      <span>Ad Dispatched</span>
                    </div>
                  </div>
                  <div className="bg-[var(--color-surface)] px-3 py-1.5 rounded border border-[var(--color-border)] text-xs font-sans text-[var(--color-text-primary)] flex items-center gap-1.5 justify-center font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
                    <span>Booking Time cut down to 4.5 seconds</span>
                  </div>
                </div>
              )}

              {activeSlide.graphicType === 'market' && (
                <div className="w-full space-y-3.5 text-xs font-sans">
                  <span className="font-mono text-caption text-[var(--color-text-muted)] block text-center tracking-[0.2em] font-semibold uppercase">SS-AFRICA TAM FORCAST</span>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-caption mb-1">
                        <span className="text-[var(--color-text-secondary)] font-mono">TAM (OOH Spend Regional)</span>
                        <span className="text-[var(--color-text-primary)] font-semibold">$2.2B</span>
                      </div>
                      <div className="h-1.5 bg-[var(--color-border)] w-full rounded overflow-hidden">
                        <div className="bg-[var(--color-text-muted)] h-full w-[95%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-caption mb-1">
                        <span className="text-[var(--color-text-secondary)] font-mono">SOM (Programmatic Target)</span>
                        <span className="text-[var(--color-text-primary)] font-semibold">$280M</span>
                      </div>
                      <div className="h-1.5 bg-[var(--color-border)] w-full rounded overflow-hidden">
                        <div className="bg-[var(--color-primary)] h-full w-[35%]" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSlide.graphicType === 'model' && (
                <div className="text-center p-2 w-full space-y-3">
                  <span className="font-mono text-caption text-[var(--color-text-muted)] block tracking-[0.2em] font-semibold uppercase">TRANSACTION FLUIDITY</span>
                  <div className="flex justify-around items-center py-1">
                    <div className="text-center">
                      <span className="text-xs text-[var(--color-text-primary)] font-semibold">15%</span>
                      <p className="text-caption text-[var(--color-text-secondary)] font-mono uppercase">Platform Rake</p>
                    </div>
                    <div className="h-4 w-[1px] bg-[var(--color-border)]" />
                    <div className="text-center">
                      <span className="text-xs text-[var(--color-text-primary)] font-semibold">SaaS</span>
                      <p className="text-caption text-[var(--color-text-secondary)] font-mono uppercase">Brand Portal</p>
                    </div>
                    <div className="h-4 w-[1px] bg-[var(--color-border)]" />
                    <div className="text-center">
                      <span className="text-xs text-[var(--color-text-primary)] font-semibold">Escrow</span>
                      <p className="text-caption text-[var(--color-text-secondary)] font-mono uppercase">Clearing</p>
                    </div>
                  </div>
                  <div className="text-caption font-sans text-[var(--color-text-secondary)] italic">
                    "Scalable recurring fees with negligible transactional inventory friction."
                  </div>
                </div>
              )}

              {activeSlide.graphicType === 'architecture' && (
                <div className="w-full space-y-3 text-xs font-mono">
                  <span className="text-caption text-[var(--color-text-muted)] block text-center uppercase tracking-[0.2em] font-semibold">ROUTING BLUEPRINT</span>
                  <div className="space-y-1.5 text-caption">
                    <div className="p-1 px-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded flex justify-between">
                      <span className="text-[var(--color-text-muted)]">Gateway Client:</span>
                      <span className="text-[var(--color-text-primary)]">Nginx Route 3000</span>
                    </div>
                    <div className="p-1 px-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded flex justify-between">
                      <span className="text-[var(--color-text-muted)]">Service Isolation:</span>
                      <span className="text-[var(--color-text-primary)]">RPC Controller</span>
                    </div>
                    <div className="p-1 px-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded flex justify-between">
                      <span className="text-[var(--color-text-muted)]">Database Layer:</span>
                      <span className="text-[var(--color-text-primary)]">PostgreSQL via Prisma</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Action Controls Footer */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--color-border)] relative z-10 text-body-xs font-mono">
          <div className="text-[var(--color-text-muted)] tracking-wider">
            SLIDE INDEX {activeSlide.slideNumber} / {INVESTMENT_DECK.length}
          </div>
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePrevSlide}
              className="p-2 border border-[var(--color-border)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)] text-[var(--color-text-primary)] rounded cursor-pointer transition-all"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextSlide}
              className="p-2 border border-[var(--color-border)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)] text-[var(--color-text-primary)] rounded cursor-pointer transition-all"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
