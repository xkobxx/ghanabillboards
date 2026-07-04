import { useState } from 'react';
import { Sparkles, BarChart3, TrendingUp, Cpu, RefreshCw } from 'lucide-react';

interface AIPredictorProps {
  billboardTitle: string;
  dailyRate: number;
  monthlyImpressions: string;
}

const INDUSTRY_IDEAS: Record<string, { slogans: string[]; multiplier: number; demographics: string }> = {
  FinTech: {
    slogans: [
      "The Future of Money is Borderless.",
      "Send Cash Instantly. Zero Latency Financials.",
      "A Bank in Your Pocket. Built for Builders.",
      "Multiply Your Net Worth with programmatic yield."
    ],
    multiplier: 1.25,
    demographics: 'Young Professionals, Tech Workers, 24-45 age bracket'
  },
  FMCG: {
    slogans: [
      "Taste the Pure Gold of the Savannah.",
      "Refreshment with Real Organic Zing.",
      "Everyday Premium Essentials, Loved Nationally.",
      "Double the Energy, Half the Cost."
    ],
    multiplier: 1.15,
    demographics: 'Mass Market commuters, Active Households, 18-65 age bracket'
  },
  SaaS: {
    slogans: [
      "Scale from Local Endpoint to Series-A Infrastructure.",
      "Automate 92% of Admin Latency Overnight.",
      "The DevOps Command Center for African Tech Giants.",
      "Click. Automate. Scale Globally."
    ],
    multiplier: 1.40,
    demographics: 'Founders, Regional Executives, Business Commuters'
  },
  Creative: {
    slogans: [
      "Unchain Your Brand. Go Cinematic.",
      "The Boldest Canvas for African Game-Changers.",
      "Ideas that Command 3.8M Pairs of Eyes.",
      "Make Them Stop. Make Them Stare."
    ],
    multiplier: 1.35,
    demographics: 'Agencies, Cultured Consumers, Urban Sophisticates'
  }
};

