class Wall {
    constructor(editor, origin, room, name, vector, left, right, ind0, ind1, sidebar, materials, winding) {
        this._editor = editor;
        this._scene = editor.scene;
        this._signals = editor.signals;
        this._origin = origin;
        this._room = room;
        this._name = name;
        this._features = [];
        this._left = left;
        this._right = right;
        this._vector = vector;
        this._length = 0;
        this._indices = [ind0, ind1];
        this._materials = materials;
        this._winding = winding;
        this._obj = makeWall(this._name, this._left, this._vector, this._right, materials.Draw, materials.Wall, null, winding);
        this._mesh = this._obj[0];
        this._line = this._obj[1];
        this._sidebar = sidebar;
        this._locked = false;
    }

    // Getters
    get name() { return this._name; }
    get room() { return this._room; }
    get features() { return this._features; }
    get origin() { return this._origin; }
    get left() { return this._left; }
    get right() { return this._right; }
    get length() { return this._length; }
    get obj()  { return this._obj; }
    get mesh() { return this._mesh; }
    get line() { return this._line; }
    get indicies() { return this._indices; }

    // Setters
    set length(lengthval) {
        this._length = lengthval;
        //todo : Update Wall Value
    }
    set left(newleft) {
        this._left = newleft;
        //todo : Update Left Angle and Origin
    }
    set right(newright) {
        this._right = newright;
        //todo : Update Right Angle
    }

    addFeature(pos, feature, height, width, top, bottom, type, swing) {
        var feat;
        var nm = "Box" + this._features.length.toString() + "-" + this._name;
        console.log(bottom);
        feat = new Feature(this._editor, pos, height, width, this._room, nm, this._vector, this._sidebar, this._materials, this._indices, this._name, top, bottom, this._winding, type, swing);
        feat.addToScene();
        this._features.push(feat);
        this.cutDoor();
        return feat;
    }

    lock() {
        this._locked = !this._locked;
    }

    refreshCuts() {
        if (this._features.length > 0) {
            var w = this._scene.getObjectByName(this._name);
            var wl = this._scene.getObjectByName('wl' + this._name);
            this._scene.remove(w);
            this._scene.remove(wl);

            this._obj = makeWall(this._name, this._left, this._vector, this._right, this._materials.Draw, this._materials.Wall, null, this._winding);
            this._mesh = this._obj[0];
            this._line = this._obj[1];
            this.cutDoor();
        }
    }

    cutDoor() {
        if (this._features.length > 0) {
            this._scene.remove(this._mesh);
            for (var i = 0; i < this._features.length; i++) {
                var ln = this._features[i].box;
                this._mesh = cutWall(this._mesh, ln, 2.032);
            }
            this._scene.add(this._mesh);
        }
    }

    getFeature(featName) {
        this._features.forEach(function (feat) {
            if (feat.name == featName) {
                return feat;
            }
        });
    }

    removeFeature(featName) {
        this._features = this._features.filter(function (el) {
            if (el.name == featName) {
                el.clear();
            }
            return el.name !== featName;
        });
    }

    matchBar() {
        var spl = this.name.match(/[a-zA-Z]+|[0-9]+/g);
        return 'wallform' + spl[spl.length - 1];
    }

    setMaterial(matChoice, mouseover) {
        if (!this._locked) {
            if (matChoice == 'Wall-Select') {
                mouseover ? null : this._signals.activateDragWall.dispatch(this._indices[0]);
                mouseover ? null : this._sidebar.highlightLine(this._room, 'Wall', this._indices[0]);
            } else {
                mouseover ? null : this._sidebar.highlightLine(this._room, 'Wall', -1);
            }
            this._mesh.material = this._materials[matChoice];
            this._mesh.material.needsUpdate = true;
            !mouseover && matChoice == 'Wall-Select' ? this._signals.objectChanged.dispatch(true) : null;
        }
    }

    deserialize(feat) {
        var featArr = [];
        for (var i = 0; i < feat.length; i++) {
            var feature = JSON.parse(feat[i]);
            var vector = [];
            feature.vector.forEach(function (vec) {
                vector.push(new THREE.Vector3(vec.x, vec.y, vec.z));
            })
            var featemp = new Feature(this._editor, feature.origin, feature.height, feature.width, this._room, feature.name, vector, this._sidebar, this._materials, this._indices, this._name);
            this._features.push(featemp);
            featemp.addToScene();
            featArr.push(featemp);
        }
        this.cutDoor();
        return featArr;
    }

    serialize() {
        var feats = [];
        this._features.forEach(function (feat) {
            feats.push(feat.serialize());
        });
        return JSON.stringify({ 'obj': this._obj, 'indices': this._indices, 'vector': this._vector, 'left': this._left, 'right': this._right, 'name': this._name, 'origin': this._origin, 'length': this._length, 'features': feats })
    }

