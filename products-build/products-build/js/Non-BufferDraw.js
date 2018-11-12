class Sketch {
    constructor(origin, editor, name, sidebar, materials) {
        this._origin = origin;
        this._scene = editor.scene;
        this._name = name + '-sketch';
        this._room = name;
        this._signals = editor.signals;
        this._sidebar = sidebar;
        this._materials = materials;
        this._sidebarLines = [];
        this._pts = [];
        this._line;
        this._arr;
    }

    get name() { return this._name; }
    get room() { return this._room; }
    get origin() { return this._origin; }
    get line() { return this._line; }
    get array() { return this._arr; }

    start(point) {
        console.log("Start");
        this._origin = point;
        this._pts.push(new THREE.Vector2(point.x, point.z));
        var c = new Float64Array([point.x, point.y, point.z, point.x, point.y, point.z]);
        var geom = new THREE.Geometry();
        geom.vertices.push(point.clone(), point.clone());
        this._line = new THREE.Line(geom, this._materials.Line);
        this._line.name = this._name;
        //this._arr = this._line.geometry.attributes.position.array;
        this._arr = this._line.geometry.vertices;
        this._scene.add(this._line);
        this._sidebar.addLine(this._room);
        this._signals.addPoint.dispatch();
        /*var geom = new THREE.BufferGeometry();
        geom.addAttribute('position', new THREE.Float64BufferAttribute(c, 3, false));
        geom.attributes.position.dynamic = true;
        this._line = new THREE.Line(geom, this._materials.Line);
        this._line.name = this._name;
        this._arr = this._line.geometry.attributes.position.array;
        this._scene.add(this._line);
        this._sidebar.addLine(this._room);
        this._signals.addPoint.dispatch();*/
        //this._signals.addWall.dispatch();
    }

    move(point, col) {
        if (this._line) {
            var vec3 = quickSnap(this._pts, point);
            var lind = this._arr.length;
            var or = new THREE.Vector3().subVectors(this._arr[lind - 2], this._arr[lind - 1]);
            if (col) {
                var tst = collision(or, vec3, col);
            }
            this._arr[lind - 1] = vec3.clone();
            var dist = vec3.distanceTo(or);
            var v1 = new THREE.Vector3(vec3.x - or.x, vec3.y - or.y, vec3.z - or.z);
            var v2;
            if (this._arr.length > 2) {
                v2 = or.sub(this._arr[lind - 3].clone())
            } else {
                v2 = or.sub(new THREE.Vector3(or.x - 1, 0.1, or.z));
            }
            var ang = or.angleTo(vec3);
            var metreInches = dist * 39.370078740157477;
            var feetval = Math.floor(metreInches / 12);
            var inchval = Math.floor(metreInches % 12);
            var angval = Math.abs(Math.round(ang * 180 / Math.PI) - 180);
            this._line.geometry.verticesNeedUpdate = true;
            this._line.geometry.lineDistancesNeedUpdate = true;
            //this._signals.updateMeas.dispatch(feetval, inchval, ang, this._name);
            this._sidebar.updateLine(this._room, [feetval, inchval, angval]);
            return this.isComplete(vec3);
            /*
            var lind = this._arr.length - 1;
            var vec3 = quickSnap(this._pts, point);
            console.log("PreArray : (" + vec3.x.toString() + ", " + vec3.y.toString() + ", " + vec3.z.toString() + ")")
            var or = new THREE.Vector3(this._arr[lind - 5], this._arr[lind - 4], this._arr[lind - 3]);
            if (col) {
                var tst = collision(or, vec3, col);
                if (tst.length > 0 && tst[0].point.distanceTo(or) < vec3.distanceTo(or)) {
                    //vec3 = tst[0].point;
                }
            }
            this._arr[lind - 2] = parseFloat(vec3.x.toString());
            this._arr[lind - 1] = parseFloat(vec3.y.toString());
            this._arr[lind] = parseFloat(vec3.z.toString());
            console.log("Array : (" + this._arr[lind - 2].toString() + ", " + this._arr[lind - 1].toString() + ", " + this._arr[lind].toString() + ")")
            console.log("PostArray : (" + vec3.x.toString() + ", " + vec3.y.toString() + ", " + vec3.z.toString() + ")")
            var dist = vec3.distanceTo(or);
            var v1 = new THREE.Vector3(vec3.x - or.x, vec3.y - or.y, vec3.z - or.z);
            var v2;
            if (this._arr.length > 6) {
                v2 = or.sub(new THREE.Vector3(this._arr[lind - 8], this._arr[lind - 7], this._arr[lind - 6]))
            } else {
                v2 = or.sub(new THREE.Vector3(or.x-1, 0.1, or.z));
            }
            var ang = or.angleTo(vec3);
            var metreInches = dist * 39.370078740157477;
            var feetval = Math.floor(metreInches / 12);
            var inchval = Math.floor(metreInches % 12);
            var angval = Math.abs(Math.round(ang * 180 / Math.PI) - 180);
            this._line.geometry.attributes.position.needsUpdate = true;
            //this._signals.updateMeas.dispatch(feetval, inchval, ang, this._name);
            this._sidebar.updateLine(this._room, [feetval, inchval, angval]);
            return this.isComplete(vec3);
            */
        }
    }

    removePoint(pointNum) {
        var verts = this._line.geometry.vertices;
        verts.splice(pointNum, 1);
        this._line.geometry = new THREE.Geometry();
        this._line.geometry.vertices = verts;
        this._line.geometry.verticesNeedUpdate = true;
        this._arr = this._line.geometry.vertices;
        this.updateSidebar();
    }

    /*removePoint(pointNum) {
        console.log(this._arr);
        console.log(pointNum);
        var testpt = pointNum * 3 + 3;
        var c = new Float32Array(this._arr.length - 3);
        var skip = 0;
        for (var i = 0; i < this._arr.length-3; i++) {
            (i == testpt || i == testpt + 1 || i == testpt + 2) ? skip += 1 : c[i - skip] = this._arr[i];
        }
        c[c.length - 3] = c[0];
        c[c.length - 2] = c[1];
        c[c.length - 1] = c[2];
        
        console.log(c);
        this._line.geometry.removeAttribute('position');
        this._line.geometry.addAttribute('position', new THREE.Float64BufferAttribute(c, 3, false));
        this._line.geometry.attributes.position.dynamic = true;
        this._line.geometry.attributes.position.needsUpdate = true;
        this._arr = this._line.geometry.attributes.position.array;

        this.updateSidebar();
    }*/

    updateSidebar() {
        var vec1 = this._arr[0].clone();
        var vec0 = this._arr[0].clone().sub(new THREE.Vector3(vec1.x - 1, 0.1, vec1.z));
        for (var i = 0; i < this._arr.length; i++) {
            var vec2 = this._arr[i].clone();
            var v0 = new THREE.Vector3().subVectors(vec1, vec0);
            var v1 = new THREE.Vector3().subVectors(vec2, vec1);
            var ang = v0.angleTo(v1);
            var dist = v1.distanceTo(v0) * 39.370078740157477;
            this._sidebar.addLine(this._room);
            this._sidebar.updateLine(this._room, [Math.floor(dist / 12), Math.floor(dist % 12), Math.abs(Math.round(ang * 180 / Math.PI) - 180)]);
            vec0 = vec1.clone();
            vec1 = vec2.clone();
        }
    }

    /*updateSidebar() {
        var ar = this._arr;
        var vec1 = new THREE.Vector3(ar[0], ar[1], ar[2]);
        var vec0 = vec1.clone().sub(new THREE.Vector3(vec1.x - 1, 0.1, vec1.z));
        for (var i = 3; i < ar.length; i += 3) {
            var vec2 = new THREE.Vector3(ar[i], ar[i + 1], ar[i + 2]);
            var v0 = new THREE.Vector3(vec1.x - vec0.x, vec1.y - vec0.y, vec1.z - vec0.z);
            var v1 = new THREE.Vector3(vec2.x - vec1.x, vec2.y - vec1.y, vec2.z - vec1.z);
            var ang = v0.angleTo(v1);
            var dist = v1.distanceTo(v0) * 39.370078740157477;
            this._sidebar.addLine(this._room);
            this._sidebar.updateLine(this._room, [Math.floor(dist / 12), Math.floor(dist % 12), Math.abs(Math.round(ang * 180 / Math.PI) - 180)]);
            vec0 = vec1.clone();
            vec1 = vec2.clone();
        }
    }*/

    addPoint(point) {
        console.log(this._line);
        point = quickSnap(this._pts, point);
        this._pts.push(new THREE.Vector2(point.x, point.z));
        if (this.isComplete(point)) {
            this._signals.completeRoom.dispatch();
            return;
        }
        this._line.geometry.vertices.push(point.clone());
        var verts = this._line.geometry.vertices;
        this._line.geometry = new THREE.Geometry();
        this._line.geometry.vertices = verts;
        this._line.geometry.verticesNeedUpdate = true;
        this._line.geometry.lineDistancesNeedUpdate = true;
        this._arr = this._line.geometry.vertices;

        this._signals.addPoint.dispatch();
        this._sidebar.addLine(this._room);
    }

    /*
    addPoint(point) {
        point = quickSnap(this._pts, point);
        this._pts.push(new THREE.Vector2(point.x, point.z));
        if (this.isComplete(point)) {
            this._signals.completeRoom.dispatch();
            return;
        }
        var c = new Float32Array(this._arr.length + 3);
        c.set(this._arr);
        c[c.length - 3] = point.x;
        c[c.length - 2] = point.y;
        c[c.length - 1] = point.z;
        this._line.geometry.removeAttribute('position');
        this._line.geometry.addAttribute('position', new THREE.Float64BufferAttribute(c, 3, false));
        this._line.geometry.attributes.position.dynamic = true;
        this._line.geometry.attributes.position.needsUpdate = true;
        this._arr = this._line.geometry.attributes.position.array;
       
        this._signals.addPoint.dispatch();
        this._sidebar.addLine(this._room);
    }*/

    isComplete(pt) {
        if (pt.distanceTo(this._origin) < 0.15 && this._arr.length > 3) {
            this._arr[this._arr.length - 1] = this._origin.clone();
            return true
        }
        return false
    }

    serialize() {
        return { '_name': this._name, '_line': this._line, '_arr': this._arr, '_origin': this._origin };
    }

    clear() {
        this._scene.remove(this._scene.getObjectByName(this._line.name));
    }
}

