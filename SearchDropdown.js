
(function () {

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

        .input-wrap {
            position: relative;
            width: 100%;
            box-sizing: border-box;
        }

        .search-box {
        width: 100%;
        height: 38px;
        border: 1px solid #2f3c48;
        border-radius: 6px;
        padding: 0 36px 0 12px;
        box-sizing: border-box;
        cursor: text;
        font-size: 14px;
        font-family: "72", Arial, sans-serif;
        outline: none;
        color: #1f2d3d;
        background: #ffffff;
        box-shadow: none;
        transition: border-color 0.2s ease, background-color 0.2s ease;
    }

        .search-box:hover {
        border-color: #1f2d3d;
        background: #ffffff;
    }
    
    .search-box:focus {
        border: 1px solid #0a6ed1;
        background: #ffffff;
        box-shadow: 0 0 0 1px #0a6ed1;
    }
    
    .search-box::placeholder {
        color: #6a7681;
    }

        .clear-btn {
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
            cursor: pointer;
            font-size: 14px;
            color: #8c9ba5;
            display: none;
            background: none;
            border: none;
            padding: 0;
            line-height: 1;
            width: 16px;
            height: 16px;
        }

        .clear-btn:hover {
            color: #d9212c;
        }

        .clear-btn:focus {
            outline: none;
        }
    </style>

    <div class="input-wrap">
        <input
            class="search-box"
            type="text"
            placeholder="Search..."
            autocomplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded="false"
            aria-haspopup="listbox"
        />
        <button class="clear-btn" type="button" title="Clear">&#x2715;</button>
    </div>
    `;

    class SearchDropdown extends HTMLElement {

        constructor() {
            super();

            this.attachShadow({ mode: "open" });
            this.shadowRoot.appendChild(template.content.cloneNode(true));

            this._props = {};
            this._data = [];
            this._filteredData = [];
            this.selectedKey = "";
            this.selectedText = "";
            this._dropdownEl = null;
            this._isOpen = false;
            this._skipFocus = false;
            this._highlightedIndex = -1;
            this._maxVisibleItems = 500;

            this.searchBox = this.shadowRoot.querySelector(".search-box");
            this.clearBtn = this.shadowRoot.querySelector(".clear-btn");

            this._boundInputClick = null;
            this._boundInputFocus = null;
            this._boundInputEvent = null;
            this._boundKeyDown = null;
            this._boundClear = null;
            this._boundDocClick = null;
            this._boundScroll = null;
            this._boundResize = null;
        }

        connectedCallback() {
            if (this._initialized) {
                return;
            }

            this._initialized = true;

            this._createDropdown();
            this._bindEvents();
            this._syncInputState();
        }

        disconnectedCallback() {
            this._removeGlobalEvents();

            if (this._dropdownEl && this._dropdownEl.parentNode) {
                this._dropdownEl.parentNode.removeChild(this._dropdownEl);
            }

            this._dropdownEl = null;
            this._initialized = false;
        }

        _createDropdown() {
            this._dropdownEl = document.createElement("div");
            this._dropdownEl.setAttribute("role", "listbox");
            this._dropdownEl.style.cssText = [
                "position:fixed",
                "background:#fff",
                "border:1px solid #d9d9d9",
                "border-radius:4px",
                "max-height:250px",
                "overflow-y:auto",
                "display:none",
                "z-index:2147483647",
                "min-width:200px",
                "box-shadow:0 4px 12px rgba(0,0,0,0.18)",
                "font-family:Arial,sans-serif",
                "font-size:13px",
                "box-sizing:border-box"
            ].join(";");

            document.body.appendChild(this._dropdownEl);
        }

        _bindEvents() {
            var that = this;

            this._boundInputClick = function (e) {
                e.stopPropagation();
                that._skipFocus = true;

                if (that._isOpen) {
                    that._closeDropdown();
                } else {
                    that._applyFilter(that.searchBox.value);
                }
            };

            this._boundInputFocus = function () {
                if (that._skipFocus) {
                    that._skipFocus = false;
                    return;
                }

                that._applyFilter(that.searchBox.value);
            };

            this._boundInputEvent = function () {
                that._syncInputState();
                that._applyFilter(that.searchBox.value);
            };

            this._boundKeyDown = function (e) {
                if (e.key === "Escape") {
                    that._closeDropdown();
                    return;
                }

                if (e.key === "ArrowDown") {
                    e.preventDefault();
                    if (!that._isOpen) {
                        that._applyFilter(that.searchBox.value);
                    } else {
                        that._moveHighlight(1);
                    }
                    return;
                }

                if (e.key === "ArrowUp") {
                    e.preventDefault();
                    if (!that._isOpen) {
                        that._applyFilter(that.searchBox.value);
                    } else {
                        that._moveHighlight(-1);
                    }
                    return;
                }

                if (e.key === "Enter") {
                    if (that._isOpen && that._highlightedIndex > -1 && that._filteredData[that._highlightedIndex]) {
                        e.preventDefault();
                        that._selectItem(that._filteredData[that._highlightedIndex]);
                    }
                }
            };

            this._boundClear = function (e) {
                e.preventDefault();
                e.stopPropagation();
                that.clear();
                that.searchBox.focus();
                that._applyFilter("");
            };

            this._boundDocClick = function (e) {
                if (!that._isOpen) {
                    return;
                }

                if (
                    e.target !== that.searchBox &&
                    e.target !== that.clearBtn &&
                    !that._dropdownEl.contains(e.target)
                ) {
                    that._closeDropdown();
                }
            };

            this._boundScroll = function () {
                if (that._isOpen) {
                    that._repositionDropdown();
                }
            };

            this._boundResize = function () {
                if (that._isOpen) {
                    that._repositionDropdown();
                }
            };

            this.searchBox.addEventListener("click", this._boundInputClick);
            this.searchBox.addEventListener("focus", this._boundInputFocus);
            this.searchBox.addEventListener("input", this._boundInputEvent);
            this.searchBox.addEventListener("keydown", this._boundKeyDown);
            this.clearBtn.addEventListener("mousedown", this._boundClear);

            document.addEventListener("click", this._boundDocClick, true);
            window.addEventListener("scroll", this._boundScroll, true);
            window.addEventListener("resize", this._boundResize);
        }

        _removeGlobalEvents() {
            if (this.searchBox && this._boundInputClick) {
                this.searchBox.removeEventListener("click", this._boundInputClick);
                this.searchBox.removeEventListener("focus", this._boundInputFocus);
                this.searchBox.removeEventListener("input", this._boundInputEvent);
                this.searchBox.removeEventListener("keydown", this._boundKeyDown);
            }

            if (this.clearBtn && this._boundClear) {
                this.clearBtn.removeEventListener("mousedown", this._boundClear);
            }

            if (this._boundDocClick) {
                document.removeEventListener("click", this._boundDocClick, true);
            }

            if (this._boundScroll) {
                window.removeEventListener("scroll", this._boundScroll, true);
            }

            if (this._boundResize) {
                window.removeEventListener("resize", this._boundResize);
            }
        }

        _syncInputState() {
            var hasValue = !!this.searchBox.value;
            this.clearBtn.style.display = hasValue ? "block" : "none";
        }

        _normalizeData(data) {
            var normalized = [];
            var i;

            if (!Array.isArray(data)) {
                return normalized;
            }

            for (i = 0; i < data.length; i++) {
                var row = data[i] || {};
                normalized.push({
                    key: row.key !== undefined && row.key !== null ? String(row.key) : "",
                    text: row.text !== undefined && row.text !== null ? String(row.text) : ""
                });
            }

            return normalized;
        }

        _escapeHtml(text) {
            return String(text)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
        }

        _repositionDropdown() {
            if (!this._dropdownEl) {
                return;
            }

            var box = this.searchBox.getBoundingClientRect();
            var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
            var spaceBelow = viewportHeight - box.bottom;
            var desiredHeight = 250;
            var openUpward = spaceBelow < 180 && box.top > desiredHeight;

            this._dropdownEl.style.left = box.left + "px";
            this._dropdownEl.style.width = box.width + "px";

            if (openUpward) {
                this._dropdownEl.style.top = "auto";
                this._dropdownEl.style.bottom = (viewportHeight - box.top) + "px";
            } else {
                this._dropdownEl.style.bottom = "auto";
                this._dropdownEl.style.top = box.bottom + "px";
            }
        }

        _openDropdown(data) {
            this._filteredData = Array.isArray(data) ? data.slice(0) : [];
            this._highlightedIndex = this._filteredData.length > 0 ? 0 : -1;

            this._renderItems(this._filteredData);
            this._repositionDropdown();

            this._dropdownEl.style.display = "block";
            this._isOpen = true;
            this.searchBox.setAttribute("aria-expanded", "true");
        }

        _closeDropdown() {
            if (!this._dropdownEl) {
                return;
            }

            this._dropdownEl.style.display = "none";
            this._dropdownEl.innerHTML = "";
            this._isOpen = false;
            this._highlightedIndex = -1;
            this.searchBox.setAttribute("aria-expanded", "false");
        }

        _applyFilter(text) {
            var search = String(text || "").toLowerCase();
            var result = [];
            var i;

            for (i = 0; i < this._data.length; i++) {
                var item = this._data[i];
                var itemText = item.text.toLowerCase();
                var itemKey = item.key.toLowerCase();

                if (
                    search === "" ||
                    itemText.indexOf(search) > -1 ||
                    itemKey.indexOf(search) > -1
                ) {
                    result.push(item);
                }
            }

            this._openDropdown(result);
        }

        _renderItems(items) {
            var that = this;
            var html = "";
            var displayItems = items.slice(0, this._maxVisibleItems);
            var i;

            this._dropdownEl.innerHTML = "";

            if (!displayItems.length) {
                var noData = document.createElement("div");
                noData.style.cssText = "padding:10px 12px;color:#8c9ba5;text-align:center;";
                noData.textContent = "No results found";
                this._dropdownEl.appendChild(noData);
                return;
            }

            for (i = 0; i < displayItems.length; i++) {
                var item = displayItems[i];
                var selectedStyle = i === this._highlightedIndex
                    ? "background:#e6f0ff;color:#0a6ed1;"
                    : "background:#fff;color:#1d2d3e;";

                html +=
                    '<div ' +
                    'class="sd-item" ' +
                    'data-index="' + i + '" ' +
                    'data-key="' + this._escapeHtml(item.key) + '" ' +
                    'data-text="' + this._escapeHtml(item.text) + '" ' +
                    'role="option" ' +
                    'style="' +
                        'padding:8px 12px;' +
                        'cursor:pointer;' +
                        'border-bottom:1px solid #f5f5f5;' +
                        selectedStyle +
                    '">' +
                    this._escapeHtml(item.text) +
                    '</div>';
            }

            if (items.length > this._maxVisibleItems) {
                html +=
                    '<div style="padding:8px 12px;color:#8c9ba5;border-top:1px solid #f0f0f0;background:#fafafa;">' +
                    'Showing first ' + this._maxVisibleItems + ' results. Keep typing to narrow down.' +
                    '</div>';
            }

            this._dropdownEl.innerHTML = html;

            var rows = this._dropdownEl.querySelectorAll(".sd-item");

            for (i = 0; i < rows.length; i++) {
                rows[i].addEventListener("mouseover", function () {
                    var idx = parseInt(this.getAttribute("data-index"), 10);
                    that._highlightedIndex = idx;
                    that._refreshHighlight();
                });

                rows[i].addEventListener("mousedown", function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    var idx = parseInt(this.getAttribute("data-index"), 10);
                    if (!isNaN(idx) && that._filteredData[idx]) {
                        that._selectItem(that._filteredData[idx]);
                    }
                });
            }
        }

        _refreshHighlight() {
            var rows = this._dropdownEl.querySelectorAll(".sd-item");
            var i;

            for (i = 0; i < rows.length; i++) {
                if (i === this._highlightedIndex) {
                    rows[i].style.background = "#e6f0ff";
                    rows[i].style.color = "#0a6ed1";
                    rows[i].scrollIntoView({ block: "nearest" });
                } else {
                    rows[i].style.background = "#fff";
                    rows[i].style.color = "#1d2d3e";
                }
            }
        }

        _moveHighlight(step) {
            if (!this._filteredData.length) {
                return;
            }

            this._highlightedIndex += step;

            if (this._highlightedIndex < 0) {
                this._highlightedIndex = this._filteredData.length - 1;
            }

            if (this._highlightedIndex >= this._filteredData.length) {
                this._highlightedIndex = 0;
            }

            this._refreshHighlight();
        }

        _selectItem(item) {
            this.searchBox.value = item.text;
            this.selectedKey = item.key;
            this.selectedText = item.text;
            this._syncInputState();
            this._closeDropdown();

            this.dispatchEvent(
                new CustomEvent("onSelectionChange", {
                    detail: {
                        key: item.key,
                        text: item.text
                    },
                    bubbles: true,
                    composed: true
                })
            );
        }

        setData(data) {
            try {
                if (!data || data === "") {
                    this._data = [];
                    this.clear();
                    return;
                }

                var parsed = JSON.parse(data);
                this._data = this._normalizeData(parsed);

                console.log("SearchDropdown setData success: " + this._data.length + " records loaded");

                if (this._isOpen) {
                    this._applyFilter(this.searchBox.value);
                }

            } catch (e) {
                console.log("SearchDropdown setData parse error: " + e.message);
            }
        }

        getSelectedKey() {
            return this.selectedKey || "";
        }

        getSelectedText() {
            return this.selectedText || "";
        }

        clear() {
            this.searchBox.value = "";
            this.selectedKey = "";
            this.selectedText = "";
            this._syncInputState();
            this._closeDropdown();

            this.dispatchEvent(
                new CustomEvent("onSelectionChange", {
                    detail: {
                        key: "",
                        text: ""
                    },
                    bubbles: true,
                    composed: true
                })
            );
        }

        selectByKey(key) {
            var lookupKey = key !== undefined && key !== null ? String(key) : "";
            var i;

            for (i = 0; i < this._data.length; i++) {
                if (this._data[i].key === lookupKey) {
                    this._selectItem(this._data[i]);
                    return true;
                }
            }

            return false;
        }

        onCustomWidgetBeforeUpdate(changedProperties) {
            for (var prop in changedProperties) {
                if (Object.prototype.hasOwnProperty.call(changedProperties, prop)) {
                    this._props[prop] = changedProperties[prop];
                }
            }
        }

        onCustomWidgetAfterUpdate() {
            if (this._props.placeholder !== undefined) {
                this.searchBox.placeholder = this._props.placeholder || "Search...";
            }

            if (this._props.items !== undefined) {
                try {
                    var parsed = JSON.parse(this._props.items || "[]");
                    this._data = this._normalizeData(parsed);

                    if (this._isOpen) {
                        this._applyFilter(this.searchBox.value);
                    }
                } catch (e) {
                    console.log("Items Property Error: " + e.message);
                }
            }
        }
    }

    customElements.define("com-arnav-searchdropdown", SearchDropdown);

})();

