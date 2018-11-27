class Feature {
    constructor(editor, origin, height, width, room, name, bounds, sidebar, materials, indices, wall, top, bottom, winding, type, swing) {
        this._scene = editor.scene;
        this._signals = editor.signals;
        this._origin = origin;
        this._room = room;
        this._name = name;
        this._features = [];
        this._vector = bounds;
        this._materials = materials;
        this._height = height;
        this._width = width;
        this._mesh = calculateFeatureBox(origin, height, width, bounds, name, materials['Paint']);
        this._dist = this._mesh.dist;
        this._sidebar = sidebar;
        this._indices = indices;
        this._top = top;
        this._bottom = bottom;
        this._dragPoint = null;
        this._wall = wall;
        this._swing = swing;
        this._type = type;
        this._id;
        this._odist;
        this._winding = winding;
        this._swingObj;
    }

    get mesh() { return this._mesh.mesh; }
    get line() { return getEdges(this._mesh.mesh, this._scene, this._materials['Draw']); }
    get name() { return this._name; }
    get wall() { return this._wall; }
    get box() { return this.makeBox(); }
    get dist() { return this._dist; }
    get rawWidth() { return this._width; }
    get width() { return (this._width * 39.3701).toFixed(2); }
    get indices() { return this._indices; }
    get top() { return this._top; }
    get bottom() { return this._bottom; }
    get height() { return this._height; }
    get swing() { return this._swing; }
    get type() { return this._type; }

    addToScene() {
        this._scene.add(this._mesh.mesh);
        this._signals.addDoorway.dispatch(this._mesh.doorway, this._indices);
        this._id = this._sidebar.addFeatureLine(this._mesh, this._room, this._name, this._winding, this._top, this._bottom, this._type, this._swing);
        this.updatePos();
    }

    get2D() {
        var ret = [];
        var verts = this._mesh.mesh.geometry.vertices;
        for (var i = 0; i < verts.length; i++) {
            ret.push(new THREE.Vector2(verts[i].x, verts[i].z));
        }
        var swing = this._swingObj.geometry.attributes.position.array;
        for (var c = 0; c < swing.length; c += 3) {
            ret.push(new THREE.Vector2(swing[c], swing[c+2]));
        }
        return { "Type": "Doorway", "Wall": this.wall, "Coordinates": ret, "Width": this.width, "Swing": this._swing };
    }

    shift(chn) {
        this._mesh.mesh.translateX(chn.x);
        this._mesh.mesh.translateZ(chn.z);
    }

    setMaterial(matChoice) {
        matChoice = matChoice == 'Wall' ? 'Paint' : matChoice;
        matChoice == 'Wall-Select' ? this._signals.activateDrag.dispatch("Door") : null;
        matChoice == 'Wall-Select' ? this._sidebar.highlightLine(this._room, 'Door', this._name) : this._sidebar.highlightLine(this._room, 'Door', -1);
        matChoice == 'Wall-Select' ? this._signals.selectDoor.dispatch(this._name) : null;
        this._mesh.mesh.material = this._materials[matChoice];
        this._mesh.mesh.material.needsUpdate = true;
    }

    makeBox() {
        var box = new THREE.BoxGeometry(this._width, this._top - this._bottom, 0.3);
        var nv = [];
        this._vector.forEach(function (vec) {
            nv.push(new THREE.Vector3(vec.x, vec.y, vec.z));
        });
        var ang = new THREE.Vector2(nv[0].x - nv[1].x, nv[0].z - nv[1].z).angle();

        box.rotateY(-1*ang);
        var mid = new THREE.Vector3().lerpVectors(nv[0], nv[1], this._dist + (this._width/2/this._odist));
        box.translate(mid.x, 0.1 + this._top / 2 + this._bottom/2, mid.z);
        return box;
    }


    updatePos() {
        var newv = this._sidebar.getFeatMeas(this._name);
        var width = convertToMeters(0, newv.indoor);
        var d1 = this._mesh.dist * this._mesh.odist;
        var d2 = this._mesh.dist2 * this._mesh.odist;
        var tmp = convertToFeetInch(d1);
        var dft0 = tmp.feet;
        var din0 = tmp.inch;
        tmp = convertToFeetInch(d2);
        var dft1 = tmp.feet;
        var din1 = tmp.inch;

        var chn;
        if (dft1 != newv.ft1 || din1 != newv.in1) {
            chn = this._mesh.odist - convertToMeters(newv.ft1, newv.in1) - width;
        } else {
            chn = convertToMeters(newv.ft0, newv.in0);
        }
        width = width > this._mesh.odist ? this._mesh.odist - 0.00002 : width;
        chn = chn + width > this._mesh.odist ? this._mesh.odist - width - 0.00001 : chn;
        this._swing = newv.select;
        this._type = newv.type;
        this.setPosition(chn, width, convertToMeters(newv.ft2, newv.in2), convertToMeters(newv.ft3, newv.in3));
        this.calculateSwing();
    }

    validatePosition(roomArr, failback) {
        this._dragPoint = null;
        this._signals.recutWalls.dispatch();
    }

    setDragPoint(pt) {
        this._dragPoint = this._dragPoint ? this._dragPoint : new THREE.Vector3().subVectors(new THREE.Vector3(pt.x, this._mesh.mesh.position.y, pt.y), this._mesh.mesh.position);
    }

    drag(pos) {
        var meas = updateFeature(pos, this._vector);
        if (meas > 0) {
            this._sidebar.setFeatMeas(this._id, this._room, meas);
            this._signals.updateFeature.dispatch(this._name);
        }
    }

    calculateSwing() {
        if (this._swingObj) {
            this._scene.remove(this._swingObj);
        }
        if (this._swing == 'Leaf' || this._type == 'Window') {
            return;
        }
        var ln0, ln1, ln2, ln3;
        var verts = this._mesh.mesh.geometry.vertices;
        switch (this._swing) {
            case "RH In Swing":
                ln0 = new THREE.Vector3(verts[0].x, 0.2, verts[0].z);
                ln1 = new THREE.Vector3(verts[3].x, 0.2, verts[3].z);
                ln2 = new THREE.Vector3(verts[1].x, 0.2, verts[1].z);
                ln3 = new THREE.Vector3(verts[2].x, 0.2, verts[2].z);
                break;
            case "LH In Swing":
                ln0 = new THREE.Vector3(verts[1].x, 0.2, verts[1].z);
                ln1 = new THREE.Vector3(verts[2].x, 0.2, verts[2].z);
                ln2 = new THREE.Vector3(verts[0].x, 0.2, verts[0].z);
                ln3 = new THREE.Vector3(verts[3].x, 0.2, verts[3].z);
                break;
            case "LH Out Swing":
                ln0 = new THREE.Vector3(verts[2].x, 0.2, verts[2].z);
                ln1 = new THREE.Vector3(verts[1].x, 0.2, verts[1].z);
                ln2 = new THREE.Vector3(verts[3].x, 0.2, verts[3].z);
                ln3 = new THREE.Vector3(verts[0].x, 0.2, verts[0].z);
                break;
            case "RH Out Swing":
                ln0 = new THREE.Vector3(verts[3].x, 0.2, verts[3].z);
                ln1 = new THREE.Vector3(verts[0].x, 0.2, verts[0].z);
                ln2 = new THREE.Vector3(verts[2].x, 0.2, verts[2].z);
                ln3 = new THREE.Vector3(verts[1].x, 0.2, verts[1].z);
                break;
            case "French In Doors":
                ln0 = new THREE.Vector3(verts[0].x, 0.2, verts[0].z);
                ln1 = new THREE.Vector3(verts[3].x, 0.2, verts[3].z);
                ln2 = new THREE.Vector3(verts[1].x, 0.2, verts[1].z);
                ln3 = new THREE.Vector3(verts[2].x, 0.2, verts[2].z);
                break;
            case "French Out Doors":
                ln0 = new THREE.Vector3(verts[3].x, 0.2, verts[3].z);
                ln1 = new THREE.Vector3(verts[0].x, 0.2, verts[0].z);
                ln2 = new THREE.Vector3(verts[2].x, 0.2, verts[2].z);
                ln3 = new THREE.Vector3(verts[1].x, 0.2, verts[1].z);
                break;
        }
        var dist = ln0.distanceTo(ln1);
        var comb = this._swing != 'French In Doors' && this._swing != 'French Out Doors' ? (this._width + dist) / dist : (this._width/2 + dist) / dist;
        var pt = new THREE.Vector3().lerpVectors(ln0, ln1, comb);
        var p2 = new THREE.Vector3().lerpVectors(ln2, ln3, comb);
        var curve = new THREE.QuadraticBezierCurve3(ln1, pt, p2);
        var points = curve.getPoints(15);
        if (this._swing == 'French In Doors' || this._swing == 'French Out Doors') {
            var lnt = new THREE.Vector3().lerpVectors(ln1, ln3, 0.5);
            var pt3 = new THREE.Vector3().lerpVectors(pt, p2, 0.5);
            var curve2 = new THREE.QuadraticBezierCurve3(lnt, pt3, pt);
            var curve3 = new THREE.QuadraticBezierCurve3(lnt, pt3, p2);
            var points2 = curve2.getPoints(15);
            points2.push(ln1);
            points = points2.concat(curve3.getPoints(15));
        }
        points.push(ln3);
        var geometry = new THREE.BufferGeometry().setFromPoints(points);
        var material = new THREE.LineBasicMaterial({ color: 0xff0000 });
        var curveObject = new THREE.Line(geometry, material);

        this._swingObj = curveObject;
        this._scene.add(this._swingObj);
    }

    setPosition(length, width, top, bottom) {
        if (this._swingObj) {
            this._scene.remove(this._swingObj);
        }
        this._scene.remove(this._mesh.mesh);
        this._width = width;
        this._top = top >= this._height-0.15 ? this._height - 0.15 : top;
        this._bottom = bottom >= this._top-0.1 ? this._top - 0.1 : bottom;
        this._mesh = calcFeatureAtLength(length, this._height, this._width, this._vector, this._name, this._materials['Paint']);
        this._dist = this._mesh.dist;
        this._odist = this._mesh.odist;
        this._sidebar.updateFeatureLine(this._mesh, this._room, this._id);
        this._scene.add(this._mesh.mesh);
        this.calculateSwing();
    }

    serialize() {
        var parts = { 'id': this._id, 'vector' : this._vector, 'height' : this._height, 'top': this._top, 'bottom' : this._bottom, 'width' : this._width, 'name' : this._name, 'origin' : this.dist, 'type' : this._type, 'swing' : this._swing };
        return parts;
    }

    clear() {
        this._scene.remove(this._mesh.mesh);
        if (this._swingObj) {
            this._scene.remove(this._swingObj);
        }
        this._sidebar.removeFeatureLine(this._room, this._name);
    }
}

