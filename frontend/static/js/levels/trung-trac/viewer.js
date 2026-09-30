// Chế độ xem sprite (?viewer=1 trên trang màn chơi) — công cụ soát asset cho
// team, KHÔNG phải gameplay. Đọc manifest_tt.json, chọn asset -> animation,
// phát ở x1/x3/x4 kèm lưới pixel, baseline (hàng chân = frame_h - 2) và pivot
// bottom-center. Frame chứa hit_frame (đếm từ 1) được đánh dấu đỏ.

import { loadImage, joinAssetPath, loadSpriteManifest, loadMapManifest } from './assets.js';
import { SPRITE_8BIT_ROOT, MAP_8BIT_ROOT, BOOK_SPRITE_ID, BOOK_FPS } from './config.js';

// Asset môi trường trong maps_tt.json (vật cản, bình thư, cổng, cột đá) đổi
// sang dạng mục manifest sprite để viewer dùng chung một đường xem. Nền
// parallax/tileset không có ô nên bỏ qua. fps null: bình thư dùng BOOK_FPS,
// ảnh nhiều trạng thái (cột đá) lật 2 ô/giây để soát.
function mapAssetEntries(mapManifest) {
  return (mapManifest?.assets || [])
    .filter(asset => ['obstacle', 'item', 'prop'].includes(asset.category))
    .map(asset => {
      const frames = asset.frames || 1;
      return {
        id: asset.id,
        category: `map/${asset.category}`,
        priority: asset.priority,
        status: asset.status,
        facing: '—',
        pivot: asset.anchor,
        root: MAP_8BIT_ROOT,
        frame_w: asset.frame_w || asset.w,
        frame_h: asset.frame_h || asset.h,
        animations: [{
          name: asset.frame_states ? asset.frame_states.join('|') : 'idle',
          file: asset.file,
          frames,
          fps: asset.fps ?? (asset.id === BOOK_SPRITE_ID ? BOOK_FPS : 2),
          loop: asset.loop ?? true,
          hit_frame: null
        }]
      };
    });
}

const SCALES = [1, 3, 4];
const PAD = 8; // lề quanh khung, tính theo pixel sprite

const style = `
.viewer { max-width: 1100px; margin: 0 auto; padding: 16px; color: #f7e8bd; font: 14px system-ui, sans-serif; }
.viewer h1 { margin: 0 0 12px; color: #e8b94a; font-size: 20px; }
.viewer__bar { display: flex; flex-wrap: wrap; gap: 8px 14px; align-items: center; margin-bottom: 12px; }
.viewer select, .viewer button { font: inherit; padding: 5px 9px; border: 1px solid #836542; border-radius: 4px; background: #2c2017; color: #fff; }
.viewer button[aria-pressed="true"] { background: #7d2923; border-color: #e7b84d; }
.viewer__meta { margin: 0 0 12px; color: #d5c39e; font-family: monospace; white-space: pre-wrap; }
.viewer__stage { overflow: auto; padding: 8px; border: 2px solid #5b351d; background: #1b1511; }
/* Ghi đè luật canvas chung của màn (cỡ theo --stage-w/--stage-h): viewer vẽ
   sẵn đúng cỡ phóng to nên canvas hiển thị cỡ gốc. */
.viewer canvas { display: block; width: auto; height: auto; image-rendering: pixelated; }
.viewer__strip { margin-top: 12px; overflow: auto; padding: 8px; border: 1px solid #3a2a1e; }
.viewer__legend { margin-top: 8px; color: #a99677; font-size: 12px; }
`;

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => { node[key] = value; });
  children.forEach(child => node.append(child));
  return node;
}

