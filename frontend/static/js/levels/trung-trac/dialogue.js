// Khung hội thoại màn 2 (TT-NPC-01 §3.2.3–3.2.4): gặp NPC (thoại -> câu hỏi
// -> vì sao đúng -> phần thưởng) và cốt truyện Thi Sách hy sinh. Là DOM phủ
// lên canvas, cùng phong cách questionPanel. Mở panel thì tạm dừng game
// (state.paused), đóng thì chạy tiếp.
// Không import physics.js (physics mở panel qua các hàm dưới đây); khi trả lời
// sai tới hết máu thì gọi `onDefeat` do main.js truyền vào (initDialogue).

import { state } from './state.js';
import { ui, updateHud } from './ui.js';
import { clearInput } from './input.js';
import { addReward } from './progress.js';
import { joinAssetPath } from './assets.js';
import { getAsset } from './animation.js';
import { SPRITE_8BIT_ROOT, NPC_SPRITES, QUESTION_SCORE } from './config.js';
import { NPC_DIALOGUES } from './dialogue-data.js';

const el = {
  panel: document.getElementById('dialoguePanel'),
  portrait: document.getElementById('dialoguePortrait'),
  name: document.getElementById('dialogueName'),
  title: document.getElementById('dialogueTitle'),
  label: document.getElementById('dialogueLabel'),
  text: document.getElementById('dialogueText'),
  answers: document.getElementById('dialogueAnswers'),
  hint: document.getElementById('dialogueHint'),
  next: document.getElementById('dialogueNext')
};

let current = null;
let onDefeat = () => {};

export function initDialogue(options) {
  onDefeat = options.onDefeat;
  el.next.addEventListener('click', advance);
  // Bàn phím: 1–3 chọn đáp án, Enter/Space sang bước tiếp. Chặn mặc định để
  // Enter không "bấm" thêm lần nữa vào nút đang focus; input.js vẫn ghi phím
  // Space vào `pressed.jump` nên đóng panel phải clearInput().
  window.addEventListener('keydown', event => {
    if (!current) return;
    const digit = /^(Digit|Numpad)([1-3])$/.exec(event.code);
    if (digit) {
      event.preventDefault();
      if (current.step === 'question') choose(Number(digit[2]) - 1);
      return;
    }
    if (event.code === 'Enter' || event.code === 'NumpadEnter' || event.code === 'Space') {
      event.preventDefault();
      if (!event.repeat && !el.next.hidden) advance();
    }
  });
}

export function dialogueOpen() {
  return current !== null;
}

// URL chân dung 64x64 theo manifest; thiếu -> null (ẩn ảnh, TODO_MISSING).
function portraitUrl(npcId) {
  const asset = getAsset(NPC_SPRITES[npcId]?.portrait);
  const file = asset?.animations?.[0]?.file;
  return file ? joinAssetPath(SPRITE_8BIT_ROOT, file) : null;
}

