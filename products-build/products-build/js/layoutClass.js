class Layout {
    constructor(editor, name, room, mesh, transitions, sidebar, material, floorFeatures, stairs) {
        this._editor = editor;
        this._scene = editor.scene;
        this._signals = editor.signals;
        this._sidebar = sidebar;
        this._name = name;
        this._room = room;
        this._floorMesh = mesh;
        this._stairs = stairs;
        this._transitions = transitions;
        this._materials = material;
        this._offset = 0;
        this._layout = [];
        this._layoutEdges = [];
        this._layoutArrows = [];
        this._tseams = {};
        this._floorFeatures = floorFeatures;
        this._type;
        this._roll;
        this._layoutPacket;
        this._width;
        this._height;
        this._grainDir;
        this._price;
        this._sqft;
        this._cost;
        this._pattern;
    }

    get name() { return this._name; }
    get floorMesh() { return this._floorMesh; }
    get layout() { return this._layout; }
    get grain() { return (this._grainDir * 180 / Math.PI).toFixed(2); }
    get width() { return (this._width * 3.28084).toFixed(2); }
    get price() { return this._price; }
    get pattern() { return this._pattern; }
    get roll() { return this._roll; }

    newPacket(full, stairs) {
        //var mat = { 'Name': 'Carpet', 'Width': 12, 'Sold In': 'Rolls', 'Price': 2, 'Price-Unit': 'SqFt', 'Pattern': false, 'Grain' : 90 };
        var packet = this._sidebar.getLayout(this._room);

        this._price = packet.Price;
        this._layoutPacket = packet;
        this._pattern = packet.Pattern;
        this._grainDir = packet.Grain;
        this._type = packet.Name;
        this._width = packet.Width;
        this._height = packet.Height;
        this._stairs = stairs ? stairs : this._stairs;

        return this.generate(full);
    }

    priceChange() {
        var packet = this._sidebar.getLayout(this._room);
        this._price = packet.Price;
        this._cost = this._sqft ? this._price * this._sqft : 0;
        var pack = { 'linear': this._linear, 'sqft': this._sqft, 'price': this._cost.toFixed(2) };
        this._sidebar.newLayout(this._room, pack);
    }

    get2D() {
        var ret = [];
        if (this._type === 'carpet') {
            this._layout.forEach(function (cuts) {
                var cut = [];
                var vec = cuts.geometry.vertices;
                for (var i = 0; i < vec.length; i++) {
                    var newVec = new THREE.Vector2(vec[i].x, vec[i].z);
                    cut.push(newVec);
                }
                ret.push(cut);
            });
        } else {
            this._layoutEdges.forEach(function (cuts) {
                var cut = [];
                var vec = cuts.geometry.attributes.position.array;
                for (var i = 0; i < vec.length; i += 3) {
                    var newVec = new THREE.Vector2(vec[i], vec[i + 2]);
                    cut.push(newVec);
                }
                ret.push(cut);
            });
        }
        return { "Type": this._type, "Price": this.price, "Grain": this.grain, "Width": this.width, "Pattern": this.pattern, "Coordinates": ret };
    }

    calculateRoll() {
        if (this._type === 'carpet') {
            if (this._grainDir !== 90) {
                this._stairs = rotateStairs(this._stairs, this._grainDir);
            }
            if (this._roll) {
                this._roll.newLayout(this._layout.concat(this._stairs), this._layoutPacket);
            } else {
                this._roll = new Roll(this._editor, this._layout.concat(this._stairs), this._name, this._layoutPacket);
            }
            this._linear = Math.ceil(this._roll.linear);
            this._sqft = Math.ceil(this._linear * this._width);
            this._cost = this._sqft * this._price;
        } else if (this._type === 'tile') {
            this._linear = this._layout.length;
            this._sqft = Math.ceil(this._linear * (this._width * this._height));
            this._cost = this._sqft * this._price;
        }

        var pack = { 'linear': this._linear, 'sqft': this._sqft, 'price': this._cost.toFixed(2) };
        this._sidebar.newLayout(this._room, pack);
    }

    updateRoll() {
        if (this._type === 'carpet') {
            this._linear = Math.ceil(this._roll.linear);
            this._sqft = Math.ceil(this._linear * this._width);
            this._cost = this._sqft * this._price;
            this._sidebar.newLayout(this._room,  { 'linear': this._linear, 'sqft': this._sqft, 'price': this._cost.toFixed(2) });
        }
    }

    generate(full) {
        var res;
        var min;
        if (this._type === 'carpet') {
            var preres = calcLayout(this._floorMesh, this._layoutPacket, this._grainDir, this._offset, this._tseams, this._floorFeatures, full);
            res = preres[0];
            min = preres[1];
        } else if (this._type === 'tile') {
            res = calcTileLayout(this._floorMesh, this._layoutPacket, this._grainDir, this._offset, this._floorFeatures);
            this._signals.tileEditor.dispatch();
        }
        for (var z = 0; z < res.length; z++) {
            res[z][0].offset = res[z].length > 2 ? res[z][3] - min : null;
            this._layout.push(res[z][0]);
            this._layoutEdges.push(res[z][1]);
            res[z].length > 2 ? this._layoutArrows.push(res[z][2]) : null;
            res[z].length > 2 ? this._scene.add(res[z][2]) : null;
            this._min = res[z].length > 2 ? Math.min(this._min, res[z][3]) : null;
            this._scene.add(res[z][0]);
            this._scene.add(res[z][1]);
        }
        this.calculateRoll();
    }

    setMaterial(matChoice, ind) {
        matChoice === 'Wall-Select' ? this._signals.activateDrag.dispatch("Layout") : null;
        matChoice = matChoice === 'Wall' ? 'Inactive' : matChoice;
        for (var i = 0; i < this._layout.length; i++) {
            if ((ind === null) || (ind !== null && this._layout[i].name === ind)) {
                this._layout[i].material = this._materials[matChoice];
                this._layout[i].material.needsUpdate = true;
            } else if (ind !== null) {
                this._layout[i].material = this._materials['Inactive'];
                this._layout[i].material.needsUpdate = true;
            }
        }
    }

    tseam(point, cutname) {
        var seam = cutname.slice(3).split('-')[0];
        this._tseams[seam] = this._tseams[seam] > 0 ? this._tseams[seam] + 1 : 1;
        this._signals.recalculateLayout.dispatch();
        //this._signals.recalculateRoll.dispatch();
    }

    drag(pos, dragStart) {
        if (this._type === 'carpet') {
            var offset = new THREE.Vector2(dragStart.x - pos.x, dragStart.z - pos.z);
            var normal = calculateNormal(this._grainDir * Math.PI / 180);
            var dot = offset.dot(normal);
            this._offset = Math.abs(dot) <= this._width ? dot : (dot % this._width);
            this._signals.recalculateLayout.dispatch();
        }
    }

    updateFeature(feats) {
        this._floorFeatures = feats;
        this._signals.recalculateLayout.dispatch();
        this._signals.recalculateRoll.dispatch();
    }

    updateStairs(stairs) {
        this._stairs = stairs;
        this._signals.recalculateRoll.dispatch();
    }

    removeLayout() {
        for (var i = 0; i < this._layout.length; i++) {
            this._scene.remove(this._layout[i]);
            this._scene.remove(this._layoutEdges[i]);
            this._layoutArrows.length > 0 ? this._scene.remove(this._layoutArrows[i]) : null;
        }
        this._layout = [];
        this._layoutEdges = [];
        this._layoutArrows = [];
    }

    hide() {
        console.log("Hide");
        if (this._roll) {
            this._roll.hide();
        }
        this._signals.hideTile.dispatch();
    }

    unhide() {
        if (this._roll) {
            console.log("Unhide");
            this._roll.unhide();
        }
    }

    deserialize(lay) {
        this.removeLayout();
        this._tseams = lay.tseams ? lay.tseams : {};
        this._offset = lay.offset ? lay.offset : this._offset;
        this.newPacket(true);
        if (lay.roll) {
            this._roll.deserialize(lay.roll);
        }
    }

    serialize() {
        var parts = { 'packet': this._layoutPacket, 'offset': this._offset, 'tseams': this._tseams };
        parts['roll'] = this._roll ? this._roll.serialize() : null;
        return parts;
    }

    clear() {
        console.log("Clear Layout");
        for (var i = 0; i < this._layout.length; i++) {
            this._scene.remove(this._layout[i]);
            this._scene.remove(this._layoutEdges[i]);
            this._layoutArrows.length > 0 ? this._scene.remove(this._layoutArrows[i]) : null;
        }
        this._layoutArrows = [];
        this._signals.hideTile.dispatch();
        this._layoutPacket = null;
        this._grainDir = null;
        this._pattern = null;
        this._price = null;
        this._width = null;
        this._height = null;
        this._offset = 0;
        this._layout = [];
        this._tseams = {};
        this._roll ? this._roll.clear() : null;
        this._roll = null;
    }
}

