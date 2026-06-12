(function () {

var template = document.createElement("template");

template.innerHTML = `
<style>

:host{
    display:block;
    width:100%;
    font-family:Arial,sans-serif;
}

.container{
    position:relative;
    width:100%;
}

.search-box{
    width:100%;
    height:36px;
    border:1px solid #d9d9d9;
    border-radius:4px;
    padding:0 10px;
    box-sizing:border-box;
    cursor:pointer;
}

.dropdown{
    position:fixed;
    background:#fff;
    border:1px solid #d9d9d9;
    max-height:250px;
    overflow-y:auto;
    display:none;
    z-index:99999;
    min-width:200px;
    box-shadow:0 4px 8px rgba(0,0,0,0.15);
}

.item{
    padding:8px 12px;
    cursor:pointer;
    font-size:13px;
}

.item:hover{
    background:#e6f0ff;
}

</style>

<div class="container">
    <input class="search-box" placeholder="Search..." />
    <div class="dropdown"></div>
</div>
`;

class SearchDropdown extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this._props        = {};
        this._data         = [];
        this.selectedKey   = "";
        this.selectedText  = "";
        this.searchBox     = this.shadowRoot.querySelector(".search-box");
        this.dropdown      = this.shadowRoot.querySelector(".dropdown");
    }

    connectedCallback() {

        var that = this;

        // Open on click
        that.searchBox.addEventListener("click", function () {
            that._openDropdown(that._data);
        });

        // Open on focus
        that.searchBox.addEventListener("focus", function () {
            that._openDropdown(that._data);
        });

        // Filter on type — no external event needed
        that.searchBox.addEventListener("keyup", function () {

            var typed  = that.searchBox.value.toLowerCase();
            var result = [];
            var i      = 0;

            for (i = 0; i < that._data.length; i++) {
                if (
                    that._data[i].text.toLowerCase().indexOf(typed) > -1 ||
                    that._data[i].key.toLowerCase().indexOf(typed)  > -1
                ) {
                    result.push(that._data[i]);
                }
            }

            that._openDropdown(result);
        });

        // Close on outside click
        document.addEventListener("click", function (e) {
            if (!that.contains(e.target)) {
                that.dropdown.style.display = "none";
            }
        });
    }

    _openDropdown(data) {

        var box = this.searchBox.getBoundingClientRect();
        this.dropdown.style.top     = (box.bottom + window.scrollY) + "px";
        this.dropdown.style.left    = (box.left   + window.scrollX) + "px";
        this.dropdown.style.width   = box.width + "px";
        this.dropdown.style.display = "block";
        this._renderItems(data);
    }

    _renderItems(data) {

        var that  = this;
        var items = data || this._data;
        var html  = "";
        var i     = 0;

        if (items.length === 0) {
            that.dropdown.innerHTML =
                '<div style="padding:8px 12px;font-size:12px;color:#999;">No results</div>';
            return;
        }

        for (i = 0; i < items.length; i++) {
            html +=
                '<div class="item" data-key="' +
                items[i].key + '">' +
                items[i].text +
                '</div>';
        }

        that.dropdown.innerHTML = html;

        var rows = that.dropdown.querySelectorAll(".item");
        var j    = 0;

        for (j = 0; j < rows.length; j++) {
            rows[j].addEventListener("click", function () {

                var key  = this.getAttribute("data-key");
                var text = this.innerHTML;

                that.searchBox.value        = text;
                that.selectedKey            = key;
                that.selectedText           = text;
                that.dropdown.style.display = "none";

                // Fire onSelectionChange — detail has key and text
                that.dispatchEvent(
                    new CustomEvent("onSelectionChange", {
                        detail: { key: key, text: text }
                    })
                );
            });
        }
    }

    setData(data) {
        try {
            this._data = JSON.parse(data);
            console.log(
                "SearchDropdown setData: " +
                this._data.length + " records"
            );
        } catch (e) {
            console.log("SearchDropdown setData error: " + e.message);
        }
    }

    getSelectedKey()  { return this.selectedKey  || ""; }
    getSelectedText() { return this.selectedText || ""; }

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
                this._data = JSON.parse(this._props.items);
            } catch (e) {
                console.log("Items prop error: " + e.message);
            }
        }
    }
}

customElements.define("com-arnav-searchdropdown", SearchDropdown);

})();
