/* ================================================================
   Web API 设计教程 · 共享脚本：侧边栏、目录、代码标签页、高亮、主题
   ================================================================ */
(function () {
  'use strict';

  var CHAPTERS = [
    { n: 1,  t: '什么是 API 设计',            d: 'Web API 是什么、为什么要设计、谁来设计、怎么设计', part: '开篇' },
    { n: 2,  t: '识别 API 能力',              d: '用 API 能力画布把模糊需求变成一组操作', part: '第一部分 · API 设计基础' },
    { n: 3,  t: '从 REST 视角观察操作',       d: 'HTTP 与 REST 入门：找出资源、关系与动作' },
    { n: 4,  t: '用 HTTP 表示操作',           d: '路径、方法、状态码与数据位置，以及 REST 架构风格' },
    { n: 5,  t: '数据建模',                   d: '资源、参数、请求体与响应体里的数据怎么设计' },
    { n: 6,  t: '用 OpenAPI 描述 HTTP 操作',  d: '把设计写成机器和人都能读的蓝图' },
    { n: 7,  t: '用 JSON Schema 描述数据',    d: '在 OpenAPI 里精确描述对象、数组与引用' },
    { n: 8,  t: '好用、可互操作的数据',       d: '选择、命名、类型与组织：让数据拿来即用', part: '第二部分 · 好用且可互操作' },
    { n: 9,  t: '好用、可互操作的操作',       d: '可猜测的路径、分页过滤排序与友好的错误' },
    { n: 10, t: '好用、可互操作的操作流',     d: '把多次调用串成简洁、防错、灵活的流程' },
    { n: 11, t: '好用、可互操作的 API',       d: '一个还是多个 API、命名，以及超媒体导航' },
    { n: 12, t: '设计安全的 API',             d: '数据敏感度、作用域（scope）与访问控制', part: '第三部分 · 把约束纳入设计' },
    { n: 13, t: '设计高效的 API',             d: '数据量、缓存、批量处理与专用 API' },
    { n: 14, t: '让设计适配上下文',           d: '文件、长耗时操作、Webhook 与 REST 之外的选择' },
    { n: 15, t: '修改 API',                   d: '破坏性变更、版本管理与可扩展设计' },
    { n: 16, t: '让设计决策更轻松',           d: '决策流程与团队 API 设计指南', part: '第四部分 · 可持续的设计流程' },
    { n: 17, t: '优化 OpenAPI 文档',          d: '用 components 与 $ref 消除重复、跨 API 复用' },
    { n: 18, t: '把设计指南自动化',           d: '用 Spectral 给 OpenAPI 文档做 lint' },
    { n: 19, t: '丰富 API 设计产物',          d: '示例、Mock、测试与完整的设计参考套件' }
  ];

  var cur = parseInt(document.body.dataset.chapter || '0', 10);
  var LS_THEME = 'webapi-doc-theme', LS_LANG = 'webapi-doc-lang';

  /* ---------- 侧边栏 ---------- */
  var side = document.getElementById('sidebar');
  if (side) {
    var html = '<a class="brand" href="index.html"><span class="flame">{ }</span>' +
      '<span>Web API 设计<small>从需求到 OpenAPI 的完整路径</small></span></a>';
    CHAPTERS.forEach(function (c) {
      if (c.part) html += '<div class="part">' + c.part + '</div>';
      html += '<a class="ch' + (c.n === cur ? ' active' : '') + '" href="ch' +
        pad(c.n) + '.html"><span class="n">' + c.n + '</span><span>' + c.t + '</span></a>';
    });
    side.innerHTML = html;
    var active = side.querySelector('a.ch.active');
    if (active) setTimeout(function () {
      active.scrollIntoView({ block: 'center' });
    }, 0);
  }

  /* ---------- 移动端菜单 ---------- */
  var btn = document.createElement('button');
  btn.id = 'menu-btn';
  btn.type = 'button';
  btn.setAttribute('aria-label', '目录');
  btn.innerHTML = '&#9776;';
  btn.onclick = function () { document.body.classList.toggle('nav-open'); };
  document.body.appendChild(btn);
  document.addEventListener('click', function (e) {
    if (document.body.classList.contains('nav-open') &&
        side && !side.contains(e.target) && e.target !== btn) {
      document.body.classList.remove('nav-open');
    }
  });

  /* ---------- 主题切换 ---------- */
  var tbtn = document.createElement('button');
  tbtn.id = 'theme-btn';
  tbtn.type = 'button';
  tbtn.setAttribute('aria-label', '切换深浅色');
  tbtn.innerHTML = '&#9789;';
  tbtn.onclick = function () {
    var root = document.documentElement;
    var now = root.getAttribute('data-theme');
    var dark = now ? now === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', dark ? 'light' : 'dark');
    try { localStorage.setItem(LS_THEME, dark ? 'light' : 'dark'); } catch (e) {}
  };
  document.body.appendChild(tbtn);
  try {
    var saved = localStorage.getItem(LS_THEME);
    if (saved) document.documentElement.setAttribute('data-theme', saved);
  } catch (e) {}

  /* ---------- 箭头 marker（全局一次） ---------- */
  var defs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  defs.setAttribute('width', '0'); defs.setAttribute('height', '0');
  defs.setAttribute('style', 'position:absolute');
  // SVG marker 的内容不会从引用它的元素继承 color，所以直接用 CSS 变量填色。
  function mk(id, v) {
    return '<marker id="' + id + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">' +
      '<path d="M0,0 L10,5 L0,10 z" style="fill:var(' + v + ')"/></marker>';
  }
  defs.innerHTML = '<defs>' + mk('ar', '--fg-faint') + mk('ar-a', '--accent') + mk('ar-b', '--blue') +
    mk('ar-g', '--green') + mk('ar-r', '--red') + mk('ar-p', '--purple') + '</defs>';
  document.body.appendChild(defs);

  /* ---------- 章节内目录 ---------- */
  var main = document.querySelector('main');
  var slot = document.getElementById('chapter-toc');
  if (slot && main) {
    var hs = main.querySelectorAll('h2');
    if (hs.length > 2) {
      var t = '<div class="h">本章目录</div><ol>';
      hs.forEach(function (h, i) {
        if (!h.id) h.id = 'sec-' + (i + 1);
        t += '<li><a href="#' + h.id + '">' + h.textContent + '</a></li>';
      });
      slot.className = 'toc';
      slot.innerHTML = t + '</ol>';
    }
  }

  /* ---------- 语法高亮 ---------- */
  function words(s) { return s.split('|').join('|'); }

  var STR_JS = '(`(?:\\\\[\\s\\S]|[^\\\\`])*`|\'(?:\\\\[\\s\\S]|[^\\\\\'\\n])*\'|"(?:\\\\[\\s\\S]|[^\\\\"\\n])*")';
  var TAIL = '|\\b([A-Z][A-Za-z0-9_]*)\\b' +          // 类型/构造器
             '|\\b(\\d+(?:\\.\\d+)?)\\b' +            // 数字
             '|\\b([a-zA-Z_$][\\w$]*)(?=\\()';        // 函数调用

  var RE_TS = new RegExp(
    '(\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\n]*)|' + STR_JS +
    '|\\b(' + words('const|let|var|function|return|if|else|await|async|import|from|export|default|new|class|' +
      'extends|implements|for|while|of|in|do|try|catch|finally|throw|switch|case|break|continue|' +
      'type|interface|enum|as|satisfies|typeof|instanceof|delete|void|yield|public|private|readonly|' +
      'null|undefined|true|false|this|super|static|declare|namespace') + ')\\b' + TAIL, 'g');
  var C_TS = ['tk-cm', 'tk-st', 'tk-kw', 'tk-tp', 'tk-nm', 'tk-fn'];

  var RE_JAVA = new RegExp(
    '(\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\n]*)' +
    '|("""[\\s\\S]*?"""|"(?:\\\\[\\s\\S]|[^\\\\"\\n])*"|\'(?:\\\\.|[^\\\\\'])\')' +
    '|(@[A-Za-z_][\\w.]*)' +
    '|\\b(' + words('package|import|public|private|protected|static|final|abstract|class|interface|enum|record|' +
      'extends|implements|new|return|if|else|for|while|do|switch|case|default|break|continue|try|catch|finally|' +
      'throw|throws|void|int|long|double|float|boolean|char|byte|short|var|null|true|false|this|super|' +
      'instanceof|synchronized|sealed|permits|yield') + ')\\b' + TAIL, 'g');
  var C_JAVA = ['tk-cm', 'tk-st', 'tk-dc', 'tk-kw', 'tk-tp', 'tk-nm', 'tk-fn'];

  var RE_PY = new RegExp(
    '(#[^\\n]*)' +
    '|((?:[fFrRbB]{0,2})(?:"""[\\s\\S]*?"""|\'\'\'[\\s\\S]*?\'\'\'|"(?:\\\\[\\s\\S]|[^\\\\"\\n])*"|\'(?:\\\\[\\s\\S]|[^\\\\\'\\n])*\'))' +
    '|(@[A-Za-z_][\\w.]*)' +
    '|\\b(' + words('def|class|return|if|elif|else|for|while|in|not|and|or|is|import|from|as|with|try|except|' +
      'finally|raise|pass|break|continue|lambda|yield|async|await|global|nonlocal|assert|del|None|True|False|' +
      'self|match|case') + ')\\b' + TAIL, 'g');
  var C_PY = ['tk-cm', 'tk-st', 'tk-dc', 'tk-kw', 'tk-tp', 'tk-nm', 'tk-fn'];

  var RE_YAML = new RegExp(
    '((?<=^|\\s)#[^\\n]*)' +
    '|("(?:\\\\.|[^\\\\"\\n])*"|\'[^\'\\n]*\')' +
    '|((?<=^[ \\t]*(?:-[ \\t]+)?)[\\w$\\/.{}~\\-]+(?=[ \\t]*:(?:\\s|$)))' +
    '|\\b(true|false|null)\\b' +
    '|((?<=[\\s:\\[,])-?\\d+(?:\\.\\d+)?(?=[\\s,\\]]|$))', 'gm');
  var C_YAML = ['tk-cm', 'tk-st', 'tk-key', 'tk-kw', 'tk-nm'];

  var RE_JSON = new RegExp(
    '(\\/\\/[^\\n]*)' +
    '|("(?:\\\\.|[^\\\\"\\n])*"(?=\\s*:))' +
    '|("(?:\\\\.|[^\\\\"\\n])*")' +
    '|\\b(true|false|null)\\b' +
    '|(-?\\b\\d+(?:\\.\\d+)?\\b)', 'g');
  var C_JSON = ['tk-cm', 'tk-key', 'tk-st', 'tk-kw', 'tk-nm'];

  var RE_HTTP = new RegExp(
    '((?<=^|\\s)#[^\\n]*)' +
    '|("(?:\\\\.|[^\\\\"\\n])*")' +
    '|\\b(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS|QUERY|HTTP\\/[\\d.]+)\\b' +
    '|(^[A-Za-z][\\w\\-]*(?=:\\s))' +
    '|\\b(true|false|null)\\b' +
    '|(\\b\\d+(?:\\.\\d+)?\\b)', 'gm');
  var C_HTTP = ['tk-cm', 'tk-st', 'tk-kw', 'tk-key', 'tk-kw', 'tk-nm'];

  var RE_SH = /(#[^\n]*)|('(?:\\[\s\S]|[^\\'])*'|"(?:\\[\s\S]|[^\\"])*")|\b(npm|npx|pnpm|yarn|bun|node|git|cd|mkdir|curl|export|pip|python|java|mvn|gradle|spectral|docker)\b/g;
  var C_SH = ['tk-cm', 'tk-st', 'tk-kw'];

  var LANGS = {
    ts: [RE_TS, C_TS], js: [RE_TS, C_TS], tsx: [RE_TS, C_TS],
    java: [RE_JAVA, C_JAVA], python: [RE_PY, C_PY], py: [RE_PY, C_PY],
    yaml: [RE_YAML, C_YAML], json: [RE_JSON, C_JSON], http: [RE_HTTP, C_HTTP],
    bash: [RE_SH, C_SH], sh: [RE_SH, C_SH]
  };
  var NAMES = { python: 'Python', py: 'Python', ts: 'TypeScript', java: 'Java', yaml: 'YAML',
                json: 'JSON', http: 'HTTP', bash: 'Shell', text: '' };

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function paint(src, re, classes) {
    var out = '', last = 0, m;
    re.lastIndex = 0;
    while ((m = re.exec(src)) !== null) {
      out += esc(src.slice(last, m.index));
      for (var g = 1; g < m.length; g++) {
        if (m[g] !== undefined) { out += '<span class="' + classes[g - 1] + '">' + esc(m[g]) + '</span>'; break; }
      }
      last = m.index + m[0].length;
      if (m[0].length === 0) re.lastIndex++;
    }
    return out + esc(src.slice(last));
  }

  /* ---------- 代码块：标题栏 + 复制 + 高亮 ---------- */
  document.querySelectorAll('.code').forEach(function (box) {
    var pre = box.querySelector('pre');
    if (!pre) return;
    var lang = box.dataset.lang || '';
    var file = box.dataset.file || '';
    var bar = document.createElement('div');
    bar.className = 'bar';
    var label = file || (NAMES[lang] !== undefined ? NAMES[lang] : lang) || 'text';
    bar.innerHTML = '<span class="tag">' + esc(label) + '</span>';
    var cp = document.createElement('button');
    cp.className = 'copy'; cp.type = 'button'; cp.textContent = '复制';
    cp.onclick = function () {
      var txt = pre.textContent;
      if (navigator.clipboard) navigator.clipboard.writeText(txt);
      cp.textContent = '已复制'; setTimeout(function () { cp.textContent = '复制'; }, 1400);
    };
    bar.appendChild(cp);
    box.insertBefore(bar, pre);

    var code = pre.textContent.replace(/^\n/, '').replace(/\s+$/, '');
    var hl = LANGS[lang];
    try {
      pre.innerHTML = hl ? paint(code, hl[0], hl[1]) : esc(code);
    } catch (e) { pre.textContent = code; }
  });

  /* ---------- 多语言标签页（Python / TypeScript / Java） ---------- */
  var groups = [];
  function selectLang(l, remember) {
    groups.forEach(function (g) {
      var has = g.langs.indexOf(l) >= 0;
      var pick = has ? l : (g.current || g.langs[0]);
      g.current = pick;
      g.boxes.forEach(function (b) { b.classList.toggle('on', b.dataset.lang === pick); });
      g.btns.forEach(function (b) { b.classList.toggle('on', b.dataset.l === pick); });
    });
    if (remember) { try { localStorage.setItem(LS_LANG, l); } catch (e) {} }
  }
  document.querySelectorAll('.tabs').forEach(function (tabs) {
    var boxes = Array.prototype.slice.call(tabs.querySelectorAll(':scope > .code'));
    if (!boxes.length) return;
    var bar = document.createElement('div');
    bar.className = 'tabbar';
    var g = { boxes: boxes, btns: [], langs: [], current: null };
    boxes.forEach(function (b) {
      var l = b.dataset.lang;
      g.langs.push(l);
      var bt = document.createElement('button');
      bt.type = 'button'; bt.dataset.l = l;
      bt.innerHTML = '<i></i>' + (NAMES[l] || l);
      bt.onclick = function () {
        var y = tabs.getBoundingClientRect().top;
        selectLang(l, true);
        // 其他标签组高度变化后，保持当前这组在视口中的位置不跳动
        window.scrollBy(0, tabs.getBoundingClientRect().top - y);
      };
      g.btns.push(bt);
      bar.appendChild(bt);
    });
    if (tabs.dataset.title) {
      var cap = document.createElement('span');
      cap.className = 'cap'; cap.textContent = tabs.dataset.title;
      bar.appendChild(cap);
    }
    tabs.insertBefore(bar, tabs.firstChild);
    groups.push(g);
  });
  if (groups.length) {
    var want = 'python';
    try { want = localStorage.getItem(LS_LANG) || want; } catch (e) {}
    selectLang(want, false);
  }

  /* ---------- 上一章 / 下一章 ---------- */
  var pager = document.getElementById('pager');
  if (pager && cur) {
    var prev = CHAPTERS.find(function (c) { return c.n === cur - 1; });
    var next = CHAPTERS.find(function (c) { return c.n === cur + 1; });
    var h = '';
    h += prev ? '<a class="prev" href="ch' + pad(prev.n) + '.html"><span>&larr; 上一章</span>第 ' + prev.n + ' 章 · ' + prev.t + '</a>'
              : '<a class="prev" href="index.html"><span>&larr; 返回</span>课程首页</a>';
    h += next ? '<a class="next" href="ch' + pad(next.n) + '.html"><span>下一章 &rarr;</span>第 ' + next.n + ' 章 · ' + next.t + '</a>'
              : '<a class="next" href="index.html"><span>完结 &rarr;</span>回到课程首页</a>';
    pager.className = 'pager';
    pager.innerHTML = h;
  }

  /* ---------- 首页目录 ---------- */
  var grid = document.getElementById('toc-grid');
  if (grid) {
    var g2 = '';
    CHAPTERS.forEach(function (c) {
      if (c.part) g2 += '<div class="toc-part">' + c.part + '</div>';
      g2 += '<a class="toc-card" href="ch' + pad(c.n) + '.html">' +
        '<div class="n">第 ' + c.n + ' 章</div>' +
        '<div class="t">' + c.t + '</div>' +
        '<div class="d">' + c.d + '</div></a>';
    });
    grid.className = 'toc-grid';
    grid.innerHTML = g2;
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
})();
