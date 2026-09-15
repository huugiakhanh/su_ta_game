"""Chuẩn hoá các GIF animation của nhân vật về cùng một khung.

Vì sao cần: mỗi GIF do AI tạo ra có khung ảnh cao thấp khác nhau và vẽ nhân vật
to nhỏ khác nhau. CSS `background-size: contain` co theo *khung ảnh* chứ không
theo nhân vật, nên trong game nhân vật sẽ phình to/thu nhỏ mỗi khi đổi animation.

Script này đưa tất cả về cùng một chuẩn:
  - cùng kích thước khung
  - nhân vật cùng tỉ lệ (đo theo khuôn mặt — bất biến theo tư thế)
  - chân cùng nằm ở đáy khung (baseline)
  - đầu cùng một toạ độ ngang (điểm neo)

Cách dùng (chạy từ thư mục gốc dự án):
    python tools/normalize_player_gifs.py                    # chạy thử cả bộ, chỉ xuất preview
    APPLY=1 python tools/normalize_player_gifs.py            # ghi đè cả bộ (tự backup vào _original/)
    APPLY=1 python tools/normalize_player_gifs.py --only stance.gif
        # chỉ chuẩn hoá 1 file cho khớp vào bộ đã chuẩn hoá sẵn (khi thay/thêm 1 animation)

Sau khi chạy, script in ra PLAYER_SPRITE_ANCHOR_X — nếu giá trị khác với hằng số
trong frontend/static/js/levels/trung-trac/config.js thì cập nhật lại cho khớp.
"""
import os
import shutil
import sys
from collections import Counter, deque

import numpy as np
from PIL import Image, ImageSequence

ROOT = 'frontend/static/assets/images/characters/trung-trac/'
BACKUP = os.path.join(ROOT, '_original')
APPLY = os.environ.get('APPLY') == '1'

_args = sys.argv[1:]
ONLY = None
if '--only' in _args:
    i = _args.index('--only')
    ONLY = _args[i + 1]
    del _args[i:i + 2]
PREVIEW = _args[0] if _args else 'normalize-preview.png'

# File đầu tiên là mốc tỉ lệ, các file sau được scale theo nó.
FILES = ['stance.gif', 'run.gif', 'jump.gif', 'dash.gif', 'attack.gif', 'hurt.gif']


def load_frames(path):
    im = Image.open(path)
    frames, durations = [], []
    for fr in ImageSequence.Iterator(im):
        frames.append(fr.convert('RGBA'))
        durations.append(fr.info.get('duration', 200))
    return frames, durations


def union_bbox(frames):
    boxes = [f.getbbox() for f in frames if f.getbbox()]
    return (min(b[0] for b in boxes), min(b[1] for b in boxes),
            max(b[2] for b in boxes), max(b[3] for b in boxes))


def face_box(rgba):
    """Khung khuôn mặt = cụm pixel màu da nằm cao nhất.

    Kích thước khuôn mặt gần như không đổi giữa các tư thế, nên dùng làm thước đo
    tỉ lệ nhân vật đáng tin hơn chiều cao toàn thân (vốn thay đổi khi cúi/nhảy).
    """
    a = np.array(rgba).astype(int)
    R, G, B, A = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    skin = (A > 200) & (R > 195) & (G > 140) & (G < 215) & (B > 100) & (B < 180) \
        & (R > B + 55) & (R > G + 20)
    H, W = skin.shape
    seen = np.zeros_like(skin, dtype=bool)
    best = None
    for sy, sx in zip(*np.where(skin)):
        if seen[sy, sx]:
            continue
        q = deque([(sy, sx)])
        seen[sy, sx] = True
        pts = []
        while q:
            y, x = q.popleft()
            pts.append((y, x))
            for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                ny, nx = y + dy, x + dx
                if 0 <= ny < H and 0 <= nx < W and skin[ny, nx] and not seen[ny, nx]:
                    seen[ny, nx] = True
                    q.append((ny, nx))
        if len(pts) < 150:
            continue
        arr = np.array(pts)
        top = arr[:, 0].min()
        if best is None or top < best[0]:
            best = (top, arr[:, 0].max() - top + 1,
                    (arr[:, 1].min() + arr[:, 1].max()) / 2)
    if not best:
        raise RuntimeError('khong tim thay khuon mat — kiem tra lai nguong mau da')
    return {'height': best[1], 'center_x': best[2]}


