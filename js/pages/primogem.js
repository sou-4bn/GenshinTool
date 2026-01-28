/**
 * primogem.js
 * 原石計算ページ
 * ・天井80連（160×80）基準
 * ・すり抜け想定 / すり抜け済み対応
 * ・紡がれた運命も資産として計算
 */

window.Pages = window.Pages || {};

window.Pages.primogem = function renderPrimogemPage({ state }) {
  const p = state.primogem;

  return `
    <section class="card">
      <h2>原石計算</h2>
      <p class="muted">
        キャラ登場日までに必要な原石/日を計算します。
      </p>

      <div class="form-grid" style="margin-top:12px;">
        <div class="field">
          <label>キャラ登場日</label>
          <input class="input" type="date" id="pgDate" value="${p.characterDate || ""}">
        </div>

        <div class="field">
          <label>現在の原石</label>
          <input class="input" type="number" min="0" id="pgPrimo" value="${p.currentPrimo}">
        </div>

        <div class="field">
          <label>現在のガチャ数（回）</label>
          <input class="input" type="number" min="0" id="pgPulls" value="${p.currentPulls}">
          <div class="muted" style="font-size:12px;">※ 回数×160 原石分として差し引き</div>
        </div>

        <div class="field">
          <label>紡がれた運命（個）</label>
          <input class="input" type="number" min="0" id="pgFates" value="${p.currentFates}">
          <div class="muted" style="font-size:12px;">※ 個数×160 原石分として差し引き</div>
        </div>

        <div class="field">
          <label>オプション</label>

          <div class="checkbox-row">
            <input type="checkbox" id="pgGuaranteed" ${p.guaranteed ? "checked" : ""}>
            <span>すり抜け済み（次は確定）</span>
          </div>

          <div class="checkbox-row">
            <input type="checkbox" id="pgAssumeLose" ${p.assumeLose5050 ? "checked" : ""} ${p.guaranteed ? "disabled" : ""}>
            <span>すり抜け想定（最悪ケース）</span>
          </div>
        </div>
      </div>

      <div style="margin-top:14px;">
        <button class="btn" id="pgCalc">計算</button>
      </div>

      <div class="card" style="margin-top:14px; box-shadow:none;">
        <h3 style="margin-top:0;">結果</h3>
        <div id="pgResult" class="muted">入力して「計算」を押してください。</div>
      </div>
    </section>
  `;
};


window.Pages.primogemSetup = function setupPrimogem({ state, setState }) {
  const elDate = document.getElementById("pgDate");
  const elPrimo = document.getElementById("pgPrimo");
  const elPulls = document.getElementById("pgPulls");
  const elFates = document.getElementById("pgFates");
  const elGuaranteed = document.getElementById("pgGuaranteed");
  const elAssumeLose = document.getElementById("pgAssumeLose");
  const elBtn = document.getElementById("pgCalc");
  const elResult = document.getElementById("pgResult");

  // チェックボックス連動
  elGuaranteed.addEventListener("change", () => {
    elAssumeLose.disabled = elGuaranteed.checked;
  });

  // 計算ボタン
  elBtn.addEventListener("click", () => {

    // 入力値を直接取得（stateに依存しない）
    const p = {
      characterDate: elDate.value,
      currentPrimo: Math.max(0, Utils.toInt(elPrimo.value)),
      currentPulls: Math.max(0, Utils.toInt(elPulls.value)),
      currentFates: Math.max(0, Utils.toInt(elFates.value)),
      guaranteed: elGuaranteed.checked,
      assumeLose5050: elAssumeLose.checked && !elGuaranteed.checked
    };

    const base = 160 * 80;

    // 必要原石
    let need = base;
    if (p.guaranteed) {
      need = base;
    } else if (p.assumeLose5050) {
      need = base * 2;
    }

    // 現在資産
    const assets = p.currentPrimo + (p.currentPulls * 160) + (p.currentFates * 160);
    const remain = need - assets;

    if (!p.characterDate) {
      elResult.innerHTML = `<span class="muted">登場日を入力してください。</span>`;
      return;
    }

    const today = Utils.todayISO();
    const days = Math.max(1, Utils.diffDays(today, p.characterDate));

    if (remain <= 0) {
      elResult.innerHTML = `
        <div><strong>達成済み 🎉</strong></div>
        <div class="muted">必要原石 ${need} に対して、現在資産は ${assets} です。</div>
      `;
      return;
    }

    const perDay = Math.ceil(remain / days);

    elResult.innerHTML = `
      <div><strong>残り ${days} 日</strong></div>
      <div>必要原石：${need}</div>
      <div>現在資産：${assets}</div>
      <div><strong>1日あたり：${perDay} 原石</strong></div>
    `;
  });
};
