import { describe, it, expect } from 'vitest';
import { designTokens, generateCSSVariables } from '../design-tokens';

describe('Typography Design Tokens', () => {
  it('light theme uses DM Sans for headings', () => {
    const vars = generateCSSVariables('light');
    expect(vars['--font-heading']).toContain('DM Sans');
  });

  it('light theme uses Inter for body', () => {
    const vars = generateCSSVariables('light');
    expect(vars['--font-sans']).toContain('Inter');
  });

  it('cinematic theme uses DM Sans for headings', () => {
    const vars = generateCSSVariables('cinematic');
    expect(vars['--font-heading']).toContain('DM Sans');
  });

  it('cinematic theme uses Inter for body', () => {
    const vars = generateCSSVariables('cinematic');
    expect(vars['--font-sans']).toContain('Inter');
  });

  it('font tokens have correct structure', () => {
    expect(designTokens.typography.light.fontFamily).toHaveProperty('heading');
    expect(designTokens.typography.light.fontFamily).toHaveProperty('sans');
    expect(designTokens.typography.cinematic.fontFamily).toHaveProperty('heading');
    expect(designTokens.typography.cinematic.fontFamily).toHaveProperty('sans');
  });
});

describe('Typography Document Structure', () => {
  it('document is created with correct doctype', () => {
    expect(document.doctype).not.toBeNull();
  });
});
