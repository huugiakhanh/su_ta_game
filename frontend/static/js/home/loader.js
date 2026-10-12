// Nạp cửa sổ trang chủ khi cần (HOME-LAZY-01): lần đầu mở 1 cửa sổ thì tải song song
// HTML (route /components/home/<tên> — templates/components/home/<tên>.html), CSS
// (css/home/*.css) và module JS (js/home/<tên>.js), gắn HTML vào cuối <body>, gọi
// init() của module 1 lần. Các lần sau dùng lại. Tải lỗi thì lần sau thử lại.
// Thêm cửa sổ: thêm 1 dòng vào COMPONENTS + tên vào HOME_COMPONENTS (backend/routes/pages.py).

const COMPONENTS = {
  timeline: { css: ['timeline'] },
  leaderboard: { css: ['board'] },
  achievements: { css: ['board'] },
  login: { css: ['login'] },
  chapter: { css: ['chapter'] },
};

const components = new Map();
const stylesheets = new Map();

function loadCss(name) {
  if (!stylesheets.has(name)) {
    stylesheets.set(name, new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `/static/css/home/${name}.css`;
      link.onload = resolve;
      link.onerror = () => {
        link.remove();
        stylesheets.delete(name);
        reject(new Error(`Không tải được ${link.href}`));
      };
      document.head.appendChild(link);
    }));
  }
  return stylesheets.get(name);
}

async function fetchHtml(name) {
  const response = await fetch(`/components/home/${name}`);
  if (!response.ok) throw new Error(`Không tải được cửa sổ ${name} (HTTP ${response.status})`);
  return response.text();
}

export function loadComponent(name) {
  const spec = COMPONENTS[name];
  if (!spec) return Promise.reject(new Error(`Không có cửa sổ ${name}`));
  if (!components.has(name)) {
    const loading = (async () => {
      const [html, module] = await Promise.all([
        fetchHtml(name),
        import(`./${name}.js`),
        ...spec.css.map(loadCss),
      ]);
      const template = document.createElement('template');
      template.innerHTML = html;
      document.body.appendChild(template.content);
      module.init?.();
      return module;
    })();
    loading.catch(() => components.delete(name));
    components.set(name, loading);
  }
  return components.get(name);
}
