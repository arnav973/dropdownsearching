(function () {

var template = document.createElement("template");

template.innerHTML = `
<style>

:host {
    display: block;
    width: 100%;
    font-family: Arial, sans-serif;
}

.container {
    position: relative;
    width: 100%;
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

.dropdown {
    position: absolute;
    top: 38px;
    left: 0;
    width: 100%;
    background: #fff;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    max-height: 250px;
    overflow-y: auto;
    display: none;
    z-index: 99999;
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    box-sizing: border-box;
}

.item {
    padding: 8px 12px;
    cursor: pointer;
    font-size: 13px;
    color: #1d2d3e;
    border-bottom: 1px solid #f5f5f5;
}

.item:last-child {
    border-bottom: none;
}

.item:hover {
    background: #e6f0ff;
    color: #0a6ed1;
}

.no-data {
    padding: 10px 12px;
    font-size: 12px;
    color: #8c9ba5;
    text-align: center;
}

</style>

<div class="container">
    <input class="search-box" type="text" placeholder="Search..." autocomplete="off" />
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

        this._props       = {};
        this._data        = [];
        this.selectedKey  = "";
        this.selectedText = "";

        this.searchBox = this.shadowRoot.querySelector(".search-box");
        this.dropdown  = this.shadowRoot.querySelector(".dropdown");
    }

    connectedCallback() {

        var that = this;

        // Click on input → show all items
        that.searchBox.addEventListener("click", function (e) {
            e.stopPropagation();
            that._openDropdown(that._data);
        });

        // Focus on input → show all items
        that.searchBox.addEventListener("focus", function () {
            that._openDropdown(that._data);
        });

        // Typing → filter
        that.searchBox.addEventListener("input", function () {
            var val = that.searchBox.value;
            if (val === "") {
                that._openDropdown(that._data);
            } else {
                that._filterData(val);
            }
        });

        // ESC key → close
        that.searchBox.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
                that.dropdown.style.display = "none";
            }
        });

        // Click inside container → do not close
        that.shadowRoot
            .querySelector(".container")
            .addEventListener("click", function (e) {
                e.stopPropagation();
            });

        // Click outside shadow root → close
        // Use the host element blur approach — most reliable in SAC iframe
        that.searchBox.addEventListener("blur", function () {
            // Small delay so item click fires before close
            setTimeout(function () {
                that.dropdown.style.display = "none";
            }, 200);
        });
    }

    // Open and position dropdown
    _openDropdown(data) {
        this.dropdown.style.display = "block";
        this._renderItems(data);
    }

    // Filter data by search text
    _filterData(text) {

        var search = (text || "").toLowerCase();
        var result = [];
        var i = 0;

        for (i = 0; i < this._data.length; i++) {

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

        this._openDropdown(result);
    }

    // Render items into dropdown
    _renderItems(data) {

        var that  = this;
        var items = data || this._data;
        var html  = "";
        var i     = 0;

        if (!items || items.length === 0) {
            that.dropdown.innerHTML =
                '<div class="no-data">No results found</div>';
            return;
        }

        for (i = 0; i < items.length; i++) {

            // Safely encode for HTML attribute
            var safeKey  = String(items[i].key  || "").replace(/"/g, "&quot;");
            var safeText = String(items[i].text || "").replace(/"/g, "&quot;");

            html +=
                '<div class="item"' +
                ' data-key="'  + safeKey  + '"' +
                ' data-text="' + safeText + '">' +
                String(items[i].text || "") +
                '</div>';
        }

        that.dropdown.innerHTML = html;

        var rows = that.dropdown.querySelectorAll(".item");
        var j    = 0;

        for (j = 0; j < rows.length; j++) {

            rows[j].addEventListener("mousedown", function (e) {

                // mousedown fires before blur — prevents dropdown closing
                e.preventDefault();

                var key  = this.getAttribute("data-key");
                var text = this.getAttribute("data-text");

                that.searchBox.value  = text;
                that.selectedKey      = key;
                that.selectedText     = text;

                that.dropdown.style.display = "none";

                console.log(
                    "SearchDropdown selected key: " + key +
                    " text: " + text
                );

                that.dispatchEvent(
                    new CustomEvent("onSelectionChange", {
                        detail: { key: key, text: text },
                        bubbles:  true,
                        composed: true
                    })
                );
            });
        }
    }

    // Called from SAC script
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
            console.log(
                "SearchDropdown setData parse error: " + e.message
            );
        }
    }

    getSelectedKey() {
        return this.selectedKey || "";
    }

    getSelectedText() {
        return this.selectedText || "";
    }

    clear() {
        this.searchBox.value        = "";
        this.selectedKey            = "";
        this.selectedText           = "";
        this.dropdown.style.display = "none";
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
                        detail: {
                            key:  key,
                            text: this._data[i].text
                        },
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

customElements.define(
    "com-arnav-searchdropdown",
    SearchDropdown
);

})();