function convertToMeters(ft, inch) {
    return ((ft * 12 + parseInt(inch)) * 0.0254);
}

function convertToFeetInch(meters) {
    var ft = Math.floor((meters * 39.370078740157477) / 12);
    var inch = Math.round((meters * 39.370078740157477) % 12);
    if (inch == 12) {
        ft += 1;
        inch = 0;
    }
    return { 'feet': ft, 'inch': inch };
}

function interpolateOnLine(currPos, vec0, vec1) {
    var dist = new THREE.Vector3().subVectors(tpos, vec0);
    var odist = new THREE.Vector3().subVectors(vec1, vec0);
    var ang = dist.angleTo(odist);
    var d1 = dist.length() * Math.cos(ang);
    return (d1 / odist.length());
}

function calcFeatureAtLength(len, height, width, vecSet, name, material) {
    var nv = [];
    var dist = vecSet[0].distanceTo(vecSet[1]);
    var ratio = len / dist;
    return calculateFeatureBox(ratio, height, width, vecSet, name, material);
}

function updateFeature(pos, vecSet) {
    var tpos = new THREE.Vector3(pos.x, 0.1, pos.z);

    var dist = new THREE.Vector3().subVectors(tpos, vecSet[0]);
    var odist = new THREE.Vector3().subVectors(vecSet[1], vecSet[0]);
    var ang = dist.angleTo(odist);
    var d1 = dist.length() * Math.cos(ang);

    return d1;
}