function collision(pt1, pt2, meshlist) {
    var nrm = new THREE.Vector3(pt2.x - pt1.x, pt2.y - pt1.y, pt2.z - pt1.z).normalize();
    var raycaster = new THREE.Raycaster();
    raycaster.set(pt1, nrm);
    return raycaster.intersectObjects(meshlist);
}

function calculateAtAngle(vec2a, vec2b, ang, mag) {
    //console.log("Vec1 : (" + vec2a.x.toString() + ", " + vec2a.y.toString() + ")")
    //console.log("Vec2 : (" + vec2b.x.toString() + ", " + vec2b.y.toString() + ")")
    var tvec = new THREE.Vector2(vec2b.x - vec2a.x, vec2b.y - vec2a.y);
    var angle = tvec.angle() + ang;
    //console.log(angle);
    //angle = angle < 0 ? angle + (Math.PI) : angle;
    //angle = angle > Math.PI ? angle - (Math.PI) : angle;
    //console.log("Angle : " + (angle * 180 / Math.PI).toString());
    var x1 = parseFloat(((mag * Math.cos(angle) * 1000) / 1000).toFixed(3));
    var y1 = parseFloat(((mag * Math.sin(angle) * 1000) / 1000).toFixed(3));
    //console.log("X : " + x1.toString());
    //console.log("Y : " + y1.toString());
    var newVec = new THREE.Vector2(vec2b.x + x1, vec2b.y - y1);
    return newVec
}