function shuffle(list) {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function open(next) {
  current = next;
  state.paused = true;
  clearInput();
  // Game dừng thì thông báo đang hiện không tự tắt (tickMessage) — ẩn luôn.
  ui.message.classList.remove('message--visible');
  const url = portraitUrl(next.portraitNpc);
  el.portrait.hidden = !url;
  if (url) el.portrait.src = url;
  el.portrait.classList.toggle('dialogue__portrait--memorial', next.kind === 'story');
  el.panel.classList.add('panel--visible');
  render();
}

// Gặp NPC: `npc` là entity trong state.npcs (render đọc npc.talking để phát
// `talk`). `onDone` chạy khi đóng panel sau khi nhận phần thưởng.
export function openNpcDialogue(npc, onDone) {
  const data = NPC_DIALOGUES[npc.id];
  open({
    kind: 'npc', npc, data, onDone, portraitNpc: npc.id,
    step: 'line', lineIndex: 0,
    // Đáp án xáo mỗi lần câu hỏi hiện; `correct` đánh dấu đáp án đúng (đáp án
    // đầu tiên trong dialogue-data.js).
    options: shuffle(data.answers.map((text, index) => ({ text, correct: index === 0 }))),
    wrong: new Set(),
    gained: 0
  });
}

// Cốt truyện: chỉ có các dòng chữ, chân dung trắng đen.
export function openStory(story, onDone) {
  open({ kind: 'story', data: story, onDone, portraitNpc: story.portraitNpc, step: 'line', lineIndex: 0 });
}

function setText(label, text) {
  el.label.hidden = !label;
  el.label.textContent = label || '';
  el.text.textContent = text;
}

function render() {
  const { kind, data, step, npc } = current;
  const isNpc = kind === 'npc';
  el.name.hidden = !isNpc;
  el.title.hidden = !isNpc;
  if (isNpc) {
    el.name.textContent = data.name;
    el.title.textContent = data.title;
    // NPC trên canvas phát `talk` khi đang nói thoại.
    npc.talking = step === 'line';
  }
  el.answers.hidden = step !== 'question';
  el.hint.hidden = true;
  el.next.hidden = step === 'question';
  el.next.textContent = 'Tiếp ▸';

  if (step === 'line') {
    setText(null, data.lines[current.lineIndex]);
    const last = current.lineIndex === data.lines.length - 1;
    if (!isNpc && last) el.next.textContent = 'Đóng';
  } else if (step === 'question') {
    setText('Câu hỏi', data.question);
    renderAnswers();
    if (current.wrong.size) {
      el.hint.hidden = false;
      el.hint.textContent = `Gợi ý: ${data.hint}`;
    }
  } else if (step === 'why') {
    setText('Vì sao đúng', data.why);
  } else if (step === 'reward') {
    setText(`Phần thưởng · +${current.gained} điểm`, data.reward.text);
    el.next.textContent = 'Đóng';
  }
  if (!el.next.hidden) el.next.focus({ preventScroll: true });
}

function renderAnswers() {
  el.answers.innerHTML = '';
  current.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = `${index + 1}. ${option.text}`;
    const wrong = current.wrong.has(index);
    button.disabled = wrong;
    button.classList.toggle('is-wrong', wrong);
    button.addEventListener('click', () => choose(index));
    el.answers.appendChild(button);
  });
}

// Chọn sai: mất 1 máu, hiện gợi ý, làm mờ đáp án đó, được chọn lại; hết máu
// thì thua theo luật hiện tại. Chọn đúng: cộng điểm (đúng ngay lần đầu nhiều
// hơn — QUESTION_SCORE), ghi phần thưởng vào tiến trình, sang "Vì sao đúng".
function choose(index) {
  const option = current.options[index];
  if (!option || current.wrong.has(index)) return;
  if (!option.correct) {
    current.wrong.add(index);
    state.health -= 1;
    updateHud();
    if (state.health <= 0) {
      closeDialogue();
      onDefeat();
      return;
    }
    render();
    return;
  }
  current.gained = current.wrong.size ? QUESTION_SCORE.retry : QUESTION_SCORE.firstTry;
  state.score += current.gained;
  addReward(current.data.reward.id);
  updateHud();
  current.step = 'why';
  render();
}

function advance() {
  if (!current) return;
  const { kind, data, step } = current;
  if (step === 'line') {
    if (current.lineIndex < data.lines.length - 1) current.lineIndex += 1;
    else if (kind === 'npc') current.step = 'question';
    else return finish();
  } else if (step === 'why') {
    current.step = 'reward';
  } else if (step === 'reward') {
    return finish();
  }
  render();
}

function finish() {
  const done = current.onDone;
  closeDialogue();
  state.paused = false;
  done?.();
}

// Đóng panel (cũng dùng khi chơi lại màn giữa lúc đang hội thoại).
export function closeDialogue() {
  if (current?.npc) current.npc.talking = false;
  current = null;
  el.panel.classList.remove('panel--visible');
  el.answers.innerHTML = '';
  clearInput();
}
