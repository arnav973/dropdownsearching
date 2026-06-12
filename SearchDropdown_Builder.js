(function () {

let template =
document.createElement("template");

template.innerHTML = `
<form id="form">

<table>

<tr>
<td>Placeholder</td>

<td>
<input
id="placeholder"
type="text">
</td>

</tr>

</table>

<button type="submit">
Update
</button>

</form>
`;

class BuilderPanel extends HTMLElement {

constructor(){

super();

this.attachShadow({
mode:"open"
});

this.shadowRoot.appendChild(
template.content.cloneNode(true)
);

this.shadowRoot
.getElementById("form")
.addEventListener(
"submit",
this.submit.bind(this)
);

}

submit(e){

e.preventDefault();

this.dispatchEvent(
new CustomEvent(
"propertiesChanged",
{
detail:{
properties:{
placeholder:
this.placeholder
}
}
}
)
);

}

set placeholder(value){

this.shadowRoot
.getElementById("placeholder")
.value=value;

}

get placeholder(){

return this.shadowRoot
.getElementById("placeholder")
.value;

}

}

customElements.define(
"com-arnav-searchdropdown-builder",
BuilderPanel
);

})();