    clear() {
        var w = this._scene.getObjectByName(this._name);
        var wl = this._scene.getObjectByName('wl' + this._name);
        for (var i = 0; i < this._features.length; i++) {
            this._features[i].clear();
        }
        if (w) {
            this._scene.remove(w);
        }
        if (wl) {
            this._scene.remove(wl);
        }
    }
}

/*
function intersectionCalc(v0, v1, v2, v3) {
    var denom = (v0.x - v1.x) * (v2.y - v3.y) - (v0.y - v1.y) * (v2.x - v3.x);
    if (denom == 0) {
        return false;
    }
    var numerx = (v0.x * v1.y - v0.y * v1.x) * (v2.x - v3.x) - (v0.x - v1.x) * (v2.x * v3.y - v2.y * v3.x);
    var numery = (v0.x * v1.y - v0.y * v1.x) * (v2.y - v3.y) - (v0.y - v1.y) * (v2.x * v3.y - v2.y * v3.x);
    var intVec = new THREE.Vector2(numerx / denom, numery / denom);
    return intVec;
}
*/

function calcIntersect(v1, v2, v3, v4) {
    var x1 = v1.x;
    var y1 = v1.z;
    var x2 = v2.x;
    var y2 = v2.z;
    var x3 = v3.x;
    var y3 = v3.z;
    var x4 = v4.x;
    var y4 = v4.z;

    var den = ((x1 - x2) * (y3 - y4)) - ((y1 - y2) * (x3 - x4));

    var xret = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / den;
    var yret = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / den;

    return (new THREE.Vector3(xret, v1.y, yret));
}


function makeThreeD(arrv) {
    return [0, 1, 2, 2, 3, 0, 4, 5, 6, 6, 7, 4, 0, 1, 5, 5, 4, 0, 0, 3, 7, 7, 4, 0, 3, 2, 6, 6, 7, 3, 2, 1, 5, 5, 6, 2];
}

function makeWall(name, pre, curr, nxt, line, wall, height, winding) {
    height = height ? height : 2.4384;
    var a, b, c, d, aa, bb, cc, dd;
    if (winding === -1) {
        a = calcIntersect(curr[0], curr[1], pre[0], pre[1]);
        b = curr[2];
        c = curr[3];
        d = calcIntersect(curr[0], curr[1], nxt[0], nxt[1]);
    } else {
        d = calcIntersect(curr[0], curr[1], pre[0], pre[1]);
        c = curr[2];
        b = curr[3];
        a = calcIntersect(curr[0], curr[1], nxt[0], nxt[1]);
    }

    aa = new THREE.Vector3(a.x, a.y + height, a.z);
    bb = new THREE.Vector3(b.x, b.y + height, b.z);
    cc = new THREE.Vector3(c.x, c.y + height, c.z);
    dd = new THREE.Vector3(d.x, d.y + height, d.z);

    var ge = new THREE.Geometry();
    ge.vertices.push(a, b, c, d, aa, bb, cc, dd);
    var faces = makeThreeD();
    for (var z = 0; z < faces.length; z += 3) {
        ge.faces.push(new THREE.Face3(faces[z], faces[z + 1], faces[z + 2]));
    }
    var cenx = (a.x + c.x) / 2;
    var ceny = (a.z + c.z) / 2;

    var w = new THREE.Mesh(ge, wall);
    w.geometry.computeVertexNormals();
    w.name = name;

    var wl = new THREE.Line(ge, line);
    wl.name = 'wl' + name;

    return [w, wl];
}

function cutWall(wall, doormesh, height) {

    var wallMat = new THREE.MeshToonMaterial({ color: 0x1D6DA0, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });

    var box = new THREE.Geometry();
    var msh = new THREE.Mesh(doormesh);

    var wallbsp = new ThreeBSP(wall);
    var meshbsp = new ThreeBSP(msh);
    var subbsp = wallbsp.union(meshbsp);

    var result = subbsp.toGeometry();
    res = new THREE.Mesh(result, wallMat);
    res.geometry.computeFaceNormals();
    res.geometry.computeVertexNormals();
    res.name = wall.name;
    return res;
}