function rotateStairs(str, dir) {
    var newstr = [];
    var grain = dir - 90;
    str.forEach(function (st) {
        var rotated = rotateFloor(st.geometry, grain);
        newstr.push(rotated.mesh);
    });
    return newstr;
}

function calculateNormal(angle) {
    angle -= Math.PI / 2;
    var vec = new THREE.Vector2(Math.cos(angle), -1 * Math.sin(angle));
    return vec;
}

function getAng(v0, v1) {
    var dot = v0.x * v1.x + v0.z * v1.z;
    var det = v0.x * v1.z - v0.z * v1.x;
    return Math.atan2(det, dot);
}

function calculateCuts(box, width, grain, offset) {
    var lerped = [];
    var rmWidth = box.max.z - (box.min.z - offset-width);
    //swap sl1-sl3/sl2-sl4 pairing with sl1-sl2/sl3-sl4 pairing for 90 degree rotation
    var sl1 = new THREE.Vector2(box.min.x, box.min.z-offset-width);
    var sl2 = new THREE.Vector2(box.max.x, box.min.z-offset-width);
    var sl3 = new THREE.Vector2(box.min.x, box.max.z);
    var sl4 = new THREE.Vector2(box.max.x, box.max.z);
    var nmCuts = Math.ceil(rmWidth / width);

    var lst = [sl1.clone(), sl2.clone()];
    for (var i = 1; i <= nmCuts; i++) {
        lerped.push([lst[0], lst[1], sl1.clone().lerp(sl3, (width * i) / rmWidth), sl2.clone().lerp(sl4, (width * i) / rmWidth)]);
        lst = [sl1.clone().lerp(sl3, (width * i) / rmWidth), sl2.clone().lerp(sl4, (width * i) / rmWidth)];
    }
    lerped.push([lst[0], lst[1], sl3.clone(), sl4.clone()]);
    return lerped;
}

