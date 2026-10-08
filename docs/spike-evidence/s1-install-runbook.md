# Runbook cài đặt cho Claude Code (bản nháp Spike, dùng cho skill `cai-dat` ở M2)

Người dùng là MKT: không biết kỹ thuật, chỉ nói "cài đặt giúp tôi". Claude Code làm hết các bước dưới đây và báo kết quả bằng tiếng Việt dễ hiểu, không dump log.

Nguyên tắc:
- Không dùng `sudo`. Không Homebrew. Không mở trình cài GUI. Không cần tài khoản hay API key.
- Mọi thứ nằm trong `$REDSUN_REELS_HOME` (mặc định `~/.redsun-reels`) hoặc trong thư mục dự án.
- Bước nào đã xong (đúng version) thì bỏ qua. Chạy lại runbook không làm hỏng gì.
- Một bước lỗi thì dừng ở đó. Báo MKT bằng 1–2 câu, kèm việc cần làm (thường là "kiểm tra mạng rồi nói 'cài lại'").

Version đã pin: Node `v22.23.3`, pnpm `10.34.6` (`package.json` → `packageManager`), HyperFrames `0.8.141` (CLI + plugin tag `v0.8.141`).

## Bước 0 — Kiểm tra máy
```bash
uname -m                       # x86_64 → ARCH=x64 ; arm64 → ARCH=arm64
sw_vers -productVersion
df -h "$HOME" | tail -1        # cần ≥ 3 GB trống
```

## Bước 1 — Node 22 (không sudo)
Bỏ qua nếu `node -v` ≥ v22.
```bash
H="${REDSUN_REELS_HOME:-$HOME/.redsun-reels}"; V=v22.23.3; ARCH=x64   # hoặc arm64
mkdir -p "$H"; cd "$H"
curl -fsSLO "https://nodejs.org/dist/$V/node-$V-darwin-$ARCH.tar.gz"
curl -fsSL "https://nodejs.org/dist/$V/SHASUMS256.txt" | grep " node-$V-darwin-$ARCH.tar.gz\$" | shasum -a 256 -c -
tar -xzf "node-$V-darwin-$ARCH.tar.gz" && rm "node-$V-darwin-$ARCH.tar.gz"
ln -sfn "$H/node-$V-darwin-$ARCH" "$H/node"
export PATH="$H/node/bin:$PATH"; node -v
```

## Bước 2 — pnpm + thư viện dự án
```bash
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0 COREPACK_HOME="$H/corepack"
cd <thư mục dự án>
corepack pnpm install --frozen-lockfile
corepack pnpm exec hyperframes --version     # phải là 0.8.141
```

## Bước 3 — Plugin HyperFrames cho Claude Code (đúng tag)
```bash
M="$H/hyperframes-marketplace-v0.8.141"
if [ ! -f "$M/.claude-plugin/marketplace.json" ]; then
  curl -fsSL -o "$H/hf.tgz" https://codeload.github.com/heygen-com/hyperframes/tar.gz/refs/tags/v0.8.141
  tar -xzf "$H/hf.tgz" -C "$H" hyperframes-0.8.141/skills hyperframes-0.8.141/.claude-plugin hyperframes-0.8.141/plugin.json
  mv "$H/hyperframes-0.8.141" "$M" && rm "$H/hf.tgz"
fi
claude plugin validate "$M"
claude plugin marketplace add "$M"
claude plugin install hyperframes@hyperframes
```
- Dùng tarball, không dùng `git`: máy Mac chưa có Xcode Command Line Tools thì `git` sẽ bật hộp thoại cài GUI. Tarball nặng 124 MB, tải khoảng 46 giây trên máy dev, giải nén ra 18 MB.
- Lệnh `claude plugin marketplace add heygen-com/hyperframes` trong README bị lỗi clone trên máy dev (xem `docs/decisions.md` mục 2), nên không dùng.

## Bước 4 — Kiểm tra môi trường
```bash
export HYPERFRAMES_FFMPEG_PATH="$(node -p "require('ffmpeg-static')")"
export HYPERFRAMES_FFPROBE_PATH="$(node -p "require('ffprobe-static').path")"
export HYPERFRAMES_NO_TELEMETRY=1 HYPERFRAMES_NO_UPDATE_CHECK=1 HYPERFRAMES_SKIP_SKILLS=1
corepack pnpm exec hyperframes doctor
corepack pnpm exec hyperframes browser ensure     # dùng Chrome có sẵn, hoặc tự tải
```

## Bước 5 — Render thử
```bash
corepack pnpm exec hyperframes init "$H/smoke" --example blank --resolution portrait --non-interactive
corepack pnpm exec hyperframes render "$H/smoke" -o "$H/smoke/smoke.mp4" --quality draft
```
Thành công: báo MKT "Cài xong. Máy đã dựng được video thử dài 10 giây." Sau đó xóa `$H/smoke`.

## Quyền cho Claude Code
Để MKT không phải bấm duyệt từng lệnh, `.claude/settings.json` của dự án (M2) sẽ allowlist đúng các lệnh trên: `curl` tới nodejs.org/github.com, `tar`, `shasum`, `git clone`/`sparse-checkout`, `corepack pnpm …`, `claude plugin …`. Spike chưa thêm allowlist này.
