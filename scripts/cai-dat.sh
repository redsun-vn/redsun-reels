#!/bin/bash
# cai-dat.sh — cài môi trường redsun-reels cho máy MKT (REQUIREMENTS v0.4 §10.1).
# Không sudo, không Homebrew, không git, không API key. Chạy lại nhiều lần được: bước nào đã xong thì bỏ qua.
# Skill .claude/skills/cai-dat gọi script này. Mỗi bước in một dòng "[n/7] …"; lỗi thì in "LỖI: …" + cách xử lý rồi dừng.

set -u
NODE_VERSION="v22.23.3"
HF_TAG="v0.8.141"
H="${REDSUN_REELS_HOME:-$HOME/.redsun-reels}"
REPO="$(cd "$(dirname "$0")/.." && pwd)"
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
export COREPACK_HOME="$H/corepack"
export HYPERFRAMES_NO_TELEMETRY=1 HYPERFRAMES_NO_UPDATE_CHECK=1 HYPERFRAMES_SKIP_SKILLS=1

fail() {
  echo "LỖI: $1"
  echo "CÁCH XỬ LÝ: $2"
  exit 1
}

step() { echo "[$1/7] $2"; }

# ---------------------------------------------------------------- 1. Kiểm máy
step 1 "Kiểm tra máy"
[ "$(uname -s)" = "Darwin" ] || fail "Máy này không phải macOS." "Dự án hỗ trợ MacBook (chip Intel hoặc chip M)."
case "$(uname -m)" in
  x86_64) ARCH=x64 ;;
  arm64) ARCH=arm64 ;;
  *) fail "Không nhận ra loại chip ($(uname -m))." "Báo dev." ;;
esac
FREE_KB=$(df -k "$HOME" | awk 'NR==2 {print $4}')
[ "${FREE_KB:-0}" -gt 3000000 ] || fail "Ổ đĩa còn dưới 3 GB trống." "Xoá bớt file rồi nói 'cài lại'."
curl -fsSI https://nodejs.org >/dev/null 2>&1 || fail "Không kết nối được Internet." "Kiểm tra mạng rồi nói 'cài lại'."
mkdir -p "$H"
echo "    macOS $(sw_vers -productVersion), chip $ARCH"

# ---------------------------------------------------------------- 2. Node
step 2 "Cài Node.js $NODE_VERSION"
node_ok() {
  local v
  v=$("$1" -v 2>/dev/null) || return 1
  v=${v#v}
  local major=${v%%.*} rest=${v#*.}
  local minor=${rest%%.*}
  [ "$major" -gt 22 ] || { [ "$major" -eq 22 ] && [ "$minor" -ge 18 ]; }
}
if [ -x "$H/node/bin/node" ] && node_ok "$H/node/bin/node"; then
  echo "    đã có ($("$H/node/bin/node" -v)), bỏ qua"
else
  TARBALL="node-$NODE_VERSION-darwin-$ARCH.tar.gz"
  (
    cd "$H" &&
      curl -fsSLO "https://nodejs.org/dist/$NODE_VERSION/$TARBALL" &&
      curl -fsSL "https://nodejs.org/dist/$NODE_VERSION/SHASUMS256.txt" | grep " $TARBALL\$" | shasum -a 256 -c - >/dev/null &&
      tar -xzf "$TARBALL" && rm -f "$TARBALL" &&
      ln -sfn "$H/node-$NODE_VERSION-darwin-$ARCH" "$H/node"
  ) || fail "Tải hoặc kiểm tra Node.js không thành công." "Kiểm tra mạng rồi nói 'cài lại'."
  echo "    xong ($("$H/node/bin/node" -v))"
fi
export PATH="$H/node/bin:$PATH"

# ---------------------------------------------------------------- 3. Thư viện dự án
step 3 "Cài thư viện của dự án"
(cd "$REPO" && corepack pnpm install --frozen-lockfile >"$H/install.log" 2>&1) ||
  fail "Cài thư viện không thành công (chi tiết: $H/install.log)." "Kiểm tra mạng rồi nói 'cài lại'. Nếu vẫn lỗi, gửi file log cho dev."
echo "    xong"

# ---------------------------------------------------------------- 4. Plugin HyperFrames cho Claude Code
step 4 "Cài plugin HyperFrames $HF_TAG cho Claude Code"
M="$H/hyperframes-marketplace-$HF_TAG"
if [ ! -f "$M/.claude-plugin/marketplace.json" ]; then
  (
    curl -fsSL -o "$H/hf.tgz" "https://codeload.github.com/heygen-com/hyperframes/tar.gz/refs/tags/$HF_TAG" &&
      rm -rf "$H/hyperframes-${HF_TAG#v}" &&
      tar -xzf "$H/hf.tgz" -C "$H" "hyperframes-${HF_TAG#v}/skills" "hyperframes-${HF_TAG#v}/.claude-plugin" "hyperframes-${HF_TAG#v}/plugin.json" &&
      mv "$H/hyperframes-${HF_TAG#v}" "$M" && rm -f "$H/hf.tgz"
  ) || fail "Tải plugin HyperFrames không thành công." "Kiểm tra mạng rồi nói 'cài lại'."
fi
if command -v claude >/dev/null 2>&1; then
  if claude plugin list 2>/dev/null | grep -q "hyperframes@hyperframes"; then
    echo "    đã có, bỏ qua"
  else
    claude plugin marketplace add "$M" >/dev/null 2>&1 || true
    claude plugin install hyperframes@hyperframes >/dev/null 2>&1 ||
      fail "Không cài được plugin vào Claude Code." "Báo dev (plugin có sẵn ở $M)."
    echo "    xong (mở lại Claude Code để dùng plugin)"
  fi
else
  echo "    không tìm thấy lệnh 'claude' trong terminal; bỏ qua (không ảnh hưởng việc làm video)"
fi

# ---------------------------------------------------------------- 5. Trình duyệt dựng video
step 5 "Chuẩn bị trình duyệt dựng video"
(cd "$REPO" && corepack pnpm exec hyperframes browser ensure >"$H/browser.log" 2>&1) ||
  fail "Không chuẩn bị được trình duyệt dựng video (chi tiết: $H/browser.log)." "Kiểm tra mạng rồi nói 'cài lại'."
echo "    xong"

# ---------------------------------------------------------------- 6. Nhạc thử
step 6 "Chuẩn bị nhạc thử"
if [ -f "$REPO/brand/music/test-pad-01.mp3" ]; then
  echo "    đã có, bỏ qua"
else
  (cd "$REPO" && node scripts/gen-test-music.ts >/dev/null) || fail "Không tạo được nhạc thử." "Báo dev."
  echo "    xong"
fi

# ---------------------------------------------------------------- 7. Kiểm tra + dựng thử
step 7 "Kiểm tra và dựng thử 1 video ngắn"
(cd "$REPO" && node scripts/doctor.ts >"$H/doctor.log" 2>&1) ||
  fail "Máy còn thiếu thứ cần thiết (chi tiết: $H/doctor.log)." "Gửi file log cho dev."
(cd "$REPO" && node scripts/render-blank.ts >"$H/smoke.log" 2>&1) ||
  fail "Dựng thử video không thành công (chi tiết: $H/smoke.log)." "Gửi file log cho dev."
echo "    xong"
echo "CÀI XONG. Máy đã dựng được video."
