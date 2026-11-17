(function () {
  class AdvancedLandingPage extends HTMLElement {
    constructor() {
      super();
      this._shadowRoot = this.attachShadow({ mode: "open" });

      this._config = this._safeJson(this.getAttribute("configJson"), this._defaultConfig());
      this._stats = this._safeJson(this.getAttribute("statsJson"), this._defaultStats());
      this._theme = this._safeJson(this.getAttribute("themeJson"), this._defaultTheme());
      this._quickLinks = this._safeJson(this.getAttribute("quickLinksJson"), []);
      this._layout = this._safeJson(this.getAttribute("layoutJson"), this._defaultLayout());

      this._pageKey = this.getAttribute("pageKey") || "ADMIN";
      this._searchText = this.getAttribute("searchText") || "";
      this._viewMode = this.getAttribute("viewMode") || "grid";
      this._density = this.getAttribute("density") || "cozy";
      this._themeMode = this.getAttribute("themeMode") || "light";
      this._selectedTile = this.getAttribute("selectedTile") || "";
      this._lastEvent = this.getAttribute("lastEvent") || "";
      this._widgetState = this.getAttribute("widgetState") || "READY";

      this._clockTimer = null;
      this._render();
    }

    static get observedAttributes() {
      return [
        "configJson",
        "statsJson",
        "themeJson",
        "quickLinksJson",
        "layoutJson",
        "pageKey",
        "searchText",
        "viewMode",
        "density",
        "themeMode",
        "selectedTile",
        "lastEvent",
        "widgetState"
      ];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue === newValue) return;

      if (name === "configJson") this._config = this._safeJson(newValue, this._defaultConfig());
      if (name === "statsJson") this._stats = this._safeJson(newValue, this._defaultStats());
      if (name === "themeJson") this._theme = this._safeJson(newValue, this._defaultTheme());
      if (name === "quickLinksJson") this._quickLinks = this._safeJson(newValue, []);
      if (name === "layoutJson") this._layout = this._safeJson(newValue, this._defaultLayout());
      if (name === "pageKey") this._pageKey = newValue || "ADMIN";
      if (name === "searchText") this._searchText = newValue || "";
      if (name === "viewMode") this._viewMode = newValue || "grid";
      if (name === "density") this._density = newValue || "cozy";
      if (name === "themeMode") this._themeMode = newValue || "light";
      if (name === "selectedTile") this._selectedTile = newValue || "";
      if (name === "lastEvent") this._lastEvent = newValue || "";
      if (name === "widgetState") this._widgetState = newValue || "READY";

      this._render();
    }

    connectedCallback() {
      this._startClock();
      this._fireSimpleEvent("onReady", { status: "READY", pageKey: this._pageKey });
    }

    disconnectedCallback() {
      if (this._clockTimer) {
        clearInterval(this._clockTimer);
        this._clockTimer = null;
      }
    }

    _defaultConfig() {
      return {
        pageTitle: "SAP Enterprise Analytics Portal",
        pageSubtitle: "Explore business intelligence, reports and planning insights.",
        pageEyebrow: "SAP ANALYTICS CLOUD",
        environment: "Production",
        logoText: "A",
        logoUrl: "",
        heroBackgroundImage: "",
        showClock: true,
        showHero: true,
        showSearch: true,
        showStats: true,
        showQuickLinksPanel: true,
        showAnnouncement: false,
        announcementText: "",
        announcementType: "info",
        showFooter: true,
        footerText: "Developed by Arnav Choudhary",
        allowThemeSwitch: true,
        allowDensitySwitch: true,
        allowViewSwitch: true,
        sections: []
      };
    }

    _defaultStats() {
      return {
        card1Label: "Modules",
        card1Value: "0",
        card1Icon: "grid",
        card2Label: "Reports",
        card2Value: "0",
        card2Icon: "document",
        card3Label: "Actions",
        card3Value: "0",
        card3Icon: "target",
        card4Label: "Links",
        card4Value: "0",
        card4Icon: "link"
      };
    }

    _defaultTheme() {
      return {
        primary: "#0f4c97",
        secondary: "#3b82f6",
        accent: "#60a5fa",
        surface: "#ffffff",
        background: "#eef4fb",
        text: "#12304f",
        muted: "#6b7c93",
        border: "#d9e6f2",
        heroText: "#ffffff"
      };
    }

    _defaultLayout() {
      return {
        heroRadius: 22,
        sectionRadius: 20,
        tileRadius: 18,
        tileMinHeight: 140,
        sectionTitleSize: 24,
        tileTitleSize: 18,
        contentMaxWidth: "100%"
      };
    }

    _safeJson(value, fallback) {
      try {
        const parsed = JSON.parse(value || "");
        return parsed && typeof parsed === "object" ? parsed : fallback;
      } catch (e) {
        return fallback;
      }
    }

    _syncAll() {
      this.dispatchEvent(new CustomEvent("propertiesChanged", {
        detail: {
          properties: {
            configJson: JSON.stringify(this._config),
            statsJson: JSON.stringify(this._stats),
            themeJson: JSON.stringify(this._theme),
            quickLinksJson: JSON.stringify(this._quickLinks),
            layoutJson: JSON.stringify(this._layout),
            pageKey: this._pageKey,
            searchText: this._searchText,
            viewMode: this._viewMode,
            density: this._density,
            themeMode: this._themeMode,
            selectedTile: this._selectedTile,
            lastEvent: this._lastEvent,
            widgetState: this._widgetState
          }
        }
      }));
    }

    _fireSimpleEvent(name, detail) {
      this.dispatchEvent(new CustomEvent(name, { detail }));
    }

    _setLastEvent(payload) {
      this._lastEvent = JSON.stringify(payload || {});
      this._syncAll();
    }

    _startClock() {
      if (!this._config.showClock) return;
      if (this._clockTimer) clearInterval(this._clockTimer);

      this._clockTimer = setInterval(() => {
        const clock = this._shadowRoot.getElementById("liveClock");
        if (clock) {
          clock.textContent = this._formatDateTime(new Date());
        }
      }, 1000);
    }

    _formatDateTime(d) {
      try {
        return new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        }).format(d);
      } catch (e) {
        return String(d);
      }
    }

    _getIconSvg(name) {
      const icons = {
        database: `<svg viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="5" rx="7" ry="3.2" stroke="currentColor" stroke-width="2"/><path d="M5 5v6c0 1.8 3.1 3.2 7 3.2s7-1.4 7-3.2V5" stroke="currentColor" stroke-width="2"/><path d="M5 11v6c0 1.8 3.1 3.2 7 3.2s7-1.4 7-3.2v-6" stroke="currentColor" stroke-width="2"/></svg>`,
        target: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/></svg>`,
        document: `<svg viewBox="0 0 24 24" fill="none"><path d="M7 3h7l5 5v13H7z" stroke="currentColor" stroke-width="2"/><path d="M14 3v6h6" stroke="currentColor" stroke-width="2"/><path d="M10 13h6M10 17h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
        upload: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 16V5M8 9l4-4 4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M5 19h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
        refresh: `<svg viewBox="0 0 24 24" fill="none"><path d="M20 12a8 8 0 1 1-2.34-5.66" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M20 4v6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        star: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3.5l2.8 5.67 6.26.91-4.53 4.42 1.07 6.25L12 17.77l-5.6 2.98 1.07-6.25L2.94 10.08l6.26-.91L12 3.5z"/></svg>`,
        clock: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2"/><path d="M12 8v5l3 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
        grid: `<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="6" height="6" stroke="currentColor" stroke-width="2"/><rect x="14" y="4" width="6" height="6" stroke="currentColor" stroke-width="2"/><rect x="4" y="14" width="6" height="6" stroke="currentColor" stroke-width="2"/><rect x="14" y="14" width="6" height="6" stroke="currentColor" stroke-width="2"/></svg>`,
        list: `<svg viewBox="0 0 24 24" fill="none"><path d="M8 7h12M8 12h12M8 17h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="4" cy="7" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="4" cy="17" r="1.5" fill="currentColor"/></svg>`,
        search: `<svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="6" stroke="currentColor" stroke-width="2"/><path d="M20 20l-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
        settings: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 8.5A3.5 3.5 0 1 0 12 15.5A3.5 3.5 0 1 0 12 8.5Z" stroke="currentColor" stroke-width="2"/><path d="M19 12a7.7 7.7 0 0 0-.07-1l2-1.55-2-3.45-2.4.8a8.1 8.1 0 0 0-1.72-1L14.5 3h-5l-.3 2.8a8.1 8.1 0 0 0-1.72 1l-2.4-.8-2 3.45 2 1.55a7.7 7.7 0 0 0 0 2l-2 1.55 2 3.45 2.4-.8a8.1 8.1 0 0 0 1.72 1L9.5 21h5l.3-2.8a8.1 8.1 0 0 0 1.72-1l2.4.8 2-3.45-2-1.55c.05-.33.08-.66.08-1Z" stroke="currentColor" stroke-width="1.5"/></svg>`,
        link: `<svg viewBox="0 0 24 24" fill="none"><path d="M10 14l4-4M8 16l-2 2a3 3 0 1 1-4-4l2-2M16 8l2-2a3 3 0 1 1 4 4l-2 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
      };
      return icons[name] || icons.document;
    }

    _normalizeString(v) {
      return String(v || "").trim();
    }

    _matchesSearch(tile, searchText) {
      const q = this._normalizeString(searchText).toLowerCase();
      if (!q) return true;

      const bucket = [
        tile.title,
        tile.subtitle,
        tile.target,
        (tile.tags || []).join(" "),
        tile.type
      ].join(" ").toLowerCase();

      return bucket.indexOf(q) !== -1;
    }

    _getVisibleSections() {
      const sections = Array.isArray(this._config.sections) ? this._config.sections : [];
      const searchText = this._searchText || "";

      return sections
        .map(section => {
          const tiles = Array.isArray(section.tiles) ? section.tiles : [];
          const filteredTiles = tiles.filter(tile => this._matchesSearch(tile, searchText));
          return Object.assign({}, section, { tiles: filteredTiles });
        })
        .filter(section => section.tiles.length > 0 || !searchText);
    }

    _handleTileClick(tile) {
      if (tile.disabled) return;

      this._selectedTile = tile.id || "";
      this._widgetState = "NAVIGATE_READY";
      this._setLastEvent({
        type: "tileClick",
        pageKey: this._pageKey,
        tileId: tile.id,
        title: tile.title,
        target: tile.target,
        targetType: tile.targetType || tile.type || "story",
        openMode: tile.openMode || "same_tab"
      });

      this._fireSimpleEvent("onTileClick", {
        pageKey: this._pageKey,
        tileId: tile.id,
        title: tile.title,
        target: tile.target,
        targetType: tile.targetType || tile.type || "story",
        openMode: tile.openMode || "same_tab",
        tile: tile
      });

      this._render();
    }

    _handleQuickLinkClick(link) {
      this._setLastEvent({
        type: "quickLinkClick",
        pageKey: this._pageKey,
        id: link.id,
        title: link.title,
        target: link.target,
        targetType: link.targetType || "url"
      });

      this._fireSimpleEvent("onQuickLinkClick", {
        pageKey: this._pageKey,
        item: link
      });
    }

    _toggleSection(sectionId) {
      const sections = this._config.sections || [];
      for (let i = 0; i < sections.length; i++) {
        if (sections[i].id === sectionId) {
          sections[i].collapsed = !sections[i].collapsed;
          break;
        }
      }

      this._widgetState = "SECTION_TOGGLED";
      this._setLastEvent({ type: "sectionToggle", sectionId: sectionId, pageKey: this._pageKey });
      this._fireSimpleEvent("onSectionToggle", { sectionId: sectionId, pageKey: this._pageKey });
      this._render();
    }

    _setSearch(value) {
      this._searchText = value || "";
      this._widgetState = "FILTERED";
      this._setLastEvent({ type: "search", value: this._searchText, pageKey: this._pageKey });
      this._fireSimpleEvent("onSearch", { value: this._searchText, pageKey: this._pageKey });
      this._render();
    }

    _setViewMode(value) {
      this._viewMode = value === "list" ? "list" : "grid";
      this._syncAll();
      this._render();
    }

    _setDensity(value) {
      this._density = value === "compact" ? "compact" : "cozy";
      this._syncAll();
      this._render();
    }

    _setThemeMode(value) {
      this._themeMode = value === "dark" ? "dark" : "light";
      this._syncAll();
      this._render();
    }

    _countAllVisibleTiles() {
      const sections = this._getVisibleSections();
      let count = 0;
      for (let i = 0; i < sections.length; i++) {
        count += (sections[i].tiles || []).length;
      }
      return count;
    }

    _themeVars() {
      const dark = this._themeMode === "dark";
      return {
        bg: dark ? "#0b1220" : (this._theme.background || "#eef4fb"),
        surface: dark ? "#111a2e" : (this._theme.surface || "#ffffff"),
        text: dark ? "#ecf3ff" : (this._theme.text || "#12304f"),
        muted: dark ? "#9db0c9" : (this._theme.muted || "#6b7c93"),
        border: dark ? "#24324d" : (this._theme.border || "#d9e6f2"),
        primary: this._theme.primary || "#0f4c97",
        secondary: this._theme.secondary || "#3b82f6",
        accent: this._theme.accent || "#60a5fa",
        heroText: this._theme.heroText || "#ffffff"
      };
    }

    _heroBackground(t) {
      if (this._config.heroBackgroundImage) {
        return `linear-gradient(rgba(15,76,151,0.72), rgba(59,130,246,0.72)), url('${this._config.heroBackgroundImage}') center/cover no-repeat`;
      }
      return `linear-gradient(135deg, ${t.primary} 0%, ${t.secondary} 100%)`;
    }

    _render() {
      const t = this._themeVars();
      const visibleSections = this._getVisibleSections();
      const totalSections = visibleSections.length;
      const totalTiles = this._countAllVisibleTiles();
      const densityClass = this._density === "compact" ? "compact" : "cozy";
      const viewClass = this._viewMode === "list" ? "list" : "grid";

      this._shadowRoot.innerHTML = `
        <style>
          :host{
            display:block;
            width:100%;
            height:100%;
            box-sizing:border-box;
            font-family:"72", Arial, sans-serif;
            color:${t.text};
          }
          *{box-sizing:border-box}
          .app{
            min-height:100%;
            background:${t.bg};
            color:${t.text};
            padding:18px;
          }
          .shell{
            width:${this._layout.contentMaxWidth || "100%"};
            margin:0 auto;
          }
          .hero{
            background:${this._heroBackground(t)};
            color:${t.heroText};
            border-radius:${parseInt(this._layout.heroRadius || 22, 10)}px;
            padding:22px 28px;
            display:grid;
            grid-template-columns:1fr auto;
            gap:18px;
            box-shadow:0 18px 40px rgba(15,76,151,0.22);
          }
          .hero-left{
            display:flex;
            gap:16px;
            align-items:flex-start;
          }
          .logo{
            width:54px;
            height:54px;
            border-radius:14px;
            background:rgba(255,255,255,0.12);
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:32px;
            font-weight:800;
            overflow:hidden;
          }
          .logo img{
            width:100%;
            height:100%;
            object-fit:cover;
          }
          .eyebrow{
            font-size:12px;
            letter-spacing:1.2px;
            text-transform:uppercase;
            opacity:.9;
            font-weight:700;
          }
          .title{
            font-size:20px;
            font-weight:800;
            margin-top:6px;
          }
          .subtitle{
            font-size:14px;
            opacity:.95;
            margin-top:6px;
          }
          .hero-right{
            display:flex;
            flex-direction:column;
            align-items:flex-end;
            gap:10px;
          }
          .chip{
            border:1px solid rgba(255,255,255,0.22);
            background:rgba(255,255,255,0.10);
            padding:10px 14px;
            border-radius:12px;
            font-size:13px;
            font-weight:700;
            white-space:nowrap;
          }
          .announcement{
            margin-top:14px;
            padding:12px 16px;
            border-radius:14px;
            border:1px solid ${t.border};
            background:#eff6ff;
            color:${t.text};
            font-size:13px;
            font-weight:700;
          }
          .toolbar{
            margin-top:18px;
            display:grid;
            grid-template-columns:${this._config.showQuickLinksPanel ? "1fr 320px auto" : "1fr auto"};
            gap:14px;
            align-items:start;
          }
          .searchbox{
            display:flex;
            align-items:center;
            gap:10px;
            background:${t.surface};
            border:1px solid ${t.border};
            border-radius:14px;
            padding:0 14px;
            height:48px;
            box-shadow:0 6px 18px rgba(10,30,60,0.05);
          }
          .searchbox input{
            border:none;
            outline:none;
            background:transparent;
            width:100%;
            font-size:14px;
            color:${t.text};
          }
          .quick-links{
            background:${t.surface};
            border:1px solid ${t.border};
            border-radius:${parseInt(this._layout.sectionRadius || 20, 10)}px;
            padding:14px;
            box-shadow:0 8px 20px rgba(10,30,60,0.04);
          }
          .quick-links-title{
            font-size:14px;
            font-weight:800;
            margin-bottom:10px;
          }
          .quick-link{
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:8px;
            padding:10px 12px;
            border-radius:12px;
            cursor:pointer;
            color:${t.text};
          }
          .quick-link:hover{
            background:rgba(59,130,246,0.08);
          }
          .tools{
            display:flex;
            gap:10px;
            flex-wrap:wrap;
          }
          .tool-btn{
            border:1px solid ${t.border};
            background:${t.surface};
            color:${t.text};
            border-radius:12px;
            height:42px;
            padding:0 12px;
            display:flex;
            align-items:center;
            gap:8px;
            cursor:pointer;
            font-weight:700;
          }
          .tool-btn svg,.icon svg,.kpi-icon svg,.mini-icon svg,.quick-link svg{
            width:18px;
            height:18px;
          }
          .stats{
            margin-top:18px;
            display:grid;
            grid-template-columns:repeat(4, minmax(0,1fr));
            gap:14px;
          }
          .kpi{
            background:${t.surface};
            border:1px solid ${t.border};
            border-radius:18px;
            padding:16px;
            display:flex;
            align-items:center;
            gap:12px;
            box-shadow:0 8px 20px rgba(10,30,60,0.05);
          }
          .kpi-icon{
            width:42px;
            height:42px;
            border-radius:12px;
            display:flex;
            align-items:center;
            justify-content:center;
            background:rgba(59,130,246,0.10);
            color:${t.secondary};
            flex:0 0 auto;
          }
          .kpi-label{
            font-size:11px;
            text-transform:uppercase;
            color:${t.muted};
            font-weight:800;
            letter-spacing:.7px;
          }
          .kpi-value{
            font-size:18px;
            font-weight:800;
            margin-top:4px;
          }
          .content{
            margin-top:20px;
            display:grid;
            gap:18px;
          }
          .section{
            background:${t.surface};
            border:1px solid ${t.border};
            border-radius:${parseInt(this._layout.sectionRadius || 20, 10)}px;
            padding:16px;
            box-shadow:0 8px 20px rgba(10,30,60,0.04);
          }
          .section-head{
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:12px;
            margin-bottom:14px;
          }
          .section-title-wrap{
            display:flex;
            align-items:center;
            gap:10px;
          }
          .section-title{
            font-size:${parseInt(this._layout.sectionTitleSize || 24, 10)}px;
            font-weight:800;
          }
          .section-subtitle{
            color:${t.muted};
            font-size:13px;
            margin-top:4px;
          }
          .section-meta{
            color:${t.muted};
            font-size:13px;
            margin-top:4px;
          }
          .collapse-btn{
            border:none;
            background:transparent;
            color:${t.muted};
            cursor:pointer;
            font-size:20px;
            font-weight:800;
          }
          .tiles.grid{
            display:grid;
            grid-template-columns:repeat(auto-fill, minmax(240px, 1fr));
            gap:14px;
          }
          .tiles.list{
            display:grid;
            grid-template-columns:1fr;
            gap:12px;
          }
          .tile{
            position:relative;
            overflow:hidden;
            border:1px solid ${t.border};
            background:${t.surface};
            border-radius:${parseInt(this._layout.tileRadius || 18, 10)}px;
            padding:16px;
            min-height:${parseInt(this._layout.tileMinHeight || 140, 10)}px;
            cursor:pointer;
            transition:transform .18s ease, box-shadow .18s ease, border-color .18s ease;
            box-shadow:0 8px 18px rgba(10,30,60,0.04);
          }
          .tile:hover{
            transform:translateY(-2px);
            box-shadow:0 16px 30px rgba(10,30,60,0.10);
            border-color:${t.accent};
          }
          .tile.compact{
            min-height:${Math.max(100, parseInt(this._layout.tileMinHeight || 140, 10) - 28)}px;
            padding:12px;
          }
          .tile.disabled{
            opacity:.55;
            cursor:not-allowed;
          }
          .tile-top{
            display:flex;
            justify-content:space-between;
            align-items:flex-start;
            gap:12px;
          }
          .icon{
            width:52px;
            height:52px;
            border-radius:14px;
            display:flex;
            align-items:center;
            justify-content:center;
            color:#fff;
            box-shadow:0 10px 22px rgba(0,0,0,0.14);
            flex:0 0 auto;
          }
          .tile-title{
            margin-top:14px;
            font-size:${parseInt(this._layout.tileTitleSize || 18, 10)}px;
            font-weight:800;
            line-height:1.2;
          }
          .tile-subtitle{
            margin-top:8px;
            font-size:13px;
            color:${t.muted};
            line-height:1.45;
          }
          .tile-footer{
            margin-top:14px;
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:10px;
          }
          .badge{
            display:inline-flex;
            align-items:center;
            gap:6px;
            font-size:12px;
            font-weight:700;
            padding:6px 10px;
            border-radius:999px;
            background:rgba(59,130,246,0.10);
            color:${t.secondary};
          }
          .tile-action{
            color:${t.muted};
            font-size:12px;
            font-weight:700;
          }
          .empty{
            background:${t.surface};
            border:1px dashed ${t.border};
            border-radius:18px;
            padding:30px;
            text-align:center;
            color:${t.muted};
          }
          .footer-note{
            text-align:center;
            margin-top:16px;
            font-size:12px;
            color:${t.muted};
          }
          @media (max-width: 1180px){
            .toolbar{
              grid-template-columns:1fr;
            }
          }
          @media (max-width: 980px){
            .hero,.stats{
              grid-template-columns:1fr;
            }
            .hero-right{
              align-items:flex-start;
            }
          }
        </style>

        <div class="app">
          <div class="shell">
            ${this._config.showHero !== false ? `
              <div class="hero">
                <div class="hero-left">
                  <div class="logo">
                    ${this._config.logoUrl ? `<img src="${this._escapeAttr(this._config.logoUrl)}" alt="logo" />` : this._escapeHtml(this._config.logoText || "A")}
                  </div>
                  <div>
                    <div class="eyebrow">${this._escapeHtml(this._config.pageEyebrow || "SAP ANALYTICS CLOUD")}</div>
                    <div class="title">${this._escapeHtml(this._config.pageTitle || "")}</div>
                    <div class="subtitle">${this._escapeHtml(this._config.pageSubtitle || "")}</div>
                  </div>
                </div>
                <div class="hero-right">
                  <div class="chip">${this._escapeHtml(this._config.environment || "Production")}</div>
                  ${this._config.showClock ? `<div class="chip"><span id="liveClock">${this._formatDateTime(new Date())}</span></div>` : ``}
                </div>
              </div>
            ` : ``}

            ${this._config.showAnnouncement && this._config.announcementText ? `
              <div class="announcement">${this._escapeHtml(this._config.announcementText)}</div>
            ` : ``}

            <div class="toolbar">
              ${this._config.showSearch !== false ? `
                <div class="searchbox">
                  <span class="mini-icon">${this._getIconSvg("search")}</span>
                  <input id="searchInput" type="text" placeholder="Search modules, reports, stories, actions" value="${this._escapeAttr(this._searchText)}" />
                </div>
              ` : `<div></div>`}

              ${this._config.showQuickLinksPanel !== false ? `
                <div class="quick-links">
                  <div class="quick-links-title">Quick Links</div>
                  ${(this._quickLinks || []).map(link => `
                    <div class="quick-link" data-quick-id="${this._escapeAttr(link.id || "")}">
                      <span>${this._escapeHtml(link.title || "")}</span>
                      <span>${this._getIconSvg(link.icon || "link")}</span>
                    </div>
                  `).join("")}
                </div>
              ` : ``}

              <div class="tools">
                ${this._config.allowViewSwitch !== false ? `<button class="tool-btn" id="viewBtn">${this._getIconSvg(this._viewMode === "grid" ? "grid" : "list")} ${this._viewMode}</button>` : ``}
                ${this._config.allowDensitySwitch !== false ? `<button class="tool-btn" id="densityBtn">${this._density}</button>` : ``}
                ${this._config.allowThemeSwitch !== false ? `<button class="tool-btn" id="themeBtn">${this._themeMode}</button>` : ``}
              </div>
            </div>

            ${this._config.showStats !== false ? `
              <div class="stats">
                <div class="kpi">
                  <div class="kpi-icon">${this._getIconSvg(this._stats.card1Icon || "grid")}</div>
                  <div><div class="kpi-label">${this._escapeHtml(this._stats.card1Label || "Modules")}</div><div class="kpi-value">${this._escapeHtml(this._stats.card1Value || String(totalSections))}</div></div>
                </div>
                <div class="kpi">
                  <div class="kpi-icon">${this._getIconSvg(this._stats.card2Icon || "document")}</div>
                  <div><div class="kpi-label">${this._escapeHtml(this._stats.card2Label || "Reports")}</div><div class="kpi-value">${this._escapeHtml(this._stats.card2Value || String(totalTiles))}</div></div>
                </div>
                <div class="kpi">
                  <div class="kpi-icon">${this._getIconSvg(this._stats.card3Icon || "target")}</div>
                  <div><div class="kpi-label">${this._escapeHtml(this._stats.card3Label || "Actions")}</div><div class="kpi-value">${this._escapeHtml(this._stats.card3Value || "0")}</div></div>
                </div>
                <div class="kpi">
                  <div class="kpi-icon">${this._getIconSvg(this._stats.card4Icon || "link")}</div>
                  <div><div class="kpi-label">${this._escapeHtml(this._stats.card4Label || "Links")}</div><div class="kpi-value">${this._escapeHtml(this._stats.card4Value || "0")}</div></div>
                </div>
              </div>
            ` : ``}

            <div class="content">
              ${visibleSections.length === 0 ? `
                <div class="empty">
                  No tiles configured for this landing page.
                </div>
              ` : visibleSections.map(section => `
                <div class="section">
                  <div class="section-head">
                    <div>
                      <div class="section-title-wrap">
                        <span class="mini-icon">${this._getIconSvg(section.icon || "grid")}</span>
                        <div class="section-title">${this._escapeHtml(section.title || "")}</div>
                      </div>
                      ${section.subtitle ? `<div class="section-subtitle">${this._escapeHtml(section.subtitle)}</div>` : ``}
                      <div class="section-meta">${(section.tiles || []).length} items</div>
                    </div>
                    <button class="collapse-btn" data-section-toggle="${this._escapeAttr(section.id)}">${section.collapsed ? "+" : "−"}</button>
                  </div>

                  ${section.collapsed ? "" : `
                    <div class="tiles ${viewClass}">
                      ${(section.tiles || []).map(tile => `
                        <div class="tile ${densityClass} ${tile.disabled ? "disabled" : ""}" data-tile-id="${this._escapeAttr(tile.id)}">
                          <div class="tile-top">
                            <div class="icon" style="background:${this._escapeAttr(tile.accent || t.secondary)}">
                              ${this._getIconSvg(tile.icon || "document")}
                            </div>
                          </div>
                          <div class="tile-title">${this._escapeHtml(tile.title || "")}</div>
                          <div class="tile-subtitle">${this._escapeHtml(tile.subtitle || "")}</div>
                          <div class="tile-footer">
                            <div class="badge">${this._escapeHtml(tile.type || "story")}</div>
                            <div class="tile-action">${this._escapeHtml(tile.actionText || "Open")}</div>
                          </div>
                        </div>
                      `).join("")}
                    </div>
                  `}
                </div>
              `).join("")}
            </div>

            ${this._config.showFooter !== false ? `
              <div class="footer-note">
                ${this._escapeHtml(this._config.footerText || "Developed by Arnav Choudhary")}
              </div>
            ` : ``}
          </div>
        </div>
      `;

      this._bindEvents();
      this._startClock();
    }

    _bindEvents() {
      const searchInput = this._shadowRoot.getElementById("searchInput");
      if (searchInput) {
        searchInput.addEventListener("input", (e) => {
          this._setSearch(e.target.value || "");
        });
      }

      const viewBtn = this._shadowRoot.getElementById("viewBtn");
      if (viewBtn) {
        viewBtn.addEventListener("click", () => {
          this._setViewMode(this._viewMode === "grid" ? "list" : "grid");
        });
      }

      const densityBtn = this._shadowRoot.getElementById("densityBtn");
      if (densityBtn) {
        densityBtn.addEventListener("click", () => {
          this._setDensity(this._density === "compact" ? "cozy" : "compact");
        });
      }

      const themeBtn = this._shadowRoot.getElementById("themeBtn");
      if (themeBtn) {
        themeBtn.addEventListener("click", () => {
          this._setThemeMode(this._themeMode === "dark" ? "light" : "dark");
        });
      }

      this._shadowRoot.querySelectorAll("[data-section-toggle]").forEach(btn => {
        btn.addEventListener("click", () => {
          this._toggleSection(btn.getAttribute("data-section-toggle"));
        });
      });

      this._shadowRoot.querySelectorAll("[data-tile-id]").forEach(el => {
        el.addEventListener("click", () => {
          const tileId = el.getAttribute("data-tile-id");
          const sections = this._getVisibleSections();
          for (let i = 0; i < sections.length; i++) {
            const tiles = sections[i].tiles || [];
            for (let j = 0; j < tiles.length; j++) {
              if (tiles[j].id === tileId) {
                this._handleTileClick(tiles[j]);
                return;
              }
            }
          }
        });
      });

      this._shadowRoot.querySelectorAll("[data-quick-id]").forEach(el => {
        el.addEventListener("click", () => {
          const id = el.getAttribute("data-quick-id");
          for (let i = 0; i < this._quickLinks.length; i++) {
            if ((this._quickLinks[i].id || "") === id) {
              this._handleQuickLinkClick(this._quickLinks[i]);
              return;
            }
          }
        });
      });
    }

    _escapeHtml(v) {
      return String(v || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    _escapeAttr(v) {
      return this._escapeHtml(v);
    }

    setConfig(json) {
      this._config = this._safeJson(json, this._defaultConfig());
      this._widgetState = "CONFIG_UPDATED";
      this._syncAll();
      this._fireSimpleEvent("onConfigChange", { config: this._config, pageKey: this._pageKey });
      this._render();
    }

    getConfig() {
      return JSON.stringify(this._config || {});
    }

    setStats(json) {
      this._stats = this._safeJson(json, this._defaultStats());
      this._syncAll();
      this._render();
    }

    setTheme(json) {
      this._theme = this._safeJson(json, this._defaultTheme());
      this._syncAll();
      this._render();
    }

    setQuickLinks(json) {
      this._quickLinks = this._safeJson(json, []);
      this._syncAll();
      this._render();
    }

    setLayout(json) {
      this._layout = this._safeJson(json, this._defaultLayout());
      this._syncAll();
      this._render();
    }

    setSearchText(value) {
      this._setSearch(value || "");
    }

    setViewMode(value) {
      this._setViewMode(value || "grid");
    }

    setDensity(value) {
      this._setDensity(value || "cozy");
    }

    setThemeMode(value) {
      this._setThemeMode(value || "light");
    }

    setPageKey(value) {
      this._pageKey = value || "ADMIN";
      this._syncAll();
      this._render();
    }

    refresh() {
      this._render();
    }

    getSelectedTile() {
      return this._selectedTile || "";
    }

    getLastEvent() {
      return this._lastEvent || "";
    }
  }

  if (!customElements.get("com-company-sac-advancedlandingpage")) {
    customElements.define("com-company-sac-advancedlandingpage", AdvancedLandingPage);
  }
})();