function quickSnap(pts, vec3) {
    var evtobj = window.event ? event : e;
    if (evtobj.shiftKey) {
        return vec3;
    }
    if (pts.length >= 2) {
        var snap = 45 * Math.PI / 180;
        var newVec = new THREE.Vector2(vec3.x, vec3.z);
        var plen = pts.length - 1;

        var v0 = new THREE.Vector2(newVec.x - pts[plen].x, newVec.y - pts[plen].y);
        var v1 = new THREE.Vector2(pts[plen - 1].x - pts[plen].x, pts[plen - 1].y - pts[plen].y);

        var mag = v0.length();
        var a1 = v0.angle();
        var hi = Math.round(a1 / snap) * snap;
        var t1 = calculateAtAngle(pts[plen - 1], pts[plen], hi, mag);
        var tr = new THREE.Vector3(t1.x, vec3.y, t1.y);
        //console.log("Result : (" + tr.x.toString() + ", " + tr.y.toString() + ", " + tr.z.toString() + ")")
        return tr
    } else if (pts.length == 1) {
        var xvec = new THREE.Vector2(vec3.x, pts[0].y);
        var zvec = new THREE.Vector2(pts[0].x, vec3.z);

        if (xvec.distanceToSquared(pts[0]) > zvec.distanceToSquared(pts[0])) {
            vec3 = new THREE.Vector3(vec3.x, vec3.y, pts[0].y);
        } else {
            vec3 = new THREE.Vector3(pts[0].x, vec3.y, vec3.z);
        }
    }
    return vec3
}