function makeGrid(startx, starty, rmWidth, rmHeight, width, height, staggering) {
    var vertices = [];
    if (staggering === 'stacked') {
        var divx = Math.ceil(rmWidth / width);
        var divy = Math.ceil(rmHeight / height);
        for (var i = 0, j = 0, k = startx, n = starty; j <= divy; i++ , k += width) {

            vertices.push(new THREE.Vector3(k, 0.2, n));
            vertices.push(new THREE.Vector3(k + width, 0.2, n));
            vertices.push(new THREE.Vector3(k, 0.2, n));
            vertices.push(new THREE.Vector3(k, 0.2, n + height));

            if (i === divx) {
                vertices.push(new THREE.Vector3(k + width, 0.2, n));
                vertices.push(new THREE.Vector3(k + width, 0.2, n + height));
                i = 0;
                k = startx;
                n += height;
                j += 1;
            }
        }
    } else if (staggering === 'herringbone') {
        var dista = Math.sqrt(2) * width;
        var distb = width / Math.sqrt(2);
        divx = Math.ceil(rmWidth / distb) + 1;
        divy = Math.ceil(rmHeight / dista) + 1;
        startx -= dista;
        starty -= distb;
        for (i = 0, j = 0, k = startx, n = starty; j <= divx; i++ , n += dista) {
            vertices.push(new THREE.Vector3(k, 0.2, n));
            j % 2 === 0 ? vertices.push(new THREE.Vector3(k + distb, 0.2, n - distb)) : vertices.push(new THREE.Vector3(k + 2 * distb, 0.2, n - 2 * distb));

            j % 2 === 0 ? vertices.push(new THREE.Vector3(k + distb, 0.2, n - distb)) : vertices.push(new THREE.Vector3(k + 2 * distb, 0.2, n - 2 * distb));
            j % 2 === 0 ? vertices.push(new THREE.Vector3(k + 3 * distb, 0.2, n + distb)) : vertices.push(new THREE.Vector3(k + 3 * distb, 0.2, n - distb));

            vertices.push(new THREE.Vector3(k, 0.2, n));
            j % 2 === 0 ? vertices.push(new THREE.Vector3(k + 2 * distb, 0.2, n + 2 * distb)) : vertices.push(new THREE.Vector3(k + distb, 0.2, n + distb));

            j % 2 === 0 ? vertices.push(new THREE.Vector3(k + 2 * distb, 0.2, n + 2 * distb)) : vertices.push(new THREE.Vector3(k + distb, 0.2, n + distb));
            j % 2 === 0 ? vertices.push(new THREE.Vector3(k + 3 * distb, 0.2, n + distb)) : vertices.push(new THREE.Vector3(k + 3 * distb, 0.2, n - distb));

            if (i === divy) {
                i = 0;
                n = starty;
                k += 2 * distb;
                j += 1;
            }
        }
    } else if (staggering.substr(0, 9) === 'staggered') {
        divx = Math.ceil(rmWidth / width) + 1;
        divy = Math.ceil(rmHeight / height) + 1;
        startx -= width;
        starty -= height;
        var f = 1;
        for (i = 0, j = 0, k = startx, n = starty; j <= divy; i++ , k += width) {

            vertices.push(new THREE.Vector3(k, 0.2, n));
            vertices.push(new THREE.Vector3(k + width, 0.2, n));
            vertices.push(new THREE.Vector3(k, 0.2, n));
            vertices.push(new THREE.Vector3(k, 0.2, n + height));
            
            if (i === divx) {
                vertices.push(new THREE.Vector3(k + width, 0.2, n));
                vertices.push(new THREE.Vector3(k + width, 0.2, n + height));
                i = 0;
                if (staggering.length > 9) {
                    if (j % 3 === 0) {
                        k = startx;
                        f = 1;
                    } else {
                        k = startx - (f * width / 3);
                        f += 1;
                    }
                } else {
                    k = j % 2 === 0 ? startx : startx - width / 2;
                }
                n += height;
                j += 1;
            }
        }
    } else if (staggering === 'pinwheel') {
        var minheight = height / 3;
        divy = Math.ceil(rmHeight / height) + 10;
        divx = Math.ceil(rmWidth / width) + Math.ceil((divy * minheight)/height);
        var numpat = height / minheight;
        startx -= width;
        starty -= height;
        var startk = startx;
        var startn = starty;
        var h = 0;
        for (i = 0, j = 0, k = startx, n = starty; j <= divx; i++, n += height) {
            vertices.push(new THREE.Vector3(k, 0.2, n));
            vertices.push(new THREE.Vector3(k+width, 0.2, n));
            
            vertices.push(new THREE.Vector3(k, 0.2, n));
            vertices.push(new THREE.Vector3(k, 0.2, n+height));

            vertices.push(new THREE.Vector3(k+width, 0.2, n));
            vertices.push(new THREE.Vector3(k+width, 0.2, n + height));

            vertices.push(new THREE.Vector3(k, 0.2, n + height));
            vertices.push(new THREE.Vector3(k+width, 0.2, n + height));

            k -= minheight;

            if (i === divy) {
                i = 0;
                h += 1;
                j += 1;
                startn = startn - height + minheight;
                if (j % numpat === 0) {
                    startn = starty;
                    startk -= (numpat-1)*minheight;
                }
                n = startn;
                startk += width + minheight;
                k = startk;
            }
        }
    } else if (staggering === 'parquet') {
        if (width != height) {
            width = Math.min(width, height);
            height = width;
        }
        divy = Math.ceil(rmHeight / height)+1;
        divx = Math.ceil(rmWidth / width) + 1;
        startx -= width;
        starty -= width;
        for (i = 0, j = 0, k = startx, n = starty; j <= divy; i++ , k += width) {

            vertices.push(new THREE.Vector3(k, 0.2, n));
            vertices.push(new THREE.Vector3(k + width, 0.2, n));
            vertices.push(new THREE.Vector3(k, 0.2, n));
            vertices.push(new THREE.Vector3(k, 0.2, n + width));

            if (j % 2 === 0) {
                i % 2 ? vertices.push(new THREE.Vector3(k, 0.2, n + (width / 2))) : vertices.push(new THREE.Vector3(k + (width / 2), 0.2, n));
                i % 2 ? vertices.push(new THREE.Vector3(k + width, 0.2, n + (width / 2))) : vertices.push(new THREE.Vector3(k + (width / 2), 0.2, n + width));
            } else {
                i % 2 ? vertices.push(new THREE.Vector3(k + (width / 2), 0.2, n)) : vertices.push(new THREE.Vector3(k, 0.2, n + (width / 2)));
                i % 2 ? vertices.push(new THREE.Vector3(k + (width / 2), 0.2, n + width)) : vertices.push(new THREE.Vector3(k + width, 0.2, n + (width / 2)));
            }

            if (i === divx) {
                vertices.push(new THREE.Vector3(k + width, 0.2, n));
                vertices.push(new THREE.Vector3(k + width, 0.2, n + height));
                i = 0;
                k = startx;
                n += height;
                j += 1;
            }
        }
    }
    return vertices;
}

