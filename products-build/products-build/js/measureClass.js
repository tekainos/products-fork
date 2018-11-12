class MeasuringTape {
    constructor(editor, sidebar) {
        this._editor = editor;
        this._scene = editor.scene;
        this._signals = editor.signals;
        this._sidebar = sidebar;
        this._points = [];
        this._spheres = [];
        this._line = [];
        this._tempSphere;
        this._tempLine;
    }

    addPoint(pos, col) {
        var newpt = this._points.length > 0 ? measureSnap(this._points, pos) : new THREE.Vector3(pos.x, 100, pos.z);
        var collide = lineCollision(newpt, col);
        if (collide.length == 0) {
            this._signals.measure.dispatch();
            return;
        }
        //this._points.length == 2 ? this.removeOldest() : null;
        this._points.length >= 1 ? this.measure(collide[0].point) : this.startPoint(collide[0].point);
        this._points.length < 2 ? this._signals.measure.dispatch() : null;
    }

    move(pos, col) {
        var newpt = this._points.length > 0 ? measureSnap(this._points, pos) : new THREE.Vector3(pos.x, 100, pos.z);
        var collide = lineCollision(newpt, col);
        if (this._points.length > 0) {
            if (!this._tempLine) {
                this._tempLine = makeLine();
                this._scene.add(this._tempLine);
            }
            this._tempLine.geometry.vertices[0] = this._points[this._points.length - 1];
            this._tempLine.geometry.vertices[1] = new THREE.Vector3(newpt.x, this._tempLine.geometry.vertices[0].y, newpt.z);
            this._tempLine.geometry.verticesNeedUpdate = true;
            this.updateSidebar();
        }
        if (collide.length > 0) {
            if (!this._tempSphere) {
                this._tempSphere = makeSphere();
                this._scene.add(this._tempSphere);
            }
            this._tempSphere.visible = true;
            this._tempLine ? this._tempSphere.position.set(collide[0].point.x, this._tempLine.geometry.vertices[0].y, collide[0].point.z) : this._tempSphere.position.set(collide[0].point.x, collide[0].y, collide[0].point.z);
        } else {
            this._tempSphere ? this._tempSphere.visible = false : null;
        }
    }

    cleanup() {
        if (this._tempSphere) {
            this._scene.remove(this._tempSphere);
            this._tempSphere = null;
        }
    }

    startPoint(pos) {
        this._points.push(pos);
        this.addPointToScene(pos);
        this._sidebar.addMeasuretape(0);
    }

    addPointToScene(pos) {
        var geo = new THREE.SphereGeometry(0.1);
        geo.translate(pos.x, pos.y, pos.z);
        var material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        var sphere = new THREE.Mesh(geo, material);
        this._spheres.push(sphere);
        this._scene.add(sphere);
    }

    measure(pos) {
        this._points.push(pos);
        this.addPointToScene(pos);
        var dist = this._points[this._points.length - 2].distanceTo(this._points[this._points.length - 1]);
        dist = dist * 39.3701;
        var ang = getAngleTape(this._points[this._points.length - 2], this._points[this._points.length - 1]);
        var measLine = new THREE.Geometry();
        measLine.vertices.push(pos, this._points[this._points.length - 2]);
        this._line.push(new THREE.Line(measLine, new THREE.LineBasicMaterial({color: 0x0000ff})));
        this._scene.add(this._line[this._line.length - 1]);

        this._sidebar.updateMeasuretape({ 'ft': Math.floor(dist / 12), 'in': Math.round(dist % 12), 'ang': Math.round(ang) }, this._points.length - 2);
        //this._sidebar.addMeasuretape(0);
        this._signals.clearTape.dispatch();
    }

    updateSidebar() {
        var dist = this._tempLine.geometry.vertices[0].distanceTo(this._tempLine.geometry.vertices[1]);
        var ang = getAngleTape(this._tempLine.geometry.vertices[0], this._tempLine.geometry.vertices[1]);
        dist = dist * 39.3701;
        this._sidebar.updateMeasuretape({ 'ft': Math.floor(dist / 12), 'in': Math.round(dist % 12), 'ang': Math.round(ang) }, this._points.length - 1);
    }

    removeOldest() {
        this._points = [];
        this._scene.remove(this._line);
        var rem = this._spheres.shift();
        this._scene.remove(rem);
        rem = this._spheres.shift();
        this._scene.remove(rem);
    }

    clear() {
        this._points = [];
        for (var i = 0; i < this._line.length; i++) {
            this._line[i] ? this._scene.remove(this._line[i]) : null;
        }
        this._tempLine ? this._scene.remove(this._tempLine) : null;
        this._tempSphere ? this._scene.remove(this._tempSphere) : null;
        for (var i = 0; i < this._spheres.length; i++) {
            this._scene.remove(this._spheres[i]);
        };
        this._spheres = [];
        this._tempLine = null;
        this._tempSphere = null;
        this._sidebar.clearMeasuretape();
    }
}

