// Âm thanh (TT-AUDIO-01): hiệu ứng chiptune tổng hợp bằng Web Audio API;
// nhạc nền các màn phát từ file mp3 của team (MUSIC_FILES), thiếu/lỗi file
// thì phát bản tổng hợp. Dữ liệu (công thức tiếng, bản nhạc, đường dẫn, âm
// lượng) ở audio-data.js. Không import module gameplay nào: physics/dialogue/
// main chỉ gọi playSfx()/playMusic()...
//
// Trình duyệt chỉ cho phát âm thanh sau thao tác của người dùng: AudioContext
// tạo lười ở lần bấm phím/chạm đầu tiên (initAudio gắn listener). playMusic()
// gọi trước lúc đó thì nhớ bản nhạc và phát khi mở khoá.

import { AUDIO_MIX, SFX, MUSIC, MUSIC_FILES } from './audio-data.js';

const MUTE_KEY = 'suta.audio.muted';
const LOOKAHEAD = .12;      // giây lập lịch trước cho nhạc nền
const TICK_MS = 25;         // chu kỳ bộ lập lịch
const SFX_MIN_GAP = .04;    // cùng 1 hiệu ứng không phát dày hơn mức này

let ctx = null;
let bus = null;             // { master, music, sfx }
let noiseBuffer = null;
let muted = readMuted();
let ducked = false;
const suspendReasons = new Set();
const lastPlayed = new Map();
const parsedTracks = new Map();
// Bản nhạc đang phát: { id, track, step, nextTime }; `wanted` = id muốn phát
// (kể cả khi chưa mở khoá).
let music = null;
let wanted = null;
let timer = null;
// Nhạc nền từ file: { id, source, gain, buffer, loopStart, loopEnd };
// `loadingFile` = id đang tải; fileCache: id -> Promise<dữ liệu | null>.
let fileMusic = null;
let loadingFile = null;
const fileCache = new Map();

function readMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeMuted(value) {
  try {
    localStorage.setItem(MUTE_KEY, value ? '1' : '0');
  } catch {
    // Chặn storage (chế độ riêng tư) — chỉ không nhớ lựa chọn.
  }
}

// Gắn listener mở khoá (thao tác đầu tiên) + tạm dừng khi ẩn tab. Gọi 1 lần.
export function initAudio() {
  const unlock = () => unlockAudio();
  window.addEventListener('pointerdown', unlock, true);
  window.addEventListener('keydown', unlock, true);
  document.addEventListener('visibilitychange', () => setAudioSuspended('hidden', document.hidden));
}

// Tạo/tiếp tục AudioContext. Phải chạy trong thao tác của người dùng.
export function unlockAudio() {
  if (!ctx) {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return;
    ctx = new Context();
    bus = {
      master: ctx.createGain(),
      music: ctx.createGain(),
      sfx: ctx.createGain()
    };
    bus.music.connect(bus.master);
    bus.sfx.connect(bus.master);
    bus.master.connect(ctx.destination);
    bus.master.gain.value = muted ? 0 : AUDIO_MIX.master;
    bus.music.gain.value = AUDIO_MIX.music * (ducked ? AUDIO_MIX.duck : 1);
    bus.sfx.gain.value = AUDIO_MIX.sfx;
    noiseBuffer = makeNoise(ctx);
    timer = setInterval(scheduleMusic, TICK_MS);
    if (wanted) startTrack(wanted);
  }
  if (ctx.state === 'suspended' && !suspendReasons.size) ctx.resume();
}

function makeNoise(context) {
  const buffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  return buffer;
}

// Tạm dừng toàn bộ âm thanh khi còn ít nhất 1 lý do ('hidden' = ẩn tab,
// 'portrait' = máy cảm ứng cầm dọc). AudioContext dừng thì đồng hồ dừng nên
// nhạc nền tiếp tục đúng chỗ khi mở lại.
export function setAudioSuspended(reason, on) {
  if (on) suspendReasons.add(reason);
  else suspendReasons.delete(reason);
  if (!ctx) return;
  if (suspendReasons.size) ctx.suspend();
  else ctx.resume();
}

export function isMuted() {
  return muted;
}

export function setMuted(value) {
  muted = Boolean(value);
  writeMuted(muted);
  if (bus) bus.master.gain.setTargetAtTime(muted ? 0 : AUDIO_MIX.master, ctx.currentTime, .02);
  return muted;
}

export function toggleMuted() {
  return setMuted(!muted);
}

// Giảm nhỏ nhạc nền khi mở hội thoại/câu hỏi.
export function duckMusic(on) {
  ducked = on;
  if (bus) bus.music.gain.setTargetAtTime(AUDIO_MIX.music * (on ? AUDIO_MIX.duck : 1), ctx.currentTime, .1);
}

