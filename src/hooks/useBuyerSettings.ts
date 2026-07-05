import { useCallback, useEffect, useState } from 'react';
import { buyerSettingsApi } from '../lib/buyerSettingsApi';
import { sessionStore } from '../lib/apiClient';
import {
  DEFAULT_BUYER_SETTINGS,
  type BuyerSettings,
  type BuyerSettingsUpdate,
} from '../types/buyerSettings';

function cacheKey(userId: string) {
  return `vantage_buyer_settings:${userId}`;
}

export function readCachedBuyerSettings(userId: string): BuyerSettings {
  try {
    const value = localStorage.getItem(cacheKey(userId));
    return value ? { ...DEFAULT_BUYER_SETTINGS, ...JSON.parse(value) } : DEFAULT_BUYER_SETTINGS;
  } catch {
    return DEFAULT_BUYER_SETTINGS;
  }
}

function writeCache(userId: string, settings: BuyerSettings) {
  localStorage.setItem(cacheKey(userId), JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent('vantage:buyer-settings', { detail: settings }));
}

export function useBuyerSettings(userId: string) {
  const [settings, setSettings] = useState<BuyerSettings>(() => readCachedBuyerSettings(userId));
  const [status, setStatus] = useState<'loading' | 'ready' | 'saving' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setSettings(readCachedBuyerSettings(userId));

    if (!sessionStore.getToken()) {
      setStatus('ready');
      return () => { active = false; };
    }

    setStatus('loading');
    buyerSettingsApi.get()
      .then((next) => {
        if (!active) return;
        setSettings(next);
        writeCache(userId, next);
        setStatus('ready');
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setError(reason instanceof Error ? reason.message : 'Unable to load settings');
        setStatus('error');
      });

    return () => { active = false; };
  }, [userId]);

  const save = useCallback(async (draft: BuyerSettings) => {
    setStatus('saving');
    setError('');
    try {
      let next: BuyerSettings;
      if (sessionStore.getToken()) {
        const { mfaEnabled: _mfaEnabled, ...update } = draft;
        next = await buyerSettingsApi.update(update as BuyerSettingsUpdate);
      } else {
        next = { ...draft, version: draft.version + 1 };
      }
      setSettings(next);
      writeCache(userId, next);
      setStatus('ready');
      return next;
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Unable to save settings';
      setError(message);
      setStatus('error');
      throw reason;
    }
  }, [userId]);

  const setMfaEnabled = useCallback((mfaEnabled: boolean) => {
    setSettings((current) => {
      const next = { ...current, mfaEnabled };
      writeCache(userId, next);
      return next;
    });
  }, [userId]);

  return { settings, status, error, save, setMfaEnabled };
}
