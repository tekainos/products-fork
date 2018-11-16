class WallSet {
    constructor(editor, origin, name, sidebar, materials) {
        this._editor = editor;
        this._scene = editor.scene;
        this._signals = editor.signals;
        this._camera = editor.camera;
        this._raycaster = new THREE.Raycaster();
        this._raycaster.linePrecision = .1;
        this._mouse = new THREE.Vector2();
        this._origin = origin;
        this._materials = materials;
        this._name = name + '-wset';
        this._room = name;
        this._sidebar = sidebar;
        this._features = [];
        this._count = 0;
        this._vertices = [];
        this._wallSet = [];
        this._meshSet = [];
        this._lineSet = [];
        this._winding;
        this._genVerts;
    }

    get name() { return this._name; }
    get room() { return this._room; }
    get features() { return this._features; }
    get origin() { return this._origin; }
    get count() { return this._count; }
    get walls() { return this._wallSet; }
    get meshSet() { return this._meshSet; }
    get lineSet() { return this._lineSet; }
    get vertices() { return this._genVerts; }


    generateWalls(vertices, thickness) {
        thickness = thickness ? thickness : 0.1143; //Default value 4 inches
        this.clear();
        this._vertices = vertices;
        this._winding = getWinding(vertices);
        var intop = calculateWalls(vertices, thickness);
        this._genVerts = [];
        for (var i = 0; i < intop.length; i++) {
            var ind0 = i;
            var ind1 = i === intop.length - 1 ? 0 : i + 1;
            var nxt = intop[ind1];
            var pre = i === 0 ? intop[intop.length - 1] : intop[i - 1];
            var curr = intop[i];
            var newwall = new Wall(this._editor, this._origin, this._room, this._room + 'w' + i, curr, pre, nxt, ind0, ind1, this._sidebar, this._materials, this._winding);
            this._scene.add(newwall.obj[0]);
            this._genVerts.push(newwall.obj[0].geometry.vertices);
            this._scene.add(newwall.obj[1]);
            this._wallSet.push(newwall);
            this._meshSet.push(newwall.mesh);
            this._lineSet.push(newwall.line);
        }
        this._count = this._wallSet.length;
    }

    getWallByName(wname) {
        for (var i = 0; i < this._wallSet.length; i++) {
            if (this._wallSet[i].name == wname) {
                return this._wallSet[i];
            }
        }
        return false;
    }

    getFeatureByName(fname) {
        for (var i = 0; i < this._features.length; i++) {
            if (this._features[i].name == fname) {
                return this._features[i];
            }
        }
        return false;
    }

    clearMaterials() {
        for (var i = 0; i < this._features.length; i++) {
            this._features[i].setMaterial('Wall', true);
        }
    }

    clearWallMaterials() {
        for (var i = 0; i < this._wallSet.length; i++) {
            this._wallSet[i].setMaterial('Wall', true);
        }
    }

    shift(chn) {
        for (var i = 0; i < this._wallSet.length; i++) {
            this._wallSet[i].mesh.translateX(chn.x);
            this._wallSet[i].mesh.translateZ(chn.z);
            this._wallSet[i].line.translateX(chn.x);
            this._wallSet[i].line.translateZ(chn.z);
        }
    }

    refresh() {
        for (var i = 0; i < this._wallSet.length; i++) {
            this._wallSet[i].refreshCuts();
        }
    }

    getFeatures() {
        var featureList = [];
        for (var i = 0; i < this._features.length; i++) {
            var featemp = this._features[i];
            featureList.push([featemp.dist, featemp.name, featemp.wall, featemp._width, featemp.height, featemp.top, featemp.bottom]);
        }
        return featureList;
    }

    addFeature(pos, feature, name, width, height, top, bottom) {
        height = height ? height : 2.5484; //Default Value 8 foot 4 inches
        width = width ? width : 0.7112; //Default Value 2 feet 4 inches
        top = top ? top : 2.032; //Default Value 2 feet 4 inches
        bottom = bottom ? bottom : 0; //Default Value 2 feet 4 inches
        var wl = this.getWallByName(name);
        pos = pos.isVector3 ? new THREE.Vector3(pos.x, 0.1, pos.z) : pos;
        var msh = wl.addFeature(pos, feature, height, width, top, bottom);
        this._features.push(msh);
        return msh;
    }

    removeFeature(featName) {
        this._wallSet.forEach(function (wl) {
            wl.removeFeature(featName);
        });
        this._features = this._features.filter(function (el) {
            return el.name !== featName;
        });
        return this._features;
    }

    getIntersects(point, objects) {
        this._raycaster.set(new THREE.Vector3(point.x, point.y + 20, point.z), new THREE.Vector3(0, -1, 0));
        return this._raycaster.intersectObjects(objects);
    }

    deserialize(wl) {
        this._room = wl.room;
        this._name = wl.name;
        console.log(wl);
        //        return JSON.stringify({ 'obj': this._obj, 'indices': this._indices, 'left': this._left, 'right': this._right, 'name': this._name, 'origin': this._origin, 'length': this._length, 'features': feats })
        for (var i = 0; i < wl.wallSet.length; i++) {
            var wall = JSON.parse(wl.wallSet[i]);
            var newwall = new Wall(this._editor, this._origin, this._room, wall.name, wall.vector, wall.left, wall.right, wall.indices[0], wall.indices[1], this._sidebar, this._materials);
            this._scene.add(newwall.mesh);
            this._scene.add(newwall.line);
            this._wallSet.push(newwall);
            this._meshSet.push(newwall.mesh);
            this._lineSet.push(newwall.line);
            if (wall.features.length > 0) {
                console.log(wall.features);
                var msh = newwall.deserialize(wall.features);
                for (var k = 0; k < msh.length; k++) {
                    this._features.push(msh[k]);
                }
            }
        }
    }

    serialize() {
        var wls = [];
        this._wallSet.forEach(function (wl) {
            wls.push(wl.serialize());
        });
        return JSON.stringify({ 'wallSet': wls, 'name': this._name, 'room': this._room, 'origin': this._origin });
    }

    clear() {
        for (var i = 0; i < this._wallSet.length; i++) {
            this._wallSet[i].clear();
        }
        this._features = [];
        this._count = 0;
        this._vertices = [];
        this._wallSet = [];
        this._meshSet = [];
        this._lineSet = [];
    }
}

