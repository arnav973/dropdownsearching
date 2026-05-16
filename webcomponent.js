(function () {
  const template = document.createElement("template");

  template.innerHTML = `
    <style>
      :host {
        display: block;
        width: 100%;
        height: 100%;
        font-family: "72", "Segoe UI", Arial, sans-serif;
        --ai-primary: #5b8def;
        --ai-accent: #22c55e;
        --ai-bg: #0f172a;
        --ai-surface: #111827;
        --ai-surface-2: #1f2937;
        --ai-border: rgba(255,255,255,0.08);
        --ai-text: #e5e7eb;
        --ai-muted: #94a3b8;
        --ai-danger: #ef4444;
        --ai-warning: #f59e0b;
        --ai-radius: 16px;
        --ai-shadow: 0 10px 30px rgba(0,0,0,0.25);
      }

      * {
        box-sizing: border-box;
      }

      .wrap {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        gap: 12px;
        background: linear-gradient(180deg, #0b1220 0%, #111827 100%);
        color: var(--ai-text);
        border: 1px solid var(--ai-border);
        border-radius: var(--ai-radius);
        padding: 14px;
        overflow: hidden;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: start;
        gap: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--ai-border);
      }

      .titleBox {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .title {
        font-size: 18px;
        font-weight: 700;
        line-height: 1.2;
      }

      .subtitle {
        font-size: 12px;
        color: var(--ai-muted);
      }

      .badge {
        background: rgba(91,141,239,0.15);
        color: #cfe0ff;
        border: 1px solid rgba(91,141,239,0.35);
        border-radius: 999px;
        padding: 6px 10px;
        font-size: 11px;
        white-space: nowrap;
      }

      .toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .btn {
        border: 1px solid var(--ai-border);
        background: var(--ai-surface-2);
        color: var(--ai-text);
        padding: 9px 12px;
        border-radius: 10px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s ease;
      }

      .btn:hover {
        transform: translateY(-1px);
        border-color: rgba(255,255,255,0.18);
      }

      .btn.primary {
        background: var(--ai-primary);
        color: white;
        border-color: transparent;
      }

      .btn.success {
        background: var(--ai-accent);
        color: white;
        border-color: transparent;
      }

      .grid {
        display: grid;
        grid-template-columns: 1.2fr 0.8fr;
        gap: 12px;
        min-height: 0;
        flex: 1;
      }

      .panel {
        background: rgba(255,255,255,0.03);
        border: 1px solid var(--ai-border);
        border-radius: 14px;
        padding: 12px;
        min-height: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .panelTitle {
        font-size: 13px;
        font-weight: 700;
        color: #dbeafe;
      }

      .promptArea {
        display: flex;
        flex-direction: column;
        gap: 10px;
        min-height: 0;
      }

      textarea {
        width: 100%;
        min-height: 180px;
        resize: none;
        background: #0b1020;
        color: var(--ai-text);
        border: 1px solid var(--ai-border);
        border-radius: 12px;
        padding: 12px;
        font-size: 13px;
        outline: none;
      }

      textarea:focus {
        border-color: var(--ai-primary);
        box-shadow: 0 0 0 3px rgba(91,141,239,0.15);
      }

      .quickActions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .chip {
        padding: 8px 10px;
        border-radius: 999px;
        background: rgba(255,255,255,0.04);
        border: 1px solid var(--ai-border);
        font-size: 11px;
        color: var(--ai-text);
        cursor: pointer;
      }

      .statusBar {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: center;
        font-size: 11px;
        color: var(--ai-muted);
        border-top: 1px solid var(--ai-border);
        padding-top: 8px;
      }

      .statusLeft, .statusRight {
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;
      }

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--ai-accent);
        display: inline-block;
      }

      .output {
        flex: 1;
        min-height: 0;
        overflow: auto;
        background: #0b1020;
        border: 1px solid var(--ai-border);
        border-radius: 12px;
        padding: 12px;
        white-space: pre-wrap;
        font-size: 12px;
        line-height: 1.5;
      }

      .jsonBox {
        flex: 1;
        min-height: 0;
        overflow: auto;
        background: #09111f;
        border: 1px solid var(--ai-border);
        border-radius: 12px;
        padding: 12px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        font-size: 11px;
        color: #cbd5e1;
        white-space: pre-wrap;
      }

      .small {
        font-size: 11px;
        color: var(--ai-muted);
      }

      .hidden {
        display: none !important;
      }

      @media (max-width: 900px) {
        .grid {
          grid-template-columns: 1fr;
        }
      }
    </style>

    <div class="wrap">
      <div class="header" id="header">
        <div class="titleBox">
          <div class="title" id="title">AI Planning Assistant</div>
          <div class="subtitle" id="subtitle">Ask for planning insights, measures, dimensions, and improvements</div>
        </div>
        <div class="badge">Advanced Widget</div>
      </div>

      <div class="toolbar">
        <button class="btn primary" id="runBtn">Run Prompt</button>
        <button class="btn" id="clearBtn">Clear</button>
        <button class="btn success" id="simulateBtn">Simulate</button>
        <button class="btn" id="copyBtn">Copy Output</button>
      </div>

      <div class="grid">
        <div class="panel">
          <div class="panelTitle">Prompt Builder</div>
          <div class="promptArea">
            <textarea id="promptInput" placeholder="Example: Add a measure GrossMargin = Revenue - COGS"></textarea>
            <div class="quickActions">
              <div class="chip" data-prompt="Add a new measure GrossMargin = Revenue - COGS in FinancePlan2025">Add Measure</div>
              <div class="chip" data-prompt="Suggest a new dimension for sales region planning with hierarchy">Add Dimension</div>
              <div class="chip" data-prompt="Analyze the planning model and propose improvements for performance and usability">Improve Model</div>
              <div class="chip" data-prompt="Create forecast logic for Q4 based on Q1-Q3 actuals">Forecast Logic</div>
            </div>
          </div>
        </div>

        <div class="panel">
          <div class="panelTitle">Agent Output</div>
          <div class="output" id="output">No output yet.</div>
          <div class="panelTitle">Structured Action JSON</div>
          <div class="jsonBox" id="jsonBox">{
  "action": null
}</div>
        </div>
      </div>

      <div class="statusBar" id="statusBar">
        <div class="statusLeft">
          <span><span class="dot"></span> Status: <span id="statusText">Ready</span></span>
          <span>Mode: <span id="modeText">Simulation</span></span>
        </div>
        <div class="statusRight">
          <span id="endpointText">Endpoint: not configured</span>
        </div>
      </div>
    </div>
  `;

  class AdvancedAIPlanningWidget extends HTMLElement {
    constructor() {
      super();
      this._shadowRoot = this.attachShadow({ mode: "open" });
      this._shadowRoot.appendChild(template.content.cloneNode(true));

      this._props = {
        title: "AI Planning Assistant",
        subtitle: "Ask for planning insights, measures, dimensions, and improvements",
        themeMode: "dark",
        apiBaseUrl: "https://your-api.example.com",
        apiPath: "/agent/planning",
        authToken: "",
        placeholder: "Example: Add a measure GrossMargin = Revenue - COGS",
        defaultPrompt: "",
        primaryColor: "#5b8def",
        accentColor: "#22c55e",
        borderRadius: 16,
        showHeader: true,
        showStatusBar: true,
        allowSimulation: true,
        compactMode: false
      };

      this._elements = {};
    }

    connectedCallback() {
      this._cacheDom();
      this._bindEvents();
      this._render();
    }

    _cacheDom() {
      const root = this._shadowRoot;
      this._elements = {
        header: root.getElementById("header"),
        title: root.getElementById("title"),
        subtitle: root.getElementById("subtitle"),
        runBtn: root.getElementById("runBtn"),
        clearBtn: root.getElementById("clearBtn"),
        simulateBtn: root.getElementById("simulateBtn"),
        copyBtn: root.getElementById("copyBtn"),
        promptInput: root.getElementById("promptInput"),
        output: root.getElementById("output"),
        jsonBox: root.getElementById("jsonBox"),
        statusBar: root.getElementById("statusBar"),
        statusText: root.getElementById("statusText"),
        modeText: root.getElementById("modeText"),
        endpointText: root.getElementById("endpointText"),
        chips: Array.from(root.querySelectorAll(".chip")),
        wrap: root.querySelector(".wrap")
      };
    }

    _bindEvents() {
      this._elements.runBtn.addEventListener("click", () => this.runPrompt());
      this._elements.clearBtn.addEventListener("click", () => this.clearOutput());
      this._elements.simulateBtn.addEventListener("click", () => this._simulateRun());
      this._elements.copyBtn.addEventListener("click", () => this._copyOutput());

      this._elements.chips.forEach((chip) => {
        chip.addEventListener("click", () => {
          const prompt = chip.getAttribute("data-prompt") || "";
          this.setPrompt(prompt);
          this._fireEvent("onAction", { type: "quickAction", prompt: prompt });
        });
      });
    }

    onCustomWidgetBeforeUpdate(changedProperties) {
      this._props = { ...this._props, ...changedProperties };
    }

    onCustomWidgetAfterUpdate(changedProperties) {
      this._props = { ...this._props, ...changedProperties };
      this._render();
    }

    _render() {
      const el = this._elements;
      if (!el.title) return;

      el.title.textContent = this._props.title;
      el.subtitle.textContent = this._props.subtitle;
      el.promptInput.placeholder = this._props.placeholder;
      if (this._props.defaultPrompt && !el.promptInput.value) {
        el.promptInput.value = this._props.defaultPrompt;
      }

      el.header.classList.toggle("hidden", !this._props.showHeader);
      el.statusBar.classList.toggle("hidden", !this._props.showStatusBar);
      el.simulateBtn.classList.toggle("hidden", !this._props.allowSimulation);

      el.wrap.style.setProperty("--ai-primary", this._props.primaryColor);
      el.wrap.style.setProperty("--ai-accent", this._props.accentColor);
      el.wrap.style.setProperty("--ai-radius", `${this._props.borderRadius}px`);

      if (this._props.compactMode) {
        el.promptInput.style.minHeight = "110px";
      } else {
        el.promptInput.style.minHeight = "180px";
      }

      if (this._props.themeMode === "light") {
        el.wrap.style.setProperty("--ai-bg", "#f8fafc");
        el.wrap.style.setProperty("--ai-surface", "#ffffff");
        el.wrap.style.setProperty("--ai-surface-2", "#eef2ff");
        el.wrap.style.setProperty("--ai-border", "rgba(0,0,0,0.08)");
        el.wrap.style.setProperty("--ai-text", "#0f172a");
        el.wrap.style.setProperty("--ai-muted", "#475569");
      }

      const endpoint = `${this._props.apiBaseUrl || ""}${this._props.apiPath || ""}`;
      el.endpointText.textContent = `Endpoint: ${endpoint || "not configured"}`;
    }

    setPrompt(prompt) {
      this._elements.promptInput.value = prompt || "";
    }

    clearOutput() {
      this._elements.output.textContent = "No output yet.";
      this._elements.jsonBox.textContent = `{
  "action": null
}`;
      this._setStatus("Ready");
    }

    setApiConfig(config) {
      this._props = { ...this._props, ...config };
      this._render();
    }

    async runPrompt(promptText) {
      const prompt = promptText || this._elements.promptInput.value.trim();
      if (!prompt) {
        this._setStatus("Prompt is empty");
        this._emitError("Prompt is empty");
        return;
      }

      const endpoint = `${this._props.apiBaseUrl || ""}${this._props.apiPath || ""}`;
      if (!this._props.apiBaseUrl) {
        this._setStatus("API not configured, using simulation");
        await this._simulateRun(prompt);
        return;
      }

      this._setStatus("Running");
      this._elements.modeText.textContent = "API";

      const payload = {
        prompt: prompt,
        context: {
          widget: "Advanced AI Planning Widget",
          source: "SAP Analytics Cloud Custom Widget"
        }
      };

      try {
        const headers = {
          "Content-Type": "application/json"
        };

        if (this._props.authToken) {
          headers["Authorization"] = `Bearer ${this._props.authToken}`;
        }

        const response = await fetch(endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }

        const result = await response.json();

        const pretty = typeof result === "string" ? result : JSON.stringify(result, null, 2);
        this._elements.output.textContent = this._extractHumanOutput(result);
        this._elements.jsonBox.textContent = pretty;
        this._setStatus("Completed");
        this._fireEvent("onResult", { result: result, prompt: prompt });
      } catch (err) {
        this._setStatus("Error");
        this._elements.output.textContent = `Request failed.\n\n${err.message}`;
        this._emitError(err.message);
      }
    }

    async _simulateRun(promptArg) {
      const prompt = promptArg || this._elements.promptInput.value.trim();
      if (!prompt) {
        this._setStatus("Prompt is empty");
        return;
      }

      this._setStatus("Simulating");
      this._elements.modeText.textContent = "Simulation";

      const structured = this._buildStructuredAction(prompt);
      const humanOutput = this._buildHumanResponse(structured, prompt);

      await new Promise((resolve) => setTimeout(resolve, 700));

      this._elements.output.textContent = humanOutput;
      this._elements.jsonBox.textContent = JSON.stringify(structured, null, 2);
      this._setStatus("Completed");
      this._fireEvent("onResult", { result: structured, prompt: prompt, simulated: true });
    }

    _buildStructuredAction(prompt) {
      const lower = prompt.toLowerCase();
      let action = "analyze_model";

      if (lower.includes("measure")) action = "create_measure";
      if (lower.includes("dimension")) action = "create_dimension";
      if (lower.includes("forecast")) action = "create_forecast_logic";
      if (lower.includes("improve")) action = "improve_model";

      return {
        action: action,
        model: this._extractModelName(prompt),
        prompt: prompt,
        proposal: {
          name:
            action === "create_measure"
              ? "GrossMargin"
              : action === "create_dimension"
              ? "SalesRegion"
              : action === "create_forecast_logic"
              ? "Q4Forecast"
              : "ModelOptimizationPlan",
          description: "Generated proposal based on prompt",
          formula:
            action === "create_measure"
              ? "[Revenue] - [COGS]"
              : action === "create_forecast_logic"
              ? "FORECAST(Q4) = AVG(Q1,Q2,Q3)"
              : null,
          hierarchy:
            action === "create_dimension"
              ? ["Global", "Region", "Country", "City"]
              : null
        },
        governance: {
          requiresApproval: true,
          environment: "sandbox",
          requestedBy: "SAC Custom Widget"
        }
      };
    }

    _buildHumanResponse(structured, prompt) {
      return [
        `Prompt received: ${prompt}`,
        ``,
        `Recommended action: ${structured.action}`,
        `Model: ${structured.model}`,
        `Approval required: ${structured.governance.requiresApproval ? "Yes" : "No"}`,
        ``,
        `Proposal summary:`,
        `- Name: ${structured.proposal.name}`,
        `- Description: ${structured.proposal.description}`,
        structured.proposal.formula ? `- Formula: ${structured.proposal.formula}` : null,
        structured.proposal.hierarchy ? `- Hierarchy: ${structured.proposal.hierarchy.join(" > ")}` : null,
        ``,
        `Next step: send this structured payload to your middleware, validate it, and then execute against SAC APIs if supported.`
      ].filter(Boolean).join("\n");
    }

    _extractHumanOutput(result) {
      if (typeof result === "string") return result;
      if (result.output) return result.output;
      if (result.message) return result.message;
      return JSON.stringify(result, null, 2);
    }

    _extractModelName(prompt) {
      const match = prompt.match(/in\s+([A-Za-z0-9_-]+)/i);
      return match ? match[1] : "DefaultPlanningModel";
    }

    _copyOutput() {
      const text = this._elements.output.textContent || "";
      navigator.clipboard.writeText(text).then(() => {
        this._setStatus("Output copied");
      }).catch(() => {
        this._setStatus("Copy failed");
      });
    }

    _setStatus(text) {
      this._elements.statusText.textContent = text;
    }

    _emitError(message) {
      this._fireEvent("onError", { message: message });
    }

    _fireEvent(name, detail) {
      this.dispatchEvent(new CustomEvent(name, {
        detail: detail
      }));
    }
  }

  customElements.define(
    "com-yourcompany-sac-advanced-ai-planning-widget",
    AdvancedAIPlanningWidget
  );
})();
