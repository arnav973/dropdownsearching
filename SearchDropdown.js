(function () {

    const template = document.createElement("template");

    template.innerHTML = `
<style>

:host{
    display:block;
    width:100%;
    font-family:"72","72full",Arial,sans-serif;
}

.container{
    position:relative;
    width:100%;
}

.search-box{

    width:100%;
    height:38px;

    border:1px solid #d9d9d9;
    border-radius:6px;

    padding:0 12px;

    box-sizing:border-box;

    outline:none;
}

.search-box:focus{

    border-color:#0a6ed1;

}

.dropdown{

    position:absolute;

    top:42px;

    left:0;

    right:0;

    background:white;

    border:1px solid #d9d9d9;

    border-radius:6px;

    box-shadow:0 4px 12px rgba(0,0,0,.15);

    z-index:9999;

    display:none;

}

.list{

    height:300px;

    overflow:auto;

}

.item{

    padding:8px 12px;

    cursor:pointer;

    font-size:13px;

}

.item:hover{

    background:#f5f5f5;

}

.selected{

    background:#e5f0fa;

}

.no-data{

    padding:10px;

    color:#666;

}

</style>

<div class="container">

    <input
        class="search-box"
        placeholder="Search..."
    >

    <div class="dropdown">

        <div class="list"></div>

    </div>

</div>
`;

class SearchDropdown extends HTMLElement {

    constructor() {

    super();

    this.attachShadow({mode:"open"});

    this.shadowRoot.appendChild(
        template.content.cloneNode(true)
    );

    this._props = {};
    this._data = [];
    this._filtered = [];
    this._items = [];

    this.visibleCount = 50;

        this.searchBox =
            this.shadowRoot.querySelector(".search-box");

        this.dropdown =
            this.shadowRoot.querySelector(".dropdown");

        this.list =
            this.shadowRoot.querySelector(".list");
    }

    connectedCallback() {

        this.searchBox.addEventListener(
            "focus",
            () => {
                this.dropdown.style.display = "block";
                this.renderItems();
            }
        );

        this.searchBox.addEventListener(
            "input",
            this.debounce((e)=>{

                this.filterData(
                    e.target.value
                );

            },200)
        );

        document.addEventListener(
            "click",
            (e)=>{

                if(!this.contains(e.target)){

                    this.dropdown.style.display =
                    "none";

                }

            }
        );
    }

    debounce(func,wait){

        let timeout;

        return (...args)=>{

            clearTimeout(timeout);

            timeout=setTimeout(
                ()=>func.apply(this,args),
                wait
            );

        };

    }

    filterData(text){

        const search =
            text.toLowerCase();

        this._filtered =
            this._data.filter(item =>
                item.text
                    .toLowerCase()
                    .includes(search)
            );

        this.renderItems();
    }

    renderItems(){

        let html = "";

        const rows =
            this._filtered.slice(
                0,
                this.visibleCount
            );

        if(rows.length === 0){

            html =
            `<div class="no-data">
                No Data Found
             </div>`;

        }else{

            rows.forEach(item=>{

                html += `
                <div
                    class="item"
                    data-key="${item.key}"
                    data-text="${item.text}"
                >
                    ${item.text}
                </div>
                `;

            });

        }

        this.list.innerHTML = html;

        this.list
        .querySelectorAll(".item")
        .forEach(item=>{

            item.addEventListener(
                "click",
                ()=>{

                    this.selectItem(
                        item.dataset.key,
                        item.dataset.text
                    );

                }
            );

        });
    }

    selectItem(key,text){

        this.selectedKey = key;
        this.selectedText = text;

        this.searchBox.value = text;

        this.dropdown.style.display =
        "none";

        this.dispatchEvent(
            new CustomEvent(
                "onSelectionChange",
                {
                    detail:{
                        key:key,
                        text:text
                    }
                }
            )
        );
    }

    setData(data){

        this._data =
            JSON.parse(data);

        this._filtered =
            [...this._data];

        this.renderItems();
    }

    getSelectedKey(){

        return this.selectedKey || "";

    }

    getSelectedText(){

        return this.selectedText || "";

    }

    clear(){

        this.selectedKey = "";
        this.selectedText = "";

        this.searchBox.value = "";

    }

    selectByKey(key){

        const found =
            this._data.find(
                x=>x.key===key
            );

        if(found){

            this.selectItem(
                found.key,
                found.text
            );

        }
    }

    onCustomWidgetBeforeUpdate(changedProps){

        this._props = {
            ...this._props,
            ...changedProps
        };

    }

    onCustomWidgetAfterUpdate(){

    if(this._props.placeholder){

        this.searchBox.placeholder =
        this._props.placeholder;

    }

    if(this._props.items){

        try{

            this._data =
            JSON.parse(this._props.items);

            this._filtered =
            [...this._data];

            this.renderItems();

        }catch(e){

            console.error(e);

        }

    }

}

}

customElements.define(
    "com-arnav-searchdropdown",
    SearchDropdown
);

})();
