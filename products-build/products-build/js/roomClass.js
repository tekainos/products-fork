class Room {
    constructor(editor, name, sidebar, materials) {
        this._editor = editor;
        this._scene = editor.scene;
        this._signals = editor.signals;
        this._sidebar = sidebar;
        this._origin = new THREE.Vector3(0, 0, 0);
        this._name = name;
        this._perimeter = 0;
        this._surfaceArea = 0;
        this._center = new THREE.Vector3(0, 0, 0);
        this._mesh;
        this._wallCount = 0;
        this._meshList;
        this._lineList;
        this._features = [];
        this._featLines = [];
        this._wallFeatures = [];
        this._transitions = [];
        this._floorFeatures = [];
        this._floorFeatureTemp;
        this._featRemake = [];
        this._sketch = new Sketch(new THREE.Vector3(0, 0, 0), editor, name, this._sidebar, materials);
        this._walls = new WallSet(editor, this._origin, name, this._sidebar, materials);
        this._notation = new Notations(this._editor, this);
        this._materials = materials;
        this._layout;
        this._stairLayout = [];
        this._alias = name;
        this._layoutMesh = [];
        this._activeDoor;
        this._dragPoint;
    }

    get origin() { return this._origin; }
    get name() { return this._name; }
    get perimeter() { return (this._perimeter*3.28084).toFixed(2); }
    get surfaceArea() { return (this._surfaceArea * 10.7639).toFixed(2); }
    get center() { return this._center; }
    get floor() { return this._mesh; }
    get wallCount() { return this._wallCount; }
    get features() { return this._features; }
    get featLines() { return this._featLines; }
    get wallList() { return this._walls; }
    get walls() { return this._walls.walls; }
    get sketch() { return this._sketch; }
    get meshList() { return this._meshList; }
    get lineList() { return this._lineList; }
    get layout() { return this._layout; }
    get layoutMesh() { return this._layoutMesh; }
    get alias() { return this._alias; }
    get activeDoor() { return this._activeDoor; }
    get wallMeshes() { return this._walls.meshSet; }
 
    setAlias(alias) {
        this._alias = alias;
    }

    generateRoom() {
        if (this._mesh) {
            this._scene.remove(this._mesh);
            this._mesh = null;
        }
        this._sketch.updateSidebar();
        var ret = generate(this._sketch.line.geometry.attributes.position.array, this._materials.Lay1);
        this._winding = getWinding(ret[0]);
        this._walls.generateWalls(ret[0]);
        this._wallCount = this._walls.count;
        this._mesh = ret[1];
        this._mesh.name = this._name;
        this._scene.add(this._mesh);
        this._meshList = this._walls.meshSet;
        this._lineList = this._walls.lineSet;
        this._perimeter = ret[2];
        this._surfaceArea = ret[3];
        this._center = ret[4];
        this._notation.createData();
        this._dragPoint = null;
        //this._layout = new Layout(editor, this._name, this._mesh, this._sidebar);
        var mat = { 'Name': 'Carpet', 'Width': 12, 'Sold In': 'Rolls', 'Price': 2, 'Price-Unit': 'SqFt', 'Pattern': false };
        //this._layout.generateLayout(mat, 90);
    }

    get2D() {
        var floor = this._sketch.get2D();
        var layout = this._layout ? this._layout.get2D() : { "Coordinates": [] };
        var features = { "FloorFeatures": [], "WallFeatures": [] };
        for (var i = 0; i < this._floorFeatures.length; i++) {
            features["FloorFeatures"].push(this._floorFeatures[i].get2D());
        }
        for (var c = 0; c < this._wallFeatures.length; c++) {
            features["WallFeatures"].push(this._wallFeatures[c].get2D());
        }
        return { 'Boundary': floor, 'Layout': layout, 'Features': features, "Perimeter": this.perimeter, "Area": this.surfaceArea};
    }

    getDoors() {
        var feat = [];
        for (var i = 0; i < this._wallFeatures.length; i++) {
            feat.push(this._wallFeatures[i].get2D().Coordinates);
        }
        return feat;
    }

    remakeFeatures() {
        for (var i = 0; i < this._featRemake.length; i++) {
            var feat = this._featRemake[i];
            console.log(this._featRemake[i]);
            if (!feat[1]) {
                feat[1] = 0;
            }
            var msh = this._walls.addFeature(feat[0], feat[1], feat[2], feat[3], feat[4], feat[5], feat[6], feat[7], feat[8]);
            if (msh) {
                this._wallFeatures.push(msh);
                this._features.push(msh.mesh);
                this._featLines.push(msh.line);
                console.log(msh);
            }
        }
        for (var i = 0; i < this._floorFeatures.length; i++) {
            this._features.push(this._floorFeatures[i].mesh);
            this._featLines.push(this._floorFeatures[i].line);
        }
        this.refresh();
    }

    refresh() {
        this._layout ? this.newLayout() : null;
        this._walls.refresh();
    }

    addFeature(position, feature, wall) {
        var msh;
        if (feature === 'Door') {
            msh = this._walls.addFeature(position, feature, wall);
            this._featRemake.push([msh.dist, feature, wall, msh._width, msh.height, msh.top, msh.bottom, msh.type, msh.swing]);
            this._wallFeatures.push(msh);
        } else if (feature === 'Stairs') {
            var rise = 7 * 0.0254;
            var run = 11 * 0.0254;
            var width = 36 * 0.0254;
            var stairCount = 12;
            var angle = Math.PI / 2;
            msh = new Stairs(position, this._editor, 'Str' + this._floorFeatures.length, this._sidebar, this._materials, rise, run, width, stairCount, angle, this._name);
            msh.addToScene();
            this._floorFeatures.push(msh);
            this.calculateStairs();
            this._layout ? this._layout.updateStairs(this._stairLayout) : null;
        }
        this._features.push(msh.mesh);
        this._featLines.push(msh.line);
    }

    calculateStairs() {
        this._stairLayout = [];
        for (var i = 0; i < this._floorFeatures.length; i++) {
            if (this._floorFeatures[i].name.substring(0, 3) == 'Str') {
                this._stairLayout = this._stairLayout.concat(this._floorFeatures[i].layout);
            }
        }
    }

    getFeatureByName(name) {
        if (name && (name.slice(0, 3) === 'Str' || name.slice(0, 3) === 'Cus')) {
            for (var i = 0; i < this._floorFeatures.length; i++) {
                if (this._floorFeatures[i].name === name) {
                    return this._floorFeatures[i];
                }
            }
        } else {
            return this._walls.getFeatureByName(name);
        }
    }

    getFloorFeatureById(n) {
        for (var i = 0; i < this._floorFeatures.length; i++) {
            if (this._floorFeatures[i].id == n) {
                return this._floorFeatures[i];
            }
        }
    }

    updateCustom(feat) {
        for (var i = 0; i < this._features.length; i++) {
            if (this._features[i].name === feat.name) {
                this._features[i] = feat.mesh;
                this._featLines[i] = feat.line;
            }
        }
    }

    updateFeature(id) {
        var tmpfeat = [];
        var feat = this.getFeatureByName(id);
        feat.updatePos();
        for (var i = 0; i < this._features.length; i++) {
            if (this._features[i].name === feat.name) {
                this._features[i] = feat.mesh;
                this._featLines[i] = feat.line;
            }
        }
        this._walls.refresh();
        this._featRemake = this._walls.getFeatures();
    }

    setDoorValue(meas) {
        this._sidebar.setFeatureMeasurement(this._activeDoor, meas);
        this.updateFeature(this._activeDoor);
    }

    selectFeature(id) {
        this.clearMaterials();
        var feat = this.getFloorFeatureById(id);
        if (feat) {
            feat.setMaterial('Wall-Select');
        } else if (id.length > 2) {
            var nfeat = this.getFeatureByName(id);
            nfeat ? nfeat.setMaterial('Wall-Select') : null;
        }
    }

    selectWall(id) {
        this._walls.clearWallMaterials();
        var wall = this._walls.getWallByName(this._name + 'w' + id);
        wall ? wall.setMaterial('Wall-Select', true) : null;
    }

    lockWall(id) {
        this._walls.clearWallMaterials();
        var wall = this._walls.getWallByName(this._name + 'w' + id);
        wall ? wall.lock() : null;
    }

    clearMaterials() {
        for (var i = 0; i < this._floorFeatures.length; i++) {
            this._floorFeatures[i].setMaterial('Wall');
        }
        this._activeDoor = null;
        this._walls.clearMaterials();
    }

    completeFloorFeature() {
        var sketch = this._floorFeatureTemp;
        var msh = new FloorFeature(sketch.origin, this._editor, 'Cus' + (this._floorFeatures.length - 1).toString(), this._name, this._sidebar, this._materials, sketch, 0.9144);
        this._floorFeatures.push(msh);
        this._features.push(msh.mesh);
        this._featLines.push(msh.line);
        this._layout ? this._layout.updateFeature(this._floorFeatures) : null;
    }

    addFloorFeature() {
        var floorFeature = new Sketch(new THREE.Vector3(0, 0, 0), this._editor, this._name, this._sidebar, this._materials);
        this._floorFeatureTemp = floorFeature;
        return this._floorFeatureTemp;
    }

    deleteFeature(n) {
        if (n.slice(0, 3) === 'Str') {
            for (var i = 0; i < this._floorFeatures.length; i++) {
                if (this._floorFeatures[i].name === n) {
                    this._floorFeatures[i].clear();
                    this._floorFeatures = this._floorFeatures.filter(function (el) {
                        return el.name !== n;
                    });
                }
            }
        } else {
            this._wallFeatures = this._walls.removeFeature(n);
            this._featRemake = this._walls.getFeatures();
        }
        this._features = this._features.filter(function (el) {
            return el.name !== n;
        });
        this._featLines = this._featLines.filter(function (el) {
            return el.name !== 'wl' + n;
        });
    }

    deleteCustom(id) {
        for (var i = 0; i < this._floorFeatures.length; i++) {
            if (this._floorFeatures[i].id === id) {
                var nm = this._floorFeatures[i].name;
                this._floorFeatures[i].clear();
                this._floorFeatures = this._floorFeatures.filter(function (el) {
                    return el.id !== id;
                });
                this._features = this._features.filter(function (el) {
                    return el.name !== nm;
                });
                this._featLines = this._featLines.filter(function (el) {
                    return el.name !== 'wl' + nm;
                });
            }
        }
    }

    addDoorway(mesh, indices) {
        this._transitions.push([mesh, indices]);
    }

    deactivate() {
        this._walls.walls.forEach(function (wls) {
            wls.setMaterial('Inactive');
        });
        this._layout ? this._layout.hide() : null;
    }

    activate() {
        this._walls.walls.forEach(function (wls) {
            wls.setMaterial('Wall');
        });
        this._layout ? this._layout.unhide() : null;
    }

    dragPoint(n, pos) {
        this._walls.clear();
        this._scene.remove(this._mesh);
        this._signals.objectChanged.dispatch();
        this._mesh = null;
        this._sketch.dragPoint(n, pos);
    }

    setDragPoint(pt) {
        if (!this._dragPoint) {
            this._dragPoint = new THREE.Vector3().subVectors(new THREE.Vector3(pt.x, this._mesh.position.y, pt.y), this._mesh.position);
            for (var i = 0; i < this._floorFeatures.length; i++) {
                this._floorFeatures[i].setDragPoint(pt);
            }
        }
    }

    clearDragPoints() {
        this._dragPoint = null;
        for (var i = 0; i < this._floorFeatures.length; i++) {
            this._floorFeatures[i].clearDragPoint();
        }
    }

    drag(pos, collide) {
        var chn = new THREE.Vector3().subVectors(pos, this._mesh.position);
        chn = chn.sub(this._dragPoint);
        if (this._sketch.testCollision(chn, collide)) {
            this.translateRoom(chn, pos);
        } else {
            var nchn = new THREE.Vector3(chn.x / 100, 0.1, chn.z / 100);
            var npos = nchn.clone().add(this._dragPoint).add(this._mesh.position);
            if (nchn.length() < chn.length() && this._sketch.testCollision(nchn, collide)) {
                this.translateRoom(nchn, npos);
            }
        }
    }

    translateRoom(chn, pos) {
        this._mesh.translateX(chn.x);
        this._mesh.translateZ(chn.z);
        this._sketch.shift(chn);
        this._walls.shift(chn);
        for (var i = 0; i < this._floorFeatures.length; i++) {
            this._floorFeatures[i].setDragPoint(this._dragPoint);
            this._floorFeatures[i].drag(pos);
        }
        for (var w = 0; w < this._features.length; w++) {
            if (this._features[w].name.substring(0, 3) == 'Box') {
                this._features[w].translateX(chn.x);
                this._features[w].translateZ(chn.z);
            }
        }
        this._signals.objectChanged.dispatch();
    }

    newLayout() {
        this.clearLayout();
        this.calculateStairs();
        this._layout = new Layout(this._editor, this._name + "-layout", this._name, this._mesh, this._transitions, this._sidebar, this._materials, this._floorFeatures, this._stairLayout);
        this.calculateLayout(true);
    }

    calculateLayout(full) {
        this.calculateStairs();
        this._layout.newPacket(full, this._stairLayout);
        this._layoutMesh = this._layout.layout;
    }

    clearLayout() {
        if (this._layout) {
            this._layout.clear();
            this._layoutMesh = [];
            this._layout = null;
        }
    }

    removeFeature(feature) {
        this._scene.remove(this._scene.getObjectByName(feature.name));
        delete this._features[feature.name];
    }

    clearFeatures() {
        for (var key in this._features) {
            this._scene.remove(this._scene.getObjectByName(key));
            delete this._features[key];
        }
        this._features = {};
    }

    serialize() {
        var layout = this._layout ? this._layout.serialize() : null; 
        var flrfeat = [];
        for (var i = 0; i < this._floorFeatures.length; i++) {
            flrfeat.push(this._floorFeatures[i].serialize());
        }
        var parts = { 'name': this._name, 'origin': this._origin, 'sketch': this._sketch.serialize(), 'layout': layout, 'floorFeatures': flrfeat, 'wallFeatures' : this._featRemake, 'alias' : this._alias };
        return parts;
    }

    deserialize(rm) {
        console.log("Deserialize Room");
        if (rm.alias) {
            $("#roomName").val(rm.alias);
            var sel = document.getElementById('roomSelect');
            sel.options[sel.selectedIndex].innerHTML = rm.alias;
            this._signals.roomNameChange.dispatch(rm.alias);
        }
        this._sketch.deserialize(rm.sketch);
        this.generateRoom();
        this._featRemake = rm.wallFeatures;
        for (var i = 0; i < rm.floorFeatures.length; i++) {
            switch (rm.floorFeatures[i].type) {
                case "Custom":
                    var newSkt = new Sketch(new THREE.Vector3(0, 0, 0), this._editor, this._name, this._sidebar, this._materials);
                    newSkt.deserialize(rm.floorFeatures[i].sketch);
                    var msh = new FloorFeature(rm.floorFeatures[i].origin, this._editor, rm.floorFeatures[i].name, this._name, this._sidebar, this._materials, newSkt, rm.floorFeatures[i].height);
                    this._floorFeatures.push(msh);
                    break;
                case "Stairs":
                    var msh = new Stairs(rm.floorFeatures[i].origin, this._editor, rm.floorFeatures[i].name, this._sidebar, this._materials, rm.floorFeatures[i].rise, rm.floorFeatures[i].run, rm.floorFeatures[i].width, rm.floorFeatures[i].count, rm.floorFeatures[i].angle, this._name);
                    msh.addToScene();
                    this._floorFeatures.push(msh);
                    break;
            }
        }
        this.remakeFeatures();
        if (rm.layout) {
            this.calculateStairs();
            this._sidebar.setLayout(this._name, rm.layout.packet);
            this._layout = new Layout(this._editor, rm.layout.name, this._name, this._mesh, this._transitions, this._sidebar, this._materials, this._floorFeatures, this._stairLayout);
            this.calculateLayout(true);
            this._layout.deserialize(rm.layout);
            this._layoutMesh = this._layout.layout;
        }
        /*
        var sk = JSON.parse(rm.sketch);
        var wl = JSON.parse(rm.wallSet);
        var flr = rm.floorFeatures;
        this._sketch.deserialize(sk);
        var loader = new THREE.ObjectLoader();
        this._mesh = loader.parse(rm.mesh);
        this._scene.add(this._mesh);
        this._walls.deserialize(wl);
        this._meshList = this._walls.meshSet;
        this._featRemake = this._walls.getFeatures();
        for (var i = 0; i < this._walls.features.length; i++) {
            this._features.push(this._walls.features[i].mesh);
            this._featLines.push(this._walls.features[i].line);
        }
        for (var i = 0; i < flr.length; i++) {
            var flrDes = JSON.parse(flr[i]);
            switch (flrDes.type) {
                case "Custom":
                    var newSkt = new Sketch(new THREE.Vector3(0, 0, 0), this._editor, this._name, this._sidebar, this._materials);
                    newSkt.deserialize(JSON.parse(flrDes.sketch));
                    var msh = new FloorFeature(flrDes.origin, this._editor, flrDes.name, this._name, this._sidebar, this._materials, newSkt, flrDes.height);
                    this._floorFeatures.push(msh);
                    this._features.push(msh.mesh);
                    this._featLines.push(msh.line);
                    break;
                case "Stairs":
                    msh = new Stairs(flrDes.origin, this._editor, flrDes.name, this._sidebar, this._materials, flrDes.rise, flrDes.run, flrDes.width, flrDes.count, flrDes.angle, this._name);
                    msh.addToScene();
                    this._floorFeatures.push(msh);
                    this._features.push(msh.mesh);
                    this._featLines.push(msh.line);
                    break;
            }
        }
        if (rm.layout) {
            var layout = JSON.parse(rm.layout);
            this.calculateStairs();
            this._layout = new Layout(this._editor, layout.name, this._name, this._mesh, this._transitions, this._sidebar, this._materials, this._floorFeatures, this._stairLayout);
            this._layout.deserialize(layout);
            //this._layoutMesh = this._layout.layout;
            //var pack = this.layout.calculateRoll(true);
            //this._sidebar.newLayout(this._name, pack);
        } */
    }

    removeModel() {
        this._walls.clear();
        this._scene.remove(this._mesh);
        this._mesh = null;
        this._features = [];
        this._featLines = [];
        this._meshList = [];
        this._perimter = 0;
        this._surfaceArea = 0;
    }

    clear() {
        this._sketch.clear();
        this._notation.clear();
        for (var i = 0; i < this._floorFeatures.length; i++) {
            this._floorFeatures[i].clear();
        }
        this._floorFeatures = [];
        if (this._mesh) {
            this._features = [];
            this._featLines = [];
            this._layout ? this._layout.clear() : null;
            this._layoutMesh = [];
            this._walls.clear();
            this.removeModel();
            this._meshList = [];
            this._perimter = 0;
            this._surfaceArea = 0;
        }
    }
}


