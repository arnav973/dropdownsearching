(function () {
    "use strict";

    if (customElements.get("com-arnav-searchdropdown")) {
        return;
    }

    var template = document.createElement("template");
    template.innerHTML = `
        <style>
            :host {
                display: block;
                width: 100%;
                font-family: Arial, sans-serif;
                box-sizing: border-box;
            }
            .wrapper {
                position: relative;
                width: 100%;
            }
            input {
                width: 100%;
                box-sizing: border-box;
                padding: 8px 32px 8px 10px;
                border: 1px solid #bfbfbf;
                border-radius: 4px;
                font-size: 13px;
                outline: none;
            }
            input:focus {
                border-color: #0a6ed1;
            }
            .clear-btn {
                position: absolute;
                right: 8px;
                top: 50%;
                transform: translateY(-50%);
                cursor: pointer;
                color: #888;
                font-size: 14px;
                display: none;
                user-select: none;
            }
            .dropdown {
                position: fixed;
                background: #fff;
                border: 1px solid #ccc;
                border-radius: 4px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.15);
                max-height: 240px;
                overflow-y: auto;
                display: none;
                z-index: 999999;
                font-size: 13px;
            }
            .item {
                padding: 8px 10px;
                cursor: pointer;
            }
            .item:hover {
                background: #f2f8ff;
            }
            .empty {
                padding: 8px 10px;
                color: #888;
            }
        </style>
        <div class="wrapper">
            <input id="searchInput" type="text" placeholder="Search..." />
            <span id="clearBtn" class="clear-btn">&#10005;</span>
        </div>
    `;

    class SearchDropdown extends HTMLElement {
        constructor() {
            super();

            this.attachShadow({ mode: "open" });
            this.shadowRoot.appendChild(template.content.cloneNode(true));

            this._props = {};
            this._items = [];
            this._selectedKey = "";
            this._selectedText = "";

            this._input = this.shadowRoot.getElementById("searchInput");
            this._clearBtn = this.shadowRoot.getElementById("clearBtn");

            this._dropdown = document.createElement("div");
            this._dropdown.className = "dropdown";
            document.body.appendChild(this._dropdown);
        }

        connectedCallback() {
            var that = this;

            this._input.addEventListener("focus", function () {
                that._renderDropdown(that._input.value || "");
            });

            this._input.addEventListener("input", function () {
                that._toggleClear();
                that._renderDropdown(that._input.value || "");
            });

            this._clearBtn.addEventListener("click", function (e) {
                e.stopPropagation();
                that.clear();
            });

            document.addEventListener("click", this._handleDocumentClick.bind(this), true);
            window.addEventListener("resize", this._repositionDropdown.bind(this));
            window.addEventListener("scroll", this._repositionDropdown.bind(this), true);

            this._toggleClear();
        }

        disconnectedCallback() {
            if (this._dropdown && this._dropdown.parentNode) {
                this._dropdown.parentNode.removeChild(this._dropdown);
            }
        }

        _handleDocumentClick(e) {
            if (!this.contains(e.target) && !this.shadowRoot.contains(e.target) && !this._dropdown.contains(e.target)) {
                this._hideDropdown();
            }
        }

        _toggleClear() {
            this._clearBtn.style.display = this._input.value ? "block" : "none";
        }

        _repositionDropdown() {
            var rect = this.getBoundingClientRect();
            this._dropdown.style.left = rect.left + "px";
            this._dropdown.style.top = rect.bottom + "px";
            this._dropdown.style.width = rect.width + "px";
        }

        _hideDropdown() {
            this._dropdown.style.display = "none";
        }

        _renderDropdown(searchText) {
            var that = this;
            var search = String(searchText || "").toLowerCase();
            var filtered = this._items.filter(function (item) {
                return item.text.toLowerCase().indexOf(search) > -1 || item.key.toLowerCase().indexOf(search) > -1;
            });

            this._dropdown.innerHTML = "";

            if (filtered.length === 0) {
                var empty = document.createElement("div");
                empty.className = "empty";
                empty.textContent = "No results found";
                this._dropdown.appendChild(empty);
            } else {
                filtered.forEach(function (item) {
                    var div = document.createElement("div");
                    div.className = "item";
                    div.textContent = item.text;
                    div.addEventListener("mousedown", function (e) {
                        e.preventDefault();
                        that._selectItem(item);
                    });
                    that._dropdown.appendChild(div);
                });
            }

            this._repositionDropdown();
            this._dropdown.style.display = "block";
        }

        _selectItem(item) {
            this._selectedKey = item.key;
            this._selectedText = item.text;
            this._input.value = item.text;
            this._toggleClear();
            this._hideDropdown();

            this.dispatchEvent(new CustomEvent("onSelectionChange", {
                detail: {
                    key: item.key,
                    text: item.text
                },
                bubbles: true,
                composed: true
            }));
        }

        setData(data) {
            try {
                var parsed = JSON.parse(data || "[]");
                this._items = Array.isArray(parsed) ? parsed.map(function (x) {
                    return {
                        key: String(x.key || ""),
                        text: String(x.text || "")
                    };
                }) : [];
            } catch (e) {
                this._items = [];
                console.error("setData parse error", e);
            }
        }

        getSelectedKey() {
            return this._selectedKey;
        }

        getSelectedText() {
            return this._selectedText;
        }

        clear() {
            this._selectedKey = "";
            this._selectedText = "";
            this._input.value = "";
            this._toggleClear();
            this._hideDropdown();
        }

        selectByKey(key) {
            var match = this._items.find(function (item) {
                return item.key === String(key);
            });

            if (match) {
                this._selectItem(match);
            }
        }

        onCustomWidgetBeforeUpdate(changedProperties) {
            this._props = Object.assign({}, this._props, changedProperties);
        }

        onCustomWidgetAfterUpdate() {
            if (this._props.placeholder !== undefined) {
                this._input.placeholder = this._props.placeholder || "Search...";
            }

            if (this._props.items !== undefined) {
                this.setData(this._props.items);
            }
        }
    }

    customElements.define("com-arnav-searchdropdown", SearchDropdown);
})();
