(function () {

    var template = document.createElement("template");

    template.innerHTML = `
    <style>

        :host {
            display: block;
            width: 100%;
            font-family: "72", "Segoe UI", Arial, sans-serif;
        }

        * {
            box-sizing: border-box;
        }

        .container {
            position: relative;
            width: 100%;
        }

        .search-wrapper {
            display: flex;
            align-items: center;
            border: 1px solid #d9d9d9;
            border-radius: 4px;
            background: #ffffff;
            height: 36px;
            padding: 0 8px;
            transition: border-color 0.2s;
        }

        .search-wrapper:focus-within {
            border-color: #0a6ed1;
            box-shadow: 0 0 0 2px rgba(10,110,209,0.12);
        }

        .search-box {
            flex: 1;
            border: none;
            outline: none;
            font-size: 13px;
            color: #1d2d3e;
            background: transparent;
            height: 100%;
            min-width: 0;
        }

        .search-box::placeholder {
            color: #8c9ba5;
            font-size: 12px;
        }

        .clear-btn {
            background: none;
            border: none;
            cursor: pointer;
            color: #8c9ba5;
            font-size: 14px;
            padding: 0 2px;
            display: none;
            line-height: 1;
            flex-shrink: 0;
        }

        .clear-btn:hover {
            color: #d9261c;
        }

        .dropdown {
            position: absolute;
            top: 40px;
            left: 0;
            right: 0;
            background: #ffffff;
            border: 1px solid #d9d9d9;
            border-radius: 4px;
            max-height: 260px;
            overflow-y: auto;
            display: none;
            z-index: 99999;
            box-shadow: 0 4px 16px rgba(0,0,0,0.14);
        }

        .count-badge {
            padding: 5px 10px;
            font-size: 10px;
            color: #8c9ba5;
            background: #f5f6f7;
            border-bottom: 1px solid #eeeeee;
            position: sticky;
            top: 0;
        }

        .item {
            padding: 9px 12px;
            cursor: pointer;
            font-size: 13px;
            color: #1d2d3e;
            border-bottom: 1px solid #f5f5f5;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .item:last-child {
            border-bottom: none;
        }

        .item:hover {
            background: #e8f0fd;
            color: #0a6ed1;
        }

        .item.selected {
            background: #e8f0fd;
            color: #0a6ed1;
            font-weight: 600;
        }

        .no-data {
            padding: 12px;
            font-size: 12px;
            color: #8c9ba5;
            text-align: center;
        }

    </style>

    <div class="container">
        <div class="search-wrapper">
            <input
                class="search-box"
                type="text"
                placeholder="Search..."
                autocomplete="off"
            />
            <button class="clear-btn" title="Clear">&#x2715;</button>
        </div>
        <div class="dropdown"></div>
    </div>
    `;

    class SearchDropdown extends HTMLElement {

        constructor() {

            super();

            this.attachShadow({ mode: "open" });

            this.shadowRoot.appendChild(
                template.content.cloneNode(true)
            );

            this._props        = {};
            this._data         = [];
            this._selectedKey  = "";
            this._selectedText = "";
            this._isOpen       = false;

            this.searchBox = this.shadowRoot.querySelector(".search-box");
            this.dropdown  = this.shadowRoot.querySelector(".dropdown");
            this.clearBtn  = this.shadowRoot.querySelector(".clear-btn");
        }

        connectedCallback() {

            var that = this;

            // Focus → show all items
            that.searchBox.addEventListener("focus", function () {
                that._showDropdown();
                that._renderItems(that._data);
            });

            // Keyup → filter live
            that.searchBox.addEventListener("input", function () {
                var val = that.searchBox.value;
                that.clearBtn.style.display = val.length > 0 ? "block" : "none";
                if (val.length === 0) {
                    that._renderItems(that._data);
                } else {
                    that._filterData(val);
                }
                that._showDropdown();
            });

            // Clear button
            that.clearBtn.addEventListener("click", function (e) {
                e.stopPropagation();
                that.clear();
            });

            // Outside click closes dropdown
            document.addEventListener("click", function (e) {
                if (!that.contains(e.target)) {
                    that._hideDropdown();
                }
            });

            // ESC key closes dropdown
            that.searchBox.addEventListener("keydown", function (e) {
                if (e.key === "Escape") {
                    that._hideDropdown();
                }
            });
        }

        // ── Show dropdown ─────────────────────────────────────────
        _showDropdown() {
            this.dropdown.style.display = "block";
            this._isOpen = true;
        }

        // ── Hide dropdown ─────────────────────────────────────────
        _hideDropdown() {
            this.dropdown.style.display = "none";
            this._isOpen = false;
        }

        // ── Filter data by search text ────────────────────────────
        _filterData(text) {

            var search = (text || "").toLowerCase().trim();
            var result = [];

            for (var i = 0; i < this._data.length; i++) {

                var itemText = String(
                    this._data[i].text || ""
                ).toLowerCase();

                var itemKey = String(
                    this._data[i].key || ""
                ).toLowerCase();

                if (
                    itemText.indexOf(search) > -1 ||
                    itemKey.indexOf(search) > -1
                ) {
                    result.push(this._data[i]);
                }
            }

            this._renderItems(result);
        }

        // ── Render dropdown items ─────────────────────────────────
        _renderItems(data) {

            var that  = this;
            var items = data || this._data;

            if (!items || items.length === 0) {
                that.dropdown.innerHTML =
                    '<div class="no-data">No results found</div>';
                return;
            }

            var html =
                '<div class="count-badge">' +
                items.length +
                " item(s)" +
                "</div>";

            for (var i = 0; i < items.length; i++) {

                var isSelected =
                    items[i].key === that._selectedKey
                        ? " selected"
                        : "";

                var safeText = String(items[i].text || "")
                    .replace(/"/g, "&quot;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;");

                var safeKey = String(items[i].key || "")
                    .replace(/"/g, "&quot;");

                html +=
                    '<div class="item' +
                    isSelected +
                    '" data-key="' +
                    safeKey +
                    '" data-text="' +
                    safeText +
                    '">' +
                    safeText +
                    "</div>";
            }

            that.dropdown.innerHTML = html;

            var rows = that.dropdown.querySelectorAll(".item");

            for (var j = 0; j < rows.length; j++) {

                rows[j].addEventListener("click", function (e) {

                    e.stopPropagation();

                    var key  = this.getAttribute("data-key");
                    var text = this.getAttribute("data-text");

                    that._selectedKey  = key;
                    that._selectedText = text;

                    that.searchBox.value        = text;
                    that.clearBtn.style.display = "block";

                    that._hideDropdown();

                    that.dispatchEvent(
                        new CustomEvent("onSelectionChange", {
                            detail: { key: key, text: text },
                            bubbles: true,
                            composed: true
                        })
                    );

                    console.log(
                        "SearchDropdown → Selected key:",
                        key,
                        "text:",
                        text
                    );
                });
            }
        }

        // ── SAC Widget Lifecycle ──────────────────────────────────
        onCustomWidgetBeforeUpdate(changedProperties) {
            for (var prop in changedProperties) {
                this._props[prop] = changedProperties[prop];
            }
        }

        onCustomWidgetAfterUpdate() {

            if (this._props.placeholder) {
                this.searchBox.placeholder = this._props.placeholder;
            }

            if (this._props.items) {
                try {
                    var parsed = JSON.parse(this._props.items);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        this._data = parsed;
                        console.log(
                            "SearchDropdown items from props:",
                            this._data.length
                        );
                    }
                } catch (e) {
                    console.log(
                        "SearchDropdown props parse error:",
                        e
                    );
                }
            }
        }

        // ── Public API (SAC Script callable) ─────────────────────

        // Called from SAC onInitialization to load members
        setData(jsonString) {

            try {

                if (
                    jsonString === null ||
                    jsonString === undefined ||
                    jsonString === ""
                ) {
                    console.log("SearchDropdown setData: empty input");
                    return;
                }

                var parsed = JSON.parse(jsonString);

                if (!Array.isArray(parsed)) {
                    console.log(
                        "SearchDropdown setData: input is not an array"
                    );
                    return;
                }

                this._data = parsed;

                console.log(
                    "SearchDropdown setData success:",
                    this._data.length,
                    "records loaded"
                );

                // Pre-render so items are ready when user clicks
                this._renderItems(this._data);

            } catch (e) {
                console.log(
                    "SearchDropdown setData parse error:",
                    e.message
                );
            }
        }

        // Get selected key
        getSelectedKey() {
            return this._selectedKey || "";
        }

        // Get selected text / description
        getSelectedText() {
            return this._selectedText || "";
        }

        // Clear selection and input
        clear() {
            this._selectedKey  = "";
            this._selectedText = "";
            this.searchBox.value        = "";
            this.clearBtn.style.display = "none";
            this._hideDropdown();
        }

        // Programmatically select by key
        selectByKey(key) {

            for (var i = 0; i < this._data.length; i++) {

                if (this._data[i].key === key) {

                    this._selectedKey  = key;
                    this._selectedText = this._data[i].text;

                    this.searchBox.value        = this._data[i].text;
                    this.clearBtn.style.display = "block";

                    console.log(
                        "SearchDropdown selectByKey:",
                        key
                    );

                    this.dispatchEvent(
                        new CustomEvent("onSelectionChange", {
                            detail: {
                                key: key,
                                text: this._data[i].text
                            },
                            bubbles: true,
                            composed: true
                        })
                    );

                    break;
                }
            }
        }
    }

    customElements.define(
        "com-arnav-searchdropdown",
        SearchDropdown
    );

})();