function calcTileLayout(oldMesh, packet, grain, offset, holes) {
    var width = packet.Width;
    var height = packet.Height;
    var staggered = packet.Stagger;
    var scale = 1000;
    var subj_path = [];
    var clip_path = [];

    var wind = getWinding(oldMesh.geometry.vertices);
    if (wind == -1) {
        for (var i = 0; i < oldMesh.geometry.vertices.length; i++) {
            subj_path.push({ X: oldMesh.geometry.vertices[i].x * scale, Y: oldMesh.geometry.vertices[i].z * scale });
        }
    } else {
        for (var i = oldMesh.geometry.vertices.length - 1; i >= 0; i--) {
            subj_path.push({ X: oldMesh.geometry.vertices[i].x * scale, Y: oldMesh.geometry.vertices[i].z * scale });
        }
        wind = -1;
    }

    var rotated = rotateFloor(oldMesh.geometry, grain);
    var mesh = rotated.mesh;
    var centroid = rotated.centroid;

    mesh.geometry.computeBoundingBox();
    var box = mesh.geometry.boundingBox;

    var holePaths = holes ? calculateHoles(holes, 0, scale, wind, centroid) : null;

    var rmHeight = box.max.z - box.min.z;
    var rmWidth = box.max.x - box.min.x;
    var divx = Math.ceil(rmWidth / width);
    var divy = Math.ceil(rmHeight / height);

    var vertices = makeGrid(box.min.x - width, box.min.z, rmWidth, rmHeight, width, height, staggered);

    var lineMat = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 3 });
    var faceMat = new THREE.MeshBasicMaterial({ color: 0xFF0000, side: THREE.DoubleSide });
    var geomtemp = new THREE.Geometry();
    var faceGeo = new THREE.BufferGeometry();
    var geometry = new THREE.BufferGeometry();

    //geomtemp.vertices = vertices.slice();
    var rot = rotateGrid(vertices, -1 * grain, centroid);
    var rvert = rot.vertices;
    for (var z = 0; z < rvert.length; z+=2) {
        clip_path.push([{ X: rvert[z].x * scale, Y: rvert[z].z * scale }, {X: rvert[z+1].x * scale, Y: rvert[z+1].z * scale }]);
    }
    subj_path = holePaths.length > 0 ? [subj_path].concat(holePaths) : [subj_path];
    var solves = intersect(clip_path, subj_path, null, true);
    var newvert = [];
    for (var s = 0; s < solves.length; s++) {
        newvert.push(solves[s].vertices[0].x, solves[s].vertices[0].y, solves[s].vertices[0].z);
        newvert.push(solves[s].vertices[1].x, solves[s].vertices[1].y, solves[s].vertices[1].z);
    }
    //var rot = new THREE.Mesh(geomtemp, lineMat);


    geometry.addAttribute('position', new THREE.Float32BufferAttribute(newvert, 3));
    faceGeo.addAttribute('position', new THREE.Float32BufferAttribute(newvert, 3));
    var lineSeg = new THREE.LineSegments(geometry, lineMat);
    var lineFace = new THREE.Mesh();//faceGeo, faceMat);

    return [[lineFace, lineSeg]];
}