def measure(frames):
    """Đo cả animation: điểm neo = tâm mặt trung bình (đầu có nhấp nhô giữa các
    frame), cỡ mặt = giá trị lớn nhất (frame nào đầu bị che/nghiêng sẽ đo hụt)."""
    boxes = [face_box(fr) for fr in frames]
    return {
        'height': max(b['height'] for b in boxes),
        'center_x': sum(b['center_x'] for b in boxes) / len(boxes),
    }


def to_palette_frame(rgba):
    """RGBA -> P mode, dành riêng index 0 cho vùng trong suốt."""
    alpha = np.array(rgba.getchannel('A'))
    quant = rgba.convert('RGB').quantize(colors=255, method=Image.MEDIANCUT)
    idx = np.array(quant, dtype=np.uint8) + 1
    idx[alpha < 128] = 0
    out = Image.fromarray(idx, mode='P')
    out.putpalette([255, 0, 255] + quant.getpalette()[:255 * 3])
    return out


def place(frame, canvas_size, offset_x):
    """Dat frame vao khung chuan: canh ngang theo diem neo, day sat day khung."""
    sheet = Image.new('RGBA', canvas_size, (0, 0, 0, 0))
    sheet.paste(frame, (offset_x, canvas_size[1] - frame.height), frame)
    return sheet


def save_gif(name, frames, durations):
    os.makedirs(BACKUP, exist_ok=True)
    target = os.path.join(ROOT, name)
    backup = os.path.join(BACKUP, name)
    if not os.path.exists(backup):
        shutil.copy2(target, backup)
    pal = [to_palette_frame(f) for f in frames]
    pal[0].save(target, save_all=True, append_images=pal[1:], duration=durations,
                loop=0, transparency=0, disposal=2, optimize=False)
    print(f'  -> da ghi de {name} ({len(pal)} frame)')


def read_existing_frame(exclude):
    """Doc khung chuan + diem neo + co khuon mat tu cac file DA duoc chuan hoa."""
    infos = []
    for name in FILES:
        path = os.path.join(ROOT, name)
        if name == exclude or not os.path.exists(path):
            continue
        frames, _ = load_frames(path)
        infos.append((name, frames[0].size, measure(frames)))
    if not infos:
        return None
    canvas = Counter(i[1] for i in infos).most_common(1)[0][0]
    same = [i for i in infos if i[1] == canvas]
    return {
        'canvas': canvas,
        'anchor': sum(i[2]['center_x'] for i in same) / len(same),
        'face': sum(i[2]['height'] for i in same) / len(same),
        'names': [i[0] for i in same],
    }