/*
 function cutWall(wall, inter) {
        var arr = active.geometry.attributes.position.array;
        var nsplit = wall.name.match(/[a-zA-Z]+|[0-9]+/g);
        var wl = parseInt(nsplit[1]);
        if (nsplit.length > 4) {
            wall = cutWalls[nsplit[0] + nsplit[1] + nsplit[2] + nsplit[3]][0];
        }
        var cutnum = 0;
        if (cutset[wall.name]) {
            cutnum = cutset[wall.name].length;
        } else {
            cutset[wall.name] = [];
        }

        var defdist = 0.7112;
        var defheight = 2.032;

        var pt1 = new THREE.Vector3(arr[wl * 3], arr[wl * 3 + 1], arr[wl * 3 + 2]);
        var pt2 = new THREE.Vector3(arr[(wl + 1) * 3], arr[(wl + 1) * 3 + 1], arr[(wl + 1) * 3 + 2]);

        var mid = new THREE.Vector3((pt1.x + pt2.x) / 2, (pt1.y + pt2.y) / 2, (pt1.z + pt2.z) / 2);
        var semvec = new THREE.Vector3((pt2.x - pt1.x), (pt2.y - pt1.y), (pt2.z - pt1.z));
        var cr = new THREE.Vector3(0, 1, 0).cross(new THREE.Vector3(pt2.x - pt1.x, pt2.y - pt1.y, pt2.z - pt1.z).normalize());

        var subvec = new THREE.Vector3(inter.x - pt1.x, inter.y - pt1.y, inter.z - pt1.z);
        var proj = subvec.projectOnVector(semvec);

        var maxY = 2.44;

        cutset[wall.name].push([defheight, defdist, proj, cutnum]);
        var newwall = wall;

        var vec = semvec.normalize();
        cutted = cutHoles(wall);
        res = cutted[0];
        cutnum = cutted[1];

        cutWalls[wall.name] = [wall, cutnum];

        signals.doorAdded.dispatch(res);
        editor.addObject(res);
        editor.addHelper(res);
        layoutset.push(res);
    }

    function cutHoles(wall) {
        var newwall = wall;
        cutset[wall.name].forEach(function (cut) {
            proj = cut[2];
            defheight = cut[0];
            defdist = cut[1];
            cn = cut[3];
            var maxY = 2.44;

            var nsplit = wall.name.match(/[a-zA-Z]+|[0-9]+/g);
            var wl = parseInt(nsplit[1]);
            var arr = active.geometry.attributes.position.array;

            var pt1 = new THREE.Vector3(arr[wl * 3], arr[wl * 3 + 1], arr[wl * 3 + 2]);
            var pt2 = new THREE.Vector3(arr[(wl + 1) * 3], arr[(wl + 1) * 3 + 1], arr[(wl + 1) * 3 + 2]);
            var semvec = new THREE.Vector3((pt2.x - pt1.x), (pt2.y - pt1.y), (pt2.z - pt1.z));
            var vec = semvec.normalize();
            var cr = new THREE.Vector3(0, 1, 0).cross(new THREE.Vector3(pt2.x - pt1.x, pt2.y - pt1.y, pt2.z - pt1.z).normalize());

            if (scene.getObjectByName(wall.name + 'Door' + cn)) {
                editor.removeObject(scene.getObjectByName(wall.name + 'Door' + cn));
            }

            var np2 = new THREE.Vector3((pt1.x + proj.x - (defdist * vec.x / 2)), (pt1.y + proj.y - (defdist * vec.y) / 2), (pt1.z + proj.z - (defdist * vec.z / 2)));
            var p2 = new THREE.Vector3((pt1.x + proj.x + (defdist * vec.x / 2)), (pt1.y + proj.y + (defdist * vec.y) / 2), (pt1.z + proj.z + (defdist * vec.z / 2)));

            var d = new Float32Array(15);
            d.set([np2.x + cr.x * 0.254 / 2, np2.y + cr.y * 0.254 / 2 + maxY, np2.z + cr.z * 0.254 / 2, np2.x, np2.y + maxY, np2.z, p2.x, p2.y + maxY, p2.z, p2.x + cr.x * 0.254 / 2, p2.y + maxY + cr.y * 0.254 / 2, p2.z + cr.z * 0.254 / 2, np2.x + cr.x * 0.254 / 2, np2.y + cr.y * 0.254 / 2 + maxY, np2.z + cr.z * 0.254 / 2])

            var geometry = new THREE.Geometry();

            for (var i = 0; i < d.length; i += 3) {
                geometry.vertices.push(new THREE.Vector3(d[i], d[i + 1], d[i + 2]));
            }
            geometry.faces.push(new THREE.Face3(0, 1, 2));
            geometry.faces.push(new THREE.Face3(2, 3, 0));

            var cust = new THREE.Mesh(geometry, planeMat);
            cust.name = wall.name + 'Door' + cn;
            editor.addObject(cust);
            doorset.push(cust);

            var box = new THREE.BoxGeometry(0.7112, 2.032, 0.3);
            var ang = new THREE.Vector3(1, 0, 0).angleTo(vec);

            box.rotateY(ang);
            box.translate(pt1.x + proj.x, 0.1 + (2.032 / 2), pt1.z + proj.z);

            var mesh = new THREE.Mesh(box, wallSel);


            var wallbsp = new ThreeBSP(newwall.geometry);
            if (scene.getObjectByName(newwall.name)) {
                editor.removeObject(scene.getObjectByName(newwall.name));
            }

            var meshbsp = new ThreeBSP(mesh);
            console.log(meshbsp)
            var subbsp = wallbsp.union(meshbsp);
            //var subs = meshbsp.subtract(subbsp);

            var result = subbsp.toGeometry();
            res = new THREE.Mesh(result, wallMat);
            res.geometry.computeFaceNormals();

            res.name = wall.name + 'c' + cn;
            newwall = res;
        });

        return [res, cn];
    }

*/

