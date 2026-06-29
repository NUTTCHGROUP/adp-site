/* Tencent Cloud ADP · 主脚本
 * 数据来源：data/templates.json
 * 三大板块：home（产品 + 行业入口）/ cases（案例介绍）/ industries（行业解决方案）
 */
(function () {
  'use strict';

  // ---------- 工具 ----------
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const escape = (s) =>
    String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  const formatText = (s) => escape(s).replace(/\n/g, '<br>');
  const MOBILE_WIDTH = 768;
  const getViewportWidth = () => {
    const widths = [
      window.innerWidth,
      document.documentElement && document.documentElement.clientWidth,
      window.visualViewport && window.visualViewport.width,
    ].filter((n) => Number.isFinite(n) && n > 0);
    return widths.length ? Math.round(Math.min(...widths)) : 1024;
  };
  const isMobileDevice = () => getViewportWidth() <= MOBILE_WIDTH;
  const applyDeviceClass = () => {
    const width = getViewportWidth();
    const mobile = width <= MOBILE_WIDTH;
    const heroFluid = Math.max(0, Math.min(1, (width - 360) / 1080));
    document.body.classList.toggle('is-mobile-device', mobile);
    document.body.dataset.viewportWidth = String(width);
    document.documentElement.style.setProperty('--viewport-w', `${width}px`);
    document.documentElement.style.setProperty('--hero-fluid', heroFluid.toFixed(4));
    document.documentElement.style.setProperty('--hero-compact', String(width < 980 ? 1 : 0));
    return mobile;
  };
  const compactText = (s, limit = 34) => {
    const text = String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
    return text.length > limit ? `${text.slice(0, limit)}…` : text;
  };

  const STEP_LABELS = {
    input: '用户输入',
    intent: '意图识别',
    plan: '任务规划',
    tool: '工具调用',
    rag: '知识检索',
    multimodal: '多模态',
    llm: '模型推理',
    answer: '生成结果',
    action: '执行动作',
    output: '结果生成',
    chart: '图表生成',
    table: '数据汇总',
    doc: '文档生成',
    image: '多模态识图',
    verdict: '判定结论',
  };
  const RICH_TYPES = ['chart', 'table', 'doc', 'image', 'verdict'];
  // 富卡片「生成中」文案（营造 AI 调用工具的过程感）
  const RICH_PENDING = {
    chart: '正在生成图表',
    table: '正在批量处理数据',
    doc: '正在撰写文档',
    image: '正在识别图像',
    verdict: '正在研判结论',
  };

  // 头像：用克制的线性图标替代「字母 + 彩色渐变」，更像真实企业产品而非 AI 生成
  const BOT_AVATAR =
    '<div class="msg-avatar msg-avatar-bot" aria-label="智能体">' +
    '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden="true">' +
    '<rect x="5" y="8.5" width="14" height="10" rx="3.2" stroke="currentColor" stroke-width="1.6"/>' +
    '<path d="M12 5.4V8.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
    '<circle cx="12" cy="4.4" r="1.5" fill="currentColor"/>' +
    '<circle cx="9.3" cy="13.2" r="1.25" fill="currentColor"/>' +
    '<circle cx="14.7" cy="13.2" r="1.25" fill="currentColor"/>' +
    '<path d="M3.4 12v3M20.6 12v3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
    '</svg></div>';
  const USER_AVATAR =
    '<div class="msg-avatar msg-avatar-user" aria-label="用户">' +
    '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden="true">' +
    '<circle cx="12" cy="8.4" r="3.6" stroke="currentColor" stroke-width="1.6"/>' +
    '<path d="M5 19c0-3.3 3.1-5.6 7-5.6s7 2.3 7 5.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
    '</svg></div>';

  const softColor = (hex) => {
    if (!hex) return '#E8F1FF';
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return `rgba(${r},${g},${b},0.12)`;
  };

  // 行业 / 特性 图标（统一用 SVG，简洁稳定）
  const ICONS = {
    finance:    '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-7h6v7"/></svg>',
    health:     '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><path d="M12 8.2v7.6M8.2 12h7.6"/></svg>',
    gov:        '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M4 21V10l8-5 8 5v11M9 21v-8h6v8M7 10v-1M12 10v-1M17 10v-1"/></svg>',
    telecom:    '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="2"/><path d="M12 10v10.5"/><path d="M8.4 11.6a5 5 0 0 1 0-7.2M15.6 4.4a5 5 0 0 1 0 7.2M5.7 14.3a9 9 0 0 1 0-12.6M18.3 1.7a9 9 0 0 1 0 12.6"/></svg>',
    factory:    '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V10l5 3V10l5 3V8l8 5v8z"/><path d="M7 21v-4M12 21v-4M17 21v-4"/></svg>',
    energy:     '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/></svg>',
    edu:        '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9l10-5 10 5-10 5L2 9z"/><path d="M6 11v5c0 2 3 3 6 3s6-1 6-3v-5"/></svg>',
    retail:     '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14l-1.5 11h-11L5 8z"/><path d="M9 8V5a3 3 0 0 1 6 0v3"/></svg>',

    spark:      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3z"/></svg>',
    shield:     '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/></svg>',
    model:      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="18" r="2.5"/><circle cx="12" cy="12" r="2.5"/><path d="M8 7l3 3M16 7l-3 3M8 17l3-3M16 17l-3-3"/></svg>',
    speed:      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14a8 8 0 1 1 16 0"/><path d="M12 14l5-3"/><circle cx="12" cy="14" r="1.5" fill="currentColor"/><path d="M3 21h18"/></svg>',
  };
  const renderIcon = (key) => ICONS[key] || ICONS.spark;

  // ---------- 状态 ----------
  const state = {
    data: null,
    section: 'home',           // home / cases / industries
    caseFilter: 'all',         // category id
    activeCaseId: null,
    activeIndustryId: null,
  };

  // ---------- 加载数据 ----------
  async function loadData() {
    try {
      const res = await fetch('./data/templates.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      state.data = await res.json();
    } catch (err) {
      console.error('加载 templates.json 失败：', err);
      $('.main').innerHTML = `
        <div class="placeholder-box">
          <div class="placeholder-icon">⚠️</div>
          <div class="placeholder-title">数据加载失败</div>
          <div class="placeholder-desc">
            无法读取 <code>data/templates.json</code>。请通过本地 HTTP 服务器访问（如 <code>python3 -m http.server 8000</code>），不要用 <code>file://</code> 直接打开。
          </div>
        </div>`;
      throw err;
    }
  }

  const getCategory = (id) =>
    (state.data.categories || []).find((c) => c.id === id) || { name: '未分类', color: '#1E6FFF' };
  const getIndustry = (id) =>
    (state.data.industries || []).find((i) => i.id === id) || null;
  const getTemplate = (id) =>
    (state.data.templates || []).find((t) => t.id === id) || null;

  // ============================================================
  //  主页
  // ============================================================
  function renderHome() {
    const p = state.data.product || {};

    // Hero 文案（副标题 slogan 已按设计移除，仅保留主标题与简介）
    const heroHeadline = $('#heroHeadline');
    const heroDesc = $('#heroDesc');
    const heroStats = $('#heroStats');
    if (heroHeadline) heroHeadline.textContent = p.headline || '腾讯云智能体开发平台';
    if (heroDesc) heroDesc.textContent = p.intro || '';

    // Hero 统计
    if (heroStats) {
      heroStats.innerHTML = (p.metrics || [])
        .map(
          (m) => `
          <div class="stat">
            <div class="stat-num">${escape(m.value)}</div>
            <div class="stat-label">${escape(m.label)}</div>
          </div>`
        )
        .join('');
    }

    // 产品优势（首页核心能力板块已替换为 Try ADP；保留兼容，避免旧 DOM 缺失时报错）
    const highlightGrid = $('#highlightGrid');
    if (highlightGrid) {
      const mobile = isMobileDevice();
      highlightGrid.innerHTML = (p.highlights || [])
        .map((h) => {
          const title = escape(h.name || '');
          const parts = title.split('：');
          const titleHtml = parts.length > 1
            ? `<span class="h-prefix">${parts[0]}：</span>${parts.slice(1).join('：')}`
            : title;
          const desc = mobile ? compactText(h.mobileDesc || h.desc, 32) : h.desc;
          const visual = mobile
            ? ''
            : `<div class="capability-motion motion-${escape(h.icon || 'spark')}">
                <span></span><span></span><span></span><span></span>
              </div>`;
          return `
          <div class="highlight-card">
            ${visual}
            <div class="h-name">${titleHtml}</div>
            <div class="h-desc">${escape(desc)}</div>
          </div>`;
        })
        .join('');
    }

    // 行业宫格（点击跳到行业页）
    const grid = $('#industryGrid');
    grid.innerHTML = (state.data.industries || [])
      .map(
        (ind) => `
        <div class="ind-card" data-ind="${ind.id}">
          <div class="ind-name">${escape(ind.name)}</div>
          <div class="ind-tag">${escape(ind.tagline)}</div>
          <div class="ind-icon">${renderIcon(ind.icon)}</div>
          <div class="ind-arrow">→</div>
        </div>`
      )
      .join('');
    grid.onclick = (e) => {
      const card = e.target.closest('.ind-card');
      if (card) navigate('industries', { industryId: card.dataset.ind });
    };

    // 客户 Logo 墙（置于产品能力画册之上）
    renderLogoWall();
  }

  // ============================================================
  //  案例介绍
  // ============================================================
  function renderCases() {
    // 关闭详情，恢复列表
    $('#caseDetail').classList.add('hidden');
    $('#caseDetail').innerHTML = '';
    $('#casesHead').classList.remove('hidden');
    $('#caseFilter').classList.remove('hidden');
    $('#caseCards').classList.remove('hidden');

    // 渲染筛选条
    const filter = $('#caseFilter');
    const cats = state.data.categories || [];
    filter.innerHTML =
      `<span class="filter-label">分类筛选：</span>
       <button class="chip${state.caseFilter === 'all' ? ' active' : ''}" data-cat="all">全部</button>` +
      cats
        .map(
          (c) =>
            `<button class="chip${state.caseFilter === c.id ? ' active' : ''}" data-cat="${c.id}">${escape(c.name)}</button>`
        )
        .join('');
    filter.onclick = (e) => {
      const btn = e.target.closest('.chip');
      if (!btn) return;
      state.caseFilter = btn.dataset.cat;
      renderCases();
    };

    // 渲染卡片
    const list = state.data.templates.filter((t) =>
      state.caseFilter === 'all' ? true : t.category === state.caseFilter
    );
    $('#caseCards').innerHTML = list
      .map((t) => {
        const cat = getCategory(t.category);
        const kpis = (t.kpis || []).slice(0, 4);
        const catStyle = `--cat-color:${escape(cat.color || '#1E6FFF')};--cat-soft:${escape(softColor(cat.color || '#1E6FFF'))};`;
        return `
          <div class="tcard" data-id="${t.id}" style="${catStyle}">
            <div class="tcard-head">
              <span class="tcard-cat">${escape(cat.name)}</span>
              ${t.highlight ? '<span class="tcard-star">★ 精装</span>' : ''}
            </div>
            <div class="tcard-title">${escape(t.name)}</div>
            <div class="tcard-tag">${escape(t.tagline)}</div>
            <div class="tcard-kpis">
              ${kpis
                .map(
                  (k) => `
                <div>
                  <div class="tcard-kpi-num ${k.trend || ''}">${escape(k.value)}</div>
                  <div class="tcard-kpi-label">${escape(k.label)}</div>
                </div>`
                )
                .join('')}
            </div>
            <div class="tcard-foot">
              <span>${t.placeholder ? '占位结构 · 待填充' : '完整内容'}</span>
              <span class="tcard-arrow">查看详情 →</span>
            </div>
          </div>`;
      })
      .join('');

    $('#caseCards').onclick = (e) => {
      const c = e.target.closest('.tcard');
      if (c) showCaseDetail(c.dataset.id);
    };
  }

  // ---- 客户 Logo 墙（行业头部客户真实 logo，灰度 → hover 上色） ----
  // logo 图片来源：维基百科 / Wikimedia，存于 assets/images/logos/。
  const LOGO_VER = 'poster-20260616f';
  // 名单来源：腾讯云 ADP 案例集（对内版）真实客户，仅取知名、适合公开展示者。
  // 全部为真实横版图形 logo（用户上传图 + 官方案例墙截图裁切）。
  // 前 9 个为最知名品牌：移动端只展示这 9 个（3×3），桌面端展示全部。
  const LOGO_BRANDS = [
    // —— 前 9：最知名品牌（移动端展示） ——
    { name: '得物',           file: 'dewu.jpg' },
    { name: 'OPPO',           file: 'oppo.svg' },
    { name: '货拉拉',         file: 'lalamove.png' },
    { name: '沃尔玛',         file: 'walmart.svg' },
    { name: 'DHL',            file: 'dhl.svg' },
    { name: '招商银行',       file: 'cmbchina.png' },
    { name: '一汽丰田',       file: 'ftmt.avif' },
    { name: 'realme',         file: 'realme.png' },
    { name: '斯凯奇',         file: 'skechers.png' },
    // —— 其余（桌面端展示） ——
    { name: '北汽集团',       file: 'baic.png' },
    { name: '清华大学',       file: 'tsinghua.svg' },
    { name: '北京中医药大学', file: 'bucm.png' },
    { name: '上海海事大学',   file: 'shmtu.avif' },
    { name: '伊利',           file: 'yili.avif' },
    { name: '长安汽车',       file: 'changan.svg' },
    { name: 'A.O.史密斯',     file: 'aosmith.avif' },
    { name: '迈瑞医疗',       file: 'mindray.avif' },
    { name: '天马微电子',     file: 'tianma.png' },
    { name: 'Baseus',         file: 'baseus.avif' },
    { name: '洋河',           file: 'yanghe.png' },
    { name: '同程旅行',       file: 'tongcheng.avif' },
    { name: '德邦快递',       file: 'deppon.avif' },
    { name: '轻喜到家',       file: 'qingxi.avif' },
    { name: '华住会',         file: 'huazhu.avif' },
    { name: '尚美数智',       file: 'sunmei.avif' },
    { name: '药师帮',         file: 'yaoshibang.png' },
    { name: '诺诚健华',       file: 'innocare.png' },
    { name: '万孚',           file: 'wondfo.png' },
    { name: 'DR.SMILE',       file: 'drsmile.png' },
    { name: '富邦华一银行',   file: 'fubon.png' },
    { name: '国投证券',       file: 'sdic.avif' },
    { name: '华润信托',       file: 'crtrust.avif' },
    { name: '中央广播电视总台', file: 'cmg.png' },
    { name: '中国日报',       file: 'chinadaily.png' },
    { name: '中国新闻社',     file: 'chinanews.jpg' },
    { name: '广东广播电视台', file: 'gdtv.png' },
    { name: '四川广播电视台', file: 'sctv.png' },
    { name: '江苏省广播电视总台', file: 'jstv.png' },
    { name: '云南广播电视台', file: 'yntv.png' },
    { name: '河南广播电视台', file: 'hntv.png' },
    { name: '深圳出版集团',   file: 'szpub.png' },
    { name: '中科万国',       file: 'sinovancoo.png' },
    { name: '四川省文化大数据', file: 'scbigdata.png' },
    { name: '运达风电',       file: 'windey.png' },
    { name: '星云开物',       file: 'starthing.png' },
    { name: '识季',           file: 'senser.png' },
    { name: '未来光谱',       file: 'wlgp.png' },
    { name: 'KiWi',           file: 'kiwi.avif' }
  ];

  // LOGO 墙轮播控制器（避免重复绑定计时器）
  let _logoCarousel = null;

  function logoItemHTML(b) {
    return `
      <div class="logo-item" title="${escape(b.name)}">
        <img class="logo-img" src="./assets/images/logos/${escape(b.file)}?v=${LOGO_VER}"
             alt="${escape(b.name)}" loading="lazy"
             onerror="this.onerror=null;this.replaceWith(Object.assign(document.createElement('span'),{className:'logo-zh',textContent:'${escape(b.name)}'}))" />
      </div>`;
  }

  function renderLogoWall() {
    const wall = $('#homeLogos');
    if (!wall) return;
    wall.classList.remove('hidden');
    wall.innerHTML = `
      <div class="logo-wall-inner">
        <div class="logo-wall-head">
          <div class="logo-wall-stat">
            <div class="logo-wall-stat-num">300<span>+</span></div>
            <div class="logo-wall-stat-desc">行业头部客户<br/>正在使用 ADP 构建智能体</div>
          </div>
          <div class="logo-wall-intro">
            <div class="logo-wall-title">他们都在用腾讯云 ADP</div>
            <p class="logo-wall-sub">覆盖泛互、金融、教育、医疗、零售、出行、传媒、制造等多个行业，从智能客服、知识问答到数据分析，ADP 已在大量真实业务场景中规模化落地。</p>
          </div>
        </div>
        <div class="logo-grid" id="logoGrid"></div>
        <div class="logo-dots" id="logoDots"></div>
      </div>`;
    startLogoCarousel();
  }

  // 分页轮播：桌面每页 24（8 列 × 3 行），移动端每页 8（2 列 × 4 行），5 秒淡入淡出切换
  function startLogoCarousel() {
    if (_logoCarousel) {
      clearInterval(_logoCarousel.timer);
      _logoCarousel.mq.removeEventListener('change', _logoCarousel.onChange);
      _logoCarousel = null;
    }
    const grid = $('#logoGrid');
    const dotsWrap = $('#logoDots');
    if (!grid) return;

    const FADE_MS = 600;
    const HOLD_MS = 5000;
    const mq = window.matchMedia('(max-width: 640px)');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctrl = { timer: null, mq, onChange: null, page: 0, pages: [] };

    const chunk = (arr, size) => {
      const out = [];
      for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
      return out;
    };

    const renderPage = (i) => {
      const list = ctrl.pages[i] || [];
      grid.innerHTML = list.map(logoItemHTML).join('');
      if (dotsWrap) {
        [...dotsWrap.children].forEach((d, k) =>
          d.classList.toggle('is-active', k === i)
        );
      }
    };

    const buildDots = () => {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = ctrl.pages
        .map((_, i) => `<button class="logo-dot" data-i="${i}" aria-label="第 ${i + 1} 组"></button>`)
        .join('');
      dotsWrap.style.display = ctrl.pages.length > 1 ? '' : 'none';
      [...dotsWrap.children].forEach((d) => {
        d.addEventListener('click', () => {
          const i = +d.dataset.i;
          if (i === ctrl.page) return;
          goTo(i);
          restart();
        });
      });
    };

    const goTo = (i) => {
      ctrl.page = i;
      if (reduceMotion) { renderPage(i); return; }
      grid.classList.add('is-fading');
      setTimeout(() => {
        renderPage(i);
        grid.classList.remove('is-fading');
      }, FADE_MS);
    };

    const next = () => goTo((ctrl.page + 1) % ctrl.pages.length);

    const restart = () => {
      clearInterval(ctrl.timer);
      if (ctrl.pages.length > 1 && !reduceMotion) {
        ctrl.timer = setInterval(next, HOLD_MS);
      }
    };

    const setup = () => {
      const pageSize = mq.matches ? 8 : 24;   // 移动端 2×4 / 桌面 8×3
      ctrl.pages = chunk(LOGO_BRANDS, pageSize);
      ctrl.page = 0;
      grid.classList.remove('is-fading');
      buildDots();
      renderPage(0);
      restart();
    };

    ctrl.onChange = () => setup();
    mq.addEventListener('change', ctrl.onChange);
    setup();
    _logoCarousel = ctrl;
  }

  function showCaseDetail(id) {
    const t = getTemplate(id);
    if (!t) return;
    state.activeCaseId = id;
    const cat = getCategory(t.category);

    let html = `
      <div class="detail-head">
        <div class="crumbs">
          <a id="caseBack">← 返回案例列表</a>
          <span> / </span>
          <span>${escape(cat.name)}</span>
          <span> / </span>
          <span>${escape(t.name)}</span>
        </div>
        <div class="detail-cat">${escape(cat.name)}${t.highlight ? ' · 精装样板间' : ''}</div>
        <h2 class="detail-title">${escape(t.name)}</h2>
        <div class="detail-tag">${escape(t.tagline)}</div>
      </div>`;

    if (t.demo && t.demo.presets && t.demo.presets.length) {
      html += `
        <div class="block demo-feature-block">
          <div class="block-head">
            <span class="block-num">1</span>
            <span class="block-title">场景演示</span>
            <span class="block-sub">先看效果，再看数据</span>
          </div>
          <div class="demo-wrap">
            <div class="demo-presets">
              <div class="demo-presets-title">预设话术</div>
              ${t.demo.presets
                .map(
                  (p, i) => `
                <div class="preset-item${i === 0 ? ' active' : ''}" data-idx="${i}">
                  <span class="preset-num">${i + 1}</span>${escape(p.title)}
                </div>`
                )
                .join('')}
            </div>
            <div class="demo-chat">
              <div class="demo-header">
                <div class="demo-avatar"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><rect x="5" y="8.5" width="14" height="10" rx="3.2" stroke="currentColor" stroke-width="1.7"/><path d="M12 5.4V8.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="12" cy="4.4" r="1.6" fill="currentColor"/><circle cx="9.3" cy="13.2" r="1.3" fill="currentColor"/><circle cx="14.7" cy="13.2" r="1.3" fill="currentColor"/><path d="M3.4 12v3M20.6 12v3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg></div>
                <div><div class="demo-name">${escape(t.shortName || t.name)}智能体</div></div>
                <div class="demo-status">在线</div>
              </div>
              <div class="demo-messages" id="demoMessages"></div>
              <div class="demo-footer">
                <input class="demo-input" id="demoInput" placeholder="演示模式：请点击左侧预设话术体验 Agent 编排" disabled />
                <button class="demo-btn" id="demoReplay">重播</button>
              </div>
            </div>
          </div>
        </div>`;
    }

    if (t.painPoints && t.painPoints.length) {
      html += `
        <div class="block">
          <div class="block-head">
            <span class="block-num">2</span>
            <span class="block-title">业务痛点</span>
            <span class="block-sub">现状与挑战</span>
          </div>
          <div class="pain-list">${t.painPoints
            .map((p) => `<div class="pain-item">${escape(p)}</div>`)
            .join('')}</div>
        </div>`;
    }

    if (t.capabilities && t.capabilities.length) {
      html += `
        <div class="block">
          <div class="block-head">
            <span class="block-num">3</span>
            <span class="block-title">核心能力</span>
            <span class="block-sub">RAG / Tool / 多模态 / 编排</span>
          </div>
          <div class="cap-list">${t.capabilities
            .map(
              (c) => `
            <div class="cap-card">
              <div class="cap-card-head">
                <span class="cap-tag">${escape(c.key)}</span>
                <span class="cap-card-name">${escape(c.name)}</span>
              </div>
              <div class="cap-card-desc">${escape(c.desc)}</div>
            </div>`
            )
            .join('')}</div>
        </div>`;
    }

    if (t.metrics && t.metrics.length) {
      html += `
        <div class="block">
          <div class="block-head">
            <span class="block-num">4</span>
            <span class="block-title">量化成效</span>
            <span class="block-sub">运行时关键指标</span>
          </div>
          <div class="metric-grid">${t.metrics
            .map(
              (m) => `
            <div class="metric-card">
              <div class="metric-num">${escape(m.value)}<span class="unit">${escape(m.unit || '')}</span></div>
              <div class="metric-label">${escape(m.name)}</div>
            </div>`
            )
            .join('')}</div>
        </div>`;
    }

    if (t.placeholder && !(t.demo && t.demo.presets && t.demo.presets.length)) {
      html += `
        <div class="placeholder-box">
          <div class="placeholder-icon">🛠️</div>
          <div class="placeholder-title">「${escape(t.name)}」详情待填充</div>
          <div class="placeholder-desc">
            该案例的编排流程图、对话 Demo 与量化数据正在补充中。<br>
            可在 <code>data/templates.json</code> 中按「装维服务」结构补全 <code>orchestration</code> / <code>metrics</code> / <code>demo.presets</code> 字段，刷新即可生效。
          </div>
        </div>`;
    }

    const detail = $('#caseDetail');
    detail.innerHTML = html;
    detail.classList.remove('hidden');
    $('#casesHead').classList.add('hidden');
    $('#caseFilter').classList.add('hidden');
    $('#caseCards').classList.add('hidden');

    $('#caseBack').onclick = () => {
      state.activeCaseId = null;
      renderCases();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (t.demo && t.demo.presets && t.demo.presets.length) {
      bindDemo(t.demo.presets);
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  // ============================================================
  //  行业解决方案
  // ============================================================
  function renderIndustries() {
    $('#industryDetail').classList.add('hidden');
    $('#industryDetail').innerHTML = '';
    $('#industryList').classList.remove('hidden');

    const list = $('#industryList');
    list.innerHTML = (state.data.industries || [])
      .map((ind) => {
        const count = (ind.relatedCases || []).length;
        return `
          <div class="indb-card" data-ind="${ind.id}">
            <div class="indb-icon">${renderIcon(ind.icon)}</div>
            <div class="indb-name">${escape(ind.name)}</div>
            <div class="indb-tag">${escape(ind.tagline)}</div>
            <div class="indb-foot">
              <span>典型场景 ${(ind.scenarios || []).length}</span>
              <span class="count">${count} 个相关案例</span>
            </div>
          </div>`;
      })
      .join('');
    list.onclick = (e) => {
      const c = e.target.closest('.indb-card');
      if (c) showIndustryDetail(c.dataset.ind);
    };
  }

  function showIndustryDetail(id) {
    const ind = getIndustry(id);
    if (!ind) return;
    state.activeIndustryId = id;
    const color = ind.color;

    const cases = (ind.relatedCases || [])
      .map((cid) => getTemplate(cid))
      .filter(Boolean);

    let html = `
      <div class="detail-head">
        <div class="crumbs">
          <a id="indBack">← 返回行业列表</a>
          <span> / </span>
          <span>${escape(ind.name)}</span>
        </div>
        <div class="detail-cat">行业方案 · ${escape(ind.name)}</div>
        <h2 class="detail-title">${escape(ind.name)}行业大模型解决方案</h2>
        <div class="detail-tag">${escape(ind.tagline)}</div>
      </div>

      <div class="block">
        <div class="block-head">
          <span class="block-num">1</span>
          <span class="block-title">典型应用场景</span>
          <span class="block-sub">${escape(ind.name)}行业落地切入点</span>
        </div>
        <div class="scenario-grid">
          ${(ind.scenarios || [])
            .map((s) => `<div class="scenario-item">${escape(s)}</div>`)
            .join('')}
        </div>
      </div>

      <div class="block">
        <div class="block-head">
          <span class="block-num">2</span>
          <span class="block-title">相关案例</span>
          <span class="block-sub">${cases.length} 个可复用样板间</span>
        </div>
        ${
          cases.length
            ? `<div class="grid-cards" id="indCases">
                ${cases
                  .map((t) => {
                    const cat = getCategory(t.category);
                    const kpis = (t.kpis || []).slice(0, 4);
                    const catStyle = `--cat-color:${escape(cat.color || '#1E6FFF')};--cat-soft:${escape(softColor(cat.color || '#1E6FFF'))};`;
                    return `
                    <div class="tcard" data-id="${t.id}" style="${catStyle}">
                      <div class="tcard-head">
                        <span class="tcard-cat">${escape(cat.name)}</span>
                        ${t.highlight ? '<span class="tcard-star">★ 精装</span>' : ''}
                      </div>
                      <div class="tcard-title">${escape(t.name)}</div>
                      <div class="tcard-tag">${escape(t.tagline)}</div>
                      <div class="tcard-kpis">
                        ${kpis
                          .map(
                            (k) => `
                          <div>
                            <div class="tcard-kpi-num ${k.trend || ''}">${escape(k.value)}</div>
                            <div class="tcard-kpi-label">${escape(k.label)}</div>
                          </div>`
                          )
                          .join('')}
                      </div>
                      <div class="tcard-foot">
                        <span>${t.placeholder ? '占位结构 · 待填充' : '完整内容'}</span>
                        <span class="tcard-arrow">查看详情 →</span>
                      </div>
                    </div>`;
                  })
                  .join('')}
              </div>`
            : `<div class="placeholder-box">
                 <div class="placeholder-icon">📂</div>
                 <div class="placeholder-title">暂无相关案例</div>
                 <div class="placeholder-desc">该行业的样板间正在沉淀中。</div>
               </div>`
        }
      </div>`;

    const det = $('#industryDetail');
    det.innerHTML = html;
    det.classList.remove('hidden');
    $('#industryList').classList.add('hidden');

    $('#indBack').onclick = () => {
      state.activeIndustryId = null;
      renderIndustries();
      window.scrollTo({ top: 0, behavior: 'auto' });
    };

    // 行业页内卡片点击 → 跳到案例详情
    const indCases = $('#indCases', det);
    if (indCases) {
      indCases.onclick = (e) => {
        const c = e.target.closest('.tcard');
        if (c) navigate('cases', { caseId: c.dataset.id });
      };
    }

    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  // ============================================================
  //  对话 Demo（打字机）
  // ============================================================
  let demoTimer = null;
  let cancelToken = 0;

  function bindDemo(presets) {
    const presetEls = $$('#caseDetail .preset-item');
    const box = $('#demoMessages');
    // 每个案例独立缓存：某个预设话术完整播放过一次后，再点回来直接展示最终结果，不再重播动画
    const cache = {};
    let curIdx = 0;

    async function show(idx, force) {
      curIdx = idx;
      presetEls.forEach((e) => e.classList.toggle('active', parseInt(e.dataset.idx, 10) === idx));

      if (!force && cache[idx] != null && box) {
        // 已播放过：瞬间还原最终结果（无动画、无逐字）
        clearDemoTimers();
        box.classList.add('is-instant');
        box.innerHTML = cache[idx];
        scrollToBottom(box);
        return;
      }

      const token = await playPreset(presets[idx]);
      // 仅在完整播放（中途未被切走/打断）后缓存最终态
      if (box && token === cancelToken) cache[idx] = box.innerHTML;
    }

    presetEls.forEach((el) => {
      el.addEventListener('click', () => show(parseInt(el.dataset.idx, 10), false));
    });
    const replayBtn = $('#demoReplay');
    if (replayBtn) replayBtn.addEventListener('click', () => { delete cache[curIdx]; show(curIdx, true); });
    show(0, false);
  }

  function clearDemoTimers() {
    if (demoTimer) { clearTimeout(demoTimer); demoTimer = null; }
    cancelToken++;
  }

  async function playPreset(preset) {
    if (!preset) return -1;
    clearDemoTimers();
    const myToken = cancelToken;
    const box = $('#demoMessages');
    if (!box) return -1;
    box.classList.remove('is-instant');
    box.innerHTML = '';

    appendUserMsg(box, preset.user);
    await sleep(360);
    if (myToken !== cancelToken) return myToken;

    for (let i = 0; i < preset.steps.length; i++) {
      if (myToken !== cancelToken) return myToken;
      const step = preset.steps[i];
      if (step.type === 'answer') {
        await typewriterAnswer(box, step.text, myToken);
      } else if (RICH_TYPES.includes(step.type)) {
        const skel = appendThinking(box, step.type);
        // 「正在生成」过程感：表格刻意更久，更像 AI 在逐行绘制
        const thinkMs =
          step.type === 'table' ? 2000 + Math.random() * 700 :
          step.type === 'chart' ? 1300 + Math.random() * 500 :
          1050 + Math.random() * 450;
        await sleep(thinkMs);
        if (myToken !== cancelToken) return myToken;
        appendRich(box, step, skel);
        // 等绘制动画跑完再进入下一步
        let drawMs = 620;
        if (step.type === 'table' && Array.isArray(step.rows)) drawMs = 700 + step.rows.length * 320;
        else if (step.type === 'chart') drawMs = 1250;
        await sleep(drawMs + Math.random() * 200);
      } else {
        await playStep(box, step, myToken);
        await sleep(260 + Math.random() * 160);
      }
    }
    return myToken;
  }

  // 详情页：把「工具调用 / 知识检索 / 意图识别…」步骤升级为带调用感的动画卡片
  // 每种工具类型拥有专属的「动画感」：查询有查询的感觉、分析有分析的感觉……
  // 流程：调用中（专属动画 + 逐字日志 + 进度条）→ 完成（转绿 ✓）
  // anim 决定调用态的视觉效果（对应 CSS：.msg-step[data-anim="..."]）
  const STEP_STYLE = {
    input:      { phrase: '接收用户输入',   anim: 'parse',  icon: 'dots'    },
    intent:     { phrase: '解析用户意图',   anim: 'parse',  icon: 'brain'   },
    plan:       { phrase: '拆解任务规划',   anim: 'plan',   icon: 'route'   },
    tool:       { phrase: '查询业务系统',   anim: 'query',  icon: 'query'   },
    rag:        { phrase: '检索知识库',     anim: 'search', icon: 'radar'   },
    multimodal: { phrase: '识别图像中',     anim: 'scan',   icon: 'eye'     },
    llm:        { phrase: '分析推理中',     anim: 'think',  icon: 'brain'   },
    action:     { phrase: '执行处置动作',   anim: 'run',    icon: 'bolt'    },
    output:     { phrase: '生成结果中',     anim: 'gen',    icon: 'spark'   },
  };
  const STEP_ICONS = {
    query:  '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M10 2a8 8 0 1 0 4.9 14.3l5.4 5.4 1.4-1.4-5.4-5.4A8 8 0 0 0 10 2Zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z"/></svg>',
    radar:  '<svg viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="1.8" d="M12 12 4.5 6.5M12 3a9 9 0 1 0 9 9"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/><circle cx="12" cy="12" r="5.5" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".5"/></svg>',
    brain:  '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M8.5 3A3.5 3.5 0 0 0 5 6.5c0 .4.1.8.2 1.2A3.5 3.5 0 0 0 4 14a3.5 3.5 0 0 0 3 3.5V19a2 2 0 0 0 4 0V3.6A2.6 2.6 0 0 0 8.5 3Zm7 0A2.6 2.6 0 0 0 13 5.6V19a2 2 0 0 0 4 0v-1.5A3.5 3.5 0 0 0 20 14a3.5 3.5 0 0 0-1.2-6.3c.1-.4.2-.8.2-1.2A3.5 3.5 0 0 0 15.5 3Z"/></svg>',
    eye:    '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 5C6.5 5 2.7 9.6 1.5 12 2.7 14.4 6.5 19 12 19s9.3-4.6 10.5-7C21.3 9.6 17.5 5 12 5Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></svg>',
    bolt:   '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/></svg>',
    spark:  '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2 14 9l7 2-7 2-2 7-2-7-7-2 7-2 2-7Z"/></svg>',
    route:  '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M6 4a3 3 0 1 0 1 5.8V14a4 4 0 0 0 4 4h2.2a3 3 0 1 0 0-2H11a2 2 0 0 1-2-2V9.8A3 3 0 0 0 6 4Z"/></svg>',
    dots:   '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="19" cy="12" r="2" fill="currentColor"/></svg>',
  };
  function stepStyle(type) { return STEP_STYLE[type] || { phrase: '处理中', anim: 'query', icon: 'dots' }; }
  function appendStep(box, step) {
    // 兼容旧调用：直接渲染完成态
    const div = document.createElement('div');
    div.className = 'msg bot';
    const tagLabel = STEP_LABELS[step.type] || step.type;
    div.innerHTML = `
      ${BOT_AVATAR}
      <div class="msg-step is-done" data-type="${escape(step.type)}">
        <span class="step-tag">${escape(tagLabel)}</span>
        <span class="step-text">${formatText(step.text)}</span>
      </div>`;
    box.appendChild(div);
    scrollToBottom(box);
  }
  async function playStep(box, step, myToken) {
    const div = document.createElement('div');
    div.className = 'msg bot';
    const tagLabel = STEP_LABELS[step.type] || step.type;
    const st = stepStyle(step.type);
    // 不同工具类型 → 不同的调用态动画装饰
    const fx = buildStepFx(st.anim);
    div.innerHTML = `
      ${BOT_AVATAR}
      <div class="msg-step is-calling" data-type="${escape(step.type)}" data-anim="${escape(st.anim)}">
        <div class="step-row">
          <span class="step-ico">${STEP_ICONS[st.icon] || STEP_ICONS.dots}</span>
          <span class="step-tag">${escape(tagLabel)}</span>
          <span class="step-state"><em>${escape(st.phrase)}</em><i class="step-dots">···</i></span>
        </div>
        <div class="step-fx">${fx}</div>
        <span class="step-text"></span>
        <span class="step-bar"><i></i></span>
      </div>`;
    box.appendChild(div);
    scrollToBottom(box);

    const card = div.querySelector('.msg-step');
    const textEl = div.querySelector('.step-text');
    const fullText = String(step.text == null ? '' : step.text);
    // 进度条增长
    requestAnimationFrame(() => { const bar = card.querySelector('.step-bar i'); if (bar) bar.style.width = '100%'; });
    // 让专属动画先跑一会，营造「正在工作」的过程感
    await sleep(560 + Math.random() * 300);
    if (myToken !== cancelToken) return;
    // 逐字打印日志（查询/检索类更快、分析类带停顿）
    const baseDelay = (st.anim === 'think' || st.anim === 'plan') ? 16 : 11;
    for (let i = 0; i < fullText.length; i++) {
      if (myToken !== cancelToken) return;
      textEl.innerHTML = formatText(fullText.slice(0, i + 1));
      scrollToBottom(box);
      const ch = fullText[i];
      await sleep(/[，。！？、：\n]/.test(ch) ? 30 : baseDelay);
    }
    await sleep(300 + Math.random() * 200);
    if (myToken !== cancelToken) return;
    // 转完成态：收起专属动画，转绿打勾
    card.classList.remove('is-calling');
    card.classList.add('is-done');
    const fxEl = card.querySelector('.step-fx');
    if (fxEl) fxEl.remove();
    const state = card.querySelector('.step-state');
    if (state) state.innerHTML = '<span class="step-check">✓</span><em>完成</em>';
    scrollToBottom(box);
  }
  // 为每种「动画感」生成对应的装饰 DOM（具体视觉在 CSS 中实现）
  function buildStepFx(anim) {
    switch (anim) {
      case 'query':  // 查询：数据流扫描 + 行扫
        return '<span class="fx-scanline"></span><span class="fx-stream"><i></i><i></i><i></i><i></i><i></i><i></i></span>';
      case 'search': // 检索：雷达脉冲波
        return '<span class="fx-radar"><i></i><i></i><i></i></span><span class="fx-hits"><b></b><b></b><b></b><b></b></span>';
      case 'think':  // 分析推理：神经节点波动
        return '<span class="fx-wave"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>';
      case 'scan':   // 多模态：图像取景框扫描
        return '<span class="fx-vision"><b class="c c1"></b><b class="c c2"></b><b class="c c3"></b><b class="c c4"></b><span class="fx-vscan"></span></span>';
      case 'plan':   // 规划：节点连线
        return '<span class="fx-plan"><b></b><b></b><b></b><b></b></span>';
      case 'run':    // 执行动作：脉冲推进
        return '<span class="fx-run"><i></i><i></i><i></i></span>';
      case 'gen':    // 生成：粒子汇聚
        return '<span class="fx-gen"><i></i><i></i><i></i><i></i><i></i></span>';
      case 'parse':  // 解析：光标读取
        return '<span class="fx-parse"><i></i><i></i><i></i><i></i><i></i><i></i></span>';
      default:
        return '<span class="fx-scanline"></span>';
    }
  }

  function appendUserMsg(box, text) {
    const div = document.createElement('div');
    div.className = 'msg user';
    div.innerHTML = `${USER_AVATAR}<div class="msg-bubble">${formatText(text)}</div>`;
    box.appendChild(div);
    scrollToBottom(box);
  }
  // 不同场景渲染不同图型：折线 / 饼图 / 柱状 / 横向排行
  const CHART_KIND_LABEL = { line: '趋势图', pie: '占比图', bar: '柱状图', hbar: '排行榜' };
  const CHART_COLORS = ['#0068B5', '#00A3F6', '#34C7A8', '#7C4DFF', '#FF7A45', '#EB2F96', '#13C2C2'];
  const clampPct = (v) => Math.max(0, Math.min(100, Number(v) || 0));
  const isNeg = (v) => /^-/.test(String(v).trim());

  // 横向排行（默认）：长标签场景，正负值着色
  function buildHBars(bars) {
    const rows = bars
      .map((b) => {
        const w = Math.max(4, clampPct(b.pct));
        return `<div class="rich-bar-row${isNeg(b.value) ? ' is-neg' : ''}">
          <span class="rich-bar-label">${escape(b.label)}</span>
          <span class="rich-bar-track"><i style="width:0" data-w="${w}"></i></span>
          <span class="rich-bar-val">${escape(b.value)}</span>
        </div>`;
      })
      .join('');
    return `<div class="rich-bars">${rows}</div>`;
  }
  // 纵向柱状图：排名 / 达成率等
  function buildBarChart(bars) {
    const cols = bars
      .map((b, i) => {
        const h = Math.max(4, clampPct(b.pct));
        const color = CHART_COLORS[i % CHART_COLORS.length];
        return `<div class="vbar-col${isNeg(b.value) ? ' is-neg' : ''}">
          <span class="vbar-val">${escape(b.value)}</span>
          <span class="vbar-track"><i class="vbar-fill" style="height:0;--c:${color}" data-h="${h}"></i></span>
          <span class="vbar-label">${escape(b.label)}</span>
        </div>`;
      })
      .join('');
    return `<div class="rich-vbars" style="--n:${bars.length}">${cols}</div>`;
  }
  // 折线图（SVG）：时间序列趋势
  function buildLineChart(bars) {
    const W = 360, H = 168, padL = 12, padR = 12, padTop = 22, padBottom = 28;
    const n = bars.length;
    const innerW = W - padL - padR;
    const plotH = H - padTop - padBottom;
    const baseY = padTop + plotH;
    const xs = bars.map((_, i) => padL + (n === 1 ? innerW / 2 : (innerW * i) / (n - 1)));
    const ys = bars.map((b) => padTop + plotH * (1 - clampPct(b.pct) / 100));
    const linePts = xs.map((x, i) => `${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
    const areaPts = `${padL.toFixed(1)},${baseY.toFixed(1)} ${linePts} ${(padL + innerW).toFixed(1)},${baseY.toFixed(1)}`;
    const grid = [0, 0.25, 0.5, 0.75, 1]
      .map((t) => { const y = (padTop + plotH * t).toFixed(1); return `<line class="lc-grid" x1="${padL}" y1="${y}" x2="${padL + innerW}" y2="${y}"/>`; })
      .join('');
    const dots = xs.map((x, i) => `<circle class="lc-dot" cx="${x.toFixed(1)}" cy="${ys[i].toFixed(1)}" r="3.4" style="--d:${(i * 0.1).toFixed(2)}s"/>`).join('');
    const vals = xs.map((x, i) => `<text class="lc-val" x="${x.toFixed(1)}" y="${(ys[i] - 9).toFixed(1)}" style="--d:${(i * 0.1).toFixed(2)}s">${escape(bars[i].value)}</text>`).join('');
    const labels = xs.map((x, i) => `<text class="lc-xlabel" x="${x.toFixed(1)}" y="${H - 9}">${escape(bars[i].label)}</text>`).join('');
    return `<div class="rich-line"><svg viewBox="0 0 ${W} ${H}" class="lc-svg" role="img">
      ${grid}
      <polygon class="lc-area" points="${areaPts}"/>
      <polyline class="lc-line" points="${linePts}" pathLength="1"/>
      ${dots}${vals}${labels}
    </svg></div>`;
  }
  // 饼图 / 环形图（SVG）：构成占比
  function buildPieChart(bars) {
    const total = bars.reduce((s, b) => s + (Number(b.pct) || 0), 0) || 1;
    const r = 42, cx = 50, cy = 50, sw = 16, C = 2 * Math.PI * r;
    let acc = 0;
    const segs = bars
      .map((b, i) => {
        const frac = (Number(b.pct) || 0) / total;
        const len = frac * C;
        const off = (-acc * C).toFixed(2);
        acc += frac;
        const color = CHART_COLORS[i % CHART_COLORS.length];
        return `<circle class="pie-seg" r="${r}" cx="${cx}" cy="${cy}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="butt" stroke-dasharray="0 ${C.toFixed(2)}" stroke-dashoffset="${off}" data-dash="${len.toFixed(2)} ${(C - len).toFixed(2)}" style="--d:${(i * 0.12).toFixed(2)}s"/>`;
      })
      .join('');
    const legend = bars
      .map((b, i) => {
        const color = CHART_COLORS[i % CHART_COLORS.length];
        return `<li><span class="pie-dot" style="background:${color}"></span><b>${escape(b.label)}</b><em>${escape(b.value)}</em></li>`;
      })
      .join('');
    return `<div class="rich-pie">
      <svg viewBox="0 0 100 100" class="pie-svg" role="img">
        <circle class="pie-bg" r="${r}" cx="${cx}" cy="${cy}" fill="none" stroke="#EDF2F7" stroke-width="${sw}"/>
        ${segs}
      </svg>
      <ul class="pie-legend">${legend}</ul>
    </div>`;
  }
  function buildChart(kind, bars) {
    if (kind === 'line') return buildLineChart(bars);
    if (kind === 'pie') return buildPieChart(bars);
    if (kind === 'bar') return buildBarChart(bars);
    return buildHBars(bars);
  }
  function renderRichCard(step) {
    const title = step.text ? `<div class="rich-title">${formatText(step.text)}</div>` : '';
    if (step.type === 'chart' && Array.isArray(step.bars)) {
      const kind = step.chartType || 'hbar';
      const kindLabel = CHART_KIND_LABEL[kind] ? ` · ${CHART_KIND_LABEL[kind]}` : '';
      return `<div class="rich-card rich-chart rich-chart-${escape(kind)}"><div class="rich-kind">图表${kindLabel}</div>${title}${buildChart(kind, step.bars)}</div>`;
    }
    if (step.type === 'table' && Array.isArray(step.rows)) {
      const head = (step.columns || []).map((c) => `<th>${escape(c)}</th>`).join('');
      const body = step.rows
        .map(
          (r, ri) =>
            `<tr class="row-in" style="animation-delay:${ri * 300}ms">${r.map((c) => `<td>${escape(c)}</td>`).join('')}</tr>`
        )
        .join('');
      return `<div class="rich-card rich-table"><div class="rich-kind">批量结果</div>${title}<div class="rich-table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div></div>`;
    }
    if (step.type === 'doc' && step.doc) {
      const d = step.doc;
      const lines = (d.body || [])
        .map((l, li) => `<li class="line-in" style="animation-delay:${li * 110}ms">${formatText(l)}</li>`)
        .join('');
      return `<div class="rich-card rich-doc"><div class="rich-kind">生成文档</div>
        <div class="rich-doc-head"><b>${escape(d.title || '')}</b>${d.meta ? `<span>${escape(d.meta)}</span>` : ''}</div>
        <ul class="rich-doc-body">${lines}</ul></div>`;
    }
    if (step.type === 'image') {
      return `<div class="rich-card rich-image">
        <div class="rich-shot"><span class="rich-shot-tag">${escape(step.shot || '识别结果')}</span><span class="rich-scan"></span>
          <svg viewBox="0 0 64 40" aria-hidden="true"><rect x="2" y="2" width="60" height="36" rx="3" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="20" cy="16" r="5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M6 34 L24 20 L34 28 L44 18 L58 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>
        </div>
        <div class="rich-shot-cap">${formatText(step.text || '')}</div></div>`;
    }
    if (step.type === 'verdict' && step.verdict) {
      const v = step.verdict;
      const tone = ['pass', 'warn', 'fail'].includes(v.tone) ? v.tone : 'warn';
      const points = (v.points || [])
        .map((p, pi) => `<li class="line-in" style="animation-delay:${pi * 100}ms">${formatText(p)}</li>`)
        .join('');
      return `<div class="rich-card rich-verdict rich-verdict-${tone}">
        <div class="rich-verdict-head"><span class="rich-verdict-flag">${escape(v.result || '')}</span></div>
        ${v.summary ? `<div class="rich-verdict-sum">${formatText(v.summary)}</div>` : ''}
        ${points ? `<ul class="rich-verdict-points">${points}</ul>` : ''}</div>`;
    }
    return `<div class="rich-card">${title}</div>`;
  }
  // 富卡片「生成中」骨架，模拟 AI 调用工具的过程
  function skeletonBody(type) {
    if (type === 'chart') {
      return '<div class="skel-bars">' + Array.from({ length: 4 }).map(() => '<span class="skel-bar"></span>').join('') + '</div>';
    }
    if (type === 'table') {
      return '<div class="skel-rows">' + Array.from({ length: 4 }).map(() => '<span class="skel-row"></span>').join('') + '</div>';
    }
    if (type === 'image') {
      return '<div class="skel-shot"></div>';
    }
    // doc / verdict：文本行骨架
    return '<div class="skel-lines">' + Array.from({ length: 3 }).map(() => '<span class="skel-line"></span>').join('') + '</div>';
  }
  function appendThinking(box, type) {
    const div = document.createElement('div');
    div.className = 'msg bot';
    const label = RICH_PENDING[type] || '正在生成';
    div.innerHTML = `${BOT_AVATAR}<div class="msg-rich"><div class="rich-card rich-skeleton">
        <div class="rich-pending"><span class="rich-spinner"></span><span>${escape(label)}<i class="rich-dots">…</i></span></div>
        ${skeletonBody(type)}
      </div></div>`;
    box.appendChild(div);
    scrollToBottom(box);
    return div;
  }
  function appendRich(box, step, skelEl) {
    const html = `${BOT_AVATAR}<div class="msg-rich">${renderRichCard(step)}</div>`;
    let div;
    if (skelEl) {
      skelEl.innerHTML = html;
      div = skelEl;
    } else {
      div = document.createElement('div');
      div.className = 'msg bot';
      div.innerHTML = html;
      box.appendChild(div);
    }
    const card = div.querySelector('.rich-card');
    if (card) card.classList.add('rich-in');
    if (step.type === 'chart') {
      requestAnimationFrame(() => {
        // 横向排行：宽度增长
        div.querySelectorAll('.rich-bar-track i').forEach((bar) => { bar.style.width = (bar.dataset.w || 0) + '%'; });
        // 纵向柱状：高度升起
        div.querySelectorAll('.vbar-fill').forEach((bar) => { bar.style.height = (bar.dataset.h || 0) + '%'; });
        // 折线：路径绘制 + 区域 + 点/数值浮现
        const line = div.querySelector('.lc-line'); if (line) line.style.strokeDashoffset = '0';
        const area = div.querySelector('.lc-area'); if (area) area.style.opacity = '1';
        div.querySelectorAll('.lc-dot, .lc-val').forEach((el) => { el.style.opacity = '1'; });
        // 饼图：各扇区由 0 生长
        div.querySelectorAll('.pie-seg').forEach((seg) => { if (seg.dataset.dash) seg.style.strokeDasharray = seg.dataset.dash; });
      });
    }
    scrollToBottom(box);
  }
  function appendBotBubble(box) {
    const div = document.createElement('div');
    div.className = 'msg bot';
    div.innerHTML = `${BOT_AVATAR}<div class="msg-bubble"><span class="typed"></span><span class="typing-cursor"></span></div>`;
    box.appendChild(div);
    scrollToBottom(box);
    return div;
  }
  // 行内格式：**加粗**，并对 ⚠ / ✓ 风险标记着色
  function inlineFmt(s) {
    let h = escape(s);
    h = h.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
    h = h.replace(/(⚠[^\n]*?)(?=$|<b>|，|。|；|;)/g, '<span class="ans-warn">$1</span>');
    h = h.replace(/(✓[^\n]*?)(?=$|<b>|，|。|；|;)/g, '<span class="ans-ok">$1</span>');
    return h;
  }
  // 是否为「结构化长文」：含 ##/# 标题、- 要点、> 引述 或 **加粗**
  function isStructuredAnswer(text) {
    return /(^|\n)\s*(#{1,2}\s|[-•·]\s|>\s)/.test(text) || /\*\*[^*]+\*\*/.test(text);
  }
  // 解析为结构块：h1/h2/p/quote/ul(items)/gap
  function parseAnswerBlocks(text) {
    const lines = String(text).split('\n');
    const blocks = [];
    let list = null;
    const flush = () => { if (list) { blocks.push({ type: 'ul', items: list }); list = null; } };
    for (const raw of lines) {
      const line = raw.trim();
      let m;
      if (!line) { flush(); blocks.push({ type: 'gap' }); }
      else if ((m = line.match(/^##\s+(.*)$/))) { flush(); blocks.push({ type: 'h2', text: m[1] }); }
      else if ((m = line.match(/^#\s+(.*)$/))) { flush(); blocks.push({ type: 'h1', text: m[1] }); }
      else if ((m = line.match(/^[-•·]\s+(.*)$/))) { if (!list) list = []; list.push(m[1]); }
      else if ((m = line.match(/^>\s+(.*)$/))) { flush(); blocks.push({ type: 'quote', text: m[1] }); }
      else { flush(); blocks.push({ type: 'p', text: line }); }
    }
    flush();
    return blocks;
  }
  async function typeInto(box, el, text, myToken, base) {
    const full = String(text);
    for (let i = 0; i < full.length; i++) {
      if (myToken !== cancelToken) return;
      el.innerHTML = inlineFmt(full.slice(0, i + 1));
      scrollToBottom(box);
      const ch = full[i];
      await sleep(/[，。！？、：；,.!?;:]/.test(ch) ? base + 36 : base);
    }
    el.innerHTML = inlineFmt(full);
  }
  // 结构化总结：逐块浮现 + 逐字输入，分层字号排版
  async function revealStructuredAnswer(box, text, myToken) {
    const div = document.createElement('div');
    div.className = 'msg bot';
    div.innerHTML = `${BOT_AVATAR}<div class="msg-bubble ans-rich"></div>`;
    box.appendChild(div);
    const bubble = div.querySelector('.ans-rich');
    scrollToBottom(box);
    const blocks = parseAnswerBlocks(text);
    for (const blk of blocks) {
      if (myToken !== cancelToken) return;
      if (blk.type === 'gap') { const sp = document.createElement('div'); sp.className = 'ans-gap'; bubble.appendChild(sp); continue; }
      if (blk.type === 'ul') {
        const ul = document.createElement('ul');
        ul.className = 'ans-ul';
        bubble.appendChild(ul);
        for (const it of blk.items) {
          if (myToken !== cancelToken) return;
          const li = document.createElement('li');
          li.className = 'ans-li ans-reveal';
          ul.appendChild(li);
          await typeInto(box, li, it, myToken, 13);
          await sleep(110);
        }
        continue;
      }
      const el = document.createElement('div');
      el.className = (blk.type === 'h1' ? 'ans-h1' : blk.type === 'h2' ? 'ans-h2' : blk.type === 'quote' ? 'ans-quote' : 'ans-p') + ' ans-reveal';
      bubble.appendChild(el);
      const head = blk.type === 'h1' || blk.type === 'h2';
      await typeInto(box, el, blk.text, myToken, head ? 18 : 13);
      await sleep(head ? 180 : 90);
    }
  }
  async function typewriterAnswer(box, text, myToken) {
    if (isStructuredAnswer(text)) { return revealStructuredAnswer(box, text, myToken); }
    const bubble = appendBotBubble(box);
    const typedEl = bubble.querySelector('.typed');
    const cursorEl = bubble.querySelector('.typing-cursor');
    const total = String(text);
    let i = 0;
    return new Promise((resolve) => {
      const tick = () => {
        if (myToken !== cancelToken) return resolve();
        if (i >= total.length) { if (cursorEl) cursorEl.remove(); return resolve(); }
        i += 1;
        typedEl.innerHTML = formatText(total.slice(0, i));
        scrollToBottom(box);
        const ch = total[i - 1];
        const delay = /[，。！？；,.!?;:\n]/.test(ch) ? 60 : 18;
        demoTimer = setTimeout(tick, delay);
      };
      tick();
    });
  }
  function scrollToBottom(box) { box.scrollTop = box.scrollHeight; }
  function sleep(ms) { return new Promise((r) => (demoTimer = setTimeout(r, ms))); }

  // ============================================================
  //  路由（顶部三栏切换）
  // ============================================================
  function navigate(section, opts = {}) {
    state.section = section;
    clearDemoTimers();

    // 顶部高亮
    $$('.topnav-item').forEach((el) => el.classList.toggle('active', el.dataset.nav === section));

    // 页面切换
    $$('.page').forEach((el) => el.classList.remove('active'));
    const tgt = $(`#page-${section}`);
    if (tgt) tgt.classList.add('active');

    // 内容渲染
    if (section === 'home') {
      renderHome();
    } else if (section === 'cases') {
      if (opts.caseId) {
        renderCases();           // 先准备列表结构
        showCaseDetail(opts.caseId);
      } else {
        renderCases();
      }
    } else if (section === 'industries') {
      if (opts.industryId) {
        renderIndustries();
        showIndustryDetail(opts.industryId);
      } else {
        renderIndustries();
      }
    }

    // 关闭移动端菜单
    closeMobileMenu();

    if (!opts.caseId && !opts.industryId) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }

  // ---------- 移动端菜单 ----------
  function setupMobileMenu() {
    const nav = $('#topnav');
    const backdrop = $('#backdrop');
    const toggle = $('#menuToggle');
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = !nav.classList.contains('open');
      nav.classList.toggle('open', open);
      if (backdrop) backdrop.classList.remove('show');
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', (e) => {
      if (!nav.classList.contains('open')) return;
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      closeMobileMenu();
    });
    if (backdrop) backdrop.addEventListener('click', closeMobileMenu);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobileMenu();
    });
  }
  function closeMobileMenu() {
    const nav = $('#topnav');
    const backdrop = $('#backdrop');
    const toggle = $('#menuToggle');
    if (nav) nav.classList.remove('open');
    if (backdrop) backdrop.classList.remove('show');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }

  // ---------- 横向画册：纵向滚动驱动横向推进，无滚轮拦截和吸附跳动 ----------
  function setupHorizontalScrollers() {
    const sections = $$('.js-horizontal-scroll');
    if (!sections.length) return;

    const topOffset = () => Math.max(0, ($('.topbar') && $('.topbar').offsetHeight) || 58);
    const states = new Map();
    let raf = null;

    const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

    sections.forEach((section) => {
      states.set(section, { maxX: 0, viewport: 0 });
    });

    const measureOne = (section) => {
      const sticky = $('.horizontal-sticky', section);
      const track = $('.horizontal-track', section);
      const st = states.get(section);
      if (!sticky || !track || !st) return;

      if (isMobileDevice()) {
        section.style.height = '';
        track.style.transform = '';
        section.style.setProperty('--scroll-progress', '0');
        st.maxX = 0;
        return;
      }

      const stickyStyle = window.getComputedStyle(sticky);
      const padX = parseFloat(stickyStyle.paddingLeft || '0') + parseFloat(stickyStyle.paddingRight || '0');
      const viewport = Math.max(1, sticky.clientWidth - padX);
      st.viewport = viewport;
      st.maxX = Math.max(0, track.scrollWidth - viewport);
      // 纵向滚动与横向位移近似 1:1，手感顺滑；sticky 已铺满视口，不会再露出空白区
      const scrollRange = Math.min(Math.max(st.maxX * 0.9, 360), window.innerHeight * 1.8);
      section.style.height = `${Math.ceil(sticky.offsetHeight + scrollRange)}px`;
    };

    const renderOne = (section) => {
      const sticky = $('.horizontal-sticky', section);
      const track = $('.horizontal-track', section);
      const st = states.get(section);
      if (!sticky || !track || !st) return;
      if (isMobileDevice() || st.maxX <= 1) {
        track.style.transform = '';
        section.style.setProperty('--scroll-progress', '0');
        return;
      }

      const rect = section.getBoundingClientRect();
      const scrollable = Math.max(1, section.offsetHeight - sticky.offsetHeight);
      const progress = clamp((topOffset() - rect.top) / scrollable, 0, 1);
      track.style.transform = `translate3d(${-st.maxX * progress}px, 0, 0)`;
      section.style.setProperty('--scroll-progress', progress.toFixed(4));
    };

    const measureAll = () => {
      sections.forEach(measureOne);
      sections.forEach(renderOne);
    };

    const requestRender = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        sections.forEach(renderOne);
      });
    };

    window.addEventListener('scroll', requestRender, { passive: true });
    window.addEventListener('resize', measureAll, { passive: true });
    window.addEventListener('load', measureAll, { once: true });
    measureAll();
  }

  // ---------- 行业场景画册：手风琴卡片（悬停/点击/键盘展开） ----------
  function setupIndustryAccordion() {
    const row = $('.industry-accordion .ia-row');
    if (!row) return;
    const cards = $$('.ia-card', row);
    if (!cards.length) return;

    let openTimer = null;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const activate = (card) => {
      if (!card || card.classList.contains('is-active')) return;
      if (openTimer) { clearTimeout(openTimer); openTimer = null; }
      cards.forEach((c) => {
        const on = c === card;
        c.classList.toggle('is-active', on);
        c.classList.remove('is-open');           // 先收起所有文字内容
        c.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      // 等卡片宽度展开到位后，再整体淡入标题/正文（杜绝拉伸与逐字感）
      const reveal = () => { if (card.classList.contains('is-active')) card.classList.add('is-open'); };
      if (reduceMotion) reveal();
      else openTimer = setTimeout(reveal, 560);
    };

    const hoverable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    cards.forEach((card, i) => {
      if (hoverable) {
        card.addEventListener('mouseenter', () => activate(card));
      }
      card.addEventListener('click', () => activate(card));

      // 「查看详情」箭头 → 进入该行业解决方案页，展示该场景下的相关案例
      const goBtn = $('.ia-go', card);
      if (goBtn) {
        goBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          const ind = card.dataset.ind;
          if (ind) {
            navigate('industries', { industryId: ind });
            // 手风琴位于首页靠下位置，跳转后必须回到顶部，否则视口仍停在原处看似“没反应”
            window.scrollTo({ top: 0, behavior: 'auto' });
          }
        });
      }

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate(card);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          const n = cards[Math.min(cards.length - 1, i + 1)];
          activate(n);
          n.focus();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          const p = cards[Math.max(0, i - 1)];
          activate(p);
          p.focus();
        }
      });
    });

    // 默认激活卡：加载后淡入其内容
    const initial = cards.find((c) => c.classList.contains('is-active')) || cards[0];
    if (initial) {
      initial.classList.add('is-active');
      setTimeout(() => initial.classList.add('is-open'), reduceMotion ? 0 : 240);
    }
  }


  // ---------- 应用模式演示切换 ----------
  function setupModeShowcase() {
    const root = $('.mode-showcase');
    if (!root) return;
    const modes = ['standard', 'workflow', 'multi'];
    const copies = $$('.mode-copy', root);
    const scenes = $$('.mode-scene', root);
    let index = 0;
    let timer = null;

    const setMode = (mode) => {
      if (!modes.includes(mode)) return;
      index = modes.indexOf(mode);
      root.dataset.active = mode;
      copies.forEach((el) => el.classList.toggle('active', el.dataset.mode === mode));
      scenes.forEach((el) => el.classList.toggle('active', el.dataset.mode === mode));
    };

    const restart = () => {
      if (timer) clearInterval(timer);
      timer = setInterval(() => setMode(modes[(index + 1) % modes.length]), 6000);
    };

    root.addEventListener('click', (e) => {
      const item = e.target.closest('.mode-copy');
      if (!item || !root.contains(item)) return;
      setMode(item.dataset.mode);
      restart();
    });

    root.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const item = e.target.closest('.mode-copy');
      if (!item || !root.contains(item)) return;
      e.preventDefault();
      setMode(item.dataset.mode);
      restart();
    });

    setMode(root.dataset.active || modes[index]);
    restart();
  }

  // ---------- 首屏 Try ADP 体验 ----------
  let heroTryTimers = [];
  function clearHeroTryTimers() {
    heroTryTimers.forEach((timer) => clearTimeout(timer));
    heroTryTimers = [];
  }
  function setupHeroTry() {
    const form = $('#heroTryForm');
    if (!form) return;
    const input = $('#heroTryInput', form);
    const result = $('#heroTryResult', form);
    const chips = $$('.hero-try-chip', form);
    const examples = {
      '生成巡检流程': '帮我把设备巡检要求生成一套可执行流程',
      '整理会议纪要': '把会议纪要整理成待办、负责人和风险提醒',
      '分析续费风险': '分析客户续费风险，并生成跟进方案',
    };

    const appendTryLine = (html, delay) => {
      const timer = setTimeout(() => {
        if (!result) return;
        const box = $('.try-chat', result);
        if (!box) return;
        box.insertAdjacentHTML('beforeend', html);
        result.scrollTop = result.scrollHeight;
      }, delay);
      heroTryTimers.push(timer);
    };

    const play = () => {
      if (!input || !result) return;
      const text = input.value.trim() || '帮我把客户需求变成一份可评审方案';
      clearHeroTryTimers();
      form.classList.add('is-thinking');
      result.classList.remove('is-empty', 'is-ready');
      result.innerHTML = `
        <div class="try-chat">
          <div class="try-msg try-user"><b>你</b><span>${escape(text)}</span></div>
          <div class="try-msg try-bot try-loading"><b>ADP</b><span>正在理解任务目标</span><i></i><i></i><i></i></div>
        </div>`;

      appendTryLine('<div class="try-msg try-bot"><b>规划智能体</b><span>已拆解为：需求澄清、资料检索、方案撰写、流程编排、评审确认。</span></div>', 620);
      appendTryLine('<div class="try-msg try-bot"><b>知识智能体</b><span>将匹配企业知识库、历史案例和行业模板，补齐方案依据。</span></div>', 1180);
      appendTryLine('<div class="try-msg try-bot"><b>流程智能体</b><span>建议生成 4 个执行节点：规划 → 检索 → 生成 → 评审，并预留人工确认口。</span></div>', 1740);
      appendTryLine('<div class="try-msg try-bot"><b>交付智能体</b><span>输出物包括：方案摘要、执行流程、风险清单、下一步任务。</span></div>', 2300);
      const doneTimer = setTimeout(() => {
        form.classList.remove('is-thinking');
        result.classList.add('is-ready');
        const loading = $('.try-loading', result);
        if (loading) loading.remove();
      }, 2860);
      heroTryTimers.push(doneTimer);
    };

    if (result) result.classList.add('is-empty');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      play();
    });
    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        if (input) input.value = examples[chip.textContent.trim()] || chip.textContent.trim();
        chips.forEach((item) => item.classList.toggle('active', item === chip));
        if (result) {
          clearHeroTryTimers();
          form.classList.remove('is-thinking');
          result.classList.add('is-empty');
          result.classList.remove('is-ready');
          result.innerHTML = '';
        }
      });
    });
    $$('[data-hero-try-trigger]').forEach((trigger) => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (input) input.focus({ preventScroll: true });
      });
    });
  }

  // ---------- 顶部 nav 点击 ----------
  function setupTopNav() {
    document.body.addEventListener('click', (e) => {
      const item = e.target.closest('[data-nav]');
      if (item) {
        e.preventDefault();
        navigate(item.dataset.nav);
      }
    });
  }

  // ---------- 启动 ----------
  async function init() {
    applyDeviceClass();
    setupMobileMenu();
    setupTopNav();
    setupHeroTry();
    setupModeShowcase();
    setupIndustryAccordion();
    setupHorizontalScrollers();
    await loadData();
    navigate('home');
    window.addEventListener('resize', () => {
      const wasMobile = document.body.classList.contains('is-mobile-device');
      const isMobile = applyDeviceClass();
      if (wasMobile !== isMobile && state.data && state.section === 'home') renderHome();
    }, { passive: true });
    window.addEventListener('orientationchange', () => {
      const wasMobile = document.body.classList.contains('is-mobile-device');
      const isMobile = applyDeviceClass();
      if (wasMobile !== isMobile && state.data && state.section === 'home') renderHome();
    }, { passive: true });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
