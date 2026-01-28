/**
 * home.js
 * ホーム（メニュー）ページ。
 */

window.Pages = window.Pages || {};
window.Pages.home = function renderHomePage({ state }) {
  return `
    <section class="card">
      <h2>ホーム</h2>
      <p class="muted">
        よく使う機能にすぐ移動できます。スマホでもPCでも崩れないレイアウトで作成しています。
      </p>

      <div class="form-grid" style="margin-top:12px;">
        <div class="card" style="box-shadow:none;">
          <h3 style="margin-top:0;">週ボス素材</h3>
          <p class="muted">素材名から週ボスを逆引きし、所持数も管理できます。</p>
          <a class="btn" href="#/weekly-boss" style="display:inline-block;text-decoration:none;">開く</a>
        </div>

        <div class="card" style="box-shadow:none;">
          <h3 style="margin-top:0;">原石計算</h3>
          <p class="muted">登場日までに必要な原石/日を計算します（運命・確定状態対応）。</p>
          <a class="btn" href="#/primogem" style="display:inline-block;text-decoration:none;">開く</a>
        </div>
      </div>
    </section>
  `;
};
