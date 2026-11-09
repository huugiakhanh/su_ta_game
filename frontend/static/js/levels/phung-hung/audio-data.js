// Âm thanh riêng chương Phùng Hưng. Nhạc nền 3 màn: file mp3 của team (tạo theo
// docs/archive/GEMINI_PROMPT_PH_MUSIC.md, nộp 09/11/2026), phát lặp; engine cắt khoảng
// lặng đầu/cuối khi tính điểm lặp. File mp3 là asset của team, không sửa; thay nhạc thì
// chép đè cùng tên. Tiếng trận + kỹ năng màn 3 (PH-L3) chép định nghĩa chương 5, không
// import. Định dạng: xem engine/sfx-data.js.

export const MUSIC_FILES = {
  level1: '/static/assets/audio/phung-hung/level1.mp3',
  level2: '/static/assets/audio/phung-hung/level2.mp3',
  level3: '/static/assets/audio/phung-hung/level3.mp3'
};

export const MUSIC = {};
export const SFX = {
  drumHit: [
    { wave: 'noise', filter: { type: 'lowpass', f: [1200, 160] }, dur: .5, vol: .38 },
    { wave: 'square', f: [120, 45], dur: .3, vol: .2 }
  ],
  postIgnite: [{ wave: 'noise', filter: { type: 'lowpass', f: [500, 2600] }, dur: .5, vol: .25 }],
  supplyCut: [
    { wave: 'triangle', f: [600, 1500], dur: .25, vol: .16 },
    { wave: 'sine', f: [1200, 2400], dur: .2, vol: .08 }
  ],
  fireDrum: [
    { wave: 'noise', filter: { type: 'lowpass', f: [700, 150] }, dur: .5, vol: .3 },
    { wave: 'square', f: [160, 70], dur: .3, vol: .12 }
  ]
};
