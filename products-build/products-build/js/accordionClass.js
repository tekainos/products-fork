
class Accordion {
	constructor(panelClass, title, titleClass, content, contentClass, url) {
		this._panelClass = panelClass;
		this._title = title;
		this._titleClass = titleClass;
		this._content = content;
        this._contentClass = contentClass;
        this._url = url;
        this._body = this.createBody();
		this._h = this.createHead();
		this._dom = this.generateAccordion();
	}	
	get titleClass() { return this._titleClass; }
	get contentClass() { return this._contentClass; }
	get dom() { return this._dom; }

	generateAccordion() {
		var div = document.createElement("div");
		div.className = this._panelClass;
		div.appendChild(this._h);
        div.appendChild(this._body);
        return div;
	}
	
	createHead() {
		var h = document.createElement("h3");
		var body = this._body;
		var className = this._contentClass;
		h.onclick = (function () {
			$("." + className).hide('fast');
			$(body).toggle('fast');
			
		});
		h.innerHTML = this._title;
		h.className = this._titleClass;
		return h;
	}
	
    createBody() {
        // create HTML elements
        var bod = document.createElement("div");
        var p = document.createElement("p");
        var url = document.createElement("a");

        // set classes / ids
        bod.className = this._contentClass;
        url.setAttribute("id", "LoadLocalBox");
        p.innerHTML = this._content;

        // build accordion body content
        bod.appendChild(p);
        url.innerHTML = this._url;
        bod.appendChild(url);

		bod.style.display = 'none';
		return bod;
    }
	
	clear() {
		$(this._body).remove();
		$(this._head).remove();
		$(this._dom).remove();
	}
	
}
// end accordion class








$(document).ready(function() {	
	
	// accordion call
	var somethingList = [];
	var acc = document.getElementById("JobsList");
	for (var i=1; i < 50; i++) {
		var something1 = new Accordion("panelAccordion", "Job "+i, "clickAccordion", "c ante sapien, porttitor sit amet ullamcorper id, ultrices id diam. Donec lorem ipsum, ultrices at gravida vulputate, posuere quis neque. Donec eget odio sit amet eros semper porttitor vel eu turpis. Ut s", "contentAccordion", "Open Job");	
		acc.appendChild(something1.dom);
		somethingList.push(something1);
	}
	/*
	for (var c = 0; c < somethingList.length; c++) {
		somethingList[c].clear();
		console.log(somethingList[c]);
		somethingList[c] = null;
		console.log(somethingList[c]);
	}*/
	
	
	/*var productsCategories = [];
	var productsAcc = document.getElementById("productCategory");
	console.log(productsAcc);
	for (var i=1; i < 6; i++) {
		var productsPicker = new Accordion("panelAccordion", "Product \"Super\" Category "+i, "clickAccordion", "c ante sapien, porttitor sit amet ullamcorper id, ultrices id diam. Donec lorem ipsum, ultrices at gravida vulputate, posuere quis neque. Donec eget odio sit amet eros semper porttitor vel eu turpis. Ut s", "contentAccordion");	
		console.log(productsPicker);
		productsAcc.appendChild(productsPicker.dom);
		productsCategories.push(productsPicker);
	}*/
});
