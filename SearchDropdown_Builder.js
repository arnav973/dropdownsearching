(function () {

    var template = document.createElement("template");

    template.innerHTML = `
    <style>

        :host {
            display: block;
            font-family: "72", "Segoe UI", Arial, sans-serif;
            padding: 12px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        td {
            padding: 6px 4px;
            font-size: 13px;
            vertical-align: middle;
        }

        td:first-child {
            font-weight: 600;
            color: #1d2d3e;
            width: 110px;
        }

        input[type="text"] {
            width: 100%;
            height: 32px;
            border: 1px solid #d9d9d9;
            border-radius: 4px;
            padding: 0 8px;
            font-size: 13px;
            box-sizing: border-box;
            outline: none;
        }

        input[type="text"]:focus {
            border-color: #0a6ed1;
        }

        button[type="submit"] {
            margin-top: 10px;
            width: 100%;
            height: 32px;
            background: #0a6ed1;
            color: #ffffff;
            border: none;
            border-radius: 4px;
            font-size: 13px;
            cursor: pointer;
        }

        button[type="submit"]:hover {
            background: #085caf;
        }

    </style>

    <form id="form">

        <table>

            <tr>
                <td>Placeholder</td>
                <td>
                    <input
                        id="placeholder"
                        type="text"
                        placeholder="Search..."
                    />
                </td>
            </tr>

        </table>

        <button type="submit">Update</button>

    </form>
    `;

    class BuilderPanel extends HTMLElement {

        constructor() {

            super();

            this.attachShadow({ mode: "open" });

            this.shadowRoot.appendChild(
                template.content.cloneNode(true)
            );

            this.shadowRoot
                .getElementById("form")
                .addEventListener(
                    "submit",
                    this._submit.bind(this)
                );
        }

        _submit(e) {

            e.preventDefault();

            this.dispatchEvent(
                new CustomEvent("propertiesChanged", {
                    detail: {
                        properties: {
                            placeholder: this.placeholder
                        }
                    }
                })
            );
        }

        set placeholder(value) {
            this.shadowRoot
                .getElementById("placeholder")
                .value = value || "";
        }

        get placeholder() {
            return this.shadowRoot
                .getElementById("placeholder")
                .value || "";
        }
    }

    customElements.define(
        "com-arnav-searchdropdown-builder",
        BuilderPanel
    );

})();