def normalize_one(name):
    """Chuan hoa dung 1 file cho khop vao bo GIF da chuan hoa san."""
    path = os.path.join(ROOT, name)
    if not os.path.exists(path):
        raise SystemExit(f'khong tim thay {path}')
    ref = read_existing_frame(name)
    if not ref:
        raise SystemExit('chua co file nao da chuan hoa de lam moc — chay che do ca bo truoc')
    canvas_w, canvas_h = ref['canvas']
    print(f'Moc tu {", ".join(ref["names"])}: khung {canvas_w}x{canvas_h}, '
          f'neo_x={ref["anchor"]:.0f}, mat={ref["face"]:.1f}px')

    frames, durations = load_frames(path)
    box = union_bbox(frames)
    cropped = [fr.crop(box) for fr in frames]
    face = measure(cropped)
    factor = ref['face'] / face['height']
    scaled = [c.resize((max(1, round(c.width * factor)), max(1, round(c.height * factor))),
                       Image.NEAREST) for c in cropped]
    anchor = measure(scaled)['center_x']
    offset_x = int(round(ref['anchor'] - anchor))
    print(f'{name}: crop={box[2]-box[0]}x{box[3]-box[1]} mat={face["height"]}px '
          f'-> scale x{factor:.3f} -> {scaled[0].width}x{scaled[0].height} lech_x={offset_x}')

    if scaled[0].height > canvas_h or offset_x < 0 or offset_x + scaled[0].width > canvas_w:
        print('  ! canh bao: anh vuot khung chuan, phan thua se bi cat')

    placed = [place(fr, (canvas_w, canvas_h), offset_x) for fr in scaled]
    if APPLY:
        save_gif(name, placed, durations)

    others = [load_frames(os.path.join(ROOT, n))[0][0] for n in ref['names']]
    board_frames = [placed[0]] + others
    gap = 24
    board = Image.new('RGBA', (canvas_w * len(board_frames) + gap * (len(board_frames) - 1),
                               canvas_h), (28, 28, 38, 255))
    vline = Image.new('RGBA', (2, canvas_h), (90, 160, 255, 255))
    for i, fr in enumerate(board_frames):
        x0 = i * (canvas_w + gap)
        board.paste(vline, (x0 + int(round(ref['anchor'])), 0))
        board.paste(fr, (x0, 0), fr)
    board.paste(Image.new('RGBA', (board.width, 2), (255, 80, 80, 255)), (0, canvas_h - 2))
    board.save(PREVIEW)
    print(f'\npreview ({name} dung dau, so voi {", ".join(ref["names"])}): {PREVIEW}')
    if not APPLY:
        print('(chay thu — chua ghi de file nao. Dat APPLY=1 de ghi that)')


def main():
    if ONLY:
        normalize_one(ONLY)
        return

    names = [n for n in FILES if os.path.exists(os.path.join(ROOT, n))]
    if not names:
        raise SystemExit(f'khong tim thay GIF nao trong {ROOT}')

    prepared = {}
    reference_face = None
    for name in names:
        frames, durations = load_frames(os.path.join(ROOT, name))
        box = union_bbox(frames)
        cropped = [fr.crop(box) for fr in frames]

        face = measure(cropped)
        if reference_face is None:
            reference_face = face['height']
        factor = reference_face / face['height']

        scaled = [c.resize((max(1, round(c.width * factor)), max(1, round(c.height * factor))),
                           Image.NEAREST) for c in cropped]
        anchor = measure(scaled)['center_x']
        prepared[name] = (scaled, durations, anchor)
        print(f'{name}: crop={box[2]-box[0]}x{box[3]-box[1]} mat={face["height"]}px '
              f'-> scale x{factor:.3f} -> {scaled[0].width}x{scaled[0].height} neo_x={anchor:.0f}')

    left = max(a for _, _, a in prepared.values())
    right = max(f[0].width - a for f, _, a in prepared.values())
    canvas_w = int(round(left + right))
    canvas_h = max(f[0].height for f, _, _ in prepared.values())
    canvas_w += canvas_w % 2
    canvas_h += canvas_h % 2
    print(f'\nKhung chung: {canvas_w}x{canvas_h}')

    previews = []
    for name, (frames, durations, anchor) in prepared.items():
        offset_x = int(round(left - anchor))
        placed = [place(fr, (canvas_w, canvas_h), offset_x) for fr in frames]
        previews.append(placed[0])

        if APPLY:
            save_gif(name, placed, durations)

    gap = 24
    board = Image.new('RGBA', (canvas_w * len(previews) + gap * (len(previews) - 1), canvas_h),
                      (28, 28, 38, 255))
    vline = Image.new('RGBA', (2, canvas_h), (90, 160, 255, 255))
    for i, fr in enumerate(previews):
        x0 = i * (canvas_w + gap)
        board.paste(vline, (x0 + int(left), 0))
        board.paste(fr, (x0, 0), fr)
    board.paste(Image.new('RGBA', (board.width, 2), (255, 80, 80, 255)), (0, canvas_h - 2))
    board.save(PREVIEW)

    print(f'\npreview: {PREVIEW}')
    print(f'PLAYER_SPRITE_ANCHOR_X = {left / canvas_w:.4f}  (cap nhat vao config.js neu khac)')
    if not APPLY:
        print('(chay thu — chua ghi de file nao. Dat APPLY=1 de ghi that)')


main()
