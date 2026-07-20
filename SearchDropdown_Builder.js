(function () {
    "use strict";

    if (customElements.get("com-arnav-searchdropdown-builder")) {
        return;
    }

    var template = document.createElement("template");
    template.innerHTML = `
        <style>
            :host {
                display: block;
                font-family: Arial, sans-serif;
                padding: 10px;
                box-sizing: border-box;
            }
            .row {
                margin-bottom: 10px;
            }
            label {
                display: block;
                margin-bottom: 4px;
                font-size: 12px;
                color: #333;
            }
            input {
                width: 100%;
                box-sizing: border-box;
                padding: 6px 8px;
                border: 1px solid #ccc;
                border-radius: 4px;
                font-size: 13px;
            }
        </style>
        <div class="row">
            <label for="placeholder">Placeholder</label>
            <input id="placeholder" type="text" />
        </div>
    `;

    class SearchDropdownBuilder extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: "open" });
            this.shadowRoot.appendChild(template.content.cloneNode(true));

            this._placeholderInput = this.shadowRoot.getElementById("placeholder");
        }

        connectedCallback() {
            var that = this;

            this._placeholderInput.addEventListener("input", function () {
                that.dispatchEvent(new CustomEvent("propertiesChanged", {
                    detail: {
                        properties: {
                            placeholder: that._placeholderInput.value
                        }
                    }
                }));
            });
        }

        set placeholder(value) {
            if (this._placeholderInput) {
                this._placeholderInput.value = value || "";
            }
        }

        get placeholder() {
            return this._placeholderInput ? this._placeholderInput.value : "";
        }
    }

    customElements.define("com-arnav-searchdropdown-builder", SearchDropdownBuilder);
})();
