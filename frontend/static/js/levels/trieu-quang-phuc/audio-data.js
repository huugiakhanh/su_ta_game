// Âm thanh riêng chương Triệu Việt Vương. Nhạc nền 3 màn: file mp3 của team (tạo theo
// docs/archive/GEMINI_PROMPT_TQP_MUSIC.md, nộp 05/11/2026 — mp3 192 kbps, 63–68 s,
// phát lặp; engine cắt khoảng lặng đầu/cuối khi tính điểm lặp). File mp3 là asset
// của team, không sửa — thay nhạc thì chép đè cùng tên. Tiếng trận Dương Sàn + kỹ
// năng màn 3 (TQP-L3) tổng hợp chiptune. Định dạng: xem engine/sfx-data.js.
// Mọi số DESIGN_BASELINE.

export const MUSIC_FILES = {
  level1: '/static/assets/audio/trieu-quang-phuc/level1.mp3',
  level2: '/static/assets/audio/trieu-quang-phuc/level2.mp3',
  level3: '/static/assets/audio/trieu-quang-phuc/level3.mp3'
};

export const MUSIC = {};

export const SFX = {
  // --- Trận Dương Sàn ---
  bossCharge: [
    { wave: 'noise', filter: { type: 'lowpass', f: [400, 900] }, dur: .35, vol: .22 },
    { wave: 'sawtooth', f: [90, 140], dur: .3, vol: .1, filter: { type: 'lowpass', f: [500, 700] } }
  ],
  bossStuck: [
    { wave: 'noise', filter: { type: 'lowpass', f: [700, 150] }, dur: .5, vol: .3 },
    { wave: 'square', f: [160, 70], dur: .3, vol: .12 }
  ],
  bladeSwing: [{ wave: 'noise', filter: { type: 'bandpass', f: [2200, 900] }, dur: .18, vol: .2 }],
  armorClank: [
    { wave: 'square', f: [1300, 1150], dur: .1, vol: .12 },
    { wave: 'triangle', f: [2600, 2400], dur: .09, vol: .1 }
  ],
  bossCommand: [{ wave: 'sawtooth', notes: [196, 247, 196], step: .1, vol: .1, filter: { type: 'lowpass', f: [900, 900] } }],
  bossRage: [
    { wave: 'sawtooth', f: [120, 70], dur: .5, vol: .14, filter: { type: 'lowpass', f: [800, 400] } },
    { wave: 'noise', filter: { type: 'lowpass', f: [600, 300] }, dur: .4, vol: .15 }
  ],
  groundSlam: [
    { wave: 'noise', filter: { type: 'lowpass', f: [1200, 160] }, dur: .5, vol: .38 },
    { wave: 'square', f: [120, 45], dur: .3, vol: .2 }
  ],
  moundCrack: [{ wave: 'noise', filter: { type: 'bandpass', f: [900, 300] }, dur: .45, vol: .28 }],
  flood: [
    { wave: 'noise', filter: { type: 'lowpass', f: [500, 2600] }, dur: .9, vol: .3 },
    { wave: 'sine', f: [160, 320], dur: .7, vol: .12 }
  ],
  bossFall: [
    { wave: 'noise', filter: { type: 'lowpass', f: [900, 160] }, dur: .45, vol: .35 },
    { wave: 'square', f: [140, 50], dur: .3, vol: .18 }
  ],
  // --- Kỹ năng ---
  rallyCall: [{ wave: 'square', notes: [392, 523, 659, 784], step: .07, vol: .14 }],
  rallyHit: [{ wave: 'noise', filter: { type: 'bandpass', f: [1400, 600] }, dur: .25, vol: .25 }],
  clawOn: [
    { wave: 'triangle', f: [600, 1500], dur: .25, vol: .16 },
    { wave: 'sine', f: [1200, 2400], dur: .2, vol: .08 }
  ],
  clawStrike: [
    { wave: 'noise', filter: { type: 'highpass', f: [2400, 4800] }, dur: .16, vol: .22 },
    { wave: 'square', f: [880, 1760], dur: .12, vol: .12 }
  ]
};
