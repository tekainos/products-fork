class Stairs {
    constructor(origin, editor, name, sidebar, materials, rise, run, width, stairCount, angle, room) {
        this._origin = origin;
        this._scene = editor.scene;
        this._name = name;
        this._roomname = name;
        this._signals = editor.signals;
        this._sidebar = sidebar;
        this._materials = materials;
        this._sidebarLines = [];
        this._room = room;
        this._angle = angle;
        this._rise = rise;
        this._run = run;
        this._width = width;
        this._id;
        this._dragPoint = null;
        this._layoutMesh;
        this._arr = [];
        this._cutout = 'No Cutout';
        this._stairCount = stairCount;
        this._mesh = generateStairs(rise, run, width, stairCount, origin, materials['Wall'], angle);
    }

    get mesh() { return this._mesh; }
    get line() { return this._edge; }
    get name() { return this._name; }
    get wall() { return this._wall; }
    get rise() { return (this._rise * 39.3701).toFixed(2); }
    get run() { return (this._run * 39.3701).toFixed(2); }
    get angle() { return (this._angle * 180 / Math.PI).toFixed(2); }
    get stairCount() { return this._stairCount; }
    get width() { return (this._width * 39.3701).toFixed(2); }
    get array() { return this._arr; }
    get layout() { return this._layoutMesh; };

    //feature.rise, feature.run, feature.width, feature.stairCount, feature.angle

    addToScene() {
        var pledge = new THREE.EdgesGeometry(this._mesh.geometry);
        this._edge = new THREE.Line(pledge, this._materials['Draw']);
        this._edge.position.set(this._origin.x, this._origin.y, this._origin.z);
        this._mesh.name = this._name;
        this._edge.name = 'wl' + this._name;
        this._scene.add(this._mesh);
        this._scene.add(this._edge);
        this._id = this._id != null ? this._id : this._sidebar.addFeatureLine(this, this._room, this._name);
        this.floorBox();
        this.layoutMesh();
    }

    get2D() {
        
        this._mesh.updateMatrix();
        this._edge.updateMatrix();
        this._mesh.geometry.applyMatrix(this._mesh.matrix);
        this._edge.geometry.applyMatrix(this._edge.matrix);
        this._mesh.position.set(0, 0, 0);
        this._edge.position.set(0, 0, 0);
        this._mesh.rotation.set(0, 0, 0);
        this._edge.rotation.set(0, 0, 0);
        this._mesh.scale.set(1, 1, 1);
        this._edge.scale.set(1, 1, 1);
        
        this._mesh.updateMatrix();
        this._edge.updateMatrix();

        var ret = this.make2d();
        
        return { "Type": "Stair", "Coordinates": ret, "Rise": this.rise, "Run": this.run, "Angle": this.angle, "Width": this.width, "Count": this.stairCount };
    }

    validatePosition(roomArr, failback) {
        this._dragPoint = null;
        this.floorBox();
    }

    clearDragPoint() {
        this._dragPoint = null;
        this.floorBox();
    }

    setDragPoint(pt) {
        this._dragPoint = this._dragPoint ? this._dragPoint : new THREE.Vector3().subVectors(new THREE.Vector3(pt.x, this._mesh.position.y, pt.y), this._mesh.position);
    }

    layoutMesh() {
        var combined = 3;
        this._layoutMesh = makeLayoutStairs(this._rise, this._run, this._width, this._stairCount, combined);
        console.log(this._layoutMesh);
    }

    removeFromScene() {
        this._scene.remove(this._mesh);
        this._scene.remove(this._edge);
    }

    setMaterial(matChoice) {
        matChoice == 'Wall-Select' ? this._signals.activateDrag.dispatch("Stairs") : null;
        this._mesh.material = this._materials[matChoice];
        this._mesh.material.needsUpdate = true;
    }

    floorBox() {
        this._arr = [];
        var ret = this.get2D();
        if (this._cutout == 'Cutout') {
            for (var i = 0; i < ret.Coordinates.length; i++) {
                this._arr.push(ret.Coordinates[i].x, 0.2, ret.Coordinates[i].y);
            }
            this._arr.push(ret.Coordinates[0].x, 0.2, ret.Coordinates[0].y);
        }
    }

    make2d() {
        this._mesh.geometry.computeBoundingBox();
        var bounding = this._mesh.geometry.boundingBox;
        var box = this._mesh.geometry.vertices;

        var rot = [];
        for (var i = 0; i < box.length; i++) {
            rot.push(new THREE.Vector2(box[i].x, box[i].z));
        }

        var newge = new THREE.Geometry();
        for (var i = 0; i < rot.length; i++) {
            newge.vertices.push(new THREE.Vector3(rot[i].x, 0, rot[i].y));
        }
        newge.mergeVertices();
        newge.rotateY(-1*this._angle - (Math.PI / 2));

        var msh = new THREE.Mesh(newge);

        var d2 = new THREE.BoxHelper(msh);

        var ret = [];
        var arr = d2.geometry.attributes.position.array;
        for (var i = 0; i < arr.length; i += 3) {
            var vec = new THREE.Vector2(arr[i], arr[i + 2]);
            ret.push(vec);
        }
        ret = [ret[2], ret[3], ret[4], ret[5]];
        var ret2 = [];

        var newGe = new THREE.Geometry();
        for (var i = 1; i <= this._stairCount; i++) {
            var v1 = new THREE.Vector2().lerpVectors(ret[0], ret[1], i / this._stairCount);
            var v2 = new THREE.Vector2().lerpVectors(ret[3], ret[2], i / this._stairCount);
            newGe.vertices.push(new THREE.Vector3(ret[0].x, 0, ret[0].y));
            newGe.vertices.push(new THREE.Vector3(v1.x, 0, v1.y));
            newGe.vertices.push(new THREE.Vector3(v2.x, 0, v2.y));
            newGe.vertices.push(new THREE.Vector3(ret[3].x, 0, ret[3].y));
        }
        newGe.computeBoundingBox();
        newGe.rotateY(this._angle + (Math.PI / 2));
        for (var i = 0; i < newGe.vertices.length; i++) {
            ret2.push(new THREE.Vector2(newGe.vertices[i].x, newGe.vertices[i].z));
        }
        return ret2;
    }

    updatePos() {
        var newv = this._sidebar.getStairMeas(this._name);
        this.removeFromScene();
        this._mesh = generateStairs(newv.rise, newv.run, newv.width, newv.stairCount, this._origin, this._materials['Wall'], newv.angle);
        this._angle = newv.angle;
        this._rise = newv.rise;
        this._run = newv.run;
        this._width = newv.width;
        this._stairCount = newv.stairCount;
        this._cutout = newv.cutout;
        this.addToScene();
    }

    drag(pos) {
        var diff = new THREE.Vector3().subVectors( this._mesh.position, this._origin);
        var chn = new THREE.Vector3().subVectors(pos, this._mesh.position);
        chn = chn.sub(this._dragPoint);
        this._mesh.translateX(chn.x);
        this._mesh.translateZ(chn.z);
        this._edge.translateX(chn.x);
        this._edge.translateZ(chn.z);
        this._mesh.geometry.verticesNeedUpdate = true;
        this._edge.geometry.verticesNeedUpdate = true;
        this._signals.objectChanged.dispatch();
        var newvec = new THREE.Vector3();
        this._mesh.getWorldPosition(newvec);
        this._origin = new THREE.Vector3().subVectors(newvec, diff);
    }
    
    serialize() {
        var parts = { "name": this._name, "origin": this._origin, "rise": this._rise, "run": this._run, "angle": this._angle, "width": this._width, "count": this.stairCount, 'type': "Stairs"};
        return parts;
    }

    clear() {
        this._scene.remove(this._mesh);
        this._scene.remove(this._edge);
        this._sidebar.removeFeatureLine(this._room, this._name);
    }
}

