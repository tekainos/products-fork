Sidebar.Head = function ( editor ) {

	var config = editor.config;
	var signals = editor.signals;

	var container = new UI.Panel();
	container.setBorderTop( '0' );
	container.setPaddingTop( '20px' );

	// class

	//var DOM_img = document.createElement("img");
    var textLogo = document.createElement('span');
    textLogo.addEventListener("click", reloadAll, false);
    textLogo.setAttribute('class', 'tekfont');
    textLogo.appendChild(document.createTextNode('TekMeasure 2D'));
    var row = new UI.Row();

   /* DOM_img.src = 'img/LogoSmall2.png';
    DOM_img.addEventListener("click", reloadAll, false);
	DOM_img.style.display = 'block';
	DOM_img.style.width = '290px';
    DOM_img.style.margin = 'auto';
    DOM_img.style.marginLeft = '5px'; */
	row.dom.appendChild(textLogo);
    container.add(row);
    row2 = new UI.Row();
    textrow = new UI.Text('Powered by Tekainos');
    textrow.dom.style = "font-family:tekainosFont; color:#cc9900;float: right;margin-right:2px";
    row2.add(textrow);
    container.add(row2);
	container.add( new UI.Break());
	
	
	var downloadSKP = new UI.Button('Export to 2020');
	downloadSKP.dom.style.float = 'right';
	downloadSKP.dom.style.margin = 'auto';
    downloadSKP.onClick(downloader);


    var houseRow = new UI.Row();
    var retToHouse = new UI.Button('Change Job');
    retToHouse.dom.style.float = 'right';
    retToHouse.dom.style.margin = 'auto';
    retToHouse.onClick(goToHouse);
    houseRow.add(retToHouse);
    //container.add(houseRow);



    var addrInput = document.createElement("input");
    addrInput.defaultValue = 'Address';
    addrInput.className = 'headerInputs';
    addrInput.style.cssFloat = 'left';
    addrInput.style.width = '60%'
    addrInput.setAttribute("id", "address_field");
    container.dom.appendChild(addrInput);

    var projectNumber = document.createElement("input");
    projectNumber.defaultValue = '000000000';
    projectNumber.setAttribute("id", "project_field");
    projectNumber.pattern = "[0 - 9]{9}";
    projectNumber.style.width = '35%';
    projectNumber.className = 'headerInputs';
    projectNumber.style.cssFloat = 'right';
    container.dom.appendChild(projectNumber);
    
    container.add(new UI.Break());
	
	//container.add( new UI.Break());
	
	var container2 = new UI.Panel();
	container2.dom.style.paddingLeft = '0px';
	container2.dom.style.paddingRight = '0px';
	
	container2.add( new UI.Text( 'Room' ).setWidth( '60px' ) );
	
	//container2.add( new UI.Break(),  new UI.Break());
	
	//container.add(container2);

    function reloadAll() {
        editor.clear();
    }

	function goToHouse () {
		if (confirm( 'Any unsaved data will be lost. Are you sure?' )) {
			window.location.href = 'selecthouse.html';
		}
	}
	
	function downloader () {
		var hiddenElement = document.createElement('a');
		var element = document.getElementById("roomSwitch");
		hiddenElement.href = encodeURI(pathDL[element.selectedIndex][0]);
		hiddenElement.target = '_blank';
		hiddenElement.download = pathDL[element.selectedIndex][1]+ '.dwg';
		hiddenElement.click();
	}
	

	//return container;

};