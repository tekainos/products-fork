/** 
*	Created by: Austin Teets
* 	Extended from Three.js editor
*/

var Viewport = function (editor) {

    // Editor Aliases 
    var signals = editor.signals;
    var camera = editor.camera;
    var tempCam = editor.camera;
    var scene = editor.scene;
    var config = editor.config;

    // Viewport Dom Element
    var renderer = null;
    var gridVis = true;
    var container = new UI.Panel();
    container.setId('viewport');
    container.setPosition('absolute');
    container.dom.style.zIndex = "1";

    // Initiate Picture in Picture
    container.add(new PIP(editor));

    // Interaction State
    var mouseDown = false;
    var downTime;

    // Item Counters
    var roomnum = 0;

    // APM Limiters
    var lastMove = Date.now();
    var renderLimit = Date.now();

    // Base Light
    var light = new THREE.HemisphereLight(0xffffff, 0x2430d6, 1.00);
    scene.add(light);

    // Base Grid
    var grid = new THREE.GridHelper(60, 196.85, 0x5F6E85, 0xBDC2CA);
    var array = grid.geometry.attributes.color.array;
    for (var i = 0; i < array.length; i += 60) {
        for (var j = 0; j < 12; j++) {
            array[i + j] = 0.26;
        }
    }
    scene.add(grid);
    signals.reloadBox.dispatch();

    // Static Textures and Materials
    var matPack = {
        'Base': new THREE.MeshToonMaterial({ color: 0xff0000 }),
        'Plane': new THREE.MeshToonMaterial({ color: 0xfad97a, side: THREE.DoubleSide }),
        'Paint': new THREE.MeshToonMaterial({ color: 0xff0000, side: THREE.DoubleSide }),
        'Lay1': new THREE.MeshToonMaterial({ color: 0xDDE1E5, side: THREE.DoubleSide }),
        'Lay2': new THREE.MeshToonMaterial({ color: 0xbac3c9, side: THREE.DoubleSide }),
        'Draw': new THREE.LineDashedMaterial({ color: 0xffffff, linewidth: 1, scale: 1, dashSize: 3, gapSize: 1 }),
        'Line': new THREE.LineDashedMaterial({ color: 0xff0000, linewidth: 1, scale: 1, dashSize: 3, gapSize: 1 }),
        'Wall': new THREE.MeshToonMaterial({ color: 0x1D6DA0, side: THREE.DoubleSide, transparent: true, opacity: 0.8 }),
        'Plane-Select': new THREE.MeshToonMaterial({ color: 0x56f442, side: THREE.DoubleSide }),
        'Wall-Select': new THREE.MeshToonMaterial({ color: 0x56f442, side: THREE.DoubleSide }),
        'Inactive': new THREE.MeshToonMaterial({ color: 0xE0EFF9, side: THREE.DoubleSide, transparent: true, opacity: 0.7 }),
        'FloorFeat': new THREE.MeshToonMaterial({ color: 0x50677b, side: THREE.DoubleSide, transparent: true, opacity: 0.5 })
    };

    /*  ====================================
            FUNCTIONS AND USER INTERACTION  
        ==================================== */

    /* Click and Intersection Functions */
    var mouse = new THREE.Vector2();
    var onDownPosition = new THREE.Vector2();
    var onUpPosition = new THREE.Vector2();
    var onDoubleClickPosition = new THREE.Vector2();
    var onMovePosition = new THREE.Vector2();

    var manager = new Manager(editor, matPack);
    var saver = new SaveLoad(editor);

    var raycaster = new THREE.Raycaster();
    raycaster.linePrecision = .05;

    function getIntersects(point, objects) {
        mouse.set((point.x * 2) - 1, - (point.y * 2) + 1);
        raycaster.setFromCamera(mouse, camera);
        return raycaster.intersectObjects(objects);
    }

    function getMousePosition(dom, x, y) {
        var rect = dom.getBoundingClientRect();
        return [(x - rect.left) / rect.width, (y - rect.top) / rect.height];
    }

    function handleClick(shift, right) {
        if (onDownPosition.distanceTo(onUpPosition) !== 0) {
            return;
        } else {
            manager.clearDrag();
        }
        manager.handleClick(onDownPosition);
        render();
    }

    function onMouseMove(event) {
        if (Date.now() - lastMove < 31) { // 32 frames a second
            return;
        } else {
            lastMove = Date.now();
        }
        event.preventDefault();
        var array = getMousePosition(container.dom, event.clientX, event.clientY);
        onMovePosition.fromArray(array);
        manager.handleMove(onMovePosition, mouseDown, downTime);
    }

    function onMouseDown(event) {
        e = event;
        var click;
        if ("which" in e)
            click = e.which;
        else if ("button" in e)
            click = e.button;
        event.preventDefault();
        mouseDown = true;
        downTime = Date.now();
        var array = getMousePosition(container.dom, event.clientX, event.clientY);
        onDownPosition.fromArray(array);
        manager.room && manager.room.floor ? manager.setIntersects(onDownPosition) : null;
        manager.setDragOrigin(onDownPosition);
        document.addEventListener('mouseup', onMouseUp, false);
    }

    function onMouseUp(event) {
        var isRightMB;
        var click;
        e = event;
        var array = getMousePosition(container.dom, event.clientX, event.clientY);
        onUpPosition.fromArray(array);
        mouseDown = false;
        manager.dragRelease();
        handleClick(event.shiftKey, isRightMB);
        manager.clearIntersects();
        document.removeEventListener('mouseup', onMouseUp, false);
    }

    function onTouchStart(event) {
        var touch = event.changedTouches[0];
        var array = getMousePosition(container.dom, touch.clientX, touch.clientY);
        onDownPosition.fromArray(array);
        document.addEventListener('touchend', onTouchEnd, false);
    }

    function onTouchEnd(event) {
        var touch = event.changedTouches[0];
        var array = getMousePosition(container.dom, touch.clientX, touch.clientY);
        onUpPosition.fromArray(array);
        //handleClick();
        document.removeEventListener('touchend', onTouchEnd, false);
    }

    function onDoubleClick(event) {
        var array = getMousePosition(container.dom, event.clientX, event.clientY);
        onDoubleClickPosition.fromArray(array);
    }

    container.dom.addEventListener('mousedown', onMouseDown, false);
    container.dom.addEventListener('touchstart', onTouchStart, false);
    container.dom.addEventListener('dblclick', onDoubleClick, false);
    container.dom.addEventListener('mousemove', onMouseMove, false);

    var controls = new THREE.EditorControls(camera, container.dom);
    controls.addEventListener('change', function () {
        render();
    });
    signals.cameraChanged.dispatch(camera);


    // System Signals
    document.addEventListener("DOMContentLoaded", function (event) {
        signals.windowResize.dispatch();
        manager.init();
        signals.addRoom.dispatch();
    });
    signals.login.add(function (user) {
        editor.user = user;
    });
    signals.addRoom.add(function () {
        console.log("Add Room");
        if (!manager.drawing) {
            manager.addRoom("Room" + roomnum);
            roomnum += 1;
        }
    });
    signals.switchTool.add(function () {
        console.log("Switch Tool");
        manager.addRoom("Room" + roomnum);
        roomnum += 1;
    });
    signals.addPoint.add(function () {
        console.log("Add Point");
        manager.addPoint();
        manager.room._notation.createData();
    });
    signals.updateNotation.add(function () {
        manager.room._notation.createData();
    });
    signals.deleteWall.add(function (n) {
        console.log("Delete Wall");
        manager.removePoint(n);
        render(true);
    });
    signals.deleteRoom.add(function () {
        console.log("Delete Room");
        manager.deleteRoom();
        render(true);
    });
    signals.changePage.add(function (page) {
        manager.sidebar.mainpages();
        if (page === 'splashPage' && manager.room) {
            manager.room.deactivate();
        } else if (page == 'viewport' && manager.room) {
            manager.sidebar.viewport();
            manager.room.activate();
            render(true);
        }
    });
    signals.exportDXF.add(function () {
        manager.export();
    });
    signals.completeRoom.add(function (n) {
        console.log("Complete Room");
        if (n === "Disto" && manager._drawing) {
            manager._drawing.completeRoomDisto();
            manager.clearMove();
            manager.makeRoom();
            manager.activateHighlight();
        } else if (n !== "Disto") {
            manager.clearMove();
            manager.makeRoom();
            manager.activateHighlight();
        }
        render();
    });
    signals.cleanLayouts.add(function () {
        console.log("Clean Layouts");
        manager.clear();
        roomnum = 0;
        render();
    });
    signals.roomSwitch.add(function (rmname) {
        console.log("Room Change");
        manager.changeRoom(rmname);
        render(true);
    });
    signals.newLayout.add(function (rmname) {
        console.log("New Layout");
    });
    var ang = 0;
    signals.layout.add(function (width, overlap, grain) {
        console.log("Layout");
        ang = ang === 350 ? 0 : ang + 5;
        manager.room && !manager.drawing ? manager.room.newLayout() : null;
        render();
    });
    signals.clearLayout.add(function () {
        console.log("Clear Layout");
        manager.clearDrag();
        manager.room.clearLayout();
    });

    // Dragging
    signals.dragRoom.add(function () {
        manager.activateRoomDrag();
    });

    signals.activateDrag.add(function (feat) {
        feat === 'Door' || feat === 'Stairs' || feat === 'FloorFeat' ? manager.activateFeatureDrag() : null;
        feat === 'Layout' ? manager.activateSeamDrag()  : null;
    });
    signals.activateDragWall.add(function (n) {
        manager.activateWallDrag(n);
        render();
    });
    signals.recalculateRoll.add(function () {
        console.log("Recalculate Roll");
        manager.room.layout.calculateRoll();
        render();
    });
    signals.recalculateLayout.add(function (full) {
        console.log("Recalculate Layout");
        manager.room.layout.removeLayout();
        manager.room.calculateLayout(full);
        render();
    });
    signals.tseam.add(function (numsplit) {
        console.log("T-Seam");
        manager.tseam();
    });
    signals.tseamCut.add(function (name) {
        console.log("T-Seam");
        manager.room.layout.tseam(new THREE.Vector3(), name);
        manager.clearClick();
        render();
    });
    signals.priceChanged.add(function () {
        console.log("Price Change");
        manager.room.layout.priceChange();
    });
    signals.constrainWall.add(function (n, id, type) {
        console.log("Constrain Wall");
        manager.editWall(n, id, type);
        render();
    });
    signals.constrainCustom.add(function (n, id, type) {
        console.log("Constrain Custom");
        manager.editCustom(n, id, type);
        render();
    });
    signals.setCustomHeight.add(function (n, id, type) {
        console.log("Height Custom");
        manager.setCustomHeight(n, id, type);
        render();
    });
    signals.selectDoor.add(function (door) {
        console.log("Select");
        manager.room._activeDoor = door;
    });
    signals.setWallValue.add(function (meas, draw) {
        console.log("Set Wall Value");
        console.log("Disto Measurement Received");
        if (meas[0] === 0 && meas[1] === 0) {
            return;
        }
        if (manager._drawing) {
            manager.addPointDisto(meas);
        } else if (manager.room.activeDoor) {
            manager.room.setDoorValue(meas);
        }
        render();
    });
    signals.flip.add(function (num) {
        console.log("Flip");
        manager.flip(num);
        render();
    });
    signals.backspace.add(function (num) {
        console.log("Backspace");
        manager.removePoint(num);
    });
    signals.addFeature.add(function (feat) {
        console.log("Add Feature");
        manager.addFeature(feat);
    });
    signals.deleteFeature.add(function (numfeat) {
        console.log("Delete Feature");
        manager.room.deleteFeature(numfeat);
        render();
    });
    signals.deleteCustom.add(function (id) {
        console.log("Delete Custom");
        manager.room.deleteCustom(id);
        render();
    });
    signals.updateFeature.add(function (id) {
        console.log("Update Feature");
        manager.room.updateFeature(id);
        render();
    });
    signals.selectFeature.add(function (id) {
        manager.room.selectFeature(id);
        render();
    });
    signals.selectWall.add(function (id) {
        manager.room.selectWall(id);
        render(true);
    });
    signals.lockWall.add(function (id) {
        manager.room.lockWall(id);
        render(true);
    });
    signals.floorFeature.add(function () {
        console.log("Add Floor Feature");
        !manager.drawing ? manager.addFloorFeature() : null;
        render();
    });
    signals.completeFeature.add(function () {
        console.log("Complete Floor Feature");
        manager.completeFloorFeature();
        render();
    });

    //Canvas
    signals.rollChange.add(function (event) {
        manager._room.layout.updateRoll();
    });

    signals.compress.add(function () {
        console.log("Compress");
        if (manager.room && !manager._drawing) {
            manager.room.layout.roll.compress();
            manager.room.layout.roll.compress();
        }
    });

    signals.savePacket.add(function () {
        console.log("Save Packet");
        var ser = manager.serialize();
        saver.saveToDB('123456789', ser);
    });
    signals.loadPacket.add(function (pnum) {
        console.log("Loading");
        pnum ? saver.loadFromDB(pnum) : null; //saver.loadLocal();
    });
    signals.loadProjURL.add(function (parsed) {
        manager.setProjectInformation(parsed);
    });
    signals.loadLocal.add(function (pnum) {
        console.log("Loading");
        saver.loadLocal();
    });
    signals.addDoorway.add(function (door) {
        console.log("Add Doorway");
        manager.addDoorway(door);
    });
    signals.recutWalls.add(function () {
        manager.room.refresh();
    });
    signals.activeDraw.add(function () {
        console.log("Active");
    });
    signals.loaded.add(function (ret) {
        console.log("Loaded");
        console.log(ret);
        manager.clear();
        roomnum = 0;
        //signals.nav.dispatch('Draw Room');
        manager.deserialize(JSON.parse(ret));
        roomnum = manager.numrooms;
        render();
    }); 
    signals.measure.add(function () {
        console.log("Measure");
        manager.startMeasure();
    });
    signals.clearTape.add(function () {
        console.log("Clear Tape");
        manager.clearClick();
        manager.clearMove();
        manager.activateHighlight();
    });
    
    signals.deleteTape.add(function () {
        console.log("Clear Tape");
        manager.clearMeasure();
    });
    signals.roomNameChange.add(function (nm) {
        console.log("Name Change " + nm);
        manager.room.setAlias(nm);
    });
    signals.savePDF.add(function () {
        console.log("Save PDF");
        manager.save2D();
    });
    signals.addWall.add(function () {
        console.log("Add Wall");
    });
    signals.updateWall.add(function (arrs, le, lr = true) {
        console.log("Update Wall");
    });
    signals.newRoom.add(function (room) {
        console.log("New Room");
    });
    signals.objectSelected.add(function (object) {
        console.log("Object Selected");
    });
    signals.objectFocused.add(function (object) {
        console.log("Object Focused");
    });
    signals.move.add(function (pos) {
        render();
    });
    signals.editorCleared.add(function () {
        console.log("Editor Cleared");
        render();
    });
    signals.sceneGraphChanged.add(function () {
        console.log("Scene Graph Changed");
        render();
    });
    signals.cameraChanged.add(function () {
        console.log("Camera Changed");
        render();
    });
    signals.objectAdded.add(function (object) {
        console.log("Object Added");
        render();
    });
    signals.objectChanged.add(function (force) {
        manager.room._notation.createData();
        render(force);
    });
    signals.objectRemoved.add(function (object) {
        console.log("Object Removed");
        render();
    });
    signals.geometryChanged.add(function (object) {
        console.log("Geometry Changed");
        render();
    });
    signals.materialChanged.add(function (material) {
        console.log("Material Changed");
        render();
    });
    // Change Signals
    signals.sceneBackgroundChanged.add(function (backgroundColor) {
        console.log("Scene Background Changed");
        scene.background.setHex(backgroundColor);
        render();
    });
    signals.cameraSwitch.add(function () {
        console.log("Camera Switch");
        if (camera === editor.camera) {
            camera = editor.camera2;
            camera.aspect = container.dom.offsetWidth / container.dom.offsetHeight;
            camera.updateProjectionMatrix();
            manager.camera = camera;
            controls.dispose();
            controls = new THREE.EditorControls4(camera, container.dom);
            controls.addEventListener('change', function () {
                render();
            });
            manager.disableInteractions();
            renderer.autoUpdateScene = true;
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(container.dom.offsetWidth, container.dom.offsetHeight);
            signals.cameraChanged.dispatch(camera);
            render(true);
        } else {
            camera = editor.camera;
            var frustumSize = 20;
            var aspect = container.dom.offsetWidth / container.dom.offsetHeight;
            camera.left = - frustumSize * aspect / 2;
            camera.right = frustumSize * aspect / 2;
            camera.top = frustumSize / 2;
            camera.bottom = - frustumSize / 2;
            camera.updateProjectionMatrix();
            manager.camera = camera;
            controls.dispose();
            controls = new THREE.EditorControls(camera, container.dom);
            controls.addEventListener('change', function () {
                render();
            });
            manager.enableInteractions();
            renderer.autoUpdateScene = true;
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(container.dom.offsetWidth, container.dom.offsetHeight);
            signals.cameraChanged.dispatch(camera);
            render(true);
        }
    });
    signals.windowResize.add(function () {
        console.log("Window Resize");
        var frustumSize = 20;
        var aspect = container.dom.offsetWidth / container.dom.offsetHeight;
        if (camera === editor.camera) {
            camera.left = - frustumSize * aspect / 2;
            camera.right = frustumSize * aspect / 2;
            camera.top = frustumSize / 2;
            camera.bottom = - frustumSize / 2;
            camera.updateProjectionMatrix();
        } else {
            camera.aspect = container.dom.offsetWidth / container.dom.offsetHeight;
            camera.updateProjectionMatrix();
        }
        renderer.setSize(container.dom.offsetWidth, container.dom.offsetHeight);
        render(true);
    });
    signals.rendererChanged.add(function (newRenderer) {
        console.log("Renderer Changed");
        if (renderer !== null) {
            container.dom.removeChild(renderer.domElement);
        }
        renderer = newRenderer;
        renderer.autoClear = false;
        renderer.autoUpdateScene = true;
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(container.dom.offsetWidth, container.dom.offsetHeight);
        container.dom.appendChild(renderer.domElement);
        render();
    });
    function render(force) {
        if (Date.now() - renderLimit < 31 && !force) { // 32 frames a second
            return;
        } else {
            renderLimit = Date.now();
        }
        scene.updateMatrixWorld();
        signals.renPip.dispatch(scene, camera);
        renderer.render(scene, camera);
    }

    return container;
};