function calculateWalls(walls, thick) {
    var wlist = [];
    var w2d = [];
    var wfin = [];
    for (var w = 0; w < walls.length; w++) {
        var va = new THREE.Vector2(walls[w].x, walls[w].z);
        w2d.push(va);
        var vb;
        if (w === walls.length - 1) {
            vb = new THREE.Vector2(walls[0].x, walls[0].z);
        } else {
            vb = new THREE.Vector2(walls[w + 1].x, walls[w + 1].z);
        }
        var dx = vb.x - va.x;
        var dy = vb.y - va.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        dx /= dist;
        dy /= dist;
        var v2a = new THREE.Vector2(va.x + (thick * dy), va.y - (thick * dx));
        var v2b = new THREE.Vector2(vb.x + (thick * dy), vb.y - (thick * dx));

        var v3a = new THREE.Vector2(va.x - (thick * dy), va.y + (thick * dx));
        var v3b = new THREE.Vector2(vb.x - (thick * dy), vb.y + (thick * dx));

        wlist.push([[v2a, v2b, va, vb], [v3a, v3b, va, vb]]);
    }
    for (var z = 0; z < walls.length; z++) {
        var w1 = new THREE.Vector2((wlist[z][0][1].x + wlist[z][0][0].x) / 2, (wlist[z][0][1].y + wlist[z][0][0].y) / 2);
        var w2 = new THREE.Vector2((wlist[z][1][1].x + wlist[z][1][0].x) / 2, (wlist[z][1][1].y + wlist[z][1][0].y) / 2);
        if (pointInPoly(w1, w2d)) {
            wfin.push([new THREE.Vector3(wlist[z][1][0].x, 0.1, wlist[z][1][0].y), new THREE.Vector3(wlist[z][1][1].x, 0.1, wlist[z][1][1].y), new THREE.Vector3(wlist[z][1][2].x, 0.1, wlist[z][1][2].y), new THREE.Vector3(wlist[z][1][3].x, 0.1, wlist[z][1][3].y)]);
        } else if (pointInPoly(w2, w2d)) {
            wfin.push([new THREE.Vector3(wlist[z][0][0].x, 0.1, wlist[z][0][0].y), new THREE.Vector3(wlist[z][0][1].x, 0.1, wlist[z][0][1].y), new THREE.Vector3(wlist[z][0][2].x, 0.1, wlist[z][0][2].y), new THREE.Vector3(wlist[z][0][3].x, 0.1, wlist[z][0][3].y)]);
        } else {
            console.log("BOTH");
        }
    }
    return wfin;
}

function pointInPoly(p, polygon) {
    var isInside = false;
    var minX = polygon[0].x, maxX = polygon[0].x;
    var minY = polygon[0].y, maxY = polygon[0].y;
    for (var n = 1; n < polygon.length; n++) {
        var q = polygon[n];
        minX = Math.min(q.x, minX);
        maxX = Math.max(q.x, maxX);
        minY = Math.min(q.y, minY);
        maxY = Math.max(q.y, maxY);
    }

    if (p.x < minX || p.x > maxX || p.y < minY || p.y > maxY) {
        return false;
    }

    var i = 0, j = polygon.length - 1;
    for (i, j; i < polygon.length; j = i++) {
        if ((polygon[i].y > p.y) !== (polygon[j].y > p.y) &&
            p.x < (polygon[j].x - polygon[i].x) * (p.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x) {
            isInside = !isInside;
        }
    }
    return isInside;
}