export async function startViewer() {
  document.querySelector('.game-shell').hidden = true;
  document.head.append(el('style', { textContent: style }));
  const root = el('main', { className: 'viewer' });
  document.body.append(root);

  const [spriteManifest, mapManifest] = await Promise.all([loadSpriteManifest(), loadMapManifest()]);
  if (!spriteManifest) {
    root.append(el('p', { textContent: 'Không tải được manifest_tt.json (xem console / đường dẫn sprites-8bit).' }));
    return;
  }
  const manifest = { ...spriteManifest, assets: [...spriteManifest.assets, ...mapAssetEntries(mapManifest)] };

  const assetSelect = el('select', { ariaLabel: 'Asset' });
  manifest.assets.forEach((asset, index) => {
    assetSelect.append(el('option', { value: index, textContent: `${asset.id} (${asset.status})` }));
  });
  const animSelect = el('select', { ariaLabel: 'Animation' });
  const scaleButtons = SCALES.map(scale => el('button', { type: 'button', textContent: `×${scale}` }));
  const playButton = el('button', { type: 'button', textContent: 'Tạm dừng' });
  const prevButton = el('button', { type: 'button', textContent: '◀ frame' });
  const nextButton = el('button', { type: 'button', textContent: 'frame ▶' });
  const gridToggle = el('input', { type: 'checkbox', checked: true });
  const meta = el('p', { className: 'viewer__meta' });
  const canvas = el('canvas');
  const stripCanvas = el('canvas');

  root.append(
    el('h1', { textContent: `Sprite viewer — ${manifest.chapter} v${manifest.version}` }),
    el('div', { className: 'viewer__bar' }, [
      assetSelect, animSelect, ...scaleButtons, prevButton, playButton, nextButton,
      el('label', {}, [gridToggle, ' lưới'])
    ]),
    meta,
    el('div', { className: 'viewer__stage' }, [canvas]),
    el('div', { className: 'viewer__strip' }, [stripCanvas]),
    el('p', {
      className: 'viewer__legend',
      textContent: 'Xanh lá: baseline (hàng chân = frame_h − 2). Vàng: pivot bottom-center. Viền đỏ: frame hit_frame. Nét đứt: mép khung.'
    })
  );

  const imageCache = new Map();
  const view = { asset: null, anim: null, image: null, scale: 3, frame: 0, playing: true, clock: 0 };

  async function selectAnimation() {
    view.asset = manifest.assets[Number(assetSelect.value)];
    view.anim = view.asset.animations[Number(animSelect.value)] || view.asset.animations[0];
    const url = joinAssetPath(view.asset.root || SPRITE_8BIT_ROOT, view.anim.file);
    if (!imageCache.has(url)) imageCache.set(url, await loadImage(url, true));
    view.image = imageCache.get(url);
    view.frame = 0;
    view.clock = 0;
    const a = view.asset;
    const n = view.anim;
    meta.textContent = [
      `id ${a.id}  category ${a.category}  priority ${a.priority}  status ${a.status}  facing ${a.facing}  pivot ${a.pivot}`,
      `anim ${n.name}  frame ${a.frame_w}×${a.frame_h}  frames ${n.frames}  fps ${n.fps}  loop ${n.loop}  hit_frame ${n.hit_frame ?? '—'}`,
      `file ${n.file}${view.image ? `  (${view.image.width}×${view.image.height})` : '  — THIẾU FILE'}`
    ].join('\n');
    render();
  }

  function fillAnimations() {
    const asset = manifest.assets[Number(assetSelect.value)];
    animSelect.replaceChildren(...asset.animations.map((anim, index) =>
      el('option', { value: index, textContent: `${anim.name} (${anim.frames}f)` })));
  }

  function drawFrame(ctx, frame, originX, originY, scale) {
    const { frame_w: fw, frame_h: fh } = view.asset;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(view.image, frame * fw, 0, fw, fh, originX, originY, fw * scale, fh * scale);
    if (gridToggle.checked && scale >= 3) {
      ctx.strokeStyle = 'rgba(255, 255, 255, .08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= fw; x++) { ctx.moveTo(originX + x * scale + .5, originY); ctx.lineTo(originX + x * scale + .5, originY + fh * scale); }
      for (let y = 0; y <= fh; y++) { ctx.moveTo(originX, originY + y * scale + .5); ctx.lineTo(originX + fw * scale, originY + y * scale + .5); }
      ctx.stroke();
    }
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = 'rgba(255, 255, 255, .45)';
    ctx.strokeRect(originX + .5, originY + .5, fw * scale - 1, fh * scale - 1);
    ctx.setLineDash([]);
    // Baseline: hàng pixel chân (frame_h - 2) — vạch ngay dưới hàng đó.
    ctx.fillStyle = '#35e07a';
    ctx.fillRect(originX - 4, originY + (fh - 1) * scale, fw * scale + 8, 1);
    ctx.fillStyle = '#ffe600';
    ctx.fillRect(originX + fw / 2 * scale - 1, originY + (fh - 1) * scale - 1, 3, 3);
    if (view.anim.hit_frame && frame === view.anim.hit_frame - 1) {
      ctx.strokeStyle = '#ff3b3b';
      ctx.lineWidth = 2;
      ctx.strokeRect(originX - 2, originY - 2, fw * scale + 4, fh * scale + 4);
      ctx.lineWidth = 1;
    }
  }

  function render() {
    const { frame_w: fw, frame_h: fh } = view.asset;
    const s = view.scale;
    canvas.width = (fw + PAD * 2) * s;
    canvas.height = (fh + PAD * 2) * s;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#3b6e86';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (!view.image) return;
    drawFrame(ctx, view.frame, PAD * s, PAD * s, s);
    ctx.fillStyle = '#fff';
    ctx.font = '12px monospace';
    ctx.fillText(`${view.frame + 1}/${view.anim.frames}`, 4, 14);

    // Cả strip ở x2 để so các frame cạnh nhau trên cùng baseline.
    const stripScale = 2;
    stripCanvas.width = view.anim.frames * (fw + 4) * stripScale;
    stripCanvas.height = (fh + 4) * stripScale;
    const stripCtx = stripCanvas.getContext('2d');
    stripCtx.fillStyle = '#3b6e86';
    stripCtx.fillRect(0, 0, stripCanvas.width, stripCanvas.height);
    for (let i = 0; i < view.anim.frames; i++) {
      drawFrame(stripCtx, i, (i * (fw + 4) + 2) * stripScale, 2 * stripScale, stripScale);
    }
  }

  let last = 0;
  function tick(timestamp) {
    const dt = Math.min(.1, (timestamp - last) / 1000 || 0);
    last = timestamp;
    if (view.playing && view.anim && view.image) {
      view.clock += dt;
      const raw = Math.floor(view.clock * view.anim.fps);
      // Không lặp -> dừng ở frame cuối rồi phát lại sau 0.6s để soát tiếp.
      const holdFrames = Math.ceil(.6 * view.anim.fps);
      const frame = view.anim.loop
        ? raw % view.anim.frames
        : Math.min(view.anim.frames - 1, raw % (view.anim.frames + holdFrames));
      if (frame !== view.frame) {
        view.frame = frame;
        render();
      }
    }
    requestAnimationFrame(tick);
  }

  function setScale(scale) {
    view.scale = scale;
    scaleButtons.forEach((button, index) => button.setAttribute('aria-pressed', String(SCALES[index] === scale)));
    render();
  }

  function step(delta) {
    view.playing = false;
    playButton.textContent = 'Phát';
    view.frame = (view.frame + delta + view.anim.frames) % view.anim.frames;
    render();
  }

  assetSelect.addEventListener('change', () => { fillAnimations(); selectAnimation(); });
  animSelect.addEventListener('change', selectAnimation);
  scaleButtons.forEach((button, index) => button.addEventListener('click', () => setScale(SCALES[index])));
  playButton.addEventListener('click', () => {
    view.playing = !view.playing;
    playButton.textContent = view.playing ? 'Tạm dừng' : 'Phát';
    view.clock = view.frame / view.anim.fps;
  });
  prevButton.addEventListener('click', () => step(-1));
  nextButton.addEventListener('click', () => step(1));
  gridToggle.addEventListener('change', render);

  fillAnimations();
  scaleButtons.forEach((button, index) => button.setAttribute('aria-pressed', String(SCALES[index] === view.scale)));
  await selectAnimation();
  requestAnimationFrame(tick);
}
