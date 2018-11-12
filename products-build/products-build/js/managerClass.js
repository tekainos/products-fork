class Manager {
    constructor(editor, materials) {
        this._editor = editor;
        this._signals = editor.signals;
        this._camera = editor.camera;
        this._scene = editor.scene;
        this._raycaster = new THREE.Raycaster();
        this._raycaster.linePrecision = .05;
        this._mouse = new THREE.Vector2();
        this._sidebar = new SidebarPanel(editor);
        this._drawHeight = 0.1;
        this._highlighted;
        this._sketch;
        this._room;
        this._tape = new MeasuringTape(editor, this._sidebar);
        this._materials = materials;
        this._drawing = false;
        this._rooms = {};
        this._floor;
        this._intersectWalls = [];
        this._dragFeatures = [];
        this._collisions = [];
        this._click = [];
        this._drag = [];
        this._move = [];
        this._save = [];
        this._cleanup = {'move':[], 'drag':[], 'click': []};
        this._dragOrigin;
        this._dragRelease;
        this._dragObject = null;
        this._last;
        this._interactions = true;
        this._notation;
        this._projectInformation;
        this._restOfWalls = [];
    }

    get scene() { return this._scene; }
    get editor() { return this._editor; }
    get signals() { return this._signals; }
    get sidebar() { return this._sidebar; }
    get sketch() { return this._room.sketch; }
    get room() { return this._room; }
    get drawing() { return this._drawing; }
    get intersects() { return this._intersectWalls; }
    get numrooms() { return this.getNextRoomNum(); }

    set camera(newcam) {
        this._camera = newcam;
    }

    getNextRoomNum() {
        var i = Object.keys(this._rooms).length;
        while (Object.keys(this._rooms).indexOf("Room" + i) >= 0) {
            console.log(this._rooms["Room" + i]);
            i += 1;
        }
        return i;
    }

    enableInteractions() {
        this._interactions = true;
    }

    disableInteractions() {
        this._interactions = false;
    }

    init() {
        this._sidebar.init();
    }

    setProjectInformation(parsed) {
        this._projectInformation = parsed;
    }

    addRoom(roomName) {
        this._drawHeight = 0.1;
        this.clearClick();
        this.clearMove();
        this.clearDrag();
        if (this._room) {
            this._room.deactivate();
        }
        this._room = new Room(this._editor, roomName, this._sidebar, this._materials);
        this._sidebar.addRoom(this._room);
        this._drawing = this._room.sketch;
        this.setClick(function (pos, col) { this.start(pos, col); }, this._drawing, this._collisions);
        this.setMove(function (pos, col) { this.move(pos, col); }, this._drawing, this._collisions);
    }

    addRoomDisto(roomName) {
        this._drawHeight = 0.1;
        this.clearClick();
        this.clearMove();
        this.clearDrag();
        if (this._room) {
            this._room.deactivate();
        }
        this._room = new Room(this._editor, roomName, this._sidebar, this._materials);
        this._sidebar.addRoom(this._room);
        this._drawing = this._room.sketch;
        this._room.sketch.start(new THREE.Vector3(0, this._drawHeight, 0));
        //this._room.sketch.startDisto();
    }

    flip(n) {
        if (this._drawing) {
            if (n === "Disto") {
                n = this._room.sketch.pointCount - 1;
            }
            this._room.sketch.flipLine(n);
        }
        /*
        var id = this._room.name + '-form' + n;
        var newMeas = this._sidebar.getMeas(id);
        var mag = newMeas.feet * 0.3048 + newMeas.inch * 0.0254;
        var newAng = parseInt(newMeas.angle) + 180;
        this._sidebar.emptyBoxes(this._room.name);
        this._room.sketch.updatePoint(n, { 'magnitude': mag, 'angle': newAng });
        if (!this._drawing && this._room) {
            this.updateRoomModel();
            this.makeRoom();
        }*/
    }

    addPoint() {
        this._drawing ? this.setClick(function (pos, col) { this.addPoint(pos, col); }, this._drawing, this._collisions) : null;
    }

    addPointDisto(meas) {
        if (this._drawing) {
            this._drawing.addPointDisto(meas);
            this.clearClick();
            //this.clearMove();
            //this.clearDrag();
        } else {
            console.log("Not Drawing Yet");
            /*
            this._drawing = true;
            this._room.sketch.start(new THREE.Vector3(0, this._drawHeight, 0));
            this._room.sketch.addPointDisto(meas); */
        }
    }

    editWall(n, id, type) {
        console.log(type);
        var newMeas = this._sidebar.getMeas(id, n);
        var data = { 'magnitude': feetInchToMeters(newMeas.feet, newMeas.inch), 'angle': newMeas.angle };
        if ((newMeas.angle === 180 || newMeas.angle === -180) && n !== 0) {
            this._room.sketch.updateSidebar();
            return false;
        }
        if (!this._drawing) {
            this.updateRoomModel();
            this._room.sketch.updatePoint(n, data, type);
            this.makeRoom();
            this._room.remakeFeatures();
        } else {
            this._room.sketch.updatePoint(n, data, type, this._drawing);
        }
    }

    editCustom(n, id, type) {
        var newMeas = this._sidebar.getMeas(id);
        var data = { 'magnitude': feetInchToMeters(newMeas.feet, newMeas.inch), 'angle': newMeas.angle };
        var f = $("#" + id).attr('name');
        console.log(f);

        var feat = this._room.getFloorFeatureById(f);
        if ((newMeas.angle === 180 || newMeas.angle === -180 || newMeas.angle === 360) && n !== 0) {
            feat.sketch.updateSidebar();
            return false;
        }
        feat.sketch.updatePoint(n, data, type);
        feat.remake();
        this._room.updateCustom(feat);
    }

    setCustomHeight(n, id, type) {
        var newMeas = this._sidebar.getHeight(id);
        var data = feetInchToMeters(newMeas.feet, newMeas.inch);
        var f = $("#" + id).attr('name');
        console.log(f);
        var feat = this._room.getFloorFeatureById(f);
        console.log(feat);
        feat.setHeight(data);
        feat.remake();
        this._room.updateCustom(feat);
    }

    removePoint(n) {
        if (this._drawing) {
            if (n === "Disto") {
                this._room.sketch.undoPoint();
            } else if (this._room.wallCount <= 3) {
                this.deleteRoom();
            } else {
                this._room.sketch.removePoint(n);
                this.updateRoomModel();
                this.makeRoom();
            }
        }
    }
    
    save2D() {
        var ct = Object.keys(this._rooms).length;
        var converted = {};
        for (var i = 0; i < ct; i++) {
            var rm = this._rooms[Object.keys(this._rooms)[i]];
            converted[rm.alias] = rm.get2D();
        }
        console.log(converted);
        savePacket(converted);
    }

    updateRoomModel() {
        this._room.removeModel();
        this._sidebar.emptyBoxes(this._room.name);
    }

    makeRoom() {
        this._room.generateRoom();
        this._rooms[this._room.name] = this._room;
        this.activateHighlight();
        this.recalculateCollisions();
        this._drawing = false;
    }

    recalculateCollisions() {
        var keys = Object.keys(this._rooms);
        this._collisions = [];
        for (var i = 0; i < keys.length; i++) {
            this._collisions = this._collisions.concat(this._rooms[keys[i]].meshList);
        }
    }

    activateHighlight() {
        this.setMove(function (pos) { this._highlighted = this.highlight(pos, this._room.meshList); }, this);
    }

    removeCollision() {
        this.recalculateCollisions();
    }

    deleteRoom() {
        var numRooms = Object.keys(this._rooms).length;
        if (this._drawing && numRooms > 0) {
            this._room.clear();
            this._sidebar.deleteRoom(this._room.name);
            this._room = this._rooms[Object.keys(this._rooms)[numRooms - 1]];
            this._room.activate();
            this._sidebar.changeRoom(this._room.name);
        } else if (numRooms > 1) {
            delete this._rooms[this._room.name];
            this._sidebar.deleteRoom(this._room.name);
            this._room.clear();
            this._room = this._rooms[Object.keys(this._rooms)[numRooms - 2]];
            this._room.activate();
            this._sidebar.changeRoom(this._room.name);
            this.removeCollision();
        } else {
            this._sidebar.deleteRoom(this._room.name);
            this.clear();
        }
        this._drawing = false; 
    }

    loadRoom() {
        if (this._save.length > 0) {
            var room = this._save[0];
            this._room = room;
            this.makeRoom();
        }
    }

    changeRoom(roomname) {
        this._sidebar.changeRoom(roomname);
        this._room.deactivate();
        this.clearInteractions();
        this._room = this._rooms[roomname];
        this._room.activate();
        this.activateHighlight();
    }

    // Dragging Set

    setDragOrigin(pos) {
        this._dragOrigin = this.clickPoint(pos);
    }

    activateFeatureDrag() {
        this.clearDrag();
        this.setDrag(function (pos) {
            var drg = this._dragFeatures.length > 0 ? this._room.getFeatureByName(this._dragFeatures[0].object.name) : null;
            if (drg) {
                this._dragObject = drg;
                drg.setDragPoint(new THREE.Vector2(this._dragFeatures[0].point.x, this._dragFeatures[0].point.z));
                drg.drag(pos);
            } else {
                this._dragObject = null;
            }
        }, this);
        this._dragRelease = function () {
            this._dragObject ? this._dragObject.validatePosition(this._room.sketch.array2d, this._dragOrigin) : null;
            this._dragObject = null;
            this._room.refresh();
        };
    }

    activateSeamDrag() {
        this.clearDrag();
        this.setDrag(function (pos, pos0) {
            var drg = this._dragLayout.length > 0 ? this._room.layout : null;
            drg ? drg.drag(pos, pos0) : null;
        }, this, this._dragOrigin, false);
        this._dragRelease = function () {
            this._dragLayout.length > 0 ? this._signals.recalculateLayout.dispatch() : null;
            //this.recalculateRoll();
        };
    }

    activateWallDrag(n) {
        this.clearDrag();
        this.setDrag(function (pos) {
            if (this._intersectWalls.length > 0) {
                var dg = this._room.dragPoint(n, pos);
            }
        }, this, true, false);
        this._dragRelease = (function () {
            this._room.sketch.updateSidebar();
            this.makeRoom();
            this._room.remakeFeatures();
        });
    } 

    activateRoomDrag() {
        if (this._room && !this._drawing) {
            this._restOfWalls = this.calculateRestOfWalls();
            this.clearDrag();
            this.clearMove();
            this.clearClick();
            this.setDrag(function (pos) {
                if (this._floor.length > 0) {
                    this._room.setDragPoint(new THREE.Vector2(this._floor[0].point.x, this._floor[0].point.z));
                    var dg = this._room.drag(pos, this._restOfWalls);
                }
            }, this);
            this._dragRelease = (function () {
                this.makeRoom();
                this._room.clearDragPoints();
                this._room.remakeFeatures();
            });
        }
    }

    calculateRestOfWalls() {
        var rest = [];
        var rest2d = [];
        for (var rm in this._rooms) {
            if (this._rooms[rm] != this._room) {
                rest = rest.concat(this._rooms[rm].wallMeshes);
                rest2d.push(this._rooms[rm].sketch.array2d);
            }
        }
        console.log(rest2d);
        return [rest, rest2d];
    }

    tseam() {
        if (this._room && this._room.layout) {
            this.clearClick();
            this._room.layout.roll.tseam();
            this.setClick(function (pos) { this._dragLayout.length > 0 ? this._room.layout.tseam(this._dragLayout[0].point, this._dragLayout[0].object.name) : this._signals.tseam.dispatch(); }, this);
        }
    }

    dragRelease() {
        if (this._dragRelease) {
            this._dragRelease.apply(this);
        }
    }

    addFeature(feature) {
        if (!this._drawing && this._room) {
            this.clearClick();
            feature === 'Door' ? this.setClick(function (pos) { this._intersectWalls.length > 0 ? this._room.addFeature(this._intersectWalls[0].point, feature, this._intersectWalls[0].object.name) : this._signals.addFeature.dispatch(feature); }, this) : null;
            feature === 'Stairs' ? this.setClick(function (pos) { this._floor && this._floor.length > 0 ? this._room.addFeature(this._floor[0].point, feature, this._floor[0].object.name) : this._signals.addFeature.dispatch(feature); }, this) : null;
        }
    }

    addDoorway(mesh, indices) {
        null;
        //this._room.addDoorway(mesh, indices);
    }

    addFloorFeature(feature) {
        console.log("Floor Feature");
        if (this._room) {
            this._drawHeight += 0.1;
            this.clearClick();
            this.clearMove();
            this.clearDrag();
            this._drawing = this._room.addFloorFeature();
            this.setClick(function (pos, col) { this.startFeature(pos, col); }, this._drawing);
            this.setMove(function (pos, col) { this.move(pos, col); }, this._drawing);
        }
    }

    completeFloorFeature() {
        this._drawHeight -= 0.1;
        this._room.completeFloorFeature();
        this.activateHighlight();
        this._drawing = false;
    }

    startMeasure() {
        if (!this._drawing) {
            var msh = this._room.lineList.concat(this._room.featLines);
            this.setClick(function (pos, col) { this.addPoint(pos, col); }, this._tape, msh);
            this.setMove(function (pos, col) { this.move(pos, col); }, this._tape, msh);
            //this.setCleanup(function () { this.cleanup(); }, this._tape, 'move');
            //this.setCleanup(function () { this.clearMeasure(); }, this, 'click');
        }
    }

    clearMeasure() {
        this.clearClick();
        this.clearMove();
        this._tape.clear();
        this.activateHighlight();
    }

    setClick(callback, callbackObj, collision) {
        var farr = collision ? [callback, callbackObj, collision] : [callback, callbackObj];
        this._click.push(farr);
    }

    setDrag(callback, callbackObj, origin, collision) {
        var farr = { "Callback": callback, "Obj": callbackObj, "Origin" : origin, "Collision" : collision }
        //var farr = origin ? [callback, callbackObj, origin] : [callback, callbackObj];
        this._drag.push(farr);
    }

    setMove(callback, callbackObj, collision) {
        var farr = collision ? [callback, callbackObj, collision] : [callback, callbackObj];
        this._move.push(farr);
    }

    setCleanup(callback, callbackObj, type) {
        this._cleanup[type].push([callback, callbackObj]);
    }

    handleClick(pos) {
        if (!this._interactions) {
            return;
        }
        if (this._click.length > 0) {
            var ck = this._click.pop();
            ck.length > 2 ? ck[0].apply(ck[1], [this.clickPoint(pos), ck[2]]) : ck[0].apply(ck[1], [this.clickPoint(pos)]);
        }
    }

    handleDrag(pos0) {
        if (!this._interactions) {
            return;
        }
        if (this._drag.length > 0) {
            var ck = this._drag.pop();
            var pos = this.clickPoint(pos0);
            var args = ck.Origin ? [pos, ck.Origin] : [pos];
            ck.Collision ? args.push(this._room.meshList.concat(this._room.features)) : null;
            ck.Callback.apply(ck.Obj, args);
            this._drag.push(ck);
        }
    }

    handleMove(pos, dragging, down) {
        if (!this._interactions) {
            return;
        }
        if (dragging && Date.now() - down > 100) {
            this.handleDrag(pos);
        } else if (this._move.length > 0) {
            var mv = this._move.pop();
            if (mv[1] === this) {
                var ret = mv[0].apply(this, [pos]);
            } else {
                mv.length > 2 ? mv[0].apply(mv[1], [this.clickPoint(pos), mv[2]]) : mv[0].apply(mv[1], [this.clickPoint(pos)]);
            }
            if (!ret) {
                this._move.push(mv);
            }
            this._signals.move.dispatch(pos);
        }
    }

    handleCleanup(type) {
        if (!this._interactions) {
            return;
        }
        while (this._cleanup[type].length > 0) {
            var cl = this._cleanup[type].pop();
            cl[0].apply(cl[1]);
        }
    }

    highlight(pos, obset) {
        var intx = this.getIntersects(pos, obset);
        var wl, ind;
        if (this._highlighted && (intx.length === 0 || (intx.length > 0 && intx[0].object.name !== this._highlighted))) {
            switch (this._highlighted.slice(0, 3)) {
                case 'Box':
                    wl = this._room.wallList.getFeatureByName(this._highlighted);
                    break;
                case 'Lay':
                    wl = this._room.layout;
                    ind = parseInt(this._highlighted);
                    break;
                case 'Str':
                    wl = this._room.getFeatureByName(this._highlighted);
                    break;
                case 'Cus':
                    wl = this._room.getFeatureByName(this._highlighted);
                    break;
                default:
                    wl = this._room.wallList.getWallByName(this._highlighted);
                    break;
            }
            wl ? wl.setMaterial('Wall', ind) : null;
        }
        if (intx.length > 0 && intx[0].object.name !== this._highlighted) {
            switch (intx[0].object.name.slice(0, 3)) {
                case 'Box':
                    wl = this._room.wallList.getFeatureByName(intx[0].object.name);
                    break;
                case 'Lay':
                    wl = this._room.layout;
                    ind = intx[0].object.name;
                    break;
                case 'Str':
                    wl = this._room.getFeatureByName(intx[0].object.name);
                    break;
                case 'Cus':
                    wl = this._room.getFeatureByName(intx[0].object.name);
                    break;
                default:
                    wl = this._room.wallList.getWallByName(intx[0].object.name);
                    break;
            }
            wl ? wl.setMaterial('Wall-Select', ind): null;
            return intx[0].object.name;
        } else if (intx.length > 0) {
            return this._highlighted;
        }
        return null;
    }

    serialize() {
        var rms = {};
        var rm;
        for (rm in this._rooms) {
            rms[rm] = this._rooms[rm].serialize();
        }
        if (this._room) {
            rm = this._room.serialize();
        }
        return { 'rooms': rms, 'room': rm, 'projectInformation': this._projectInformation };
    }

    deserialize(pack) {
        if (pack) {
            this.deleteRoom();
            this._sidebar.toggleAnimations();
            if (pack.projectInformation) {
                this._signals.loadProjURL.dispatch(pack.projectInformation);
            }
            var newroom;
            for (var room in pack.rooms) {
                var rm = pack.rooms[room];
                this._room = new Room(this._editor, rm.name, this._sidebar, this._materials);
                this._rooms[this._room.name] = this._room;
                this._sidebar.addRoom(this._room);
                this._room.deserialize(rm);
                this._room.deactivate();
            }
            //this._room.activate();
            this.clearClick();
            this._drawing = false;
            this.setMove(function (pos) { this._highlighted = this.highlight(pos, this._room.meshList, this._highlighted); }, this);
            this.activateFeatureDrag();
            this._sidebar.toggleAnimations();
        }
    }

    clickPoint(point) {
        var vector = new THREE.Vector3();
        vector.set((point.x * 2) - 1, -(point.y * 2) + 1, 0.5);
        vector.unproject(this._camera);
        return new THREE.Vector3(vector.x, this._drawHeight, vector.z);
    }

    clickPointConstrained(point) {
        var wls = this._room.sketch.array2d;
        var col = this._room.meshList.concat(this._room.features);

        var vector = new THREE.Vector3();
        vector.set((point.x * 2) - 1, -(point.y * 2) + 1, 0.5);
        vector.unproject(this._camera);
        var pt = new THREE.Vector2(vector.x, vector.z);

        return this.findNearest(pt, wls);
    }

    findNearest(pt, polygon) {
        var x = pt.x, y = pt.y;
        var inside = false;
        for (var i = 0, j = polygon.length - 2; i < polygon.length-1; j = i++) {
            var xi = polygon[i].x, yi = polygon[i].y;
            var xj = polygon[j].x, yj = polygon[j].y;

            var intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        if (!inside) {
            var minpt = interpolate2D(pt, polygon[0], polygon[polygon.length - 2]);
            var mindist = pt.distanceToSquared(minpt);
            var minind = 0;
            for (var i = 1; i < polygon.length - 1; i++) {
                var tst = interpolate2D(pt, polygon[i], polygon[i - 1]);
                var dt = pt.distanceToSquared(tst);
                if (dt < mindist) {
                    mindist = dt;
                    minpt = tst.clone();
                }
            }
            console.log(minpt);
            return new THREE.Vector3(minpt.x, this._drawHeight, minpt.y);
        } else {
            return new THREE.Vector3(pt.x, this._drawHeight, pt.y);
        }
    }

    setIntersects(point) {
        var objects = this._room.meshList;
        this._mouse.set(point.x * 2 - 1, - (point.y * 2) + 1);
        this._raycaster.setFromCamera(this._mouse, this._camera);
        this._intersectWalls = this._raycaster.intersectObjects(objects);
        this._dragFeatures = this._raycaster.intersectObjects(this._room.features);
        this._dragLayout = this._raycaster.intersectObjects(this._room.layoutMesh);
        this._floor = this._raycaster.intersectObject(this._room.floor);
    }

    getIntersects(point, objects) {
        // Make the raycast list
        objects = this._room.meshList.concat(this._room.features).concat(this._room.layoutMesh);
        this._mouse.set((point.x * 2) - 1, - (point.y * 2) + 1);
        this._raycaster.setFromCamera(this._mouse, this._camera);
        return this._raycaster.intersectObjects(objects);
    }

    collision(pt1, pt2, meshlist) {
        var nrm = new THREE.Vector3(pt2.x - pt1.x, pt2.y - pt1.y, pt2.z - pt1.z).normalize();
        this._raycaster.set(pt1, nrm);
        return this._raycaster.intersectObjects(meshlist);
    }

    clearDrag() {
        this.handleCleanup('drag');
        this._drag = [];
        this._dragRelease = null;
    }

    clearMove() {
        this.handleCleanup('move');
        this._move = [];
    }

    clearClick() {
        this.handleCleanup('click');
        this._click = [];
    }

    clearIntersects() {
        this._intersectWalls = [];
        this._dragFeatures = [];
        this._dragLayout = [];
    }

    clearInteractions() {
        this.clearDrag();
        this.clearClick();
        this.clearMove();
    }

    clear() {
        this.clearInteractions();
        this._collisions = [];
        this._intersectWalls = {};
        this._floor = null;
        this._tape.clear();
        for (var rm in this._rooms) {
            this._rooms[rm].clear();
        }
        this._room ? this._room.clear() : null;
        this._rooms = {};
        this._sidebar.clear();
    }
}

function interpolate2D(currPos, vec0, vec1) {
    var dist = new THREE.Vector2().subVectors(currPos, vec0);
    var odist = new THREE.Vector2().subVectors(vec1, vec0);
    var ang = new THREE.Vector3(dist.x, 0, dist.y).angleTo(new THREE.Vector3(odist.x, 0, odist.y));
    var d1 = dist.length() * Math.cos(ang);
    if ((d1 / odist.length()) <= 1 && (d1 / odist.length()) >=0) {
        var terp = new THREE.Vector2().lerpVectors(vec0, vec1, (d1 / odist.length()));
        return terp;
    } else {
        return vec0;
    }
}