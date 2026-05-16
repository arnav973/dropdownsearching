(function () {
  let template = document.createElement("template");
  template.innerHTML = `
    <form id="form" style="font-family: Arial, sans-serif; padding: 10px;">
      <h3>Advanced AI Planning Widget Settings</h3>

      <label>Title</label><br />
      <input id="title" type="text" style="width: 100%; margin-bottom: 8px;" /><br />

      <label>Subtitle</label><br />
      <input id="subtitle" type="text" style="width: 100%; margin-bottom: 8px;" /><br />

      <label>API Base URL</label><br />
      <input id="apiBaseUrl" type="text" style="width: 100%; margin-bottom: 8px;" /><br />

      <label>API Path</label><br />
      <input id="apiPath" type="text" style="width: 100%; margin-bottom: 8px;" /><br />

      <label>Primary Color</label><br />
      <input id="primaryColor" type="color" style="width: 100%; margin-bottom: 8px;" /><br />

      <label>Accent Color</label><br />
      <input id="accentColor" type="color" style="width: 100%; margin-bottom: 8px;" /><br />
    </form>
  `;

  class AdvancedAIPlanningWidgetStyling extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
      this._bind();
    }

    _bind() {
      ["title", "subtitle", "apiBaseUrl", "apiPath", "primaryColor", "accentColor"].forEach((id) => {
        this.shadowRoot.getElementById(id).addEventListener("input", () => {
          this.dispatchEvent(new CustomEvent("propertiesChanged", {
            detail: {
              properties: {
                [id]: this.shadowRoot.getElementById(id).value
              }
            }
          }));
        });
      });
    }

    set value(v) {
      if (!v) return;
      Object.keys(v).forEach((key) => {
        const el = this.shadowRoot.getElementById(key);
        if (el) el.value = v[key];
      });
    }
  }

  customElements.define("com-yourcompany-sac-advanced-ai-planning-widget-styling", AdvancedAIPlanningWidgetStyling);
})();
