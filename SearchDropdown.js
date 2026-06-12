(function () {

var template = document.createElement("template");

template.innerHTML = `
<style>
:host {
    display: block;
    width: 100%;
    font-family: Arial, sans-serif;
}
.search-box {
    width: 100%;
    height: 36px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    padding: 0 10px;
    box-sizing: border-box;
    cursor: pointer;
    font-size: 13px;
    outline: none;
}
.search-box:focus {
    border-color: #0a6ed1;
    box-shadow: 0 0 0 2px rgba(10,110,209,0.12);
}
</style>
<div>
    <input class="search-box" type="text" placeholder="Search..." autocomplete="off" />
</div>
`;

class SearchDropdown extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this._props       = {};
        this._data        = [];
        this.selectedKey  = "";
        this.selectedText = "";
        this._dropdownEl  = null;
        this._isOpen      = false;
        this.searchBox    = this.shadowRoot.querySelector(".search-box");
    }

    connectedCallback() {

        var that = this;

        // Create dropdown div on document.body — escapes all SAC overflow clipping
        that._dropdownEl = document.createElement("div");
        that._dropdownEl.style.cssText = [
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
            "font-size:13px"
        ].join(";");

        document.body.appendChild(that._dropdownEl);

        // Click on input
        that.searchBox.addEventListener("click", function (e) {
            e.stopPropagation();
            if (that._isOpen) {
                that._closeDropdown();
            } else {
                that._openDropdown(that._data);
            }
        });

        // Focus on input
        that.searchBox.addEventListener("focus", function () {
            that._openDropdown(that._data);
        });

        // Type to filter
        that.searchBox.addEventListener("input", function () {
            var val = that.searchBox.value;
            if (val === "") {
                that._openDropdown(that._data);
            } else {
                that._filterData(val);
            }
        });

        // ESC to close
        that.searchBox.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
                that._closeDropdown();
            }
        });

        // Click outside to close
        document.addEventListener("click", function (e) {
            if (
                that._isOpen &&
                e.target !== that.searchBox &&
                !that._dropdownEl.contains(e.target)
            ) {
                that._closeDropdown();
            }
        });
    }

    disconnectedCallback() {
        // Clean up dropdown from body when widget removed
        if (this._dropdownEl && this._dropdownEl.parentNode) {
            this._dropdownEl.parentNode.removeChild(this._dropdownEl);
        }
    }

    _openDropdown(data) {

        var box = this.searchBox.getBoundingClientRect();

        this._dropdownEl.style.top     = box.bottom + "px";
        this._dropdownEl.style.left    = box.left   + "px";
        this._dropdownEl.style.width   = box.width  + "px";
        this._dropdownEl.style.display = "block";
        this._isOpen = true;

        this._renderItems(data);
    }

    _closeDropdown() {
        this._dropdownEl.style.display = "none";
        this._isOpen = false;
    }

    _filterData(text) {

        var search = (text || "").toLowerCase();
        var result = [];
        var i      = 0;

        for (i = 0; i < this._data.length; i++) {

            var itemText = String(this._data[i].text || "").toLowerCase();
            var itemKey  = String(this._data[i].key  || "").toLowerCase();

            if (
                itemText.indexOf(search) > -1 ||
                itemKey.indexOf(search)  > -1
            ) {
                result.push(this._data[i]);
            }
        }

        this._openDropdown(result);
    }

    _renderItems(data) {

        var that  = this;
        var items = data || this._data;
        var i     = 0;

        that._dropdownEl.innerHTML = "";

        if (!items || items.length === 0) {
            var noData = document.createElement("div");
            noData.style.cssText = "padding:10px 12px;color:#8c9ba5;text-align:center;";
            noData.textContent   = "No results found";
            that._dropdownEl.appendChild(noData);
            return;
        }

        for (i = 0; i < items.length; i++) {

            var row = document.createElement("div");

            row.style.cssText = [
                "padding:8px 12px",
                "cursor:pointer",
                "border-bottom:1px solid #f5f5f5",
                "color:#1d2d3e"
            ].join(";");

            row.textContent = String(items[i].text || "");

            row.setAttribute("data-key",  String(items[i].key  || ""));
            row.setAttribute("data-text", String(items[i].text || ""));

            row.addEventListener("mouseover", function () {
                this.style.background = "#e6f0ff";
                this.style.color      = "#0a6ed1";
            });

            row.addEventListener("mouseout", function () {
                this.style.background = "#fff";
                this.style.color      = "#1d2d3e";
            });

            row.addEventListener("mousedown", function (e) {

                // mousedown before blur — prevent close
                e.preventDefault();
                e.stopPropagation();

                var key  = this.getAttribute("data-key");
                var text = this.getAttribute("data-text");

                that.searchBox.value  = text;
                that.selectedKey      = key;
                that.selectedText     = text;

                that._closeDropdown();

                console.log(
                    "SearchDropdown selected: key=" + key +
                    " text=" + text
                );

                that.dispatchEvent(
                    new CustomEvent("onSelectionChange", {
                        detail:   { key: key, text: text },
                        bubbles:  true,
                        composed: true
                    })
                );
            });

            that._dropdownEl.appendChild(row);
        }
    }

    setData(data) {

        try {

            if (!data || data === "") {
                console.log("SearchDropdown setData: empty data");
                return;
            }

            var parsed = JSON.parse(data);

            if (!Array.isArray(parsed)) {
                console.log("SearchDropdown setData: not an array");
                return;
            }

            this._data = parsed;

            console.log(
                "SearchDropdown setData success: " +
                this._data.length +
                " records loaded"
            );

        } catch (e) {
            console.log("SearchDropdown setData parse error: " + e.message);
        }
    }

    getSelectedKey()  { return this.selectedKey  || ""; }
    getSelectedText() { return this.selectedText || ""; }

    clear() {
        this.searchBox.value = "";
        this.selectedKey     = "";
        this.selectedText    = "";
        this._closeDropdown();
    }

    selectByKey(key) {

        var i = 0;

        for (i = 0; i < this._data.length; i++) {

            if (this._data[i].key === key) {

                this.searchBox.value = this._data[i].text;
                this.selectedKey     = key;
                this.selectedText    = this._data[i].text;

                this.dispatchEvent(
                    new CustomEvent("onSelectionChange", {
                        detail:   { key: key, text: this._data[i].text },
                        bubbles:  true,
                        composed: true
                    })
                );

                return;
            }
        }
    }

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
                }
            } catch (e) {
                console.log("Items Property Error: " + e.message);
            }
        }
    }
}

customElements.define("com-arnav-searchdropdown", SearchDropdown);

})();
