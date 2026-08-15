#!/bin/bash
set -u

clear
printf "🎧 Miyu 回放批量轉換工具\n"
printf "========================\n\n"

if ! command -v ffmpeg >/dev/null 2>&1; then
  printf "找不到 ffmpeg。\n"
  printf "請先安裝 ffmpeg，再重新執行。\n\n"
  read -n 1 -s -r -p "按任意鍵關閉..."
  exit 1
fi

convert_file() {
  local input="$1"
  [ -f "$input" ] || return 0
  case "$input" in
    *.m4s|*.M4S) ;;
    *) return 0 ;;
  esac

  local dir base stem output
  dir="$(dirname "$input")"
  base="$(basename "$input")"
  stem="${base%.*}"
  output="$dir/${stem}.m4a"

  if [ -e "$output" ]; then
    printf "⏭ 已存在：%s\n" "$(basename "$output")"
    return 0
  fi

  printf "🔄 轉換：%s\n" "$base"
  if ffmpeg -hide_banner -loglevel error -i "$input" -map 0:a:0 -c:a copy -movflags +faststart "$output"; then
    printf "✅ 完成：%s\n\n" "$(basename "$output")"
  else
    printf "❌ 失敗：%s\n\n" "$base"
    rm -f "$output"
  fi
}

convert_folder() {
  local folder="$1"
  [ -d "$folder" ] || return 0
  while IFS= read -r -d '' f; do
    convert_file "$f"
  done < <(find "$folder" -maxdepth 1 -type f \( -iname '*.m4s' \) -print0)
}

if [ "$#" -gt 0 ]; then
  for item in "$@"; do
    if [ -d "$item" ]; then
      convert_folder "$item"
    else
      convert_file "$item"
    fi
  done
else
  DOWNLOADS="$HOME/Downloads"
  printf "沒有拖入檔案，將自動掃描：%s\n\n" "$DOWNLOADS"
  convert_folder "$DOWNLOADS"
fi

printf "========================\n"
printf "🎉 處理完成。m4a 會放在原始 m4s 的同一資料夾。\n"
printf "原始 m4s 不會刪除。\n\n"
read -n 1 -s -r -p "按任意鍵關閉..."
printf "\n"
