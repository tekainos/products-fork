﻿/** 
*	Created by: Austin Teets
* 	Extended from Three.js editor
*/

var Editor = function () {
	
	//OrthographicCamera( left, right, top, bottom, near, far )
	this.DEFAULT_CAMERA = new THREE.OrthographicCamera(window.innerWidth / - 2, window.innerWidth / 2,window.innerHeight / 2, window.innerHeight / - 2, -200, 500);
	
	this.DEFAULT_CAMERA.name = 'Camera';
	this.DEFAULT_CAMERA.position.set( 0, 10, 0 );
	this.DEFAULT_CAMERA.lookAt( new THREE.Vector3(0, 0, 0) );
	
	//PerspectiveCamera( fov, aspect, near, far )
	this.secCam = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
	this.secCam.name = 'Camera';
	this.secCam.position.set( 10, 10, 10 );
	this.secCam.lookAt( new THREE.Vector3(0, 0, 0) );
	
	var Signal = signals.Signal;

    this.signals = {
        /* Base Editor Signals */
        move: new Signal(),
        action: new Signal(),
        windowResize: new Signal(),

        editorCleared: new Signal(),
        refreshSidebarObject3D: new Signal(),

        login : new Signal(),
        cameraSwitch: new Signal(),
        themeChanged: new Signal(),
        transformModeChanged: new Signal(),
        snapChanged: new Signal(),
        spaceChanged: new Signal(),
        rendererChanged: new Signal(),
        sceneBackgroundChanged: new Signal(),
        sceneFogChanged: new Signal(),
        sceneGraphChanged: new Signal(),
        cameraChanged: new Signal(),
        showGridChanged: new Signal(),
        startWatcher: new Signal(),
        
        geometryChanged: new Signal(),
        materialChanged: new Signal(),
        objectSelected: new Signal(),
        objectFocused: new Signal(),
        objectAdded: new Signal(),
        objectChanged: new Signal(),
        objectRemoved: new Signal(),

        helperAdded: new Signal(),
        helperRemoved: new Signal(),
        addDoorway: new Signal(),
        nav: new Signal(),

        uploadJson: new Signal(),
        loadProjURL: new Signal(),
        offlineMode: new Signal(),
        
        /* Signals For TM2D */
        newRoom: new Signal(),
        roomSwitch: new Signal(),
        addRoom: new Signal(),
        switchTool: new Signal(),
        addPoint: new Signal(),
        completeRoom: new Signal(),
        dragWall: new Signal(),
        sendToSidebar: new Signal(),
        setWallValue: new Signal(),
        lockWall: new Signal(),
        backspace: new Signal(),
        measure: new Signal(),
        roomNameChange: new Signal(),
        deleteTape: new Signal(),
        updateTape: new Signal(),
        updateNotation: new Signal(),
        selectDoor: new Signal(),

        dragRoom: new Signal(),
        exportDXF: new Signal(),

        // Feature
        addFeature: new Signal(),
        addStairs: new Signal(),
        recutWalls: new Signal(),

        // Custom
        constrainCustom: new Signal(),
        setCustomHeight: new Signal(),
        deleteCustom: new Signal(),

        // Save/Load
        savePDF: new Signal(),
        loadRoomModel: new Signal(),
        export: new Signal(),

        // Dragging
        activateDrag: new Signal(),
        activateDragWall: new Signal(),
        recalculateLayout: new Signal(),
        clearTape: new Signal(),

        //Form
        groupChanged: new Signal(),
        priceChanged: new Signal(),

        // Layout
        downloadLayout: new Signal(),
        newLayout: new Signal(),
        layout: new Signal(),
        tseam: new Signal(),
        tseamCut: new Signal(),
        cleanLayouts: new Signal(),
        clearLayout: new Signal(),

        
        // Roll
        recalculateRoll: new Signal(),
        rollChange: new Signal(),
        compress: new Signal(),
        tileEditor: new Signal(),
        updateTile: new Signal(),
        hideTile: new Signal(),
        tileClick: new Signal(),

        // Cutout
        floorFeature: new Signal(),
        completeFeature: new Signal(),
        selectFeature: new Signal(),
        selectWall: new Signal(),

        opticut: new Signal(),
        renPip: new Signal(),
        renZoom: new Signal(),
        activeWall: new Signal(),
        updateWall: new Signal(),
        activeDraw: new Signal(),
        constrainWall: new Signal(),
        addWall: new Signal(),
        flip: new Signal(),
        deleteWall: new Signal(),
        deleteRoom: new Signal(),
        updateFeature: new Signal(),
        deleteFeature: new Signal(),

        questionAnswered: new Signal(),

        reloadPO: new Signal(),
        reloadBox: new Signal(),
        measureTaken: new Signal(),

        changePage: new Signal(),
        loginPage: new Signal(),

        download: new Signal(),
        loaded: new Signal(),
        loadPlanes: new Signal(),
        savePacket: new Signal(),
        loadPacket: new Signal(),
        loadLocal: new Signal(),

        

		// Old Signals
        //addBar : new Signal(),
		//fileRead: new Signal(),
		//compSwitch: new Signal(),
		//colorChange: new Signal(),
		//toolChange: new Signal(),
		//changeControl: new Signal(),
		//clearColor: new Signal(),
		//counter: new Signal(),
		//ctselect: new Signal(),
		//clearCounter: new Signal(),
		//counterSAPlus: new Signal(),
        //drawSprite: new Signal(),
        //doorAdded: new Signal(),
        //downloadLayout: new Signal(),
        //loadRoomModel: new Signal(),
        //setWallValue: new Signal(),
        //backspace: new Signal(),
        //enterVR: new Signal(),
        //enteredVR: new Signal(),
        //exitedVR: new Signal(),
		//priceSwitch: new Signal(),
		//planeSwitch: new Signal(),
        //editScript: new Signal(),
        //startPlayer: new Signal(),
        //stopPlayer: new Signal(),
        //newPlane: new Signal(),
		//showModal: new Signal(),
		//showHide: new Signal(),
		//updateVisList: new Signal(),
		//updateVisibility: new Signal(),
		//savingStarted: new Signal(),
		//savingFinished: new Signal(),
		//scriptAdded: new Signal(),
		//scriptChanged: new Signal(),
		//scriptRemoved: new Signal(),
		//historyChanged: new Signal(),
		//refreshScriptEditor: new Signal()
	};
    this.config = new Config('viewtest-viewer');

	this.camera = this.DEFAULT_CAMERA.clone();
	this.camera2 = this.secCam.clone();
	
	this.scene = new THREE.Scene();
	this.scene.name = 'Scene';
	this.scene.background = new THREE.Color( 0xd3e3fc  );
    
	this.object = {};
	this.geometries = {};
	this.materials = {};
	this.textures = {};
	this.scripts = {};

    this.user = '';

	this.selected = null;
	this.helpers = {};
};

