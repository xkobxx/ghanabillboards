// Design Tokens for Vantage Point
// Light Mode + Cinematic Dark

export type ThemeMode = 'light' | 'cinematic';

export const designTokens = {
  // ============================================
  // COLOR PALETTES
  // ============================================
  colors: {
    light: {
      // Primary
      primary: '#0066CC',
      primaryHover: '#0052A3',
      primaryActive: '#003D7A',
      primaryFocus: 'rgba(0, 102, 204, 0.1)',
      primaryDim: 'rgba(0, 102, 204, 0.08)',
      primaryBorder: 'rgba(0, 102, 204, 0.3)',
      
      // Neutral Scale
      black: '#000000',
      darkGray: '#515151',
      mediumGray: '#999999',
      lightGray: '#CCCCCC',
      borderGray: '#E0E0E0',
      surfaceHover: '#F5F5F5',
      
      // Surfaces
      white: '#FFFFFF',
      background: '#FFFFFF',
      backgroundDeep: '#F5F7FA',
      backgroundElevated: '#FFFFFF',
      surface: '#FFFFFF',
      surfaceElevated: '#FFFFFF',

      // Borders
      border: '#E0E0E0',
      borderHover: '#CCCCCC',
      borderStrong: '#999999',
      
      // Interactive
      disabledBg: '#F5F5F5',
      disabledText: '#CCCCCC',
      disabledBorder: '#DDDDDD',
      
      // Status
      success: '#10B981',
      successBg: 'rgba(16, 185, 129, 0.1)',
      successBorder: 'rgba(16, 185, 129, 0.3)',
      
      warning: '#F59E0B',
      warningBg: 'rgba(245, 158, 11, 0.1)',
      warningBorder: 'rgba(245, 158, 11, 0.3)',
      
      error: '#D32F2F',
      errorBg: 'rgba(211, 47, 47, 0.1)',
      errorBorder: 'rgba(211, 47, 47, 0.3)',
      
      // Format-specific (Cinematic Dark uses these too)
      format: {
        digitalLED: { bg: '#1C1C1C', border: '#3CFFD0', text: '#3CFFD0', glow: '#3CFFD0' },
        staticMega: { bg: '#1C1C1C', border: 'rgba(255,255,255,0.25)', text: '#FFFFFF', glow: '#FFFFFF' },
        spectacularBridge: { bg: '#1C1C1C', border: '#5200FF', text: '#5200FF', glow: '#5200FF' },
        portraitPillar: { bg: '#1C1C1C', border: 'rgba(236,72,153,0.5)', text: '#EC4899', glow: '#EC4899' },
      },
      
      // Text
      textPrimary: '#000000',
      textSecondary: '#515151',
      textMuted: '#999999',
      textInverse: '#FFFFFF',
      textLink: '#0066CC',
      textLinkHover: '#0052A3',
    },
    
    cinematic: {
      // Primary Accent
      primary: '#5BC0A0',
      primaryHover: '#4DAA8E',
      primaryActive: '#3F947A',
      primaryFocus: 'rgba(91, 192, 160, 0.15)',
      primaryDim: 'rgba(91, 192, 160, 0.1)',
      primaryBorder: 'rgba(91, 192, 160, 0.3)',
      
      // Backgrounds
      background: '#131313',
      backgroundDeep: '#0C0C0C',
      backgroundElevated: '#1C1C1C',
      surface: '#1C1C1C',
      surfaceHover: '#252525',
      surfaceElevated: '#161619',

      // Interactive
      disabledBg: '#1C1C1C',
      disabledText: '#52525B',
      disabledBorder: '#27272A',
      
      // Borders
      border: 'rgba(255, 255, 255, 0.1)',
      borderHover: 'rgba(255, 255, 255, 0.2)',
      borderStrong: 'rgba(255, 255, 255, 0.15)',
      
      // Text
      textPrimary: '#FFFFFF',
      textSecondary: '#D4D4D8', // zinc-300
      textMuted: '#71717A', // zinc-500
      textInverse: '#131313',
      textLink: '#3CFFD0',
      textLinkHover: '#2FE0B7',
      
      // Status
      success: '#10B981',
      successBg: 'rgba(16, 185, 129, 0.1)',
      successBorder: 'rgba(16, 185, 129, 0.3)',
      
      warning: '#F59E0B',
      warningBg: 'rgba(245, 158, 11, 0.1)',
      warningBorder: 'rgba(245, 158, 11, 0.3)',
      
      error: '#EF4444',
      errorBg: 'rgba(239, 68, 68, 0.1)',
      errorBorder: 'rgba(239, 68, 68, 0.3)',
      
      // Format-specific
      format: {
        digitalLED: { bg: '#1C1C1C', border: '#3CFFD0', text: '#3CFFD0', glow: '#3CFFD0' },
        staticMega: { bg: '#1C1C1C', border: 'rgba(255,255,255,0.25)', text: '#FFFFFF', glow: '#FFFFFF' },
        spectacularBridge: { bg: '#1C1C1C', border: '#5200FF', text: '#5200FF', glow: '#5200FF' },
        portraitPillar: { bg: '#1C1C1C', border: 'rgba(236,72,153,0.5)', text: '#EC4899', glow: '#EC4899' },
      },
    },
  },

  // ============================================
  // TYPOGRAPHY
  // ============================================
  typography: {
    // Light Mode
    light: {
      fontFamily: {
        heading: "'Urbanist Variable', 'Urbanist', ui-sans-serif, system-ui, sans-serif",
        sans: "'Geist Variable', 'Geist', ui-sans-serif, system-ui, sans-serif",
        serif: "'Urbanist Variable', 'Urbanist', ui-sans-serif, system-ui, sans-serif",
        mono: "'Geist Mono Variable', 'Geist Mono', ui-monospace, monospace",
      },
      fontSize: {
        display: 'clamp(48px, 6vw, 96px)',
        h1: 'clamp(36px, 5vw, 72px)',
        h2: 'clamp(28px, 3.5vw, 48px)',
        h3: 'clamp(20px, 2.5vw, 28px)',
        h4: '18px',
        bodyLg: '16px',
        body: '14px',
        bodySm: '13px',
        bodyXs: '12px',
        caption: '11px',
        button: '14px',
        link: '14px',
        code: '13px',
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
        black: 900,
      },
      lineHeight: {
        tight: 1.1,
        snug: 1.3,
        normal: 1.5,
        relaxed: 1.6,
        loose: 2,
      },
      letterSpacing: {
        tight: '-0.02em',
        normal: '0',
        wide: '0.02em',
        wider: '0.1em',
        widest: '0.3em',
      },
    },
    
    // Cinematic
    cinematic: {
      fontFamily: {
        heading: "'Urbanist Variable', 'Urbanist', ui-sans-serif, system-ui, sans-serif",
        sans: "'Geist Variable', 'Geist', ui-sans-serif, system-ui, sans-serif",
        serif: "'Urbanist Variable', 'Urbanist', ui-sans-serif, system-ui, sans-serif",
        mono: "'Geist Mono Variable', 'Geist Mono', ui-monospace, monospace",
      },
      fontSize: {
        display: 'clamp(3rem, 6vw, 7rem)',
        h1: 'clamp(2.5rem, 4vw, 3.5rem)',
        h2: 'clamp(1.75rem, 3vw, 2.5rem)',
        h3: 'clamp(1.25rem, 2vw, 1.75rem)',
        h4: '1.125rem',
        bodyLg: '1.0625rem',
        body: '0.9375rem',
        bodySm: '0.8125rem',
        bodyXs: '0.75rem',
        caption: '0.6875rem',
        button: '0.875rem',
        link: '0.875rem',
        code: '0.8125rem',
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
        black: 900,
      },
      lineHeight: {
        tight: 0.9,
        snug: 1.2,
        normal: 1.5,
        relaxed: 1.6,
        loose: 1.8,
      },
      letterSpacing: {
        tight: '-0.02em',
        normal: '0',
        wide: '0.02em',
        wider: '0.1em',
        widest: '0.4em',
      },
    },
  },

  // ============================================
  // SPACING (8px base unit)
  // ============================================
  spacing: {
    base: '8px',
    scale: {
      0: '0',
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
      5: '20px',
      6: '24px',
      8: '32px',
      10: '40px',
      12: '48px',
      16: '64px',
      18: '72px',
      20: '80px',
      24: '96px',
      32: '128px',
    },
    // Semantic spacing
    semantic: {
      xs: '4px',
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '20px',
      '2xl': '32px',
      '3xl': '48px',
      '4xl': '72px',
      // Component-specific
      inputPadding: '12px',
      buttonPadding: '12px 20px',
      cardPadding: '20px',
      sectionPadding: '32px',
      containerPadding: '32px',
      componentGap: '8px',
      touchTarget: '44px',
    },
  },

  // ============================================
  // BORDER RADIUS
  // ============================================
  borderRadius: {
    none: '0px',
    sm: '4px',    // Buttons, inputs, form controls
    md: '8px',    // Cards, modals, surface containers
    lg: '12px',   // Large cards, panels
    xl: '16px',   // Featured panels
    '2xl': '24px', // Hero sections
    full: '9999px', // Pills, badges
  },

  // ============================================
  // SHADOWS / ELEVATION
  // ============================================
  shadows: {
    light: {
      level0: 'none',
      level1: '0px 1px 3px rgba(0, 0, 0, 0.12)',
      level2: '0px 4px 12px rgba(0, 0, 0, 0.15)',
      level3: '0px 12px 40px rgba(0, 0, 0, 0.25)',
      // Semantic
      card: '0px 1px 3px rgba(0, 0, 0, 0.12)',
      cardHover: '0px 4px 12px rgba(0, 0, 0, 0.15)',
      modal: '0px 12px 40px rgba(0, 0, 0, 0.25)',
      dropdown: '0px 4px 12px rgba(0, 0, 0, 0.15)',
      focus: '0px 0px 0px 2px rgba(0, 102, 204, 0.1)',
      focusError: '0px 0px 0px 2px rgba(211, 47, 47, 0.1)',
      glow: 'none',
      glowStrong: 'none',
    },
    cinematic: {
      level0: 'none',
      level1: '0px 2px 8px rgba(0, 0, 0, 0.3)',
      level2: '0px 8px 24px rgba(0, 0, 0, 0.4)',
      level3: '0px 24px 48px rgba(0, 0, 0, 0.5)',
      // Semantic
      card: '0px 2px 8px rgba(0, 0, 0, 0.3)',
      cardHover: '0px 8px 24px rgba(0, 0, 0, 0.4)',
      modal: '0px 24px 48px rgba(0, 0, 0, 0.5)',
      dropdown: '0px 8px 24px rgba(0, 0, 0, 0.4)',
      glow: '0px 0px 20px rgba(60, 255, 208, 0.15)',
      glowStrong: '0px 0px 40px rgba(60, 255, 208, 0.25)',
      focus: '0px 0px 0px 2px rgba(60, 255, 208, 0.2)',
      focusError: '0px 0px 0px 2px rgba(239, 68, 68, 0.2)',
    },
  },

  // ============================================
  // BREAKPOINTS
  // ============================================
  breakpoints: {
    mobile: '320px',
    tablet: '768px',
    desktop: '1024px',
    largeDesktop: '1440px',
    maxWidth: '1200px',
    containerMax: '1440px',
  },

  // ============================================
  // TRANSITIONS
  // ============================================
  transitions: {
    fast: '150ms ease',
    normal: '200ms ease',
    slow: '300ms ease',
    slower: '500ms cubic-bezier(0.16, 1, 0.3, 1)',
    spring: '400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  // ============================================
  // Z-INDEX SCALE
  // ============================================
  zIndex: {
    base: 0,
    dropdown: 100,
    sticky: 200,
    fixed: 300,
    modalBackdrop: 400,
    modal: 500,
    popover: 600,
    tooltip: 700,
    toast: 800,
    cursor: 9999,
  },

  // ============================================
  // CONTAINER QUERIES
  // ============================================
  containerQueries: {
    sm: '320px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
} as const;

// ============================================
// THEME CSS VARIABLES GENERATOR
// ============================================
export function generateCSSVariables(mode: ThemeMode): Record<string, string> {
  const c = designTokens.colors[mode];
  const t = designTokens.typography[mode];
  const s = designTokens.shadows[mode];
  const r = designTokens.borderRadius;
  const sp = designTokens.spacing;

  const vars: Record<string, string> = {
    // Colors
    '--color-primary': c.primary,
    '--color-primary-hover': c.primaryHover,
    '--color-primary-active': c.primaryActive,
    '--color-primary-focus': c.primaryFocus,
    '--color-primary-dim': c.primaryDim || 'transparent',
    '--color-primary-border': c.primaryBorder || c.primary,

    '--color-background': c.background,
    '--color-background-deep': c.backgroundDeep || c.background,
    '--color-background-elevated': c.backgroundElevated || c.surface,
    '--color-surface': c.surface,
    '--color-surface-hover': c.surfaceHover,
    '--color-surface-elevated': c.surfaceElevated || c.surface,

    '--color-border': c.border,
    '--color-border-hover': c.borderHover,
    '--color-border-strong': c.borderStrong,

    '--color-text-primary': c.textPrimary,
    '--color-text-secondary': c.textSecondary,
    '--color-text-muted': c.textMuted,
    '--color-text-inverse': c.textInverse,
    '--color-text-link': c.textLink,
    '--color-text-link-hover': c.textLinkHover,

    '--color-success': c.success,
    '--color-success-bg': c.successBg,
    '--color-success-border': c.successBorder,
    '--color-warning': c.warning,
    '--color-warning-bg': c.warningBg,
    '--color-warning-border': c.warningBorder,
    '--color-error': c.error,
    '--color-error-bg': c.errorBg,
    '--color-error-border': c.errorBorder,

    // Format colors (object -> individual vars)
    '--color-format-digital-bg': c.format.digitalLED.bg,
    '--color-format-digital-border': c.format.digitalLED.border,
    '--color-format-digital-text': c.format.digitalLED.text,
    '--color-format-digital-glow': c.format.digitalLED.glow,

    '--color-format-static-bg': c.format.staticMega.bg,
    '--color-format-static-border': c.format.staticMega.border,
    '--color-format-static-text': c.format.staticMega.text,
    '--color-format-static-glow': c.format.staticMega.glow,

    '--color-format-spectacular-bg': c.format.spectacularBridge.bg,
    '--color-format-spectacular-border': c.format.spectacularBridge.border,
    '--color-format-spectacular-text': c.format.spectacularBridge.text,
    '--color-format-spectacular-glow': c.format.spectacularBridge.glow,

    '--color-format-portrait-bg': c.format.portraitPillar.bg,
    '--color-format-portrait-border': c.format.portraitPillar.border,
    '--color-format-portrait-text': c.format.portraitPillar.text,
    '--color-format-portrait-glow': c.format.portraitPillar.glow,

    // Disabled
    '--color-disabled-bg': c.disabledBg || c.surfaceHover,
    '--color-disabled-text': c.disabledText || c.textMuted,
    '--color-disabled-border': c.disabledBorder || c.border,

    // Typography
    '--font-heading': t.fontFamily.heading,
    '--font-sans': t.fontFamily.sans,
    '--font-serif': t.fontFamily.serif,
    '--font-mono': t.fontFamily.mono,

    '--text-display': t.fontSize.display,
    '--text-h1': t.fontSize.h1,
    '--text-h2': t.fontSize.h2,
    '--text-h3': t.fontSize.h3,
    '--text-h4': t.fontSize.h4,
    '--text-body-lg': t.fontSize.bodyLg,
    '--text-body': t.fontSize.body,
    '--text-body-sm': t.fontSize.bodySm,
    '--text-body-xs': t.fontSize.bodyXs,
    '--text-caption': t.fontSize.caption,
    '--text-button': t.fontSize.button,
    '--text-link': t.fontSize.link,
    '--text-code': t.fontSize.code,

    /* backward-compat aliases */
    '--font-size-display': t.fontSize.display,
    '--font-size-h1': t.fontSize.h1,
    '--font-size-h2': t.fontSize.h2,
    '--font-size-h3': t.fontSize.h3,
    '--font-size-body': t.fontSize.body,
    '--font-size-body-sm': t.fontSize.bodySm,
    '--font-size-caption': t.fontSize.bodyXs,
    '--font-size-button': t.fontSize.button,
    '--font-size-link': t.fontSize.link,
    '--font-size-code': t.fontSize.code,

    '--font-weight-light': t.fontWeight.light.toString(),
    '--font-weight-normal': t.fontWeight.normal.toString(),
    '--font-weight-medium': t.fontWeight.medium.toString(),
    '--font-weight-semibold': t.fontWeight.semibold.toString(),
    '--font-weight-bold': t.fontWeight.bold.toString(),
    '--font-weight-extrabold': t.fontWeight.extrabold.toString(),
    '--font-weight-black': (t.fontWeight.black || 900).toString(),

    '--line-height-tight': t.lineHeight.tight.toString(),
    '--line-height-snug': t.lineHeight.snug.toString(),
    '--line-height-normal': t.lineHeight.normal.toString(),
    '--line-height-relaxed': t.lineHeight.relaxed.toString(),
    '--line-height-loose': t.lineHeight.loose.toString(),

    '--letter-spacing-tight': t.letterSpacing.tight,
    '--letter-spacing-normal': t.letterSpacing.normal,
    '--letter-spacing-wide': t.letterSpacing.wide,
    '--letter-spacing-wider': t.letterSpacing.wider,
    '--letter-spacing-widest': t.letterSpacing.widest,

    // Spacing
    '--spacing-base': sp.base,
    '--spacing-1': sp.scale[1],
    '--spacing-2': sp.scale[2],
    '--spacing-3': sp.scale[3],
    '--spacing-4': sp.scale[4],
    '--spacing-5': sp.scale[5],
    '--spacing-6': sp.scale[6],
    '--spacing-8': sp.scale[8],
    '--spacing-10': sp.scale[10],
    '--spacing-12': sp.scale[12],
    '--spacing-16': sp.scale[16],
    '--spacing-18': sp.scale[18],
    '--spacing-20': sp.scale[20],
    '--spacing-24': sp.scale[24],
    '--spacing-32': sp.scale[32],

    '--spacing-input-padding': sp.semantic.inputPadding,
    '--spacing-button-padding': sp.semantic.buttonPadding,
    '--spacing-card-padding': sp.semantic.cardPadding,
    '--spacing-section-padding': sp.semantic.sectionPadding,
    '--spacing-container-padding': sp.semantic.containerPadding,
    '--spacing-component-gap': sp.semantic.componentGap,
    '--spacing-touch-target': sp.semantic.touchTarget,

    // Border Radius
    '--radius-none': r.none,
    '--radius-sm': r.sm,
    '--radius-md': r.md,
    '--radius-lg': r.lg,
    '--radius-xl': r.xl,
    '--radius-2xl': r['2xl'],
    '--radius-full': r.full,

    // Shadows
    '--shadow-level0': s.level0,
    '--shadow-level1': s.level1,
    '--shadow-level2': s.level2,
    '--shadow-level3': s.level3,
    '--shadow-card': s.card,
    '--shadow-card-hover': s.cardHover,
    '--shadow-modal': s.modal,
    '--shadow-dropdown': s.dropdown,
    '--shadow-focus': s.focus,
    '--shadow-focus-error': s.focusError,
    '--shadow-glow': s.glow || 'none',
    '--shadow-glow-strong': s.glowStrong || 'none',

    // Transitions
    '--transition-fast': designTokens.transitions.fast,
    '--transition-normal': designTokens.transitions.normal,
    '--transition-slow': designTokens.transitions.slow,
    '--transition-slower': designTokens.transitions.slower,
    '--transition-spring': designTokens.transitions.spring,

    // Z-Index
    '--z-base': designTokens.zIndex.base.toString(),
    '--z-dropdown': designTokens.zIndex.dropdown.toString(),
    '--z-sticky': designTokens.zIndex.sticky.toString(),
    '--z-fixed': designTokens.zIndex.fixed.toString(),
    '--z-modal-backdrop': designTokens.zIndex.modalBackdrop.toString(),
    '--z-modal': designTokens.zIndex.modal.toString(),
    '--z-popover': designTokens.zIndex.popover.toString(),
    '--z-tooltip': designTokens.zIndex.tooltip.toString(),
    '--z-toast': designTokens.zIndex.toast.toString(),
    '--z-cursor': designTokens.zIndex.cursor.toString(),

    // Breakpoints
    '--breakpoint-mobile': designTokens.breakpoints.mobile,
    '--breakpoint-tablet': designTokens.breakpoints.tablet,
    '--breakpoint-desktop': designTokens.breakpoints.desktop,
    '--breakpoint-large-desktop': designTokens.breakpoints.largeDesktop,
    '--container-max': designTokens.breakpoints.containerMax,
    '--container-max-wide': designTokens.breakpoints.maxWidth,
  };

  return vars;
}

// ============================================
// COMPONENT TOKEN PRESETS
// ============================================
export const componentTokens = {
  button: {
    primary: {
      light: {
        background: 'var(--color-primary)',
        color: 'var(--color-text-inverse)',
        border: '1px solid var(--color-primary)',
        padding: 'var(--spacing-button-padding)',
        borderRadius: 'var(--radius-sm)',
        fontWeight: 'var(--font-weight-semibold)',
        fontSize: 'var(--text-button)',
        cursor: 'pointer',
        hover: {
          background: 'var(--color-primary-hover)',
          borderColor: 'var(--color-primary-hover)',
        },
        active: {
          background: 'var(--color-primary-active)',
          borderColor: 'var(--color-primary-active)',
        },
        focus: {
          outline: '2px solid var(--color-primary-hover)',
          outlineOffset: '2px',
        },
        disabled: {
          background: 'var(--color-disabled-bg)',
          color: 'var(--color-disabled-text)',
          borderColor: 'var(--color-disabled-border)',
          cursor: 'not-allowed',
        },
      },
      cinematic: {
        background: 'var(--color-primary)',
        color: 'var(--color-text-inverse)',
        border: '1px solid var(--color-primary)',
        padding: 'var(--spacing-button-padding)',
        borderRadius: 'var(--radius-sm)',
        fontWeight: 'var(--font-weight-semibold)',
        fontSize: 'var(--text-button)',
        cursor: 'pointer',
        hover: {
          background: 'var(--color-primary-hover)',
          borderColor: 'var(--color-primary-hover)',
        },
        active: {
          background: 'var(--color-primary-active)',
          borderColor: 'var(--color-primary-active)',
        },
        focus: {
          outline: '2px solid var(--color-primary-hover)',
          outlineOffset: '2px',
        },
        disabled: {
          background: 'var(--color-disabled-bg)',
          color: 'var(--color-disabled-text)',
          borderColor: 'var(--color-disabled-border)',
          cursor: 'not-allowed',
        },
      },
    },
    secondary: {
      light: {
        background: 'var(--color-surface)',
        color: 'var(--color-primary)',
        border: '1px solid var(--color-primary)',
        padding: 'var(--spacing-button-padding)',
        borderRadius: 'var(--radius-sm)',
        fontWeight: 'var(--font-weight-semibold)',
        fontSize: 'var(--text-button)',
        cursor: 'pointer',
        hover: {
          background: 'var(--color-surface-hover)',
          borderColor: 'var(--color-primary-hover)',
          color: 'var(--color-primary-hover)',
        },
        active: {
          background: 'var(--color-disabled-bg)',
          borderColor: 'var(--color-primary-active)',
          color: 'var(--color-primary-active)',
        },
        focus: {
          outline: '2px solid var(--color-primary-hover)',
          outlineOffset: '2px',
        },
        disabled: {
          background: 'var(--color-surface-hover)',
          color: 'var(--color-disabled-text)',
          borderColor: 'var(--color-disabled-border)',
          cursor: 'not-allowed',
        },
      },
      cinematic: {
        background: 'transparent',
        color: 'var(--color-primary)',
        border: '1px solid transparent',
        padding: 'var(--spacing-button-padding)',
        borderRadius: 'var(--radius-sm)',
        fontWeight: 'var(--font-weight-semibold)',
        fontSize: 'var(--text-button)',
        cursor: 'pointer',
        hover: {
          background: 'var(--color-surface-hover)',
          color: 'var(--color-primary-hover)',
        },
        active: {
          background: 'var(--color-surface-elevated)',
          color: 'var(--color-primary-active)',
        },
        focus: {
          outline: '2px solid var(--color-primary-hover)',
          outlineOffset: '2px',
        },
        disabled: {
          color: 'var(--color-disabled-text)',
          cursor: 'not-allowed',
        },
      },
    },
    ghost: {
      light: {
        background: 'transparent',
        color: 'var(--color-primary)',
        border: '1px solid transparent',
        padding: 'var(--spacing-button-padding)',
        borderRadius: 'var(--radius-sm)',
        fontWeight: 'var(--font-weight-semibold)',
        fontSize: 'var(--text-button)',
        cursor: 'pointer',
        hover: {
          background: 'var(--color-surface-hover)',
          color: 'var(--color-primary-hover)',
        },
        active: {
          background: 'var(--color-disabled-bg)',
          color: 'var(--color-primary-active)',
        },
        focus: {
          outline: '2px solid var(--color-primary-hover)',
          outlineOffset: '2px',
        },
        disabled: {
          color: 'var(--color-disabled-text)',
          cursor: 'not-allowed',
        },
      },
      cinematic: {
        background: 'transparent',
        color: 'var(--color-primary)',
        border: '1px solid transparent',
        padding: 'var(--spacing-button-padding)',
        borderRadius: 'var(--radius-sm)',
        fontWeight: 'var(--font-weight-semibold)',
        fontSize: 'var(--text-button)',
        cursor: 'pointer',
        hover: {
          background: 'var(--color-surface-hover)',
          color: 'var(--color-primary-hover)',
        },
        active: {
          background: 'var(--color-surface-elevated)',
          color: 'var(--color-primary-active)',
        },
        focus: {
          outline: '2px solid var(--color-primary-hover)',
          outlineOffset: '2px',
        },
        disabled: {
          color: 'var(--color-disabled-text)',
          cursor: 'not-allowed',
        },
      },
    },
  },

  input: {
    light: {
      background: 'var(--color-surface)',
      color: 'var(--color-text-primary)',
      border: '1px solid var(--color-light-gray)',
      borderRadius: 'var(--radius-sm)',
      padding: 'var(--spacing-input-padding)',
      fontSize: 'var(--text-body-sm)',
      fontWeight: 'var(--font-weight-normal)',
      placeholderColor: 'var(--color-text-muted)',
      hover: {
        borderColor: 'var(--color-medium-gray)',
      },
      focus: {
        borderColor: 'var(--color-primary)',
        boxShadow: 'var(--shadow-focus)',
      },
      disabled: {
        background: 'var(--color-surface-hover)',
        color: 'var(--color-disabled-text)',
        borderColor: 'var(--color-disabled-border)',
        cursor: 'not-allowed',
      },
      error: {
        borderColor: 'var(--color-error)',
        color: 'var(--color-error)',
        boxShadow: 'var(--shadow-focus-error)',
      },
    },
    cinematic: {
      background: 'var(--color-surface)',
      color: 'var(--color-text-primary)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-sm)',
      padding: 'var(--spacing-input-padding)',
      fontSize: 'var(--text-body-sm)',
      fontWeight: 'var(--font-weight-normal)',
      placeholderColor: 'var(--color-text-muted)',
      hover: {
        borderColor: 'var(--color-border-hover)',
      },
      focus: {
        borderColor: 'var(--color-primary)',
        boxShadow: 'var(--shadow-focus)',
      },
      disabled: {
        background: 'var(--color-surface-hover)',
        color: 'var(--color-disabled-text)',
        borderColor: 'var(--color-disabled-border)',
        cursor: 'not-allowed',
      },
      error: {
        borderColor: 'var(--color-error)',
        color: 'var(--color-error)',
        boxShadow: 'var(--shadow-focus-error)',
      },
    },
  },

  card: {
    light: {
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border-gray)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--spacing-card-padding)',
      boxShadow: 'var(--shadow-card)',
      hover: {
        boxShadow: 'var(--shadow-card-hover)',
      },
    },
    cinematic: {
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--spacing-card-padding)',
      boxShadow: 'var(--shadow-card)',
      hover: {
        borderColor: 'var(--color-primary-border)',
        background: 'var(--color-surface-hover)',
        boxShadow: 'var(--shadow-card-hover)',
      },
    },
  },

  modal: {
    light: {
      background: 'var(--color-surface)',
      padding: 'var(--spacing-section-padding)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-modal)',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
    cinematic: {
      background: 'var(--color-surface)',
      padding: 'var(--spacing-section-padding)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-modal)',
      overlay: 'rgba(0, 0, 0, 0.5)',
      border: '1px solid var(--color-border)',
    },
  },

  nav: {
    light: {
      background: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border-gray)',
      padding: '12px 32px',
      height: '64px',
    },
    cinematic: {
      background: 'rgba(7, 7, 7, 0.72)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.055)',
      padding: '16px 32px',
      backdropFilter: 'blur(24px) saturate(160%)',
    },
  },
} as const;

// ============================================
// TYPE EXPORTS
// ============================================
export type DesignTokens = typeof designTokens;
export type ComponentTokens = typeof componentTokens;
export type ColorPalette = typeof designTokens.colors.light;
export type TypographyScale = typeof designTokens.typography.light;
export type SpacingScale = typeof designTokens.spacing;
export type ShadowScale = typeof designTokens.shadows.light;