function calculateTileCuts(box, width, height, grain) {
    var lerped = [];
    var lerpht = [];
    var rmWidth = box.max.z - box.min.z;
    var rmHeight = box.max.x - box.min.x;


    //swap sl1-sl3/sl2-sl4 pairing with sl1-sl2/sl3-sl4 pairing for 90 degree rotation
    var sl1 = new THREE.Vector2(box.min.x-height, box.min.z-width);
    var sl2 = new THREE.Vector2(box.max.x+height, box.min.z-width);
    var sl3 = new THREE.Vector2(box.min.x-height, box.max.z+width);
    var sl4 = new THREE.Vector2(box.max.x+height, box.max.z+width);

    var nmCuts = Math.ceil(rmWidth / width)+2;
    var nmVtCuts = Math.ceil(rmHeight / height)+2;

    var lst = [sl1.clone(), sl2.clone()];
    for (var i = 1; i <= nmCuts; i++) {
        var t1 = sl1.clone().lerp(sl3, width * i / rmWidth);
        var t2 = sl2.clone().lerp(sl4, width * i / rmWidth);
        var fac = height !== width ? -1 * i % 2 * height / 2 : -1 * height + (i % 2 * 0.0001);
        fac += height === width && !(i % 2) ? -1* 0.0001 : 0;
        var nbox = [new THREE.Vector2(lst[0].x - fac, lst[0].y), new THREE.Vector2(lst[1].x - fac, lst[1].y), new THREE.Vector2(t1.x -fac, t1.y), new THREE.Vector2(t2.x - fac, t2.y)];
        var tmps = [nbox[0].clone(), nbox[2].clone()];
        for (var z = 1; z <= nmVtCuts; z++) {
            var tmp1 = nbox[0].clone().lerp(nbox[1], height * z / rmHeight);
            var tmp2 = nbox[2].clone().lerp(nbox[3], height * z / rmHeight);
            lerpht.push([tmps[0], tmps[1], tmp1, tmp2]);
            tmps = [tmp1.clone(), tmp2.clone()];
        }
        lst = [t1.clone(), t2.clone()];
    }
    lerped.push([lst[0], lst[1], sl3.clone(), sl4.clone()]);
    return lerpht;
}

