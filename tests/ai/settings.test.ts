// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { loadAiSettings, saveAiSettings, getActiveApiKey, STORAGE_KEYS } from '@/lib/ai/settings';

beforeEach(() => localStorage.clear());

describe('loadAiSettings', () => {
  it('mặc định: Gemini, chưa xác nhận, chưa có key', () => {
    const s = loadAiSettings();
    expect(s.provider).toBe('gemini');
    expect(s.providerConfirmed).toBe(false);
    expect(s.apiKeys).toEqual({ gemini: '', 'agent-platform': '' });
    expect(s.models.gemini).toBe('gemini-3.8-flash');
    expect(s.models['agent-platform']).toBe('gemini-2.5-flash');
    expect(s.useAiVoice).toBe(false);
  });

  it('provider cũ "vertex" → về Gemini và yêu cầu xác nhận lại', () => {
    localStorage.setItem(STORAGE_KEYS.provider, 'vertex');
    localStorage.setItem(STORAGE_KEYS.providerSource, 'manual');
    const s = loadAiSettings();
    expect(s.provider).toBe('gemini');
    expect(s.providerConfirmed).toBe(false);
  });

  it('chuẩn hoá model không tương thích với Agent Platform', () => {
    localStorage.setItem(STORAGE_KEYS.model('agent-platform'), 'gemini-3.8-flash');
    expect(loadAiSettings().models['agent-platform']).toBe('gemini-2.5-flash');
  });
});

describe('saveAiSettings', () => {
  it('Gemini + key AQ...: lưu và tải lại vẫn là Gemini', () => {
    const s = loadAiSettings();
    saveAiSettings({ ...s, provider: 'gemini', apiKeys: { ...s.apiKeys, gemini: 'AQ.gemini-key-123456' } });
    const r = loadAiSettings();
    expect(r.provider).toBe('gemini');
    expect(r.providerConfirmed).toBe(true);
    expect(localStorage.getItem(STORAGE_KEYS.providerSource)).toBe('manual');
    expect(getActiveApiKey(r)).toBe('AQ.gemini-key-123456');
  });

  it('Agent Platform + key AQ...: lưu và tải lại vẫn là Agent Platform', () => {
    const s = loadAiSettings();
    saveAiSettings({ ...s, provider: 'agent-platform', apiKeys: { ...s.apiKeys, 'agent-platform': 'AQ.agent-key-123456' } });
    const r = loadAiSettings();
    expect(r.provider).toBe('agent-platform');
    expect(getActiveApiKey(r)).toBe('AQ.agent-key-123456');
  });

  it('key hai dịch vụ lưu riêng, không ghi đè nhau', () => {
    const s = loadAiSettings();
    saveAiSettings({ ...s, apiKeys: { gemini: 'AIzaSyGeminiKey1234', 'agent-platform': 'AQ.agent-key-123456' } });
    expect(localStorage.getItem(STORAGE_KEYS.geminiKey)).toBe('AIzaSyGeminiKey1234');
    expect(localStorage.getItem(STORAGE_KEYS.agentKey)).toBe('AQ.agent-key-123456');
  });

  it('cắt khoảng trắng và xoá key rỗng khỏi bộ nhớ', () => {
    localStorage.setItem(STORAGE_KEYS.geminiKey, 'AIzaSyOldKey12345');
    const s = loadAiSettings();
    saveAiSettings({ ...s, apiKeys: { gemini: '   ', 'agent-platform': '  AQ.agent-key-123456 ' } });
    expect(localStorage.getItem(STORAGE_KEYS.geminiKey)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.agentKey)).toBe('AQ.agent-key-123456');
  });

  it('lưu lựa chọn giọng đọc AI', () => {
    const s = loadAiSettings();
    saveAiSettings({ ...s, useAiVoice: true, voiceName: 'Puck' });
    const r = loadAiSettings();
    expect(r.useAiVoice).toBe(true);
    expect(r.voiceName).toBe('Puck');
  });
});
