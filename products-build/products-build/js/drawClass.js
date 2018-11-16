class Sketch {
    constructor(origin, editor, name, sidebar, materials) {
        this._origin = origin;
        this._scene = editor.scene;
        this._name = name + '-sketch';
        this._roomname = name;
        this._signals = editor.signals;
        this._sidebar = sidebar;
        this._materials = materials;
        this._sidebarLines = [];
        this._raycaster = new THREE.Raycaster();
        this._raycaster.linePrecision = .05;
        this._line;
        this._arr;
        this._pts;
        this._type;
        this._id;
        this._minWallLength = 0.0508;
    }

    get name()  { return this._name; }
    get room()  { return this._roomname; }
    get id()    { return this._id; }
    get origin(){ return this._origin; }
    get line()  { return this._line; }
    get array() { return this._arr; }
    get array2d() { return this.get2D(); }
    get pointCount() { return this._pts.length; }
    get pointArray() { return bufferToVertices(this._line); }

    start(point) {
        console.log("Start");
        this._origin = point;
        var c = new Float32Array([point.x, point.y, point.z, point.x, point.y, point.z]);
        var geom = new THREE.BufferGeometry();
        geom.addAttribute('position', new THREE.BufferAttribute(c, 3));
        geom.attributes.position.dynamic = true;
        this._line = new THREE.Line(geom, this._materials.Line);
        this._line.name = this._name;
        this._arr = this._line.geometry.attributes.position.array;
        this._pts = [0];
        this._scene.add(this._line);
        this._sidebar.addLine(this._roomname);
        this._signals.addPoint.dispatch();
        this._type = "Room";
        //this._signals.addWall.dispatch();
    }

    startFeature(point) {
        console.log("Start Feature");
        this._origin = point;
        var c = new Float32Array([point.x, point.y, point.z, point.x, point.y, point.z]);
        var geom = new THREE.BufferGeometry();
        geom.addAttribute('position', new THREE.BufferAttribute(c, 3));
        geom.attributes.position.dynamic = true;
        this._line = new THREE.Line(geom, this._materials.Line);
        this._line.name = "Cus" + this._name;
        this._name = this._line.name;
        this._arr = this._line.geometry.attributes.position.array;
        this._pts = [0];
        this._scene.add(this._line);
        this._id = this._sidebar.addFeatureLine(this._line, this._roomname, this._name);
        this._sidebar.addCustom(this._roomname, this._id);
        this._signals.addPoint.dispatch();
        this._type = "Feature";
    }

    startDisto() {
        console.log("start disto");
        var c = new Float32Array(3);
        c.set(this._arr.slice(0, 3));
        this._line.geometry.removeAttribute('position');
        this._line.geometry.addAttribute('position', new THREE.BufferAttribute(c, 3));
        this._line.geometry.attributes.position.dynamic = true;
        this._line.geometry.attributes.position.needsUpdate = true;
        this._arr = this._line.geometry.attributes.position.array;
    }

    move(point, col) {
        if (this._line) {
            var lind = this._arr.length - 1;
            var vec3 = quickSnap(this._arr, point);
            var or = new THREE.Vector3(this._arr[lind - 5], this._arr[lind - 4], this._arr[lind - 3]);
            if (col) {
                var tst = collision(or, vec3, col);
                if (tst.length > 0 && tst[0].point.distanceTo(or) < vec3.distanceTo(or)) {
                    vec3 = tst[0].point;
                }
            }
            this._arr[lind - 2] = vec3.x;
            this._arr[lind - 1] = vec3.y;
            this._arr[lind] = vec3.z;
            var v1 = vec3.sub(or);
            var v2 = this._arr.length > 6 ? or.sub(new THREE.Vector3(this._arr[lind - 8], this._arr[lind - 7], this._arr[lind - 6])) : or.sub(new THREE.Vector3(or.x - 1, 0.1, or.z));
            var ang = or.angleTo(vec3);
            var angval = Math.abs((ang * 180 / Math.PI) - 180);

            var metreInches = new THREE.Vector3(this._arr[lind - 2], this._arr[lind - 1], this._arr[lind]).distanceTo(new THREE.Vector3(this._arr[lind - 5], this._arr[lind - 4], this._arr[lind - 3])) * 39.370078740157477;
            var feetval = Math.floor(metreInches / 12);
            var inchval = Math.floor(metreInches % 12);
            this._line.geometry.attributes.position.needsUpdate = true;
            this._type === 'Room' ? this._signals.updateNotation.dispatch() : null;
            this._type === 'Room' ? this._sidebar.updateLine(this._roomname, [feetval, inchval, angval]) : this._sidebar.updateCustom(this._roomname, this._id, [feetval, inchval, angval]);
            return this.isComplete(vec3);
        }
    }

    testCollision(chn, colliders) {
        var pts = bufferToVertices(this._line);
        var scale = 1000;
        var subj_path = [];
        for (var i = 0; i < this._arr.length - 3; i += 3) {
            subj_path.push({ X: (this._arr[i] + chn.x) * scale, Y: (this._arr[i+2] + chn.z) * scale });
            var tst = new THREE.Vector3((this._arr[i + 3] + chn.x) - (this._arr[i] + chn.x), 0, (this._arr[i + 5] + chn.z) - (this._arr[i + 2] + chn.z));
            var dist = tst.length();
            var nrm = tst.normalize();
            var pt = new THREE.Vector3((this._arr[i] + chn.x), 1, (this._arr[i + 2] + chn.z));
            this._raycaster.far = dist;
            this._raycaster.set(pt, nrm);
            if (this._raycaster.intersectObjects(colliders[0]).length > 0) {
                return false;
            }
        }
        for (var c = 0; c < colliders[1].length; c++) {
            var clip_path = [];
            for (var z = 0; z < colliders[1][c].length; z++) {
                clip_path.push({ X: (colliders[1][c][z].x) * scale, Y: (colliders[1][c][z].y) * scale });
            }
            if (intersectQuick(subj_path, clip_path).length > 0) {
                return false;
            }
        }
        return true;
    }

    get2D() {
        var ret = [];
        for (var i = 0; i < this._arr.length; i += 3) {
            ret.push(new THREE.Vector2(this._arr[i], this._arr[i + 2]));
        }
        return ret;
    }

    addPoint(point) {
        point = quickSnap(this._arr, point);
        var prev = new THREE.Vector3(this._arr[this._arr.length - 6], this._arr[this._arr.length - 5], this._arr[this._arr.length - 4]);
        if (point.distanceTo(prev) < this._minWallLength) {
            console.log("Too Close");
            this._signals.addPoint.dispatch();
            return;
        }
        if (this.isComplete(point)) {
            this._type === 'Room' ? this._signals.completeRoom.dispatch() : this._signals.completeFeature.dispatch();
            return;
        }
        this.insertPoint(point);
        this._signals.addPoint.dispatch();
        this._type === 'Room' ? this._sidebar.addLine(this._roomname) : this._sidebar.addCustom(this._roomname, this._id);
    }

    addPointFeature(point) {
        point = quickSnap(this._arr, point);
        if (this.isComplete(point)) {
            //this._signals.completeRoom.dispatch();
            return;
        }
        this.insertPoint(point);
    }

    addPointDisto(meas) {
        if (!this._arr) {
            this.start(new THREE.Vector3(0, 0.1, 0));
        }
        var ft = meas[0];
        var inch = meas[1];
        if (ft === 0 && inch === 0) {
            return;
        }
        var spt = get2DPoints(this._arr, this._arr.length / 3 - 2);
        var opt = this._arr.length === 6 ? new THREE.Vector2(spt.x - 1, spt.y) : get2DPoints(this._arr, this._arr.length / 3 - 3);
        var mag = feetInchToMeters(ft, inch);
        var ang = Math.PI / 2;

        var newVec = calcAtAngNew(spt, opt, ang, mag);
        var pt = new THREE.Vector3(newVec.x, 0.1, newVec.y);

        this._type === 'Room' ? this._sidebar.updateLine(this._roomname, [ft, inch, 90]) : this._sidebar.updateCustom(this._roomname, this._id, [ft, inch, 90]);
        this.insertPointDisto(pt);
    }

    insertPointDisto(pt) {
        this._arr[this._arr.length - 3] = pt.x;
        this._arr[this._arr.length - 2] = pt.y;
        this._arr[this._arr.length - 1] = pt.z;

        this.addPoint(pt);
        console.log(this._arr);
    }

    shift(vec) {
        for (var i = 0; i < this._arr.length; i += 3) {
            this._arr[i] += vec.x;
            this._arr[i + 2] += vec.z;
        }
        this._line.geometry.attributes.position.dynamic = true;
        this._line.geometry.attributes.position.needsUpdate = true;
        this._arr = this._line.geometry.attributes.position.array;
    }

    completeRoomDisto() {
        if (this._arr.length >= 9) {
            //this.insertPoint(new THREE.Vector3(this._arr[this._arr.length - 3], this._arr[this._arr.length - 2], this._arr[this._arr.length - 1]));
            this.addPoint(this._origin);
        }

    }

    insertPoint(point) {
        var c = new Float32Array(this._arr.length + 3);
        this._pts.push(this._pts[this._pts.length - 1] + 3);
        c.set(this._arr);
        c[c.length - 3] = point.x;
        c[c.length - 2] = point.y;
        c[c.length - 1] = point.z;
        this._line.geometry.removeAttribute('position');
        this._line.geometry.addAttribute('position', new THREE.BufferAttribute(c, 3));
        this._line.geometry.attributes.position.dynamic = true;
        this._line.geometry.attributes.position.needsUpdate = true;
        this._arr = this._line.geometry.attributes.position.array;
    }

    undoPoint() {
        console.log(this._arr.length);
        var c = new Float32Array(this._arr.length - 3);
        this._pts.pop();
        c.set(this._arr.slice(0, -3));
        this._line.geometry.removeAttribute('position');
        this._line.geometry.addAttribute('position', new THREE.BufferAttribute(c, 3));
        this._line.geometry.attributes.position.dynamic = true;
        this._line.geometry.attributes.position.needsUpdate = true;
        this._arr = this._line.geometry.attributes.position.array;
        this.updateSidebar();
    }

    flipLine(num) {
        num = this._arr.length / 3 - 2;
        var pt0 = get2DPoints(this._arr, num);
        var pt1 = get2DPoints(this._arr, num - 1);
        var curr = new THREE.Vector2().subVectors(pt0, pt1);
        var newcurr = new THREE.Vector2(pt1.x - curr.x, pt1.y - curr.y);

        this._line.geometry.attributes.position.array[this._arr.length - 6] = newcurr.x;
        this._line.geometry.attributes.position.array[this._arr.length - 4] = newcurr.y;
        this._line.geometry.attributes.position.array[this._arr.length - 3] = newcurr.x;
        this._line.geometry.attributes.position.array[this._arr.length - 1] = newcurr.y;
        this._line.geometry.attributes.position.dynamic = true;
        this._line.geometry.attributes.position.needsUpdate = true;
        this._arr = this._line.geometry.attributes.position.array;
    }

    removePoint(pointNum) {
        var testpt = (pointNum + 1) * 3;
        var c = new Float32Array(this._arr.length - 3);
        this._pts.pop();
        var skip = 0;
        for (var i = 0; i < c.length - 3; i++) {
            skip = (i === testpt) ? 3 : skip;
            c[i] = this._arr[i + skip];
        }
        this._line.geometry.removeAttribute('position');
        this._line.geometry.addAttribute('position', new THREE.BufferAttribute(c, 3));
        this._line.geometry.attributes.position.dynamic = true;
        this._line.geometry.attributes.position.needsUpdate = true;
        this._arr = this._line.geometry.attributes.position.array;
        this.updateSidebar();
    }

    updatePoint(pointNum, values, type, drawing) {
        var ang = values['angle'] * Math.PI / 180;
        var mag = values['magnitude'];
        var newVec;
        var ptct = this._arr.length / 3;

        var p0 = pointBefore(ptct, pointNum + 1);
        var p1 = pointBefore(ptct, p0);
        newVec = calcAtAngle(get2DPoints(this._arr, pointNum + 1), get2DPoints(this._arr, p0), get2DPoints(this._arr, p1), ang, mag);
        if (type === 'angle' && !drawing) {
            var indPre = pointAfter(ptct, pointNum);
            var indNxt = pointAfter(ptct, indPre);
            var v0 = get2DPoints(this._arr, pointNum);
            var v1 = newVec;
            var v2 = get2DPoints(this._arr, indPre);
            var v3 = get2DPoints(this._arr, indNxt);
            var anglePreserve = intersectionCalc([v0, v1], [v2, v3]);
            if (anglePreserve) {
                newVec = anglePreserve;
            }
        }
        this.update(pointNum, newVec, drawing);
        this.updateSidebar();
    }

    update(pointNum, newVec, drawing) {
        this._line.geometry.attributes.position.array[pointNum * 3 + 3] = newVec.x;
        this._line.geometry.attributes.position.array[pointNum * 3 + 5] = newVec.y;
        if (pointNum === this._arr.length / 3 - 2 && !drawing) {
            this._line.geometry.attributes.position.array[0] = newVec.x;
            this._line.geometry.attributes.position.array[2] = newVec.y;
            this._origin = new THREE.Vector3(newVec.x, 0.1, newVec.y);
        }
        this._line.geometry.attributes.position.dynamic = true;
        this._line.geometry.attributes.position.needsUpdate = true;
        this._arr = this._line.geometry.attributes.position.array;
    }

    getComponent(p0, p1, pos) {
        var v0 = get3DPoints(this._arr, p0);
        var v1 = get3DPoints(this._arr, p1);
        var component = new THREE.Vector3().lerpVectors(v0, v1, .5);

        var offset = new THREE.Vector2(pos.x - component.x, pos.z - component.z);
        var og = new THREE.Vector3().subVectors(v1, v0);
        var ang = og.angleTo(new THREE.Vector3(1, 0, 0));
        var mag = offset.length() * Math.cos(ang);
        og.normalize();
        var newv = new THREE.Vector2(offset.x - mag * og.x, offset.y - mag * og.z);
        return newv;
    }

    dragPoint(pointNum, pos) {
        var ptct = this._arr.length / 3;

        var indPre = pointBefore(ptct, pointNum);
        var ind2 = pointAfter(ptct, pointNum);
        var indPost = pointAfter(ptct, ind2);

        var offset = this.getComponent(pointNum, ind2, pos);

        var pb = get2DPoints(this._arr, indPre);
        var p0 = get2DPoints(this._arr, pointNum);
        var p1 = get2DPoints(this._arr, ind2);
        var pp = get2DPoints(this._arr, indPost);

        var oldMin = intersectionCalc([pb, p0], [p1, pp]);

        var p0n = new THREE.Vector2(p0.x + offset.x, p0.y + offset.y);
        var p1n = new THREE.Vector2(p1.x + offset.x, p1.y + offset.y);

        var preInt = intersectionCalc([pb, p0], [p0n, p1n]);
        var postInt = intersectionCalc([p0n, p1n], [p1, pp]);
        if (!(preInt && postInt)) {
            return false;
        }

        var lenMax, lenMax2, maxchk, minchk, maxchk2, minchk2;
        var nomin, nomax;
        
        if (!oldMin) {
            nomin = (pb.distanceToSquared(p0n) > p0.distanceToSquared(p0n) || pb.distanceToSquared(p0) > p0.distanceToSquared(p0n));
            nomax = (pp.distanceToSquared(p1n) > p1.distanceToSquared(p1n) || pp.distanceToSquared(p1) > p1.distanceToSquared(p1n));
            if (nomin && nomax) {
                this._line.geometry.attributes.position.array[pointNum * 3] = preInt.x;
                this._line.geometry.attributes.position.array[pointNum * 3 + 2] = preInt.y;

                this._line.geometry.attributes.position.array[ind2 * 3] = postInt.x;
                this._line.geometry.attributes.position.array[ind2 * 3 + 2] = postInt.y;

                if (pointNum === this._arr.length / 3 - 2) {
                    this._line.geometry.attributes.position.array[0] = postInt.x;
                    this._line.geometry.attributes.position.array[this._arr.length - 3] = postInt.x;
                    this._line.geometry.attributes.position.array[2] = postInt.y;
                    this._line.geometry.attributes.position.array[this._arr.length - 1] = postInt.y;
                    this._origin = new THREE.Vector3(postInt.x, 0.1, postInt.y);
                } else if (pointNum === 0) {
                    this._line.geometry.attributes.position.array[this._arr.length - 3] = preInt.x;
                    this._line.geometry.attributes.position.array[this._arr.length - 1] = preInt.y;
                    this._origin = new THREE.Vector3(preInt.x, 0.1, preInt.y);
                }
                this._line.geometry.attributes.position.dynamic = true;
                this._line.geometry.attributes.position.needsUpdate = true;
                this._arr = this._line.geometry.attributes.position.array;

                this.updateMultiple(indPre, pointNum, ind2, indPost);

                this._signals.objectChanged.dispatch();
                return true;
            } else {
                return false;
            }
        } else if (oldMin) {
            lenMax = oldMin.distanceToSquared(pb);
            lenMax2 = oldMin.distanceToSquared(pp);
            maxchk = preInt.distanceToSquared(pb);
            minchk = preInt.distanceToSquared(oldMin);
            maxchk2 = postInt.distanceToSquared(pp);
            minchk2 = postInt.distanceToSquared(oldMin);
            if (maxchk < lenMax && minchk < lenMax && maxchk2 < lenMax2 && minchk2 < lenMax2) {
                /*
                        var oldSignx = Math.sign(p0.x - pb.x);
                        var oldSigny = Math.sign(p0.y - pb.y);
                        var oldSignx2 = Math.sign(p1.x - pp.x);
                        var oldSigny2 = Math.sign(p1.y - pp.y);
                
                        var newSignx = Math.sign(preInt.x - pb.x);
                        var newSigny = Math.sign(preInt.y - pb.y);
                        var newSignx2 = Math.sign(postInt.x - pp.x);
                        var newSigny2 = Math.sign(postInt.y - pp.y);
                
                        console.log(oldSignx);
                        console.log(oldSigny);
                        console.log(newSignx);
                        console.log(newSigny);
                
                        if ((oldSignx == newSignx) && (oldSigny == newSigny) && (oldSignx2 == newSignx2) && (oldSigny2 == newSigny2)) {  */
                this._line.geometry.attributes.position.array[pointNum * 3] = preInt.x;
                this._line.geometry.attributes.position.array[pointNum * 3 + 2] = preInt.y;

                this._line.geometry.attributes.position.array[ind2 * 3] = postInt.x;
                this._line.geometry.attributes.position.array[ind2 * 3 + 2] = postInt.y;

                if (pointNum === this._arr.length / 3 - 2) {
                    this._line.geometry.attributes.position.array[0] = postInt.x;
                    this._line.geometry.attributes.position.array[this._arr.length - 3] = postInt.x;
                    this._line.geometry.attributes.position.array[2] = postInt.y;
                    this._line.geometry.attributes.position.array[this._arr.length - 1] = postInt.y;
                    this._origin = new THREE.Vector3(postInt.x, 0.1, postInt.y);
                } else if (pointNum === 0) {
                    this._line.geometry.attributes.position.array[this._arr.length - 3] = preInt.x;
                    this._line.geometry.attributes.position.array[this._arr.length - 1] = preInt.y;
                    this._origin = new THREE.Vector3(preInt.x, 0.1, preInt.y);
                }
                this._line.geometry.attributes.position.dynamic = true;
                this._line.geometry.attributes.position.needsUpdate = true;
                this._arr = this._line.geometry.attributes.position.array;

                this.updateMultiple(indPre, pointNum, ind2, indPost);

                this._signals.objectChanged.dispatch();
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    updateMultiple(ind0, ind1, ind2, ind3) {
        ind0 = ind0 === (this._arr.length / 3) - 1 ? 0 : ind0;

        var p0 = get2DPoints(this._arr, ind0);
        var p1 = get2DPoints(this._arr, ind1);
        var p2 = get2DPoints(this._arr, ind2);
        var p3 = get2DPoints(this._arr, ind3);

        var len0 = p0.distanceTo(p1);
        var len1 = p1.distanceTo(p2);
        var len2 = p2.distanceTo(p3);

        this._sidebar.updateLine(this._roomname, meterToFeetInch(len0), ind0);
        this._sidebar.updateLine(this._roomname, meterToFeetInch(len1), ind1);
        this._sidebar.updateLine(this._roomname, meterToFeetInch(len2), ind2);
    }

    updateSidebar() {
        this._type === 'Room' ? this._sidebar.emptyBoxes(this._roomname) : this._sidebar.emptyCustom(this._roomname, this._id);
        var ar = this._arr;
        var vec1 = new THREE.Vector3(ar[0], ar[1], ar[2]);
        var vec0 = new THREE.Vector3(ar[ar.length-6], ar[ar.length-5], ar[ar.length-4]);
        for (var i = 3; i < ar.length; i += 3) {
            var vec2 = new THREE.Vector3(ar[i], ar[i + 1], ar[i + 2]);
            var v0 = new THREE.Vector3(vec1.x - vec0.x, vec1.y - vec0.y, vec1.z - vec0.z);
            var v1 = new THREE.Vector3(vec2.x - vec1.x, vec2.y - vec1.y, vec2.z - vec1.z);
            var ang = v0.angleTo(v1);
            var dist = convertToFeetInch(vec1.distanceTo(vec2));
            this._type === 'Room' ? this._sidebar.addLine(this._roomname) : this._sidebar.addCustom(this._roomname, this._id);
            var meas = [dist.feet, dist.inch, Math.abs(Math.round(ang * 180 / Math.PI) - 180)];
            this._type === 'Room' ?  this._sidebar.updateLine(this._roomname, meas) : this._sidebar.updateCustom(this._roomname, this._id, meas);
            vec0 = vec1.clone();
            vec1 = vec2.clone();
        }
    }

    isComplete(pt) {
        if (pt.distanceTo(this._origin) < 0.2 && this._arr.length > 9) {
            this._arr[this._arr.length - 3] = this._origin.x;
            this._arr[this._arr.length - 2] = this._origin.y;
            this._arr[this._arr.length - 1] = this._origin.z;
            return true;
        }
        return false;
    }

    convertArray(arr) {
        var c = new Float32Array(Object.keys(arr).length);
        for (var i = 0; i < c.length; i++) {
            c[i] = arr[i];
        }
        return c;
    }

    deserialize(sk) {
        this._arr = this.convertArray(sk.arr);
        var loader = new THREE.ObjectLoader();
        this._line = loader.parse(sk.line);
        this._scene.add(this._line);
        this._type = sk.type;
        this._name = sk.name;
        if (this._type !== 'Room') {
            this._id = this._sidebar.addFeatureLine(this._line, this._roomname, this._name);
            this._sidebar.addCustom(this._roomname, this._id);
        }
        this.updateSidebar();
    }

    serialize() {
        return { 'name': this._name, 'line': this._line, 'arr': this._arr, 'origin': this._origin, 'type': this._type };
    }

    clear() {
        this._line ? this._scene.remove(this._scene.getObjectByName(this._line.name)) : null;
    }
}

function meterToFeetInch(meters) {
    var dist = meters * 39.370078740157477;
    return [Math.floor(dist / 12), Math.floor(dist % 12)];
}

function feetInchToMeters(feet, inches) {
    return (feet * 0.3048 + inches * 0.0254);
}

function checkSlope(v0, v1) {
    if (v0[1].x - v0[0].x === 0 || v1[1].x - v1[0].x === 0) {
        return Math.sign(v0[1].x - v0[0].x) === Math.sign(v1[1].x - v1[0].x);
    }
    return Math.atan2((v0[1].y - v0[0].y) / (v0[1].x - v0[0].x)).toFixed(2) === Math.atan2((v1[1].y - v1[0].y) / (v1[1].x - v1[0].x)).toFixed(2);
}

function intersectionCalc(vecs0, vecs1) {
    var v0 = vecs0[0];
    var v1 = vecs0[1];
    var v2 = vecs1[0];
    var v3 = vecs1[1];
    var denom = (v0.x - v1.x) * (v2.y - v3.y) - (v0.y - v1.y) * (v2.x - v3.x);
    if (denom === 0) {
        return false;
    }
    var numerx = (v0.x * v1.y - v0.y * v1.x) * (v2.x - v3.x) - (v0.x - v1.x) * (v2.x * v3.y - v2.y * v3.x);
    var numery = (v0.x * v1.y - v0.y * v1.x) * (v2.y - v3.y) - (v0.y - v1.y) * (v2.x * v3.y - v2.y * v3.x);
    var intVec = new THREE.Vector2(numerx / denom, numery / denom);
    return intVec;
}

function get3DPoints(arr, ind) {
    return new THREE.Vector3(arr[ind * 3], arr[ind * 3 + 1], arr[ind * 3 + 2]);
}
function get2DPoints(arr, ind) {
    return new THREE.Vector2(arr[ind * 3], arr[ind * 3 + 2]);
}
function pointBefore(arrlen, ind) {
    return (ind === 0 ? arrlen - 2 : ind === 1 ? arrlen-1 : ind - 1);
}
function pointAfter(arrlen, ind) {
    return (ind === arrlen - 2 ? 0 : ind === arrlen-1 ? 1 : ind + 1);
}
function collision(pt1, pt2, meshlist) {
    var nrm = new THREE.Vector3(pt2.x - pt1.x, pt2.y - pt1.y, pt2.z - pt1.z).normalize();
    var raycaster = new THREE.Raycaster();
    raycaster.set(pt1, nrm);
    return raycaster.intersectObjects(meshlist);
}

function calcAtAngNew(pt0, pt1, ang, mag) {
    var ovec = new THREE.Vector2(pt1.x - pt0.x, pt1.y - pt0.y);
    var a1 = Math.atan2(ovec.y, ovec.x);
    var angle = a1 + ang;
    var x1 = parseFloat(((mag * Math.cos(angle) * 1000) / 1000).toFixed(3));
    var y1 = parseFloat(((mag * Math.sin(angle) * 1000) / 1000).toFixed(3));
    var newVec = new THREE.Vector2(pt0.x + x1, pt0.y + y1);
    return newVec;
}

function calcAtAngle(pt0, pt1, pt2, ang, mag) {
    var tvec = new THREE.Vector2(pt0.x - pt1.x, pt0.y - pt1.y);
    var ovec = new THREE.Vector2(pt2.x - pt1.x, pt2.y - pt1.y);

    var a0 = Math.atan2(tvec.y, tvec.x);
    var a1 = Math.atan2(ovec.y, ovec.x);
    var total = Math.abs(a1 - a0);

    ang = total > Math.PI ? 2 * Math.PI - ang : ang;

    var chn = total - ang;
    var angle = a1 - a0 >= 0 ? a0 + chn : a0 - chn;

    var x1 = parseFloat(((mag * Math.cos(angle) * 1000) / 1000).toFixed(3));
    var y1 = parseFloat(((mag * Math.sin(angle) * 1000) / 1000).toFixed(3));
    var newVec = new THREE.Vector2(pt1.x + x1, pt1.y + y1);
    return newVec
}

function quickSnap(pts, vec3) {
    var evtobj = window.event ? event : { 'shiftKey': true };
    if (evtobj.shiftKey) {
        return vec3;
    }
    if (pts.length > 6) {
        // To change snap change it here
        var snap = 22.5 * Math.PI / 180;
        var origin = get3DPoints(pts, 0);
        if (vec3.distanceTo(origin) < 0.2) {
            return origin;
        }
        var newVec = new THREE.Vector2(vec3.x, vec3.z);
        var plen = (pts.length)/3 - 2;
        var pt0 = get2DPoints(pts, plen);
        var pt1 = get2DPoints(pts, plen - 1);
        var v0 = new THREE.Vector2(newVec.x - pt0.x, newVec.y - pt0.y);
        var v1 = new THREE.Vector2(pt1.x - pt0.x, pt1.y - pt0.y);

        var mag = v0.length();
        var a1 = Math.atan2(v0.y, v0.x);
        var a2 = Math.atan2(v1.y, v1.x);
        var hi = Math.round(Math.abs(a2 - a1) / snap) * snap;
        hi = hi > Math.PI ? 2 * Math.PI - hi : hi;
        hi = hi === Math.PI ? hi - snap : hi;
        hi = hi === 0 ? hi + snap : hi;
        var t1 = calcAtAngle(newVec, pt0, pt1, hi, mag);
        var tr = new THREE.Vector3(t1.x, vec3.y, t1.y);
        return tr
    } else if (pts.length === 6) {
        pt0 = get2DPoints(pts, 0);
        var xvec = new THREE.Vector2(vec3.x, pt0.y);
        var zvec = new THREE.Vector2(pt0.x, vec3.z);
        vec3 = xvec.distanceToSquared(pt0) > zvec.distanceToSquared(pt0) ? new THREE.Vector3(vec3.x, vec3.y, pt0.y) : new THREE.Vector3(pt0.x, vec3.y, vec3.z);
    }
    return vec3
}


function testIntersections(ptlist) {


}