#!/bin/bash
set -u

DOWNLOADS="$HOME/Downloads"

echo "========================================"
echo "  Miyu 回放 HLS → m4a 下載工具"
echo "========================================"
echo

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "找不到 ffmpeg，請先安裝 ffmpeg。"
  read -n 1 -s -r -p "按任意鍵結束..."
  exit 1
fi

manifest="${1:-}"
if [ -z "$manifest" ]; then
  manifest=$(ls -t "$DOWNLOADS"/miyu_replay_tasks_*.json 2>/dev/null | head -n 1 || true)
fi

if [ -z "$manifest" ] || [ ! -f "$manifest" ]; then
  echo "找不到 miyu_replay_tasks_*.json。"
  echo "請先在猫耳頁面的 Miyu 批量回放工具裡匯出下載任務。"
  read -n 1 -s -r -p "按任意鍵結束..."
  exit 1
fi

echo "任務檔：$(basename "$manifest")"
echo "輸出位置：$DOWNLOADS"
echo

python3 - "$manifest" "$DOWNLOADS" <<'PY'
import json, os, subprocess, sys
manifest, outdir = sys.argv[1], sys.argv[2]
with open(manifest, 'r', encoding='utf-8') as f:
    data = json.load(f)
tasks = data.get('tasks') or []
if not tasks:
    print('任務檔裡沒有可下載項目。')
    sys.exit(2)
print(f'共 {len(tasks)} 條回放。\n')
failed=[]
for i,t in enumerate(tasks,1):
    url=t.get('hls_128')
    name=t.get('filename') or f"miyu_{t.get('id','unknown')}.m4a"
    out=os.path.join(outdir,name)
    print(f'[{i}/{len(tasks)}] {name}')
    if not url:
        print('  ✗ 沒有 HLS URL')
        failed.append((name,'no url'))
        continue
    if os.path.exists(out) and os.path.getsize(out)>1024*1024:
        print('  ✓ 已存在，略過')
        continue
    cmd=[
        'ffmpeg','-hide_banner','-loglevel','warning','-y',
        '-user_agent','Mozilla/5.0',
        '-headers','Referer: https://www.missevan.com/\r\n',
        '-protocol_whitelist','file,http,https,tcp,tls,crypto',
        '-i',url,
        '-map','0:a:0','-c','copy','-movflags','+faststart',out
    ]
    p=subprocess.run(cmd)
    if p.returncode==0 and os.path.exists(out) and os.path.getsize(out)>0:
        print('  ✓ 完成')
    else:
        print('  ✗ 失敗')
        try: os.remove(out)
        except OSError: pass
        failed.append((name,f'ffmpeg exit {p.returncode}'))
    print()
print('========================================')
if failed:
    print(f'完成，但有 {len(failed)} 條失敗：')
    for n,e in failed: print(' -',n,':',e)
    print('\n如果全部都失敗，通常是 HLS 簽名已過期；回猫耳重新匯出一次任務即可。')
else:
    print('全部下載完成。')
PY

echo
read -n 1 -s -r -p "按任意鍵關閉..."
echo
