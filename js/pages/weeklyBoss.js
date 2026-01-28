/**
 * weeklyBoss.js
 * 週ボス素材（天賦素材）ページ
 * - 素材名を選ぶ → ドロップする週ボス行をハイライト
 * - ボスごとの所持数（3種）を入力して保存
 * - 合計が最小のボス行をハイライト
 */

window.Pages = window.Pages || {};
window.Pages.weeklyBoss = function renderWeeklyBossPage({ state }) {
  // ボス一覧（表示用）
  const bossOptions = WeeklyBossDrops.map(b =>
    `<option value="${escapeAttr(b.boss)}">${escapeHtml(b.boss)}</option>`
  ).join("");

  return `
    <section class="card">
      <h2>週ボス素材（天賦）</h2>
      <p class="muted">まず週ボスを選び、次にその週ボスの3素材から1つを選びます。</p>

      <div class="form-grid" style="margin-top:12px;">
        <div class="field">
          <label>週ボス</label>
          <select class="select" id="wbBossSelect">
            <option value="">選択してください</option>
            ${bossOptions}
          </select>
        </div>

        <div class="field">
          <label>欲しい素材（選択した週ボスの3つだけ表示）</label>
          <select class="select" id="wbBossMaterialSelect" disabled>
            <option value="">まず週ボスを選択</option>
          </select>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>週ボス</th>
              <th>素材1</th><th>所持</th>
              <th>素材2</th><th>所持</th>
              <th>素材3</th><th>所持</th>
              <th>計</th>
            </tr>
          </thead>
          <tbody id="wbTableBody"></tbody>
        </table>
      </div>
    </section>
  `;
};

/**
 * weeklyBossページのイベント/描画をセットアップする
 * app.jsからページ描画後に呼ばれる。
 */
window.Pages.weeklyBossSetup = function setupWeeklyBoss({ state, setState }) {
  const bossSelect = document.getElementById("wbBossSelect");
  const matSelect = document.getElementById("wbBossMaterialSelect");
  const tbody = document.getElementById("wbTableBody");

  // ページ内の一時状態（localStorageに保存したいなら state.weeklyBoss に入れる）
  let selectedBoss = "";
  let selectedMaterialIndex = -1; // 0,1,2 / 未選択は-1

  /**
   * 選択中ボスの素材3つで素材セレクトを作り直す
   */
  function populateBossMaterials(bossName) {
    const boss = WeeklyBossDrops.find(b => b.boss === bossName);

    matSelect.innerHTML = "";
    selectedMaterialIndex = -1;

    if (!boss) {
      matSelect.disabled = true;
      matSelect.innerHTML = `<option value="">まず週ボスを選択</option>`;
      return;
    }

    matSelect.disabled = false;
    matSelect.innerHTML = `
      <option value="">素材を選択</option>
      <option value="0">${escapeHtml(boss.materials[0])}</option>
      <option value="1">${escapeHtml(boss.materials[1])}</option>
      <option value="2">${escapeHtml(boss.materials[2])}</option>
    `;
  }

  /**
   * tbodyのみ描画（入力の体験を崩しにくい）
   */
  function renderTableBody() {
    // 合計最小を計算
    const totals = WeeklyBossDrops.map(({ boss }) => {
      const owned = state.weeklyBoss.ownedByBoss[boss] || [0, 0, 0];
      return owned[0] + owned[1] + owned[2];
    });
    const minTotal = Math.min(...totals);

    tbody.innerHTML = WeeklyBossDrops.map(({ boss, materials }, idx) => {
      const owned = state.weeklyBoss.ownedByBoss[boss] || [0, 0, 0];
      const total = owned[0] + owned[1] + owned[2];

      const isMin = total === minTotal;
      const isSelectedBoss = selectedBoss && boss === selectedBoss;

      const trClass = [
        isMin ? "is-min-total" : "",
        isSelectedBoss ? "is-drop-match" : "" // 既存クラスを「選択中ボス強調」に流用
      ].filter(Boolean).join(" ");

      // 選択中素材セルの強調（任意：分かりやすいので付ける）
      const mark = (i) => (isSelectedBoss && selectedMaterialIndex === i) ? ' style="background:#e8edff;"' : "";

      return `
        <tr class="${trClass}">
          <td>${escapeHtml(boss)}</td>

          <td${mark(0)}>${escapeHtml(materials[0])}</td>
          <td>
            <input class="input cell-input" type="number" min="0"
              data-boss="${escapeAttr(boss)}" data-index="0" value="${owned[0]}">
          </td>

          <td${mark(1)}>${escapeHtml(materials[1])}</td>
          <td>
            <input class="input cell-input" type="number" min="0"
              data-boss="${escapeAttr(boss)}" data-index="1" value="${owned[1]}">
          </td>

          <td${mark(2)}>${escapeHtml(materials[2])}</td>
          <td>
            <input class="input cell-input" type="number" min="0"
              data-boss="${escapeAttr(boss)}" data-index="2" value="${owned[2]}">
          </td>

          <td>${total}</td>
        </tr>
      `;
    }).join("");
  }

  // 入力（所持数）更新：イベント委譲
  tbody.addEventListener("input", (e) => {
    const el = e.target;
    if (!(el instanceof HTMLInputElement)) return;

    const boss = el.dataset.boss;
    const index = Utils.toInt(el.dataset.index);
    if (!boss || index < 0 || index > 2) return;

    const value = Math.max(0, Utils.toInt(el.value));

    // ✅ ここが重要：今のstateをベースにコピーして更新する
    // structuredClone は iPhone で未対応のことがあるのでJSON方式にする
    const next = JSON.parse(JSON.stringify(state));

    const prev = next.weeklyBoss.ownedByBoss[boss] || [0, 0, 0];
    prev[index] = value;
    next.weeklyBoss.ownedByBoss[boss] = prev;

    // ✅ setStateで保存（rerenderはしない）
    setState(next, { rerender: false });

    // ✅ ここが超重要：このファイル内の state も最新に更新する
    state = next;
  });

  // 入力確定（フォーカス外れ）で再描画
  tbody.addEventListener("change", () => {
    renderTableBody();
  });

  // 週ボス選択
  bossSelect.addEventListener("change", () => {
    selectedBoss = bossSelect.value;
    populateBossMaterials(selectedBoss);
    renderTableBody();
  });

  // 素材選択（0/1/2）
  matSelect.addEventListener("change", () => {
    selectedMaterialIndex = matSelect.value === "" ? -1 : Utils.toInt(matSelect.value);
    renderTableBody();
  });

  // 初期描画
  renderTableBody();
};

/* ========== HTMLエスケープ（安全対策） ========== */
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}
function escapeAttr(str) {
  // attribute用（基本は同じ）
  return escapeHtml(str);
}