// ---- Hiệu ứng ----

export function playSfx(id) {
  if (!ctx || muted || ctx.state !== 'running') return;
  const voices = SFX[id];
  if (!voices) {
    console.warn('SUTA audio: không có hiệu ứng', id);
    return;
  }
  const now = ctx.currentTime;
  if (now - (lastPlayed.get(id) ?? -1) < SFX_MIN_GAP) return;
  lastPlayed.set(id, now);
  voices.forEach(voice => playVoice(voice, now + (voice.delay || 0), bus.sfx));
}

function makeSource(wave, t0) {
  if (wave === 'noise') {
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;
    // Bắt đầu ở vị trí ngẫu nhiên để 2 tiếng noise liền nhau không giống hệt.
    source.start(t0, Math.random() * .9);
    return source;
  }
  const osc = ctx.createOscillator();
  osc.type = wave;
  osc.start(t0);
  return osc;
}

// 1 lớp âm: nguồn -> (lọc) -> gain có envelope -> bus.
function playVoice(voice, t0, output) {
  const notes = voice.notes;
  const dur = notes ? notes.length * voice.step : voice.dur;
  const source = makeSource(voice.wave, t0);
  const gain = ctx.createGain();
  let node = source;

  if (voice.filter) {
    const filter = ctx.createBiquadFilter();
    filter.type = voice.filter.type;
    filter.frequency.setValueAtTime(voice.filter.f[0], t0);
    filter.frequency.exponentialRampToValueAtTime(voice.filter.f[1], t0 + dur);
    node.connect(filter);
    node = filter;
  }
  node.connect(gain);
  gain.connect(output);

  gain.gain.setValueAtTime(0, t0);
  if (notes) {
    // Mỗi nốt có envelope riêng (kiểu arpeggio NES); nốt 0 = lặng.
    notes.forEach((freq, index) => {
      const t = t0 + index * voice.step;
      if (!freq) {
        gain.gain.setValueAtTime(0, t);
        return;
      }
      if (source.frequency) source.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(voice.vol, t);
      gain.gain.exponentialRampToValueAtTime(.0001, t + voice.step * .95);
    });
  } else {
    if (source.frequency) {
      source.frequency.setValueAtTime(voice.f[0], t0);
      source.frequency.exponentialRampToValueAtTime(voice.f[1], t0 + dur);
    }
    gain.gain.linearRampToValueAtTime(voice.vol, t0 + .005);
    gain.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
  }
  source.stop(t0 + dur + .02);
}

// ---- Nhạc nền ----

function noteFrequency(name) {
  const match = /^([A-G])(#|b)?(-?\d)$/.exec(name);
  if (!match) return null;
  const semitone = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[match[1]]
    + (match[2] === '#' ? 1 : match[2] === 'b' ? -1 : 0);
  const midi = (Number(match[3]) + 1) * 12 + semitone;
  return 440 * 2 ** ((midi - 69) / 12);
}

const tokens = pattern => pattern.trim().split(/\s+/);

// Tách chuỗi ô thành sự kiện theo ô: { freq, len } (len = số ô kể cả `-`).
function parseVoice(voice) {
  const cells = tokens(voice.pattern);
  const events = cells.map((cell, index) => {
    if (cell === '.' || cell === '-') return null;
    const freq = noteFrequency(cell);
    if (!freq) {
      console.warn('SUTA audio: nốt không hợp lệ', cell);
      return null;
    }
    let len = 1;
    while (cells[index + len] === '-') len += 1;
    return { freq, len };
  });
  return { wave: voice.wave, vol: voice.vol, events };
}

function parseTrack(id) {
  if (parsedTracks.has(id)) return parsedTracks.get(id);
  const data = MUSIC[id];
  if (!data) return null;
  const voices = data.voices.map(parseVoice);
  const drums = tokens(data.drums);
  const length = drums.length;
  if (voices.some(voice => voice.events.length !== length)) {
    console.warn('SUTA audio: các kênh của bản nhạc lệch số ô', id);
  }
  const track = { bpm: data.bpm, stepTime: 60 / data.bpm / data.steps, loop: data.loop, voices, drums, length };
  parsedTracks.set(id, track);
  return track;
}

// Phát bản nhạc `id`: có file trong MUSIC_FILES thì phát file (lặp), không
// thì bản tổng hợp MUSIC. Đang phát (hoặc đang tải) đúng bản lặp đó thì để yên.
export function playMusic(id) {
  const looping = Boolean(MUSIC_FILES[id]) || MUSIC[id]?.loop;
  if (wanted === id && looping && (music || fileMusic || loadingFile === id)) return;
  wanted = id;
  if (ctx) startTrack(id);
}

export function stopMusic() {
  wanted = null;
  stopCurrent();
}

function stopCurrent() {
  music = null;
  loadingFile = null;
  if (!fileMusic) return;
  // Nhỏ dần .15 s rồi dừng, tránh tiếng "bụp" khi cắt ngang.
  const { source, gain } = fileMusic;
  gain.gain.setTargetAtTime(0, ctx.currentTime, .05);
  source.stop(ctx.currentTime + .2);
  fileMusic = null;
}

function startTrack(id) {
  stopCurrent();
  if (MUSIC_FILES[id]) {
    startFile(id);
    return;
  }
  startSynth(id);
}

function startSynth(id) {
  const track = parseTrack(id);
  music = track ? { id, track, step: 0, nextTime: ctx.currentTime + .05 } : null;
}

// ---- Nhạc nền từ file (mp3 của team) ----

// Tải + giải mã 1 lần mỗi file; lỗi -> null (playMusic lùi về bản tổng hợp).
function loadFile(id) {
  if (!fileCache.has(id)) {
    const url = MUSIC_FILES[id];
    fileCache.set(id, fetch(url)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.arrayBuffer();
      })
      .then(data => ctx.decodeAudioData(data))
      .then(buffer => ({ buffer, ...loopPoints(buffer) }))
      .catch(error => {
        console.warn('SUTA audio: không tải được nhạc', url, error.message);
        return null;
      }));
  }
  return fileCache.get(id);
}

