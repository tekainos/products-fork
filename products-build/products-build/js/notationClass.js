class Notations {
    constructor(editor, room) {
        this._editor = editor;
        this._signals = editor.signals;
        this._camera = editor.camera;
        this._scene = editor.scene;
        this._room = room;
        this._pts;
        this._bound;
        this._boundPoly;
        this._lerp;
        this._lerpy;
        this._lerpx;
        this._pointSet;
        this._line;
        this._objects;
    }

    createData() {
        this._pts = bufferToVertices(this._room.sketch.line);
        if (this._pts.length < 4) {
            return;
        }
        this._bound = calculateBoundingBox(this._pts);
        this._boundPoly = boundPolygon(this._bound);
        this._lerp = new THREE.Vector2(this._bound.max.x - this._bound.min.x, this._bound.max.z - this._bound.min.z);
        this._lerpy0 = { "Low": new THREE.Vector2().lerpVectors(this._boundPoly[0], this._boundPoly[3], (this._lerp.x + 0.5) / this._lerp.x), "High": new THREE.Vector2().lerpVectors(this._boundPoly[1], this._boundPoly[2], (this._lerp.x + 0.5) / this._lerp.x) };
        this._lerpy1 = { "Low": new THREE.Vector2().lerpVectors(this._boundPoly[0], this._boundPoly[3], (this._lerp.x + 1) / this._lerp.x), "High": new THREE.Vector2().lerpVectors(this._boundPoly[1], this._boundPoly[2], (this._lerp.x + 1) / this._lerp.x) };

        this._lerpx0 = { "Low": new THREE.Vector2().lerpVectors(this._boundPoly[0], this._boundPoly[1], (this._lerp.y + 0.5) / this._lerp.y), "High": new THREE.Vector2().lerpVectors(this._boundPoly[3], this._boundPoly[2], (this._lerp.y + 0.5) / this._lerp.y) };
        this._lerpx1 = { "Low": new THREE.Vector2().lerpVectors(this._boundPoly[0], this._boundPoly[1], (this._lerp.y + 1) / this._lerp.y), "High": new THREE.Vector2().lerpVectors(this._boundPoly[3], this._boundPoly[2], (this._lerp.y + 1) / this._lerp.y) };
        this._pointSet = makePointSet(this._pts);
        this.drawNotation();
        this.addWords();
    }

    drawNotation() {
        this._line ? this._scene.remove(this._line) : null;
        var geo = new THREE.Geometry();

        var p0 = new THREE.Vector3(this._bound.min.x, 0.1, new THREE.Vector2().lerpVectors(this._lerpx0.Low, this._lerpx1.High, 0.5).y);
        var p1 = new THREE.Vector3(this._bound.max.x, 0.1, new THREE.Vector2().lerpVectors(this._lerpx0.Low, this._lerpx1.High, 0.5).y);
        geo.vertices.push(p0, p1);
        for (var i = 0; i < this._pointSet.X.length; i++) {
            var pt1 = new THREE.Vector3(this._pointSet.X[i], 0.1, this._lerpx0.Low.y);
            var pt2 = new THREE.Vector3(this._pointSet.X[i], 0.1, this._lerpx1.High.y);
            geo.vertices.push(pt1, pt2);
        }

        var p2 = new THREE.Vector3(new THREE.Vector2().lerpVectors(this._lerpy0.Low, this._lerpy1.High, 0.5).x, 0.1, this._bound.min.z);
        var p3 = new THREE.Vector3(new THREE.Vector2().lerpVectors(this._lerpy0.Low, this._lerpy1.High, 0.5).x, 0.1, this._bound.max.z);
        geo.vertices.push(p2, p3);
        for (var c = 0; c < this._pointSet.Z.length; c++) {
            var pt3 = new THREE.Vector3(this._lerpy0.Low.x, 0.1, this._pointSet.Z[c]);
            var pt4 = new THREE.Vector3(this._lerpy1.High.x, 0.1, this._pointSet.Z[c]);
            geo.vertices.push(pt3, pt4);
        }
        this._line = new THREE.LineSegments(geo, new THREE.LineDashedMaterial({ color: 0xff0000, linewidth: 1, scale: 1, dashSize: 3, gapSize: 1 }));
        this._scene.add(this._line);
    }

    addWords() {
        var notat = this;
        if (this._objects) {
            for (var i = 0; i < this._objects.length; i++) {
                this._scene.remove(this._objects[i]);
            }
        }
        this._objects = [];
        var verts = this._pointSet.Z;
        var zz = new THREE.Vector2().lerpVectors(this._boundPoly[1], this._boundPoly[2], (this._lerp.x + 1.25) / this._lerp.x);
        for (var c = 0; c < verts.length-1; c++) {
            var p0 = new THREE.Vector3(zz.x, 0.1, verts[c]);
            var p1 = c + 1 >= verts.length ? new THREE.Vector3(zz.x, 0.1, verts[0]) : new THREE.Vector3(zz.x, 0.1, verts[c+1]);
            var pos = new THREE.Vector3().lerpVectors(p0, p1, 0.5);
            var dist = convertToFeetInch(p0.distanceTo(p1));
            dist.feet + dist.inch > 0 ? createText(dist.feet + "'" + dist.inch + "\"", pos, notat) : null;
        }
        verts = this._pointSet.X;
        var xx = new THREE.Vector2().lerpVectors(this._boundPoly[3], this._boundPoly[2], (this._lerp.y + 1.25) / this._lerp.y);
        for (var z = 0; z < verts.length-1; z ++) {
            var p2 = new THREE.Vector3(verts[z], 0.1, xx.y);
            var p3 = z + 1 >= verts.length ? new THREE.Vector3(verts[0], 0.1, xx.y) : new THREE.Vector3(verts[z + 1], 0.1, xx.y);
            var pos2 = new THREE.Vector3().lerpVectors(p2, p3, 0.5);
            var dist2 = convertToFeetInch(p2.distanceTo(p3));
            dist2.feet + dist2.inch > 0 ? createText(dist2.feet + "'" + dist2.inch + "\"", pos2, notat) : null;
        }
    }

    addObject(obj) {
        this._objects.push(obj);
        this._scene.add(obj);
    }

    updateNotation() {

    }

    clear() {
        if (this._objects) {
            for (var i = 0; i < this._objects.length; i++) {
                this._scene.remove(this._objects[i]);
            }
        }
        this._line ? this._scene.remove(this._line) : null;
    }
}

