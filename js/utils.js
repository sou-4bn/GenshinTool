/**
 * utils.js
 * 画面間で共通に使う小さな関数群。
 */

window.Utils = {
  /** 数値として安全に変換（NaNなら0） */
  toInt(value) {
    const n = Number(value);
    return Number.isFinite(n) ? Math.trunc(n) : 0;
  },

  /** 今日（ローカル）の日付を YYYY-MM-DD 形式で返す */
  todayISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  },

  /**
   * 2つの日付(YYYY-MM-DD)の差分日数（target - base）
   * 例：登場日 - 今日
   */
  diffDays(baseISO, targetISO) {
    const base = new Date(baseISO);
    const target = new Date(targetISO);
    const ms = target.getTime() - base.getTime();
    return Math.ceil(ms / 86400000);
  },

  /** JSONを安全にパース（失敗したらnull） */
  safeJsonParse(text) {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }
};