function calcTileLayoutOld(oldMesh, packet, grain, offset) {
    var lineMat = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 3 });
    var material = [new THREE.MeshToonMaterial({ color: 0xFF0000, side: THREE.DoubleSide }), new THREE.MeshToonMaterial({ color: 0xE0EFF9, side: THREE.DoubleSide })];

    var rotated = rotateFloor(oldMesh.geometry, grain);
    var mesh = rotated.mesh;
    var centroid = rotated.centroid;
    mesh.geometry.computeBoundingBox();
    var ext = mesh.geometry.boundingBox;
    var subj_path = [];
    var scale = 1000;

    for (var i = 0; i < mesh.geometry.vertices.length; i++) {
        subj_path.push({ X: mesh.geometry.vertices[i].x * scale, Y: mesh.geometry.vertices[i].z * scale });
    }

    var wid = packet.Width;
    var ht = packet.Height;
    
    var lerped = calculateTileCuts(ext, wid, ht, grain);

    var results = [];
    var edgeArray = [];
    var floorArray = [];

    var mergeGeo = new THREE.Geometry();

    var ct = 0;
    for (var i = 0; i < lerped.length; i++) {
        var ln = lerped[i];
        var clip_path = [{ X: ln[0].x * scale, Y: ln[0].y * scale }, { X: ln[1].x * scale, Y: ln[1].y * scale }, { X: ln[3].x * scale, Y: ln[3].y * scale }, { X: ln[2].x * scale, Y: ln[2].y * scale }];
        var solves = intersect([subj_path], clip_path);

        for (var z = 0; z < solves.length; z++) {
            var rotate = rotateFloor(solves[z], -1 * grain, centroid);
            var newgeo = rotate.mesh.geometry;
            for (var c = 0; c < newgeo.vertices.length; c++) {
                mergeGeo.vertices.push(newgeo.vertices[c]);
            }
            for (var d = 0; d < newgeo.faces.length; d++) {
                var newface;
                if (i % 2 === 0) {
                    newface = new THREE.Face3(newgeo.faces[d].a + ct, newgeo.faces[d].b + ct, newgeo.faces[d].c + ct);
                } else {
                    newface = new THREE.Face3(newgeo.faces[d].c + ct, newgeo.faces[d].b + ct, newgeo.faces[d].a + ct);
                }
                mergeGeo.faces.push(newface);
            }
            //floorArray.push(new THREE.BufferGeometry().fromGeometry(newgeo));
            ct = mergeGeo.vertices.length;
        }
    }
    var newflr = new THREE.Mesh(mergeGeo, material[1]);
    newflr.geometry.computeFaceNormals();
    var pledge = new THREE.EdgesGeometry(mergeGeo);
    var plline = new THREE.LineSegments(pledge, lineMat);
    
    results.push([newflr, plline]);
    return results;
}

function calcLayout(oldMesh, packet, grain, offset, tseams, holes, full) {
    var lineMat = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 3 });
    var material = [new THREE.MeshToonMaterial({ color: 0xFF0000, side: THREE.DoubleSide }), new THREE.MeshToonMaterial({ color: 0xE0EFF9, side: THREE.DoubleSide })];

    var rotated = rotateFloor(oldMesh.geometry, grain);
    var mesh = rotated.mesh;
    var centroid = rotated.centroid;
    mesh.geometry.computeBoundingBox();
    var ext = mesh.geometry.boundingBox;
    var wind = getWinding(mesh.geometry.vertices);
    var subj_path = [];
    var scale = 1000;
    var min;

    if (wind == -1) {
        for (var i = 0; i < mesh.geometry.vertices.length; i++) {
            subj_path.push({ X: mesh.geometry.vertices[i].x * scale, Y: mesh.geometry.vertices[i].z * scale });
        }
    } else {
        for (var i = mesh.geometry.vertices.length-1; i >=0; i--) {
            subj_path.push({ X: mesh.geometry.vertices[i].x * scale, Y: mesh.geometry.vertices[i].z * scale });
        }
        wind = -1;
    }

    var wid = packet.Width;
    var lerped = calculateCuts(ext, wid, grain, offset);
    
    var holePaths = full ? calculateHoles(holes, grain, scale, wind, centroid) : null;

    var results = [];
    var tseamed = [];
    var splitset;
    var ct = 0;
    for (var i = 0; i < lerped.length; i++) {
        var newgeo = new THREE.Geometry();
        var ln = lerped[i];
        var clip_path = [{ X: ln[0].x * scale, Y: ln[0].y * scale }, { X: ln[1].x * scale, Y: ln[1].y * scale }, { X: ln[3].x * scale, Y: ln[3].y * scale }, { X: ln[2].x * scale, Y: ln[2].y * scale }]; 

        var path = full && holePaths.length > 0 ? [subj_path].concat(holePaths) : [subj_path];
        var solves = full && holePaths.length > 0 ? intersect(path, clip_path, wind) : intersect(path, clip_path);
        for (var z = 0; z < solves.length; z++) {
            var rotate;
            if (tseams[ct.toString()]) {
                splitset = splitGeo(solves[z], tseams[ct.toString()]);
                for (var s = 0; s < splitset.length; s++) {
                    var arrows = addArrows(splitset[s], -1 * grain, centroid);
                    rotate = rotateFloor(splitset[s], -1 * grain, centroid);
                    newgeo = rotate.mesh.geometry;
                    var newflr = new THREE.Mesh(newgeo, material[1]);
                    newflr.name = 'Lay' + ct + '-' + s;
                    var pledge = new THREE.EdgesGeometry(newgeo);
                    var plline = new THREE.LineSegments(pledge, lineMat);
                    min = min ? Math.min(arrows[1], min) : arrows[1];
                    results.push([newflr, plline, arrows[0], arrows[1]]);
                }
                ct += 1;
            } else {
                arrows = addArrows(solves[z], -1 * grain, centroid);
                rotate = rotateFloor(solves[z], -1 * grain, centroid);
                newgeo = rotate.mesh.geometry;
                newflr = new THREE.Mesh(newgeo, material[1]);
                newflr.name = 'Lay' + ct;
                ct += 1;
                pledge = new THREE.EdgesGeometry(newgeo);
                plline = new THREE.LineSegments(pledge, lineMat);
                min = min ? Math.min(arrows[1], min) : arrows[1];
                results.push([newflr, plline, arrows[0], arrows[1]]);
            }
        }
    }
    return [results, min];
}