function createText(text, pos, notation) {
    var actualFontSize = 0.28;
    var textHeight = 32;

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = 'green';
    ctx.font = "30px Arial";

    var metrics = ctx.measureText(text);
    var textWidth = 128;

    canvas.width = textWidth;
    canvas.height = textHeight;
    //ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "normal " + textHeight + "px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ff0000";
    ctx.fillText(text, textWidth / 2, textHeight / 2);

    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    var material = new THREE.SpriteMaterial({ map: texture});
    var sprite = new THREE.Sprite(material);

    var textObject = new THREE.Object3D();
    sprite.scale.set(textWidth / textHeight * actualFontSize, actualFontSize, 1);
    textObject.position.set(pos.x, pos.y, pos.z);

    textObject.add(sprite);
    notation.addObject(textObject);
}


function boundPolygon(bnd) {
    return [new THREE.Vector2(bnd.min.x, bnd.min.z), new THREE.Vector2(bnd.min.x, bnd.max.z), new THREE.Vector2(bnd.max.x, bnd.max.z), new THREE.Vector2(bnd.max.x, bnd.min.z)];
}

function bufferToVertices(obj) {
    var buff = obj.geometry.attributes.position.array;
    var verts = [];
    for (var i = 0; i < buff.length; i += 3) {
        verts.push(new THREE.Vector3(buff[i], buff[i + 1], buff[i + 2]));
    }
    return verts;
}

function verticesToBuffer(vert) {
    var buff = [];
    for (var i = 0; i < vert.length; i++) {
        buff.push(vert[i].x, vert[i].y, vert[i].z);
    }
    return buff;
}

function calculateBoundingBox(points) {
    if (!points) {
        return false;
    }
    var minx = points[0].x;
    var maxx = points[0].x;
    var miny = points[0].y;
    var maxy = points[0].y;
    var minz = points[0].z;
    var maxz = points[0].z;
    for (var i = 0; i < points.length; i++) {
        minx = Math.min(points[i].x, minx);
        maxx = Math.max(points[i].x, maxx);

        miny = Math.min(points[i].y, miny);
        maxy = Math.max(points[i].y, maxy);

        minz = Math.min(points[i].z, minz);
        maxz = Math.max(points[i].z, maxz);
    }
    return { "min": new THREE.Vector3(minx, miny, minz), "max": new THREE.Vector3(maxx, maxy, maxz) };
}

function makePointSet(points) {
    var ptx = [];
    var pty = [];
    var ptz = [];
    for (var i = 0; i < points.length; i++) {
        ptx.includes(points[i].x) ? null : ptx.push(points[i].x);
        pty.includes(points[i].y) ? null : pty.push(points[i].y);
        ptz.includes(points[i].z) ? null : ptz.push(points[i].z);
    }
    return { 'X': ptx.sort(function (a, b) { return a - b; }), 'Y': pty.sort(function (a, b) { return a - b; }), 'Z': ptz.sort(function (a, b) { return a - b; }) };
}