Editor.prototype = {

	setTheme: function ( value ) {

		document.getElementById( 'theme' ).href = 'css/dark.css';

		this.signals.themeChanged.dispatch( 'css/dark.css' );

	},
	
	//
	
	setScene: function ( scene ) {

		this.scene.uuid = scene.uuid;
		this.scene.name = scene.name;

		//if ( scene.background !== null ) this.scene.background = scene.background.clone();
		//if ( scene.fog !== null ) this.scene.fog = scene.fog.clone();

		//this.scene.userData = JSON.parse( JSON.stringify( scene.userData ) );

		// avoid render per object

		this.signals.sceneGraphChanged.active = false;

		while ( scene.children.length > 0 ) {
			this.addObject( scene.children[ 0 ] );

		}

		this.signals.sceneGraphChanged.active = true;
		this.signals.sceneGraphChanged.dispatch();

	},

	//

	addObject: function ( object ) {

		var scope = this;

		object.traverse( function ( child ) {

			if ( child.geometry !== undefined ) scope.addGeometry( child.geometry );
			if ( child.material !== undefined ) scope.addMaterial( child.material );

			//scope.addHelper( child );

		} );

		this.scene.add( object );

		this.signals.objectAdded.dispatch( object );
		this.signals.sceneGraphChanged.dispatch();

	},

	moveObject: function ( object, parent, before ) {

		if ( parent === undefined ) {

			parent = this.scene;

		}

		parent.add( object );

		// sort children array

		if ( before !== undefined ) {

			var index = parent.children.indexOf( before );
			parent.children.splice( index, 0, object );
			parent.children.pop();

		}

		this.signals.sceneGraphChanged.dispatch();

	},

	nameObject: function ( object, name ) {

		object.name = name;
		this.signals.sceneGraphChanged.dispatch();

	},

	removeObject: function ( object ) {

		if ( object.parent === null ) return; // avoid deleting the camera or scene

		var scope = this;

		object.traverse( function ( child ) {

			scope.removeHelper( child );
              
		} );

		object.parent.remove( object );

		this.signals.objectRemoved.dispatch( object );
		this.signals.sceneGraphChanged.dispatch();

	},

	addGeometry: function ( geometry ) {

		this.geometries[ geometry.uuid ] = geometry;

	},

	setGeometryName: function ( geometry, name ) {

		geometry.name = name;
		this.signals.sceneGraphChanged.dispatch();

	},

	addMaterial: function ( material ) {

		this.materials[ material.uuid ] = material;

	},

	setMaterialName: function ( material, name ) {

		material.name = name;
		this.signals.sceneGraphChanged.dispatch();

	},

	addTexture: function ( texture ) {

		this.textures[ texture.uuid ] = texture;

	},

	//

    addHelper: function () {

        var geometry = new THREE.SphereBufferGeometry(2, 4, 2);
        var material = new THREE.MeshBasicMaterial({ color: 0xff0000, visible: false });

        return function (object) {

            var helper;

            if (object instanceof THREE.Camera) {

                helper = new THREE.CameraHelper(object, 1);

            } else if (object instanceof THREE.PointLight) {

                helper = new THREE.PointLightHelper(object, 1);

            } else if (object instanceof THREE.DirectionalLight) {

                helper = new THREE.DirectionalLightHelper(object, 1);

            } else if (object instanceof THREE.SpotLight) {

                helper = new THREE.SpotLightHelper(object, 1);

            } else if (object instanceof THREE.HemisphereLight) {

                helper = new THREE.HemisphereLightHelper(object, 1);

            } else if (object instanceof THREE.SkinnedMesh) {

                helper = new THREE.SkeletonHelper(object);

            } else {

                // no helper for this object type
                return;

            }

            var picker = new THREE.Mesh(geometry, material);
            picker.name = 'picker';
            picker.userData.object = object;
            helper.add(picker);

            this.sceneHelpers.add(helper);
            this.helpers[object.id] = helper;

            this.signals.helperAdded.dispatch(helper);

        };

    }(),

    removeHelper: function (object) {

        if (this.helpers[object.id] !== undefined) {

            var helper = this.helpers[object.id];
            helper.parent.remove(helper);

            delete this.helpers[object.id];

            this.signals.helperRemoved.dispatch(helper);

        }

    },

	//

	addScript: function ( object, script ) {

		if ( this.scripts[ object.uuid ] === undefined ) {

			this.scripts[ object.uuid ] = [];

		}

		this.scripts[ object.uuid ].push( script );

		this.signals.scriptAdded.dispatch( script );

	},

	removeScript: function ( object, script ) {

		if ( this.scripts[ object.uuid ] === undefined ) return;

		var index = this.scripts[ object.uuid ].indexOf( script );

		if ( index !== - 1 ) {

			this.scripts[ object.uuid ].splice( index, 1 );

		}

		this.signals.scriptRemoved.dispatch( script );

	},

	//

	select: function ( object ) {
		
		/*
		if ( this.selected === object ) return;

		var uuid = null;

		if ( object !== null ) {

			uuid = object.uuid;

		}

		this.selected = object;

		this.config.setKey( 'selected', uuid );
		this.signals.objectSelected.dispatch( object );
			*/

	},

	selectById: function ( id ) {

		if ( id === this.camera.id ) {

			this.select( this.camera );
			return;

		}

		this.select( this.scene.getObjectById( id, true ) );

	},

	selectByUuid: function ( uuid ) {

		var scope = this;

		this.scene.traverse( function ( child ) {

			if ( child.uuid === uuid ) {

				scope.select( child );

			}

		} );

	},

	deselect: function () {

		this.select( null );

	},

	focus: function ( object ) {

		this.signals.objectFocused.dispatch( object );

	},

	focusById: function ( id ) {

		this.focus( this.scene.getObjectById( id, true ) );

	},

	clear: function () {

        this.camera = this.DEFAULT_CAMERA.clone();
        this.camera2 = this.secCam.clone();

        this.scene = new THREE.Scene();
        this.scene.name = 'Scene';
        this.scene.background = new THREE.Color(0xd3e3fc);

        this.sceneHelpers = new THREE.Scene();

		this.scene.background.setHex( 0xaaaaaa );
		this.scene.fog = null;

		var objects = this.scene.children;

		while ( objects.length > 0 ) {

			this.removeObject( objects[ 0 ] );

		}

		this.geometries = {};
		this.materials = {};
		this.textures = {};
		this.scripts = {};

		this.deselect();

		this.signals.editorCleared.dispatch();

        //PerspectiveCamera( fov, aspect, near, far )

	},

	//

	fromJSON: function ( raw ) {

		var loader = new THREE.ObjectLoader();

		// backwards
        
        var json = JSON.parse(raw);
       
		if ( json.scene === undefined ) {
			this.setScene( loader.parse( json ) );
			return;
		}

		var camera = loader.parse( json.camera );

		this.camera.copy( camera );
		this.camera.aspect = this.DEFAULT_CAMERA.aspect;
		this.camera.updateProjectionMatrix();

		//this.history.fromJSON( json.history );
		//this.scripts = json.scripts;

		//this.setScene( loader.parse( json.scene ) );


        this.signals.loaded.dispatch(json, loader.parse(json.scene));
	},

	toJSON: function () {

		// scripts clean up

		var scene = this.scene;
		var scripts = this.scripts;

		for ( var key in scripts ) {

			var script = scripts[ key ];

			if ( script.length === 0 || scene.getObjectByProperty( 'uuid', key ) === undefined ) {

				delete scripts[ key ];

			}

		}

		//

		this.signals.savePacket.dispatch( {

            metadata: {},
            values: {},
            room: {},
			project: {
				gammaInput: this.config.getKey( 'project/renderer/gammaInput' ),
				gammaOutput: this.config.getKey( 'project/renderer/gammaOutput' ),
				shadows: this.config.getKey( 'project/renderer/shadows' ),
				editable: this.config.getKey( 'project/editable' ),
				vr: this.config.getKey( 'project/vr' )
			},
			camera: this.camera.toJSON(),
			scene: this.scene.toJSON(),
			scripts: this.scripts
			//history: this.history.toJSON()

		});

	},

	objectByUuid: function ( uuid ) {

		return this.scene.getObjectByProperty( 'uuid', uuid, true );

	},

	execute: function ( cmd, optionalName ) {

		this.history.execute( cmd, optionalName );

	},

	undo: function () {

		//this.history.undo();

	},

	redo: function () {

		this.history.redo();
		this.signals.helperAdded.dispatch(true);

	}

};
