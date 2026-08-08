from pathlib import Path

path = Path("tools/miyu_toolbox.html")
text = path.read_text(encoding="utf-8")

marker = "  function copySessionSummary(sessionId){"
helper = r'''  async function copySongRequest(songName, button) {
    const text = `点歌 ${songName}`;

    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    if (button) {
      const originalText = button.textContent;
      button.textContent = '已複製 ✓';
      button.disabled = true;
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 1200);
    }
  }

'''
if "async function copySongRequest(songName, button)" not in text:
    if marker not in text:
        raise SystemExit("copySessionSummary marker not found")
    text = text.replace(marker, helper + marker, 1)

old_ai = r'''        <div class="hot-meta" style="margin-top:6px">
          ${escapeHtml(song.reason)}
        </div>

      </div>'''
new_ai = r'''        <div class="hot-meta" style="margin-top:6px">
          ${escapeHtml(song.reason)}
        </div>
        <div class="btn-row">
          <button class="ghost" data-action="copy-song" data-song="${esc(song.songName || song.name || '')}">複製</button>
        </div>

      </div>'''
if old_ai in text and 'data-action="copy-song" data-song="${esc(song.songName || song.name || \'\')}"' not in text:
    text = text.replace(old_ai, new_ai, 1)

old_one = "      $('drawMultiResult').innerHTML = '';"
new_one = r'''      $('drawMultiResult').innerHTML = `<div class="btn-row"><button class="ghost" data-action="copy-song" data-song="${esc(r.songName)}">複製</button></div>`;'''
if old_one in text:
    text = text.replace(old_one, new_one, 1)

old_three = r'''      $('drawMultiResult').innerHTML = `<div class="scroll"><table><thead><tr><th>#</th><th>歌名</th><th>歌手</th></tr></thead><tbody>${results.map((r,i)=>`<tr><td>${i+1}</td><td>${esc(r.songName)}</td><td>${esc(r.artist || '')}</td></tr>`).join('')}</tbody></table></div>`;'''
new_three = r'''      $('drawMultiResult').innerHTML = `<div class="scroll"><table><thead><tr><th>#</th><th>歌名</th><th>歌手</th><th>操作</th></tr></thead><tbody>${results.map((r,i)=>`<tr><td>${i+1}</td><td>${esc(r.songName)}</td><td>${esc(r.artist || '')}</td><td><button class="ghost" data-action="copy-song" data-song="${esc(r.songName)}">複製</button></td></tr>`).join('')}</tbody></table></div>`;'''
if old_three in text:
    text = text.replace(old_three, new_three, 1)

reset_marker = "    $('resetDrawPoolBtn').addEventListener('click', () => { resetRandomBag(); alert('已重置本輪抽籤池'); });"
delegate = r'''    ['aiRecommendResult', 'drawMultiResult'].forEach(containerId => {
      $(containerId).addEventListener('click', e => {
        const btn = e.target.closest('button[data-action="copy-song"]');
        if (!btn) return;
        copySongRequest(btn.dataset.song || '', btn);
      });
    });

'''
if "['aiRecommendResult', 'drawMultiResult'].forEach" not in text:
    if reset_marker not in text:
        raise SystemExit("resetDrawPoolBtn marker not found")
    text = text.replace(reset_marker, delegate + reset_marker, 1)

path.write_text(text, encoding="utf-8")