function makeLayoutStairs(rise, run, width, count, combined) {
    var start = new THREE.Vector3();
    var verts = [];
    var objCount = Math.floor(count / combined) + (count % combined);
    for (var i = 0; i < objCount; i++) {

        var stairRise = [start.clone(), new THREE.Vector3(start.x + width, 0, start.z), new THREE.Vector3(start.x + width, 0, start.z + (rise * combined) + (run * combined)), new THREE.Vector3(start.x, 0, start.z + (rise * combined) + (run * combined))];
        start = new THREE.Vector3(start.x, 0, start.z + (rise * combined) + (run * combined));

        var geo = new THREE.Geometry();
        geo.vertices = stairRise;
        var msh = new THREE.Mesh(geo);

        verts.push(msh);
    }
    console.log(verts);
    return verts;
}

function generateStairs(ylen, zlen, xlen, stairCount, point, material, angle) {
    var xoff = 0;
    var index = 0;
    
    var boxArr = [];
    var geo = new THREE.Geometry();
    for (var i = 0; i < stairCount; i++) {
        var ge = new THREE.BoxGeometry(xlen, ylen, zlen);
        ge.translate(point.x + (xoff * i), 2*point.y + (ylen * i), point.z - (zlen * i));
        var stairMesh = new THREE.Mesh(ge, material);
        geo.mergeMesh(stairMesh);
    }
    geo.translate(-1 * point.x, -1 * point.y, -1 * point.z);
    geo.rotateY(angle);
    var newmsh = new THREE.Mesh(geo, material);
    newmsh.position.set(point.x, point.y, point.z);
    return newmsh;
}

function computeAngle(bounds) {
    var odist = new THREE.Vector3().subVectors(bounds[1], bounds[0]);
    return getAng(odist, new THREE.Vector3(1, 0, 0));
}

function computeOrigin(bounds, pos, width) {
    var dist = new THREE.Vector3().subVectors(pos, bounds[0]);
    var odist = new THREE.Vector3().subVectors(bounds[1], bounds[0]);
    var ang = dist.angleTo(odist);
    var d1 = dist.length() * Math.cos(ang);

    d1 = d1 + width > odist.length() ? odist.length() - width : d1;

    var newv = new THREE.Vector3().lerpVectors(bounds[0], bounds[1], d1 / odist.length());
    var newvend = new THREE.Vector3().lerpVectors(bounds[0], bounds[1], (d1 + width) / odist.length());

    return new THREE.Vector3(newv.x, newv.y + 0.1, newv.z);
}