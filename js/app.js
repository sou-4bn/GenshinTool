/**
 * app.js
 * - ルーティング（#/home など）を処理してページを描画
 * - state管理（保存/復元）
 * - 共通のエクスポート/インポート/リセット
 */

(function () {
  const appEl = document.getElementById("app");

  let state = StorageAPI.load();

  /**
   * stateを更新して保存する
   * @param {Object} next
   * @param {Object} options { rerender: boolean }
   */
  function setState(next, options = { rerender: true }) {
    state = next;
    StorageAPI.save(state);

    if (options.rerender) {
      renderRoute();
    }
  }

  /** 現在のハッシュからルート名を取得 */
  function getRoute() {
    const hash = location.hash || "#/home";
    const route = hash.replace("#/", "");
    return route || "home";
  }

  /** ナビのactive状態 */
  function setActiveNav(route) {
    const navMap = {
      home: "navHome",
      "weekly-boss": "navWeekly",
      primogem: "navPrimo"
    };

    Object.values(navMap).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove("is-active");
    });

    const activeId = navMap[route];
    const activeEl = document.getElementById(activeId);
    if (activeEl) activeEl.classList.add("is-active");
  }

  /** ルート描画 */
  function renderRoute() {
    const route = getRoute();
    setActiveNav(route);

    let html = "";

    if (route === "weekly-boss") {
      html = Pages.weeklyBoss({ state });
      appEl.innerHTML = html;
      Pages.weeklyBossSetup?.({ state, setState });
      return;
    }

    if (route === "primogem") {
      html = Pages.primogem({ state });
      appEl.innerHTML = html;
      Pages.primogemSetup?.({ state, setState });
      return;
    }

    // default: home
    html = Pages.home({ state });
    appEl.innerHTML = html;
  }

  /** エクスポート */
  function handleExport() {
    const json = StorageAPI.export(state);

    // クリップボードコピー（失敗してもテキスト表示できる）
    navigator.clipboard?.writeText(json).catch(() => {});

    alert("エクスポートしました（JSONをクリップボードにコピーしました）\n必要ならメモ帳などに貼り付けて保存してください。");
  }

  /** インポート */
  function openImportDialog() {
    const dlg = document.getElementById("importDialog");
    const ta = document.getElementById("importTextarea");
    ta.value = "";
    dlg.showModal();
  }

  function applyImport() {
    const ta = document.getElementById("importTextarea");
    const imported = StorageAPI.import(ta.value);
    if (!imported) {
      alert("インポートに失敗しました。JSON形式を確認してください。");
      return;
    }
    setState(imported, { rerender: true });
    alert("インポートしました。");
  }

  /** リセット */
  function handleReset() {
    const ok = confirm("全データをリセットします。よろしいですか？");
    if (!ok) return;

    StorageAPI.reset();
    state = StorageAPI.load();
    renderRoute();
  }

  // 共通ボタンのイベント
  document.getElementById("btnExport").addEventListener("click", handleExport);
  document.getElementById("btnImport").addEventListener("click", openImportDialog);
  document.getElementById("btnReset").addEventListener("click", handleReset);
  document.getElementById("btnImportApply").addEventListener("click", (e) => {
    // dialogのsubmitを止めて処理
    e.preventDefault();
    applyImport();
    document.getElementById("importDialog").close();
  });

  // ルート変化
  window.addEventListener("hashchange", renderRoute);

  // 初期表示
  if (!location.hash) location.hash = "#/home";
  renderRoute();
})();
