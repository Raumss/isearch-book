(function () {
  'use strict';

  // ── Search Engine Configurations ───────────────────────────────
  const SEARCH_ENGINES = [
    {
      name: 'Z-Library',
      buildUrl: (q) => `https://z-lib.fm/s/${encodeURIComponent(q)}`
    },
    {
      name: "Anna's Archive",
      buildUrl: (q) => `https://annas-archive.li/search?q=${encodeURIComponent(q)}`
    }
  ];

  // ── Inline styles (injected into Shadow DOM) ───────────────────
  // Cloned from Douban's gray_ad / buyinfo / buyinfo-printed styles
  const SHADOW_CSS = `
    :host {
      display: block;
      font-size: 12px;
      font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
      color: #111;
    }
    h2 {
      font-size: 15px;
      font-weight: normal;
      line-height: 1.4;
      margin: 0 0 8px;
      color: #072;
    }
    h2 .dots {
      color: #ccc;
      font-size: 12px;
    }
    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    li {
      padding: 8px 0;
      border-bottom: 1px solid #e8e5da;
    }
    li:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    li:first-child {
      padding-top: 0;
    }
    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .vendor-name {
      font-size: 13px;
      color: #111;
    }
    .vendor-name span {
      color: #37a;
    }
    .search-btn {
      display: inline-block;
      padding: 4px 14px;
      color: #fff;
      background: #319a54;
      border: none;
      border-radius: 3px;
      font-size: 12px;
      line-height: 1;
      white-space: nowrap;
      cursor: pointer;
      text-decoration: none;
      transition: background-color 0.15s;
    }
    .search-btn:hover {
      background: #2a8548;
    }
  `;

  // ── Book Info Extraction ───────────────────────────────────────

  function getBookTitle() {
    const el =
      document.querySelector('#wrapper h1 span[property="v:itemreviewed"]') ||
      document.querySelector('#wrapper h1 span');
    return el ? el.textContent.trim() : null;
  }

  // ── DOM Construction (Shadow DOM) ──────────────────────────────

  function createPanel(title) {
    const host = document.createElement('div');
    host.id = 'isearch-ebook-panel';
    host.style.cssText = 'margin-bottom: 15px !important; display: block; padding: 15px 18px; background: #f6f6f1; border-radius: 4px;';

    const shadow = host.attachShadow({ mode: 'closed' });

    const style = document.createElement('style');
    style.textContent = SHADOW_CSS;
    shadow.appendChild(style);

    const items = SEARCH_ENGINES.map((engine) => {
      const url = engine.buildUrl(title);
      return `
        <li>
          <div class="row">
            <div class="vendor-name"><span>${engine.name}</span></div>
            <button type="button" class="search-btn" data-url="${url}">去搜索</button>
          </div>
        </li>`;
    }).join('');

    const container = document.createElement('div');
    container.innerHTML = `
      <h2>
        <span>搜索电子版</span>
        <span class="dots">&nbsp;&middot;&nbsp;&middot;&nbsp;&middot;&nbsp;&middot;&nbsp;&middot;&nbsp;&middot;</span>
      </h2>
      <ul>${items}</ul>`;

    shadow.appendChild(container);

    // Handle clicks entirely inside the shadow – Douban JS cannot see this
    shadow.addEventListener('click', (event) => {
      const btn = event.target.closest('.search-btn');
      if (!btn) return;
      event.preventDefault();
      event.stopPropagation();
      window.open(btn.dataset.url, '_blank', 'noopener,noreferrer');
    });

    return host;
  }

  // ── Panel Insertion ────────────────────────────────────────────

  function findInsertionPoint() {
    const aside =
      document.querySelector('#content .aside') ||
      document.querySelector('.aside');

    if (!aside) return null;

    // Find the buying-info block and walk up to the direct child of .aside
    const buyingInfo =
      document.querySelector('#buyinfo-printed') ||
      document.querySelector('#buying_info') ||
      document.querySelector('[id*="buyinfo"]');

    if (buyingInfo) {
      let target = buyingInfo;
      while (target.parentNode && target.parentNode !== aside) {
        target = target.parentNode;
      }
      if (target.parentNode === aside) {
        return { parent: aside, before: target };
      }
    }

    // Fallback: top of the right sidebar
    return { parent: aside, before: aside.firstElementChild };
  }

  // ── Initialisation ────────────────────────────────────────────

  function init() {
    if (document.getElementById('isearch-ebook-panel')) return;

    const title = getBookTitle();
    if (!title) return;

    const point = findInsertionPoint();
    if (!point) return;

    const panel = createPanel(title);
    point.parent.insertBefore(panel, point.before);
  }

  // ── Entry Point ────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