function addArrows(path, rot, cent) {
    var newpath = [];
    var ht = path.vertices[0].y;
    var minx = path.vertices[0].x;
    path.vertices.forEach(function (v) {
        var newv = new THREE.Vector2(v.x, v.z);
        minx = Math.min(minx, v.x);
        newpath.push(newv);
    });
    var ext = getExtremes(newpath);
    var startLo = new THREE.Vector2(ext.minX + 0.5, ext.minY + 0.2);
    var startHi = new THREE.Vector2(ext.maxX - 0.5, ext.minY + 0.2);
    var ret = [];
    var mid = ext.minY + (ext.maxY - ext.minY) / 2;
    /*
    while (startLo.y + 0.6 < ext.maxY) {
        //ret.push(new THREE.Vector2(startLo.x, startLo.y), new THREE.Vector2(startLo.x + 0.2, startLo.y + 0.2), new THREE.Vector2(startLo.x + 0.2, startLo.y + 0.2), new THREE.Vector2(startLo.x, startLo.y + 0.4));
        ret.push(new THREE.Vector2(startHi.x, startHi.y), new THREE.Vector2(startHi.x + 0.2, startHi.y + 0.2), new THREE.Vector2(startHi.x + 0.2, startHi.y + 0.2), new THREE.Vector2(startHi.x, startHi.y + 0.4));
        startLo = new THREE.Vector2(startLo.x, startLo.y + 0.6);
        startHi = new THREE.Vector2(startHi.x, startHi.y + 0.6);
    }*/
    ret.push(new THREE.Vector2(startHi.x, mid-0.2), new THREE.Vector2(startHi.x + 0.2, mid), new THREE.Vector2(startHi.x + 0.2, mid), new THREE.Vector2(startHi.x, mid + 0.2));

    var lpack = rotatePolygon({ "Vertices": ret, "Centroid": cent[0], "Area": cent[1] }, rot);

    var rotGeo = new THREE.Geometry();
    lpack.Vertices.forEach(function (v) {
        rotGeo.vertices.push(new THREE.Vector3(v.x, ht+0.01, v.y));
    });
    var ln = new THREE.LineSegments(rotGeo, new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 3 }));
    return [ln, minx];
}

function splitGeo(geo, num) {
    geo.computeBoundingBox();
    var cuts = [];
    var mid =(geo.boundingBox.max.x - geo.boundingBox.min.x) / (num+1);
    var startx = geo.boundingBox.min.x;
    for (var z = 1; z <= num+1; z++) {
        var scale = 1000;
        var sbj = [];
        for (var i = 0; i < geo.vertices.length; i++) {
            sbj.push({ X: geo.vertices[i].x * scale, Y: geo.vertices[i].z * scale });
        }

        var vertsLeft = [{ X: startx * scale, Y: geo.boundingBox.min.z * scale }];
        vertsLeft.push({ X: startx * scale, Y: geo.boundingBox.max.z * scale });
        vertsLeft.push({ X: (startx + mid) * scale, Y: geo.boundingBox.max.z * scale });
        vertsLeft.push({ X: (startx + mid) * scale, Y: geo.boundingBox.min.z * scale });

        var lft = intersect([sbj], vertsLeft);
        startx = startx + mid;
        cuts = cuts.concat(lft);
    }
    return cuts;
}

function calculateHoles(holes, grain, scale, winding, centroid) {
    var ret = [];
    for (var i = 0; i < holes.length; i++) {
        var newgeo = new THREE.Geometry();
        for (var z = 0; z < holes[i].array.length; z+=3) {
            newgeo.vertices.push(new THREE.Vector3(holes[i].array[z], holes[i].array[z + 1], holes[i].array[z + 2]));
        }
        var rotated = rotateFloor(newgeo, grain, centroid);
        var mesh = rotated.mesh;
        var subj_path = [];
        if (getWinding(mesh.geometry.vertices) == winding) {
            mesh.geometry.vertices = mesh.geometry.vertices.reverse();
        }
        for (var z = 0; z < mesh.geometry.vertices.length; z++) {
            subj_path.push({ X: mesh.geometry.vertices[z].x * scale, Y: mesh.geometry.vertices[z].z * scale });
        }
        ret.push(subj_path.slice());
    }
    return ret;
}

