// Âm thanh riêng chương Ngô Quyền. TODO_MISSING: nhạc nền riêng chương (prompt
// Gemini ở bước Nhạc của NQ-00). PLACEHOLDER — tạm phát nhạc chương 6 Phùng Hưng.
// Định dạng: xem engine/sfx-data.js.

export const MUSIC_FILES = {
  level1: '/static/assets/audio/phung-hung/level1.mp3',
  level2: '/static/assets/audio/phung-hung/level2.mp3',
  level3: '/static/assets/audio/phung-hung/level3.mp3'
};

export const MUSIC = {};
// Tiếng trận Bạch Đằng (NQ-L3) tổng hợp chiptune. Mọi số DESIGN_BASELINE.
export const SFX = {
  bossCommand: [{ wave: 'square', notes: [392, 523], step: .08, vol: .1 }],
  catapultFire: [
    { wave: 'noise', filter: { type: 'bandpass', f: [600, 1400] }, dur: .2, vol: .25 },
    { wave: 'square', f: [220, 520], dur: .12, vol: .1 }
  ],
  boulderCrash: [
    { wave: 'noise', filter: { type: 'lowpass', f: [1200, 180] }, dur: .45, vol: .35 },
    { wave: 'square', f: [120, 50], dur: .25, vol: .18 }
  ],
  splash: [
    { wave: 'noise', filter: { type: 'highpass', f: [4000, 1200] }, dur: .5, vol: .28 },
    { wave: 'triangle', f: [700, 250], dur: .25, vol: .1 }
  ],
  woodHit: [{ wave: 'noise', filter: { type: 'bandpass', f: [900, 500] }, dur: .12, vol: .25 }],
  woodBreak: [
    { wave: 'noise', filter: { type: 'lowpass', f: [1800, 300] }, dur: .35, vol: .3 },
    { wave: 'square', notes: [330, 247, 196], step: .06, vol: .1 }
  ],
  bladeSwing: [{ wave: 'noise', filter: { type: 'bandpass', f: [2200, 900] }, dur: .18, vol: .2 }],
  armorClank: [
    { wave: 'square', f: [1300, 1150], dur: .1, vol: .12 },
    { wave: 'triangle', f: [2600, 2400], dur: .09, vol: .1 }
  ],
  counter: [{ wave: 'square', notes: [784, 1047, 1319], step: .05, vol: .12 }],
  stakeRise: [
    { wave: 'noise', filter: { type: 'lowpass', f: [600, 1600] }, dur: .25, vol: .25 },
    { wave: 'square', f: [140, 420], dur: .2, vol: .12 }
  ],
  decoyDash: [
    { wave: 'noise', filter: { type: 'highpass', f: [2500, 900] }, dur: .35, vol: .2 },
    { wave: 'triangle', f: [500, 900], dur: .2, vol: .1 }
  ]
};
