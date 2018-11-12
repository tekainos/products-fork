/** 
*	Created by: Austin Teets
* 	Extended from Three.js editor
*/

var Sidebar = function ( editor ) {
	var signals = editor.signals;
	var container = new UI.Panel();
	container.setId( 'sidebar' );

    var measureTab = new UI.Text('Draw Room').onClick(onClick);
    var saveTab = new UI.Text('Save/Load').onClick(onClick);
	var designTab = new UI.Text( 'TapMeasure' ).onClick( onClick );
	//var settingsTab = new UI.Text( 'SETTINGS' ).onClick( onClick );
	//var counterTab = new UI.Text('COUNTERS').onClick( onClick );
    
    saveTab.dom.style.width = "25%";
	measureTab.dom.style.width = "25%";
	designTab.dom.style.width = "25%";
	//settingsTab.dom.style.width = "17%";
	//counterTab.dom.style.width = "17%";

    saveTab.dom.style.fontSize = "small";
	measureTab.dom.style.fontSize = "small";
	designTab.dom.style.fontSize = "small";
	//settingsTab.dom.style.fontSize = "x-small";
	//counterTab.dom.style.fontSize = "x-small";

    saveTab.dom.style.textAlign = "center";
	measureTab.dom.style.textAlign = "center";
	designTab.dom.style.textAlign = "center";
	//settingsTab.dom.style.textAlign = "center";
	//counterTab.dom.style.textAlign = "center";

    saveTab.dom.style.borderTopRightRadius = "10px";
	measureTab.dom.style.borderTopRightRadius = "10px";
	designTab.dom.style.borderTopRightRadius = "10px";
	//settingsTab.dom.style.borderTopRightRadius = "10px";
	//counterTab.dom.style.borderTopRightRadius = "10px";

    saveTab.dom.style.borderTopLeftRadius = "10px";
	measureTab.dom.style.borderTopLeftRadius = "10px";
	designTab.dom.style.borderTopLeftRadius = "10px";
	//settingsTab.dom.style.borderTopLeftRadius = "10px";
	//counterTab.dom.style.borderTopLeftRadius = "10px";
	
	
    var head = new Sidebar.Head(editor);
	container.add(head);
	
	var tabs = new UI.Div();
    tabs.dom.style.backgroundColor = "#222";
	//tabs.setId( 'tabs' );
    //tabs.add(measureTab);
    //tabs.add(saveTab);
	//tabs.add(designTab);
	//tabs.add(counterTab);
	//tabs.add(settingsTab );
	//container.add(tabs);
	
	function onClick( event ) {
		select( event.target.textContent );
	}

    var containerB = new UI.Panel();
    containerB.dom.id = 'pledit';
    containerB.dom.className += ' viewportSidebar';

    var containerC = new UI.Panel();
    containerC.dom.id = 'pledit2';
    containerC.dom.className += ' viewportSidebar';

    var containerD = new UI.Panel();
    containerD.dom.id = 'pledit3';

    var containerE = new UI.Panel();
    containerE.dom.id = 'pledit4';
    containerE.dom.className += ' viewportSidebar';

    var containerF = new UI.Panel();
    containerF.dom.id = 'pledit5';
    containerF.dom.className += ' viewportSidebar';

    var measure = new UI.Span().add(
        containerD,
        containerB,
        containerC,
        containerE,
        containerF,
        new Sidebar.Bluetooth(editor)
	);
    container.add(measure);

    var save = new UI.Span().add(
        new Sidebar.Save(editor)
    );
    container.add(save);

    var design = new UI.Span().add(
        new Sidebar.Load(editor)
    );
    container.add(design);

	/*
	var counter = new UI.Span().add( 
		new Sidebar.Counters(editor)
	);
	//container.add(counter);
	var scene = new UI.Span().add(
		new Sidebar.Scene( editor )
	);
	
	var project = new UI.Span().add(
		new Sidebar.Project( editor )
	);*/
	
	function select( section ) {
		designTab.setClass( '' );
        measureTab.setClass('');
        saveTab.setClass('');

		design.setDisplay('none');
        measure.setDisplay('none');
        save.setDisplay('none');
		
		switch ( section ) {
            case 'Save/Load':
				//saveTab.setClass( 'selected' );
				save.setDisplay( '' );
				break;
            case 'Draw Room':
				//measureTab.setClass( 'selected' );
				measure.setDisplay('');
                break;
            case 'TapMeasure':
                //signals.reloadBox.dispatch();
                //designTab.setClass('selected');
                design.setDisplay('');
                break;
		}
	}

    select( 'Draw Room' );

    signals.nav.add(function (text) {
        select(text);
    });
    /*
	var settingsTab = new UI.Text( 'SETTINGS' ).onClick( onClick );
	
	
	var head = new Sidebar.Room(editor)
	container.add(head);
	
	var tabs = new UI.Div();
	tabs.setId( 'tabs' );
	tabs.add(measureTab);
	tabs.add(designTab);
	tabs.add(settingsTab );
	container.add(tabs);
	
	function onClick( event ) {

		select( event.target.textContent );

	}
	
	var measure = new UI.Span().add( 
		new Sidebar.Measurements( editor )
	);
	container.add(measure);
	
	var design = new UI.Span().add(
		new Sidebar.Color(editor)
	);
	container.add(design);
	
	
	
	var settings = new UI.Span().add(
		new Sidebar.View( editor ),
		new Sidebar.MeasStyle(editor)
	);
	container.add( settings );
	*/
	

	/*
	function select( section ) {
		designTab.setClass( '' );
		measureTab.setClass( '' );
		settingsTab.setClass( '' );

		design.setDisplay( 'none' );
		measure.setDisplay( 'none' );
		settings.setDisplay( 'none' );

		switch ( section ) {
			case 'DESIGN':
				designTab.setClass( 'selected' );
				design.setDisplay( '' );
				signals.toolChange.dispatch('paint');
				break;
			case 'MEASURE':
				measureTab.setClass( 'selected' );
				measure.setDisplay( '' );
				signals.toolChange.dispatch('measure');
				break;
			case 'SETTINGS':
				settingsTab.setClass( 'selected' );
				settings.setDisplay( '' );
				break;
		}
	}

	select( 'MEASURE' );
	*/
	return container;

};
