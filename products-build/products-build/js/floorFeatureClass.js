class FloorFeature {
    constructor(origin, editor, name, roomname, sidebar, materials, sketch, height) {
        this._origin = origin;
        this._scene = editor.scene;
        this._name = name;
        this._roomname = roomname;
        this._signals = editor.signals;
        this._sidebar = sidebar;
        this._materials = materials;
        this._sidebarLines = [];
        this._sketch = sketch;
        this._arr = sketch.array;
        this._arr2d = sketch.array2d;
        this._line = sketch.line;
        this._obj = generateBox(sketch.array, height, editor.scene, name, materials['FloorFeat'], materials['Draw']);
        this._mesh = this._obj[0];
        this._edge = this._obj[1];
        this._height = height;
        this._box = [];
        this._dragPoint;
        this._path;
    }

    get mesh()  { return this._mesh; }
    get line()  { return this._edge; }
    get sketch(){ return this._sketch; }
    get id()    { return this._sketch._id; }
    get height(){ return (this._height * 39.3701).toFixed(2); }
    get array() { return this._arr; }
    get name()  { return this._name; }
    get box()   { return this.makeBox(); }

    drag(pos) {
        var chn = new THREE.Vector3().subVectors(pos, this._mesh.position);
        chn = chn.sub(this._dragPoint);
        //var chn = calcCollision(pos, this._sketch.array2d, coll);
        this._mesh.translateX(chn.x);
        this._mesh.translateZ(chn.z);
        this._edge.translateX(chn.x);
        this._edge.translateZ(chn.z);
        this._sketch.shift(chn);
        this._box = [];
        this._signals.objectChanged.dispatch();
    }

    validatePosition(roomArr, failback) {
        var inCheck = true;
        var ar2d = this._sketch.get2D();
        for (var i = 0; i < ar2d.length; i++) {
            inCheck = (inCheck && pInP(ar2d[i], roomArr));
        }
        if (!inCheck) {
            this.drag(failback);
        }
        this._dragPoint = null;
    }

    clearDragPoint() {
        var ar2d = this._sketch.get2D();
        this._dragPoint = null;
    }

    setDragPoint(pt) {
        this._dragPoint = this._dragPoint ? this._dragPoint : new THREE.Vector3().subVectors(new THREE.Vector3(pt.x, this._mesh.position.y, pt.y), this._mesh.position);
    }

    get2D() {
        return { "Type": "Floor Cutout", "Height" : this.height, "Coordinates": this._sketch.get2D() };
    }

    setMaterial(matChoice) {
        matChoice == 'Wall-Select' ? this._signals.activateDrag.dispatch("FloorFeat") : null;
        matChoice = matChoice == 'Wall' ? 'FloorFeat' : matChoice;
        this._mesh.material = this._materials[matChoice];
        this._mesh.material.needsUpdate = true;
    }

    setHeight(ht) {
        this._height = ht;
    }

    makeBox() {
        if (this._box.length == 0) {
            var arr = this._sketch.array;
            var off = this._sketch.line.position;
            for (var i = 0; i < arr.length; i += 3) {
                this._box.push(new THREE.Vector2(arr[i] + off.x, arr[i + 2] + off.z));
            }
        }
        return this._box;
    }

    remake() {
        this._scene.remove(this._mesh);
        this._scene.remove(this._edge);
        this._obj = generateBox(this._sketch.array, this._height, this._scene, this._name, this._materials['FloorFeat'], this._materials['Draw']);
        this._mesh = this._obj[0];
        this._edge = this._obj[1];
    }

    serialize() {
        var parts = { 'name': this._name, 'origin': this._origin, 'mesh': this._mesh, 'sketch': this._sketch.serialize(), 'height': this._height, 'type': "Custom" };
        return parts;
    }

    clear() {
        this._sidebar.removeCustom(this._roomname, this.id);
        this._scene.remove(this._sketch.line);
        this._scene.remove(this._mesh);
        this._scene.remove(this._edge);
    }
}

function generateBox(arr, height, scene, name, wall, line) {
    var origin = new THREE.Vector3(arr[0], arr[1], arr[2]);
    var geo = new THREE.Geometry();
    var vertarr = getVerticeList(arr);
    var faces = [];
    var fac2d = [];
    var facesTop = [];
    for (var i = 0; i < vertarr.length; i++) {
        var ind = i + 1; //< vertarr.length-1 ? i + 1 : 0;
        var h1 = new THREE.Vector3(vertarr[i].x, vertarr[i].y + height, vertarr[i].z);
        geo.vertices.push(vertarr[i], h1);
        ind == vertarr.length ? geo.faces.push(new THREE.Face3((i * 2) + 0, (i * 2) + 1, 1)) : geo.faces.push(new THREE.Face3((i * 2) + 0, (i * 2) + 1, (i * 2) + 3));
        ind == vertarr.length ? geo.faces.push(new THREE.Face3(1, 0, i*2)) : geo.faces.push(new THREE.Face3((i * 2) + 3, (i * 2) + 2, (i * 2) + 0));
        faces.push((i * 2));
        fac2d.push(vertarr[i].x, vertarr[i].z);
        facesTop.push((i * 2) + 1);
    }
    fac2d.push(vertarr[0].x, vertarr[0].z);
    faces.push(0);
    facesTop.push(1);
    var triangles = earcut(fac2d, null, 2);
    for (var z = 0; z < triangles.length; z += 3) {
        geo.faces.push(new THREE.Face3(faces[triangles[z]], faces[triangles[z+1]], faces[triangles[z + 2]]));
    }
    for (var z = 0; z < triangles.length; z += 3) {
        geo.faces.push(new THREE.Face3(facesTop[triangles[z]], facesTop[triangles[z + 1]], facesTop[triangles[z + 2]]));
    }

    geo.translate(-1 * origin.x, -1 * origin.y, -1 * origin.z);
    var w = new THREE.Mesh(geo, wall);
    w.geometry.computeVertexNormals();
    w.position.set(origin.x, origin.y, origin.z);
    w.name = name;

    var wl = new THREE.Line(geo, line);
    wl.position.set(origin.x, origin.y, origin.z);
    wl.name = 'wl' + name;

    scene.add(w);
    scene.add(wl);

    return [w, wl];
}

function getVerticeList(arr) {
    // Generate Vertices
    var vertarr = [];
    for (var i = 0; i < arr.length - 3; i += 3) {
        vertarr.push(new THREE.Vector3(arr[i], arr[i + 1], arr[i + 2]));
    }
    return vertarr;
}

function pInP(pt, polygon) {
    var x = pt.x, y = pt.y;
    var inside = false;
    for (var i = 0, j = polygon.length - 2; i < polygon.length - 1; j = i++) {
        var xi = polygon[i].x, yi = polygon[i].y;
        var xj = polygon[j].x, yj = polygon[j].y;

        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}