function generate(arr, material) {
    var roomgeo = new THREE.Geometry();
    var vertarr = [];
    var ar2d = [];
    var arEar = [];
    var perim = 0;
    var SA = 0;
    // Generate Vertices
    for (var i = 0; i < arr.length - 3; i += 3) {
        vertarr.push(new THREE.Vector3(arr[i], arr[i + 1], arr[i + 2]));
        ar2d.push(new THREE.Vector2(arr[i], arr[i + 2]));
        arEar.push(arr[i], arr[i + 2]);
        if (ar2d.length > 0) {
            var test2d = ar2d.slice(-1)[0];
            perim += new THREE.Vector2(test2d.x - arr[i], test2d.y - arr[i + 2]).length();
        }
    }
    perim += new THREE.Vector2(ar2d[0].x - ar2d[ar2d.length - 1].x, ar2d[0].y - ar2d[ar2d.length - 1].y).length();

    // Generate Faces
    roomgeo.vertices = vertarr.slice();
    var triangles = earcut(arEar, null, 2);
    for (var z = 0; z < triangles.length; z += 3) {
        roomgeo.faces.push(new THREE.Face3(triangles[z], triangles[z + 1], triangles[z + 2]));
        SA += calculateArea(roomgeo.vertices[triangles[z]], roomgeo.vertices[triangles[z + 1]], roomgeo.vertices[triangles[z + 2]]);
    }
    var roommesh = new THREE.Mesh(roomgeo, material);
    roommesh.geometry.computeVertexNormals();
    var cent = getCenter(roommesh);
    perim *= 3.28084;
    SA *= 10.7639;

    return [vertarr, roommesh, perim, SA, cent];
}

function getCenter(mesh) {
    var middle = new THREE.Vector3();
    var geometry = mesh.geometry;

    geometry.computeBoundingBox();

    middle.x = (geometry.boundingBox.max.x + geometry.boundingBox.min.x) / 2;
    middle.y = (geometry.boundingBox.max.y + geometry.boundingBox.min.y) / 2;
    middle.z = (geometry.boundingBox.max.z + geometry.boundingBox.min.z) / 2;

    mesh.localToWorld(middle);
    return middle;
}

function calculateArea(verta, vertb, vertc) {
    var a = verta.distanceTo(vertb);
    var b = vertb.distanceTo(vertc);
    var c = vertc.distanceTo(verta);

    var s = 0.5 * (a + b + c);
    var x = s * (s - a) * (s - b) * (s - c);
    var ans = Math.sqrt(x);
    return ans;
}