// Điểm lặp = bỏ phần im lặng ở đầu/cuối file (mẫu nhỏ hơn ngưỡng
// AUDIO_MIX.silenceDb ở mọi kênh) — file AI tạo thường có ~2,5 s lặng ở cuối.
function loopPoints(buffer) {
  const threshold = 10 ** (AUDIO_MIX.silenceDb / 20);
  const channels = Array.from({ length: buffer.numberOfChannels }, (_, i) => buffer.getChannelData(i));
  const loud = index => channels.some(data => Math.abs(data[index]) > threshold);
  let first = 0;
  let last = buffer.length - 1;
  while (first < last && !loud(first)) first += 1;
  while (last > first && !loud(last)) last -= 1;
  if (last <= first) return { loopStart: 0, loopEnd: buffer.duration };
  return { loopStart: first / buffer.sampleRate, loopEnd: (last + 1) / buffer.sampleRate };
}

function startFile(id) {
  loadingFile = id;
  loadFile(id).then(data => {
    // Trong lúc tải đã đổi/dừng nhạc -> bỏ.
    if (loadingFile !== id || wanted !== id) return;
    loadingFile = null;
    if (!data) {
      startSynth(id);
      return;
    }
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = data.buffer;
    source.loop = true;
    source.loopStart = data.loopStart;
    source.loopEnd = data.loopEnd;
    gain.gain.value = AUDIO_MIX.musicFile;
    source.connect(gain);
    gain.connect(bus.music);
    source.start(ctx.currentTime + .02, data.loopStart);
    fileMusic = { id, source, gain, ...data };
  });
}

function scheduleMusic() {
  if (!music || ctx.state !== 'running') return;
  const { track } = music;
  while (music && music.nextTime < ctx.currentTime + LOOKAHEAD) {
    scheduleStep(track, music.step, music.nextTime);
    music.nextTime += track.stepTime;
    music.step += 1;
    if (music.step >= track.length) {
      if (track.loop) music.step = 0;
      else {
        music = null;
        wanted = null;
      }
    }
  }
}

function scheduleStep(track, step, t) {
  track.voices.forEach(voice => {
    const event = voice.events[step];
    if (!event) return;
    const dur = event.len * track.stepTime * .92;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = voice.wave;
    osc.frequency.setValueAtTime(event.freq, t);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(voice.vol, t + .008);
    gain.gain.setValueAtTime(voice.vol, t + Math.max(.01, dur - .04));
    gain.gain.linearRampToValueAtTime(0, t + dur);
    osc.connect(gain);
    gain.connect(bus.music);
    osc.start(t);
    osc.stop(t + dur + .02);
  });
  playDrum(track.drums[step], t);
}

const DRUMS = {
  k: { wave: 'sine', f: [150, 45], dur: .12, vol: .5 },
  s: { wave: 'noise', filter: { type: 'bandpass', f: [1800, 1200] }, dur: .1, vol: .22 },
  h: { wave: 'noise', filter: { type: 'highpass', f: [7000, 7000] }, dur: .035, vol: .08 }
};

function playDrum(cell, t) {
  const drum = DRUMS[cell];
  if (drum) playVoice(drum, t, bus.music);
}