export default function AIPredictor({ billboardTitle, dailyRate, monthlyImpressions }: AIPredictorProps) {
  const [selectedIndustry, setSelectedIndustry] = useState<'FinTech' | 'FMCG' | 'SaaS' | 'Creative'>('FinTech');
  const [currentSloganIndex, setCurrentSloganIndex] = useState(0);
  const [campaignProduct, setCampaignProduct] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const activeIndustryData = INDUSTRY_IDEAS[selectedIndustry];
  const activeSlogan = activeIndustryData.slogans[currentSloganIndex];

  const handleShuffle = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setCurrentSloganIndex((prev) => (prev + 1) % activeIndustryData.slogans.length);
      setIsGenerating(false);
    }, 500);
  };

  const selectIndustry = (ind: 'FinTech' | 'FMCG' | 'SaaS' | 'Creative') => {
    setSelectedIndustry(ind);
    setCurrentSloganIndex(0);
  };

  // Metrics simulation
  const rawImpressionsMultiplier = activeIndustryData.multiplier;
  const simulatedImpressionCount = Math.round(parseFloat(monthlyImpressions) * rawImpressionsMultiplier * 10) / 10;
  const estimatedCostPerView = ((dailyRate * 30) / (simulatedImpressionCount * 1000000)).toFixed(4);

  return (
    <div id="ai-copywriter" className="glass-panel rounded-2xl p-6 relative overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)]/50">
      {/* Background neon radial flare */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-surface)]/50 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[var(--color-surface)]/50 border border-[var(--color-border)] rounded text-[var(--color-text-primary)]">
            <Cpu className="w-5 h-5 text-[var(--color-text-secondary)]" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Billboard AI Ad Engine</h4>
            <span className="font-mono text-caption text-[var(--color-text-muted)] uppercase tracking-[0.2em]">PREDICTIVE CREATIVE OPTIMIZER</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--color-surface)]/50 text-[var(--color-text-primary)] font-mono text-caption rounded border border-[var(--color-border)] uppercase tracking-widest">
          <Sparkles className="w-3 h-3 text-[var(--color-text-secondary)] animate-pulse" />
          <span>PROGRAMMATIC V3</span>
        </div>
      </div>

      <p className="text-[var(--color-text-secondary)] text-xs mb-4 font-sans leading-relaxed">
        Select your sector and input your target keyphrase to simulate copywriting and project brand impact on the <span className="text-[var(--color-text-primary)] font-semibold uppercase">{billboardTitle}</span> node.
      </p>

      {/* Industry Tabs */}
      <div className="grid grid-cols-4 gap-1.5 mb-5">
        {(Object.keys(INDUSTRY_IDEAS) as Array<'FinTech' | 'FMCG' | 'SaaS' | 'Creative'>).map((ind) => (
          <button
            key={ind}
            type="button"
            onClick={() => selectIndustry(ind)}
            className={`py-2 px-1 text-xs font-mono rounded transition-all duration-300 cursor-pointer ${
              selectedIndustry === ind
                ? 'bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] font-semibold border border-[var(--color-border)]'
                : 'bg-[var(--color-surface)]/50 hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)]'
            }`}
          >
            {ind}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {/* Keyword text input */}
        <div>
          <label htmlFor="custom-brand-name" className="block font-mono text-caption text-[var(--color-text-secondary)] uppercase tracking-[0.2em] mb-1.5 font-semibold">
            YOUR BRAND / PRODUCT NAME
          </label>
          <input
            id="custom-brand-name"
            type="text"
            placeholder="e.g. PayPro, Savannah Energy, CloudOps"
            value={campaignProduct}
            onChange={(e) => setCampaignProduct(e.target.value)}
            className="w-full bg-[var(--color-surface)]/50 border border-[var(--color-border)] rounded px-3 py-2 text-sm font-sans focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-text-primary)] transition-all"
          />
        </div>

        {/* Live Billboard Slogan Mockup Visualizer */}
        <div className="relative bg-black/60 rounded-xl p-6 border border-[var(--color-border)] flex flex-col justify-between items-center min-h-[140px] text-center overflow-hidden">
          {/* Subtle glowing dots simulating billboard lights */}
          <div className="absolute top-1 left-0 right-0 flex justify-around px-4">
            <span className="w-1.5 h-1.5 bg-zinc-600/40 rounded-full blur-[1px]" />
            <span className="w-1.5 h-1.5 bg-zinc-400/50 rounded-full blur-[1px]" />
            <span className="w-1.5 h-1.5 bg-zinc-600/40 rounded-full blur-[1px]" />
          </div>
          
          <div className="absolute bottom-1 left-0 right-0 flex justify-around px-4">
            <span className="w-1 h-3 bg-zinc-800 rounded-t" />
            <span className="w-1 h-3 bg-zinc-800 rounded-t" />
          </div>

          <div className="my-auto relative max-w-[85%]">
            {campaignProduct ? (
              <span className="font-mono text-[var(--color-text-secondary)] text-caption uppercase tracking-[0.2em] block mb-1">
                {campaignProduct} Presents
              </span>
            ) : null}
            
            <p className={`font-sans font-bold text-base text-gray-100 tracking-tight transition-opacity duration-300 ${isGenerating ? 'opacity-30' : 'opacity-100'}`}>
              "{activeSlogan}"
            </p>
          </div>

          <button
            type="button"
            onClick={handleShuffle}
            disabled={isGenerating}
            className="mt-3 text-caption font-mono text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1.5 hover:underline bg-[var(--color-surface)]/50 hover:bg-[var(--color-surface)] px-3 py-1.5 rounded border border-[var(--color-border)] cursor-pointer transition-all"
          >
            <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
            SHUFFLE PROGRAMMATIC TAGLINES
          </button>
        </div>

        {/* Predicted Metrics Grid */}
        <div className="bg-[var(--color-surface)]/50 rounded-xl p-4 space-y-3 border border-[var(--color-border)]">
          <span className="font-mono text-caption text-[var(--color-text-secondary)] tracking-[0.2em] block uppercase font-semibold">
            ESTIMATED AD VALUE SCORECARD
          </span>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
                <BarChart3 className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
                <span className="text-caption uppercase font-mono tracking-wider">Impressions / Mo</span>
              </div>
              <p className="text-sm text-[var(--color-text-primary)] font-sans font-semibold tracking-tight">
                {simulatedImpressionCount} Million
                <span className="text-caption text-[var(--color-text-muted)] font-normal ml-1.5">
                  (+{(rawImpressionsMultiplier * 100 - 100).toFixed(0)}%)
                </span>
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
                <TrendingUp className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
                <span className="text-caption uppercase font-mono tracking-wider">Avg. CPM Index</span>
              </div>
              <p className="text-sm text-[var(--color-text-primary)] font-sans font-semibold tracking-tight">
                ${estimatedCostPerView} <span className="text-caption text-[var(--color-text-muted)] font-normal font-mono uppercase">Cost Per View</span>
              </p>
            </div>
          </div>

          <div className="border-t border-[var(--color-border)] pt-2 flex items-center justify-between text-body-xs text-[var(--color-text-muted)]">
            <span className="font-sans">Demographic Focus:</span>
            <span className="font-mono text-right text-[var(--color-text-secondary)] text-caption italic">{activeIndustryData.demographics}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