function calculateFeatureBox(pos, height, width, vecSet, name, material) {
    var tpos;
    if (!pos.isVector3) {
        if (pos == 0) {
            pos = 0.0001;
        }
        tpos = new THREE.Vector3().lerpVectors(vecSet[0], vecSet[1], pos);
    } else {
        tpos = new THREE.Vector3(pos.x, 0.1, pos.z);
    }
    var dist = new THREE.Vector3().subVectors(tpos, vecSet[0]);
    var odist = new THREE.Vector3().subVectors(vecSet[1], vecSet[0]);
    var ang = dist.angleTo(odist);
    var d1 = dist.length() * Math.cos(ang);

    var ddist = new THREE.Vector3().subVectors(tpos, vecSet[2]);
    var oddist = new THREE.Vector3().subVectors(vecSet[3], vecSet[2]);
    var dang = ddist.angleTo(oddist);

    var lerpL = d1 / odist.length();
    var lerpR = (d1 + width) / odist.length();

    var newv = new THREE.Vector3().lerpVectors(vecSet[0], vecSet[1], lerpL);
    var newvend = new THREE.Vector3().lerpVectors(vecSet[0], vecSet[1], lerpR);

    var onewv = new THREE.Vector3().lerpVectors(vecSet[2], vecSet[3], d1 / oddist.length());
    var onewvend = new THREE.Vector3().lerpVectors(vecSet[2], vecSet[3], (d1 + width) / oddist.length());

    var ge = new THREE.Geometry();
    ge.vertices.push(new THREE.Vector3(newv.x, height, newv.z), new THREE.Vector3(newvend.x, height, newvend.z), new THREE.Vector3(onewvend.x, height, onewvend.z), new THREE.Vector3(onewv.x, height, onewv.z));
    ge.faces.push(new THREE.Face3(0, 1, 2));
    ge.faces.push(new THREE.Face3(2, 3, 0));
    ge.computeVertexNormals();

    var ge2 = new THREE.Geometry();
    ge2.vertices.push(newv, newvend, onewvend, onewv);
    ge2.faces.push(new THREE.Face3(0, 1, 2));
    ge2.faces.push(new THREE.Face3(2, 3, 0));
    ge2.computeVertexNormals();
    
    var msh = new THREE.Mesh(ge, material);
    msh.name = name;
    return { "mesh": msh, "dist": d1 / odist.length(), "odist": odist.length(), "dist2": (odist.length() - d1 - width) / odist.length(), "width" : width, "doorway": new THREE.Mesh(ge2, material) };
}

function getEdges(msh, scene, mat) {
    var pledge = new THREE.EdgesGeometry(msh.geometry);
    var edge = new THREE.Line(pledge, mat);
    edge.position.set(msh.position.x, msh.position.y, msh.position.z);
    edge.name = 'wl' + msh.name;
    return edge;
}

