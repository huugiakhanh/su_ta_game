"""Chuẩn hoá các GIF animation của nhân vật về cùng một chuẩn.

Vì sao cần: AI tạo ảnh không giữ được tỉ lệ nhân vật — mỗi file có khung ảnh cao
thấp khác nhau và vẽ nhân vật to nhỏ khác nhau. CSS `background-size: contain`
co theo *khung ảnh* chứ không theo nhân vật, nên trong game nhân vật sẽ phình
to/thu nhỏ khi đổi animation.

Script đưa tất cả về cùng một chuẩn:
  - cùng kích thước khung
  - nhân vật cùng tỉ lệ (đo khuôn mặt — bất biến theo tư thế hơn chiều cao thân)
  - chân cùng nằm ở đáy khung (baseline)
  - đầu cùng một toạ độ ngang (điểm neo)

Mỗi file dùng 1 hệ số scale chung cho mọi frame, nên chuyển động hoạ sĩ/AI vẽ
(đầu nhấp nhô, lao người khi đâm) được giữ nguyên. Cân riêng từng frame đã thử
và bỏ: khuôn mặt đo được đổi theo góc nghiêng đầu nên hay phóng đại nhầm cả
những frame vốn đã đúng cỡ.

Cách dùng (chạy từ thư mục gốc dự án):
    python tools/normalize_player_gifs.py                    # chạy thử cả bộ, chỉ xuất preview
    APPLY=1 python tools/normalize_player_gifs.py            # ghi đè cả bộ (tự backup vào _original/)
    APPLY=1 python tools/normalize_player_gifs.py --only attack.gif
        # chỉ chuẩn hoá 1 file cho khớp vào bộ đã chuẩn hoá sẵn

Sau khi chạy, script in ra PLAYER_SPRITE_ANCHOR_X — nếu khác hằng số trong
frontend/static/js/levels/trung-trac/config.js thì cập nhật lại cho khớp.
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

# File đầu tiên là mốc tỉ lệ, các file sau cân theo nó.
FILES = ['stance.gif', 'run.gif', 'jump.gif', 'dash.gif', 'attack.gif', 'hurt.gif']

# Ép lại tốc độ frame (ms) cho animation cần khớp nhịp gameplay. attack chỉ có
# ~0.5s trong game (attackTimer .18 + cooldown .36) nên GIF gốc 1.6s sẽ chỉ kịp
# hiện frame đầu; hurt khớp với thời gian bất tử sau khi trúng đòn.
FRAME_DURATION = {
    'attack.gif': 110,
    'hurt.gif': 150,
}

# Sửa tay những frame mà AI vẽ lệch cỡ hẳn so với các frame còn lại trong cùng
# file: {tên file: {chỉ số frame: hệ số phóng thêm}}. Frame được sửa sẽ đồng thời
# bị kéo xuống đứng chung baseline với các frame khác. Chỉ dùng khi nhìn preview
# thấy rõ 1 frame bị nhỏ/to bất thường — cân theo frame tự động đã thử và bỏ vì
# khuôn mặt đo được đổi theo góc nghiêng đầu nên hay sửa nhầm frame vốn đã đúng.
FRAME_FIX = {
    # frame trúng đòn bị vẽ nhỏ ~2/3 và treo lơ lửng giữa không trung
    'hurt.gif': {0: 1.51},
}

_args = sys.argv[1:]
ONLY = None
if '--only' in _args:
    i = _args.index('--only')
    ONLY = _args[i + 1]
    del _args[i:i + 2]
PREVIEW = _args[0] if _args else 'normalize-preview.png'


def load_frames(path):
    im = Image.open(path)
    frames, durations = [], []
    for fr in ImageSequence.Iterator(im):
        frames.append(fr.convert('RGBA'))
        durations.append(fr.info.get('duration', 200))
    return frames, durations


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


def prepare(frames, ref_face, fixes=None):
    """Cân cỡ nhân vật của cả file về ref_face (1 hệ số chung cho mọi frame).

    Cố tình KHÔNG cân riêng từng frame: khuôn mặt đo được thay đổi theo góc
    nghiêng/biểu cảm đầu, nên cân theo frame sẽ phóng đại nhầm cả những frame
    vốn đã đúng cỡ. Một hệ số chung = "zoom cả animation", giữ nguyên biên độ
    chuyển động hoạ sĩ vẽ.
    """
    box = union_bbox(frames)
    faces = [face_box(fr) for fr in frames]
    # Lấy max chứ không phải trung bình/trung vị: frame nào đầu nghiêng hoặc mặt
    # bị tóc/tay che sẽ đo hụt, còn đo thừa thì gần như không xảy ra.
    mid = max(f['height'] for f in faces)
    factor = ref_face / mid
    fixes = fixes or {}
    placed = []
    for index, fr in enumerate(frames):
        content = fr.crop(box)
        size = (max(1, round(content.width * factor)), max(1, round(content.height * factor)))
        scaled = content.resize(size, Image.NEAREST)
        extra = fixes.get(index)
        if extra:
            # Phóng riêng nhân vật trong frame này rồi đặt lại cho chân chạm
            # đúng baseline chung, giữ tâm mặt ở nguyên toạ độ ngang cũ.
            own = fr.getbbox()
            body = fr.crop(own)
            grown = body.resize((max(1, round(body.width * factor * extra)),
                                 max(1, round(body.height * factor * extra))), Image.NEAREST)
            face_x = (face_box(fr)['center_x'] - box[0]) * factor
            sheet = Image.new('RGBA', size, (0, 0, 0, 0))
            offset_x = int(round(face_x - (face_box(grown)['center_x'])))
            sheet.paste(grown, (offset_x, size[1] - grown.height), grown)
            scaled = sheet
        placed.append(scaled)
    anchor = sum(face_box(fr)['center_x'] for fr in placed) / len(placed)
    return {
        'placed': placed,
        'anchor': anchor,
        'width': placed[0].width,
        'height': placed[0].height,
        'face': mid,
        'factor': factor,
    }


def union_bbox(frames):
    boxes = [f.getbbox() for f in frames if f.getbbox()]
    return (min(b[0] for b in boxes), min(b[1] for b in boxes),
            max(b[2] for b in boxes), max(b[3] for b in boxes))


def compose(prep, canvas_size, anchor_x):
    """Đặt các frame của 1 file vào khung chung: neo theo đầu, đáy sát đáy khung."""
    canvas_w, canvas_h = canvas_size
    x = int(round(anchor_x - prep['anchor']))
    y = canvas_h - prep['height']
    sheets = []
    for img in prep['placed']:
        sheet = Image.new('RGBA', canvas_size, (0, 0, 0, 0))
        sheet.paste(img, (x, y), img)
        sheets.append(sheet)
    return sheets


def to_palette_frame(rgba):
    """RGBA -> P mode, dành riêng index 0 cho vùng trong suốt."""
    alpha = np.array(rgba.getchannel('A'))
    quant = rgba.convert('RGB').quantize(colors=255, method=Image.MEDIANCUT)
    idx = np.array(quant, dtype=np.uint8) + 1
    idx[alpha < 128] = 0
    out = Image.fromarray(idx, mode='P')
    out.putpalette([255, 0, 255] + quant.getpalette()[:255 * 3])
    return out


def save_gif(name, frames, durations):
    os.makedirs(BACKUP, exist_ok=True)
    target = os.path.join(ROOT, name)
    backup = os.path.join(BACKUP, name)
    if not os.path.exists(backup):
        shutil.copy2(target, backup)
    override = FRAME_DURATION.get(name)
    if override:
        durations = [override] * len(frames)
    pal = [to_palette_frame(f) for f in frames]
    pal[0].save(target, save_all=True, append_images=pal[1:], duration=durations,
                loop=0, transparency=0, disposal=2, optimize=False)
    print(f'  -> da ghi de {name} ({len(pal)} frame, {durations[0]}ms/frame)')


def make_board(cells, canvas_size, anchor_x, path, window=None):
    canvas_w, canvas_h = canvas_size
    width = window or canvas_w
    board = Image.new('RGBA', (width * len(cells), canvas_h), (28, 28, 38, 255))
    vline = Image.new('RGBA', (2, canvas_h), (90, 160, 255, 255))
    for i, sheet in enumerate(cells):
        if window:
            sheet = sheet.crop((int(anchor_x - window // 2), 0,
                                int(anchor_x + window // 2), canvas_h))
            mark = window // 2
        else:
            mark = int(anchor_x)
        board.paste(sheet, (i * width, 0), sheet)
        board.paste(vline, (i * width + mark, 0))
    board.paste(Image.new('RGBA', (board.width, 2), (255, 80, 80, 255)), (0, canvas_h - 2))
    board.save(path)


def read_existing_frame(exclude):
    """Đọc khung chuẩn + điểm neo + cỡ mặt từ các file ĐÃ được chuẩn hoá."""
    infos = []
    for name in FILES:
        path = os.path.join(ROOT, name)
        if name == exclude or not os.path.exists(path):
            continue
        frames, _ = load_frames(path)
        faces = [face_box(fr) for fr in frames]
        infos.append((name, frames[0].size,
                      max(f["height"] for f in faces),
                      sum(f['center_x'] for f in faces) / len(faces)))
    if not infos:
        return None
    canvas = Counter(i[1] for i in infos).most_common(1)[0][0]
    same = [i for i in infos if i[1] == canvas]
    return {
        'canvas': canvas,
        'anchor': sum(i[3] for i in same) / len(same),
        'face': sum(i[2] for i in same) / len(same),
        'names': [i[0] for i in same],
    }


def normalize_one(name):
    path = os.path.join(ROOT, name)
    if not os.path.exists(path):
        raise SystemExit(f'khong tim thay {path}')
    ref = read_existing_frame(name)
    if not ref:
        raise SystemExit('chua co file nao da chuan hoa de lam moc — chay che do ca bo truoc')
    canvas = ref['canvas']
    print(f'Moc tu {", ".join(ref["names"])}: khung {canvas[0]}x{canvas[1]}, '
          f'neo_x={ref["anchor"]:.0f}, mat={ref["face"]:.1f}px')

    frames, durations = load_frames(path)
    prep = prepare(frames, ref['face'], FRAME_FIX.get(name))
    print(f'{name}: mat={prep["face"]:.0f}px -> scale x{prep["factor"]:.3f} '
          f'-> noi dung {prep["width"]}x{prep["height"]}')
    if (prep['height'] > canvas[1]
            or prep['anchor'] > ref['anchor']
            or prep['width'] - prep['anchor'] > canvas[0] - ref['anchor']):
        raise SystemExit('anh vuot khung chuan — chay che do ca bo de mo rong khung cho vua')

    sheets = compose(prep, canvas, ref['anchor'])
    if APPLY:
        save_gif(name, sheets, durations)

    others = [load_frames(os.path.join(ROOT, n))[0][0] for n in ref['names']]
    make_board([sheets[0]] + others, canvas, ref['anchor'], PREVIEW, window=640)
    print(f'\npreview ({name} dung dau): {PREVIEW}')
    if not APPLY:
        print('(chay thu — chua ghi de file nao. Dat APPLY=1 de ghi that)')


def normalize_all():
    names = [n for n in FILES if os.path.exists(os.path.join(ROOT, n))]
    if not names:
        raise SystemExit(f'khong tim thay GIF nao trong {ROOT}')

    preps, all_durations, ref_face = {}, {}, None
    for name in names:
        frames, durations = load_frames(os.path.join(ROOT, name))
        faces = [face_box(fr) for fr in frames]
        if ref_face is None:
            ref_face = max(f['height'] for f in faces)
        prep = prepare(frames, ref_face, FRAME_FIX.get(name))
        preps[name] = prep
        all_durations[name] = durations
        print(f'{name}: mat={prep["face"]:.0f}px -> scale x{prep["factor"]:.3f} '
              f'-> noi dung {prep["width"]}x{prep["height"]}')

    left = max(p['anchor'] for p in preps.values())
    right = max(p['width'] - p['anchor'] for p in preps.values())
    canvas_w = int(round(left + right))
    canvas_h = int(round(max(p['height'] for p in preps.values())))
    canvas_w += canvas_w % 2
    canvas_h += canvas_h % 2
    print(f'\nKhung chung: {canvas_w}x{canvas_h}')

    firsts = []
    for name, prep in preps.items():
        sheets = compose(prep, (canvas_w, canvas_h), left)
        firsts.append(sheets[0])
        if APPLY:
            save_gif(name, sheets, all_durations[name])

    make_board(firsts, (canvas_w, canvas_h), left, PREVIEW, window=640)
    print(f'\npreview: {PREVIEW}')
    print(f'PLAYER_SPRITE_ANCHOR_X = {left / canvas_w:.4f}  (cap nhat vao config.js neu khac)')
    if not APPLY:
        print('(chay thu — chua ghi de file nao. Dat APPLY=1 de ghi that)')


def main():
    if ONLY:
        normalize_one(ONLY)
    else:
        normalize_all()


main()