function rotateGrid(verts, angle, centroid) {
    var sx = Math.sin(angle * Math.PI / 180);
    var cx = Math.cos(angle * Math.PI / 180);
    var newVerts = [];
    for (var i = 0; i < verts.length; i++) {
        var nvec = new THREE.Vector3(cx * (verts[i].x - centroid[0].x) - sx * (verts[i].z - centroid[0].y) + centroid[0].x, verts[i].y, sx * (verts[i].x - centroid[0].x) + cx * (verts[i].z - centroid[0].y) + centroid[0].y);
        newVerts.push(nvec.clone());
    }
    var ngeo = new THREE.Geometry();
    ngeo.vertices = newVerts;
    return ngeo;
}

function getWinding(verts) {
    var dir = 0;
    for (var i = 0; i < verts.length; i++) {
        var nxt = i == verts.length - 1 ? 0 : i + 1;
        dir += (verts[nxt].x - verts[i].x)*(verts[nxt].z + verts[i].z);
    }
    return Math.sign(dir);
}

function rotateFloor(ob, angle, centroid) {
    var linear = 0;
    var verts = ob.vertices;
    var vlist = [];
    var ht;
    verts.forEach(function (v) {
        var newv = new THREE.Vector2(v.x, v.z);
        vlist.push(newv);
        ht = v.y;
    });
    var cent = centroid ? centroid : getCentroid(vlist);
    var lpack = rotatePolygon({ "Vertices": vlist, "Centroid": cent[0], "Area": cent[1] }, angle);
    linear += lpack.Linear;
    var rotGeo = new THREE.Geometry();
    var geo2d = [];
    lpack.Vertices.forEach(function (v) {
        rotGeo.vertices.push(new THREE.Vector3(v.x, ht, v.y));
        geo2d.push(v.x, v.y);
    });
    var triangles = earcut(geo2d, null, 2);
    for (var z = 0; z < triangles.length; z += 3) {
        rotGeo.faces.push(new THREE.Face3(triangles[z], triangles[z + 1], triangles[z + 2]));
    }
    rotGeo.computeFaceNormals();
    var msh = new THREE.Mesh(rotGeo, new THREE.MeshToonMaterial({ color: 0xFF0000, side: THREE.DoubleSide }));
    return { 'mesh': msh, 'centroid': cent };
}

function intersect(subj_paths, clip_path, winding, segments) {
    var cpr = new ClipperLib.Clipper();
    var scale = 1000;
    var pft;
    if (winding) {
        pft = winding > 0 ? ClipperLib.PolyFillType.pftNegative : ClipperLib.PolyFillType.pftPositive;
    } else {
        pft = ClipperLib.PolyFillType.pftEvenOdd;
    }
    var closed = segments ? false : true;
    cpr.AddPaths(subj_paths, ClipperLib.PolyType.ptSubject, closed);
    segments ? cpr.AddPaths(clip_path, ClipperLib.PolyType.ptClip, true) : cpr.AddPath(clip_path, ClipperLib.PolyType.ptClip, true);
    var solution_paths = new ClipperLib.Paths();
    var succeeded = cpr.Execute(ClipperLib.ClipType.ctIntersection, solution_paths, pft, ClipperLib.PolyFillType.pftNonZero);
    var solve = [];
    for (var i = 0; i < solution_paths.length; i++) {
        var conv = convertFromPath(solution_paths[i], scale, winding);
        conv ? solve.push(conv) : null;
    }
    return solve;
}

function convertFromPath(path, scale, winding) {
    var newgeo = new THREE.Geometry();
    var geo2d = [];
    for (var i = 0; i < path.length; i++) {
        newgeo.vertices.push(new THREE.Vector3((path[i]).X/scale, 0.11, (path[i]).Y/scale));
        geo2d.push((path[i].X)/scale, (path[i].Y)/scale);
    }
    if (winding && getWinding(newgeo.vertices) !== winding) {
        return false;
    }
    var triangles = earcut(geo2d, null, 2);
    for (var z = 0; z < triangles.length; z += 3) {
        newgeo.faces.push(new THREE.Face3(triangles[z], triangles[z + 1], triangles[z + 2]));
    }
    newgeo.computeFaceNormals();
    return newgeo;
}

function getExtremes(vecList) {
    var vertList;
    var maxX, maxY, minX, minY;
    maxX = vecList[0].x;
    maxY = vecList[0].y;
    minX = vecList[0].x;
    minY = vecList[0].y;
    for (var i = 0; i < vecList.length; i++) {
        maxX = Math.max(maxX, vecList[i].x);
        maxY = Math.max(maxY, vecList[i].y);
        minX = Math.min(minX, vecList[i].x);
        minY = Math.min(minY, vecList[i].y);
    }
    return { 'maxX': maxX, 'maxY': maxY, 'minX': minX, 'minY' : minY }
}