function getAngleTape(vec1, vec2) {
    var vec0 = new THREE.Vector3(vec1.x - 0.1, vec1.y, vec1.z);
    var v0 = new THREE.Vector3(vec1.x - vec0.x, vec1.y - vec0.y, vec1.z - vec0.z);
    var v1 = new THREE.Vector3(vec2.x - vec1.x, vec2.y - vec1.y, vec2.z - vec1.z);
    return (180 * v0.angleTo(v1) / Math.PI);
}

function lineCollision(point, meshlist) {
    var nrm = new THREE.Vector3(0, -1, 0);
    var raycaster = new THREE.Raycaster();
    raycaster.linePrecision = 0.1016;
    raycaster.set(point, nrm);
    return raycaster.intersectObjects(meshlist, true);
}

function makeLine() {
    var measLine = new THREE.Geometry();
    measLine.vertices.push(new THREE.Vector3());
    measLine.vertices.push(new THREE.Vector3());
    var line = new THREE.Line(measLine, new THREE.LineBasicMaterial({ color: 0x0000ff }));
    return line;
}

function makeSphere() {
    var geo = new THREE.SphereGeometry(0.1);
    var material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    var sphere = new THREE.Mesh(geo, material);
    return sphere;
}

function measureSnap(pts, vec3) {
    var evtobj = window.event ? event : e;
    if (evtobj.shiftKey) {
        return vec3;
    }
    if (pts.length == 1) {
        pts = [new THREE.Vector3(pts[0].x - 0.1, pts[0].y, pts[0].z), pts[0]];
    }
    var snap = 22.5 * Math.PI / 180;
    var newVec = new THREE.Vector2(vec3.x, vec3.z);
    var plen = pts.length - 1;

    var v0 = new THREE.Vector2(newVec.x - pts[plen].x, newVec.y - pts[plen].z);
    var v1 = new THREE.Vector2(pts[plen - 1].x - pts[plen].x, pts[plen - 1].z - pts[plen].z);

    var mag = v0.length();
    var a1 = Math.atan2(v0.y, v0.x);
    var a2 = Math.atan2(v1.y, v1.x);
    var hi = Math.round(Math.abs(a2 - a1) / snap) * snap;
    hi = hi > Math.PI ? 2 * Math.PI - hi : hi;
    hi = hi === Math.PI ? hi - snap : hi;
    hi = hi === 0 ? hi + snap : hi;
    var t1 = calcAtAngle(newVec, new THREE.Vector2(pts[plen].x, pts[plen].z), new THREE.Vector2(pts[plen - 1].x, pts[plen - 1].z), hi, mag);
    var tr = pts.length == 2 ? new THREE.Vector3(t1.x, pts[0].y, t1.y) : new THREE.Vector3(t1.x, vec3.y, t1.y);
    return tr
}