function snapToAngle(arr, vec3) {
    var evtobj = window.event ? event : e;
    var lind = arr.length - 1;
    if (!evtobj.shiftKey) {
        if (lind > 7) {
            var exvec1 = new THREE.Vector3(arr[lind - 8] - arr[lind - 5], arr[lind - 7] - arr[lind - 4], arr[lind - 6] - arr[lind - 3]);
            var exvec2 = new THREE.Vector3(vec3.x - arr[lind - 5], vec3.y - arr[lind - 4], vec3.z - arr[lind - 3]);
            var ang = exvec1.angleTo(exvec2);
            var ang2 = exvec1.angleTo(new THREE.Vector3(1, 0, 0)); //- ( Math.PI / 2 );

            if (exvec1.z >= 0) {
                ang2 += Math.PI;
            } else {
                ang2 -= Math.PI;
            }
            ang2 = -1 * Math.abs(ang2);
            var a1 = 0;
            if (ang * (180 / 3.14159265) < 90) {
                a1 = Math.sin(ang) * Math.sqrt(exvec2.x * exvec2.x + exvec2.y * exvec2.y + exvec2.z * exvec2.z);
            } else {
                a1 = Math.cos(ang - (Math.PI / 2)) * Math.sqrt(exvec2.x * exvec2.x + exvec2.y * exvec2.y + exvec2.z * exvec2.z);
            }
            var a2 = new THREE.Vector3(a1 * Math.sin(ang2), 0, a1 * Math.cos(ang2));
            posvec3 = new THREE.Vector3(arr[lind - 5] + a2.x, arr[lind - 4] + a2.y, arr[lind - 3] + a2.z);
            negvec3 = new THREE.Vector3(arr[lind - 5] - a2.x, arr[lind - 4] - a2.y, arr[lind - 3] - a2.z);
            var origin = new THREE.Vector3(arr[0], arr[1], arr[2]);
            if (vec3.distanceTo(origin) < 0.2) {
                vec3 = origin;
            } else if (vec3.distanceTo(posvec3) <= vec3.distanceTo(negvec3)) {
                vec3 = posvec3;
            } else {
                vec3 = negvec3;
            }
        } else {
            var startVec = new THREE.Vector3(arr[lind - 5], arr[lind - 4], arr[lind - 3]);
            var xvec = new THREE.Vector3(vec3.x, startVec.y, startVec.z);
            var zvec = new THREE.Vector3(startVec.x, startVec.y, vec3.z);
            var ang = xvec.angleTo(vec3);
            var ang2 = zvec.angleTo(vec3);

            if (ang2 * (180 / 3.14159265) < 25) {
                vec3 = zvec;
            } else {
                vec3 = xvec;
            }
        }

    }
    return vec3;
}