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
}

.dropdown{
    position:absolute;
    top:40px;
    left:0;
    right:0;
    background:#fff;
    border:1px solid #d9d9d9;
    max-height:250px;
    overflow-y:auto;
    display:none;
    z-index:9999;
}

.item{
    padding:8px;
    cursor:pointer;
}

.item:hover{
    background:#f5f5f5;
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

        this.attachShadow({
            mode: "open"
        });

        this.shadowRoot.appendChild(
            template.content.cloneNode(true)
        );

        this._props = {};
        this._data = [];

        this.searchBox =
            this.shadowRoot.querySelector(".search-box");

        this.dropdown =
            this.shadowRoot.querySelector(".dropdown");
    }

    connectedCallback() {

        var that = this;

        that.searchBox.addEventListener(
    "focus",
    function () {

        that.dropdown.style.display =
        "block";

        that.renderItems(
            that._data
        );

    }
);

        that.searchBox.addEventListener(
            "keyup",
            function () {

                that.filterData(
                    that.searchBox.value
                );

            }
        );
    }

    filterData(text) {

    var search =
    text.toLowerCase();

    var result = [];

    for(
        var i = 0;
        i < this._data.length;
        i++
    ){

        if(
            String(
                this._data[i].text
            )
            .toLowerCase()
            .indexOf(search)
            > -1
        ){

            result.push(
                this._data[i]
            );

        }

    }

    this.dropdown.style.display =
    "block";

    this.renderItems(
        result
    );

}

    renderItems(data) {

        var that = this;

        var items =
            data || this._data;

        var html = "";

        for (var i = 0; i < items.length; i++) {

            html +=
            '<div class="item" data-key="' +
            items[i].key +
            '">' +
            items[i].text +
            '</div>';

        }

        that.dropdown.innerHTML = html;

        var rows =
        that.dropdown.querySelectorAll(
            ".item"
        );

        for (var j = 0; j < rows.length; j++) {

            rows[j].addEventListener(
                "click",
                function () {

                    var key =
                    this.getAttribute(
                        "data-key"
                    );

                    that.searchBox.value =
                    this.innerHTML;

                    that.selectedKey = key;

that.selectedText = this.innerHTML;

that.dropdown.style.display = "none";

that.dispatchEvent(
    new CustomEvent(
        "onSelectionChange",
        {
            detail: {
                key: key,
                text: that.selectedText
            }
        }
    )
);

                }
            );

        }

    }

    onCustomWidgetBeforeUpdate(
        changedProperties
    ) {

        for (
            var prop in changedProperties
        ) {

            this._props[prop] =
            changedProperties[prop];

        }

    }

    onCustomWidgetAfterUpdate() {

        if (
            this._props.placeholder
        ) {

            this.searchBox.placeholder =
            this._props.placeholder;

        }

        if (
            this._props.items
        ) {

            try {

                this._data =
                JSON.parse(
                    this._props.items
                );

                this.renderItems();

            }
            catch (e) {

                console.log(e);

            }

        }

    }

   setData(data) {

    try {

        this._data = JSON.parse(data);

        console.log(
            "Records Loaded:",
            this._data.length
        );

        this.dropdown.style.display =
        "block";

        this.renderItems(
            this._data
        );

    }
    catch (e) {

        console.log(
            "setData Error",
            e
        );

    }

}
    getSelectedKey() {

        return this.selectedKey || "";

    }

    getSelectedText() {

        return this.selectedText || "";

    }

}

customElements.define(
    "com-arnav-searchdropdown",
    SearchDropdown
);

})();
