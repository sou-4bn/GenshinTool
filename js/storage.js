/**
 * storage.js
 * データの保存/読込/エクスポート/インポートを1箇所にまとめる。
 * 将来、クラウド（Supabase/Firebase）に移すときもここを差し替えるだけで済む。
 */

const STORAGE_KEY = "genshin_tool_state_v1";

window.StorageAPI = {
  /** 初期状態を作る（保存が無いときに使う） */
  createInitialState() {
    return {
      weeklyBoss: {
        // ボスごとの「所持数」（materials配列と同じ順番で管理）
        // 例：{ "トワリン": [1,2,0], ... }
        ownedByBoss: {}
      },
      primogem: {
        // 原石計算の入力値（UI復元用）
        characterDate: "",
        currentPrimo: 0,
        currentPulls: 0,
        currentFates: 0,
        assumeLose5050: false,
        guaranteed: false
      }
    };
  },

  /** stateをロード */
  load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return this.createInitialState();

    const parsed = Utils.safeJsonParse(raw);
    if (!parsed) return this.createInitialState();

    // 破損・古い形式の保険（最低限）
    return {
      ...this.createInitialState(),
      ...parsed
    };
  },

  /** stateを保存 */
  save(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },

  /** JSON文字列としてエクスポート */
  export(state) {
    return JSON.stringify(state, null, 2);
  },

  /** JSON文字列からインポート（成功時はstateを返す、失敗ならnull） */
  import(jsonText) {
    const parsed = Utils.safeJsonParse(jsonText);
    if (!parsed) return null;

    // 最低限の形チェック（厳密にしすぎない）
    if (!parsed.weeklyBoss || !parsed.primogem) return null;

    return {
      ...this.createInitialState(),
      ...parsed
    };
  },

  /** 全リセット */
  reset() {
    localStorage.removeItem(STORAGE_KEY);
  }
};
