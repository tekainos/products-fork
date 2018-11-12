PIP = function ( editor ) {

	var signals = editor.signals;
	var config = editor.config;
    var scene = editor.scene;
    var camera = editor.camera2;
    var sceneHelpers = editor.sceneHelpers;

    var container = new UI.Panel();
    container.setId('PIP');
	container.setPosition( 'absolute' );
	container.setRight( '0px' );
	container.setBottom( '0px' );
	container.dom.style.zIndex = '2';
	container.setId( 'viewport2' );
	
	var renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( 250, 250 );

    container.dom.appendChild(renderer.domElement);
	
	//
	
	renderer.render(scene, camera);
	controls = new THREE.EditorControls4(camera, renderer.domElement);
	controls.addEventListener('change', function() {
		renderer.render(scene, camera);
	});
	
	signals.renPip.add( function (sc, cam) {
		renderer.render(sc, camera);
	});
	
	signals.renZoom.add( function(zoom, cent) {
		camera.zoom = zoom;
		camera.position.set = (cent.x+10, 10, cent.y+10);
		camera.lookAt( new THREE.Vector3(cent.x, 0, cent.y) );
		camera.updateProjectionMatrix();
    });

    signals.cameraSwitch.add(function () {
        console.log("Camera Switch");
        if (camera === editor.camera2) {
            camera = editor.camera;
            controls.dispose();
            controls = new THREE.EditorControls(camera, container.dom);
            controls.addEventListener('change', function () {
                renderer.render(scene, camera);
            });
            signals.cameraChanged.dispatch(camera);
        } else {
            camera = editor.camera2;
            camera.aspect = 1;
            camera.updateProjectionMatrix();
            controls.dispose();
            controls = new THREE.EditorControls4(camera, container.dom);
            controls.addEventListener('change', function () {
                renderer.render(scene, camera);
            });
            signals.cameraChanged.dispatch(camera);
        }
    });
	
	return container;
};