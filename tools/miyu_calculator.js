(() => {
  const nav = document.querySelector('.tabs');
  const app = document.querySelector('.app');
  if (!nav || !app || document.getElementById('calculator')) return;

  const style = document.createElement('style');
  style.textContent = `
    .calc-wrap{max-width:430px;margin:18px auto}.calc-card{background:linear-gradient(135deg,#f8fafc,#fff 60%);border:1px solid #dbeafe;border-radius:22px;box-shadow:var(--shadow);padding:16px}.calc-display{background:#0f172a;color:#fff;border-radius:18px;padding:15px 16px;margin-bottom:12px;text-align:right;min-height:94px;display:flex;flex-direction:column;justify-content:flex-end;overflow:hidden}.calc-expression{min-height:22px;color:#94a3b8;font-size:14px;word-break:break-all}.calc-result{font-size:34px;font-weight:950;line-height:1.2;word-break:break-all}.calc-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px}.calc-key{border:1px solid #e2e8f0;border-radius:16px;background:#fff;min-height:58px;font-size:20px;font-weight:900;cursor:pointer;box-shadow:0 2px 6px rgba(15,23,42,.04)}.calc-key:active{transform:scale(.98)}.calc-key.op{background:#eff6ff;color:#2563eb;border-color:#bfdbfe}.calc-key.action{background:#f8fafc;color:#475569}.calc-key.equal{background:#2563eb;color:#fff;border-color:#2563eb}.calc-note{margin-top:10px;text-align:center;color:var(--muted);font-size:12px}
  `;
  document.head.appendChild(style);

  const btn = document.createElement('button');
  btn.className = 'tab-btn';
  btn.dataset.tab = 'calculator';
  btn.textContent = '计算机';
  const dataBtn = nav.querySelector('[data-tab="data"]');
  if (dataBtn) nav.insertBefore(btn, dataBtn); else nav.appendChild(btn);

  const panel = document.createElement('section');
  panel.id = 'calculator';
  panel.className = 'panel';
  panel.innerHTML = `
    <div class="calc-wrap"><div class="calc-card">
      <div class="card-head"><div><h2>🧮 计算机</h2><div class="hint">直播临时算金额、比例、数量时直接用。</div></div></div>
      <div class="calc-display"><div id="calcExpression" class="calc-expression"></div><div id="calcResult" class="calc-result">0</div></div>
      <div class="calc-grid" id="calcGrid">
        <button class="calc-key action" data-calc="clear">C</button><button class="calc-key action" data-calc="back">⌫</button><button class="calc-key action" data-calc="percent">%</button><button class="calc-key op" data-value="÷">÷</button>
        <button class="calc-key" data-value="7">7</button><button class="calc-key" data-value="8">8</button><button class="calc-key" data-value="9">9</button><button class="calc-key op" data-value="×">×</button>
        <button class="calc-key" data-value="4">4</button><button class="calc-key" data-value="5">5</button><button class="calc-key" data-value="6">6</button><button class="calc-key op" data-value="-">−</button>
        <button class="calc-key" data-value="1">1</button><button class="calc-key" data-value="2">2</button><button class="calc-key" data-value="3">3</button><button class="calc-key op" data-value="+">+</button>
        <button class="calc-key action" data-calc="sign">±</button><button class="calc-key" data-value="0">0</button><button class="calc-key" data-value=".">.</button><button class="calc-key equal" data-calc="equals">=</button>
      </div>
      <div class="calc-note">电脑也可直接用键盘输入</div>
    </div></div>`;
  app.appendChild(panel);

  let expr = '';
  const expressionEl = panel.querySelector('#calcExpression');
  const resultEl = panel.querySelector('#calcResult');
  const format = n => Number.isFinite(n) ? String(Math.round((n + Number.EPSILON) * 1e10) / 1e10) : '错误';
  const evaluate = value => {
    const clean = String(value || '').replaceAll('×','*').replaceAll('÷','/');
    if (!clean || !/^[0-9+\-*/.()\s]+$/.test(clean)) return null;
    try { const n = Function('"use strict";return (' + clean + ')')(); return Number.isFinite(n) ? n : null; } catch { return null; }
  };
  const render = () => {
    expressionEl.textContent = expr;
    const n = evaluate(expr);
    if (n !== null) resultEl.textContent = format(n);
    else if (!expr) resultEl.textContent = '0';
  };
  const append = v => { expr += v; render(); };
  const percent = () => { const m=expr.match(/(-?\d*\.?\d+)$/); if(!m)return; expr=expr.slice(0,-m[1].length)+format(Number(m[1])/100); render(); };
  const sign = () => { const m=expr.match(/(-?\d*\.?\d+)$/); if(!m)return; const raw=m[1]; expr=expr.slice(0,-raw.length)+(raw.startsWith('-')?raw.slice(1):'-'+raw); render(); };
  const equals = () => { const n=evaluate(expr); if(n===null){resultEl.textContent='错误';return;} const out=format(n); expressionEl.textContent=expr+' ='; resultEl.textContent=out; expr=out; };

  panel.querySelector('#calcGrid').addEventListener('click', e => {
    const key = e.target.closest('button'); if (!key) return;
    if (key.dataset.value != null) append(key.dataset.value);
    else if (key.dataset.calc === 'clear') { expr=''; render(); }
    else if (key.dataset.calc === 'back') { expr=expr.slice(0,-1); render(); }
    else if (key.dataset.calc === 'percent') percent();
    else if (key.dataset.calc === 'sign') sign();
    else if (key.dataset.calc === 'equals') equals();
  });

  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(x => x.classList.toggle('active', x === btn));
    document.querySelectorAll('.panel').forEach(x => x.classList.toggle('active', x === panel));
    const u = new URL(location.href); u.searchParams.set('streamer', new URLSearchParams(location.search).get('streamer') || 'miyu'); u.searchParams.set('tool','calculator'); history.replaceState({},'',u);
  });

  nav.addEventListener('click', e => {
    const target = e.target.closest('.tab-btn');
    if (target && target !== btn) {
      btn.classList.remove('active');
      panel.classList.remove('active');
    }
  });

  window.addEventListener('keydown', e => {
    if (!panel.classList.contains('active')) return;
    if (/^[0-9.]$/.test(e.key)) append(e.key);
    else if (e.key === '+') append('+'); else if (e.key === '-') append('-'); else if (e.key === '*') append('×');
    else if (e.key === '/') { e.preventDefault(); append('÷'); }
    else if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); equals(); }
    else if (e.key === 'Backspace') { e.preventDefault(); expr=expr.slice(0,-1); render(); }
    else if (e.key === 'Escape') { expr=''; render(); }
  });

  if (new URLSearchParams(location.search).get('tool') === 'calculator') btn.click();
})();

(() => {
  if (!document.querySelector('script[data-miyu-screenlist-patch]')) {
    const script = document.createElement('script');
    script.src = './miyu_screenlist_patch.js';
    script.dataset.miyuScreenlistPatch = '1';
    document.head.appendChild(script);
  }
  if (!document.querySelector('script[data-miyu-pet]')) {
    const petScript = document.createElement('script');
    petScript.src = './miyu_pet.js';
    petScript.dataset.miyuPet = '1';
    document.head.appendChild(petScript);
  }
})();
