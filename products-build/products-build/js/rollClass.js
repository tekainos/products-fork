class Roll {
    constructor(editor, layout, name, packet, hide) {
        this._editor = editor;
        this._signals = editor.signals;
        this._layout = layout;
        this._name = name;
        this._packet = packet;
        this._cutGap = 3/12;
        this._canvas;
        this._width;
        this._scale;
        this._cuts;
        this._laycuts;
        this._ctx;
        this._mouseDown = false;
        this._shift = new THREE.Vector2();
        this._fake;
        this._fakeCtx;
        this._shiftStart;
        this._mousePos;
        this._highlighted;
        this._hlColor = "#00FF00";
        this._container = this.createContainer(hide);
        this._renderLimit = Date.now();
        this._linear;
        this._tseam = false;
        this._pattern;
    }

    get linear() { return this._linear; }
    get canvas() { return this._canvas; }
    get fake() { return this._fake; }

    createContainer(hide) {
        var lay2d = makeLayout2D(this._layout, this._packet.Grain, this._cutGap);
        console.log(lay2d);
        this._laycuts = lay2d.Cuts;
        this._linear = lay2d.Linear;
        var temp = drawCanvas(this._packet, this._linear * 1.25);
        this._canvas = temp.canvas;
        this._width = temp.width;
        this._scale = temp.scale;

        var roll = this;
        this._canvas.addEventListener('mousedown', function (event) { getCursorMouseDown(roll, roll.canvas, event); }, false);

        console.log(this._name);
        var container = addRoll(this._editor, this._name, this._packet, this._canvas);
        this.generateLayout();
        container.style.dispaly = hide ? 'none' : 'block';
        return container;
    }

    newLayout(layout, packet) {
        this._layout = layout;
        this._packet = packet;
        this._pattern = packet.Pattern;
        var lay2d = makeLayout2D(this._layout, this._packet.Grain, this._cutGap);
        console.log(lay2d);
        this._laycuts = lay2d.Cuts;
        this._linear = lay2d.Linear;

        this._container.removeChild(this._canvas);

        var temp = drawCanvas(this._packet, this._linear * 1.25);
        this._canvas = temp.canvas;
        this._ctx = this._canvas.getContext("2d");
        this._width = temp.width;
        this._scale = temp.scale;

        var roll = this;
        this._canvas.addEventListener('mousedown', function (event) { getCursorMouseDown(roll, roll.canvas, event); }, false);
        this._container.appendChild(this._canvas);
        this.generateLayout();
    }

    generateLayout() {
        var xoff = 5;
        var yoff = 60;
        this._tseam = false;
        this._ctx = this._canvas.getContext("2d");
        var width = this._packet.Width;
        this._pattern = this._packet.Pattern;
        var cutGap = this._cutGap;
        this._laycuts = sortCuts(this._laycuts);
        this._cuts = packCuts(this._laycuts, this._ctx, xoff, yoff, width, cutGap, this._pattern);
    }

    redrawPolygons(force) {
        if (this._ctx) {
            if (Date.now() - this._renderLimit < 45 && !force) { // 32 frames a second
                return;
            } else {
                this._renderLimit = Date.now();
            }
            var patt = this._pattern ? this._pattern * this._scale : null;
            blankRoll(this._ctx, this._width, this._scale, patt);
            readdPolygon(this._ctx, this._cuts, { "color": this._hlColor, "index": this._highlighted }, this._shift);
            this.recalculateLinear();
        }
    }

    recalculateLinear() {
        this._linear = calcLinear(this._cuts, this._packet.Width);
        this._signals.rollChange.dispatch();
    }

    compress() {
        console.log("Compress")
        var bounds = { "min": new THREE.Vector2(5, 60), "max": new THREE.Vector2(this._width - 20, 280) };
        var shift = new THREE.Vector2(-6 / 12 * this._scale, 0);
        for (var i = 0; i < this._cuts.length; i++) {
            var testCut = this._cuts[i];
            var cloneArray = this._cuts.slice();
            cloneArray.splice(i, 1);
            var test = testPolygonOverlap(testCut, cloneArray, shift.clone(), bounds, this._scale);
            while (shift.distanceToSquared(polygonSnap(testCut, shift.clone(), bounds)) == 0 && test[1]) {
                this._cuts[i] = test[0];
                test = testPolygonOverlap(testCut, cloneArray, shift.clone(), bounds, this._scale);
            }
            this.redrawPolygons(true);
        }
    }

    clickEvent(pos) {
        this._mouseDown = true;
        for (var i = 0; i < this._cuts.length; i++) {
            var cut = this._cuts[i];
            if ((pos.x <= cut.max.x) && (pos.x >= cut.min.x) && (pos.y <= cut.max.y) && (pos.y >= cut.min.y)) {
                if (pnpoly(pos, cut.polygon, cut.polygon.length)) {
                    if (this._tseam) {
                        console.log(cut.Name);
                        this._signals.tseamCut.dispatch(cut.Name);
                        this._tseam = false;
                    } else {
                        this._highlighted = i;
                        this._shiftStart = pos;
                        this.efficientCopy();
                        this.efficientRedraw();
                    }
                }
            }
        }
    }

    tseam() {
        this._tseam = true;
    }

    efficientCopy() {
        if (this._ctx) {
            var cloneArray = this._cuts.slice();
            cloneArray.splice(this._highlighted, 1);

            var patt = this._pattern ? this._pattern * this._scale : null;
            blankRoll(this._ctx, this._width, this._scale, patt);
            readdPolygon(this._ctx, cloneArray, { "color": this._hlColor, "index": -1 }, this._shift);
            this._fake = makeFake(this._canvas, this._container);
            var roll = this;
            this._fake.addEventListener('mousemove', function (event) { getCursorMouseMove(roll, roll.fake, event) }, false);
            this._fakeCtx = this._fake.getContext("2d");
        }
    }

    efficientRedraw() {
        blankFake(this._fakeCtx);
        efficientCopyCanvas(this._fakeCtx, this._hlColor, this._cuts[this._highlighted], this._shift);
    }

    clickRelease() {
        removeFake(this._fake, this._container);
        this._fake = null;
        this._fakeCtx = null;
        this.calculateRelease();
        this._mouseDown = false;
        this._highlighted = -1;
        this._shift = new THREE.Vector2();
        this._shiftStart = null;
        this.redrawPolygons(true);
    }

    calculateRelease() {
        var bounds = { "min": new THREE.Vector2(5, 60), "max": new THREE.Vector2(this._width - 20, 280) };
        if (this._shift && this._highlighted >=0) {
            var testCut = this._cuts[this._highlighted];
            var cloneArray = this._cuts.slice();
            cloneArray.splice(this._highlighted, 1);
            var tst = testPolygonOverlap(testCut, cloneArray, this._shift, bounds, this._scale, this._pattern);
            this._cuts[this._highlighted] = tst[1] ? tst[0] : this._cuts[this._highlighted];
        }
    }

    moveEvent(pos) {
        if (this._mouseDown && this._highlighted >= 0) {
            this._shift = new THREE.Vector2().subVectors(pos, this._shiftStart);
            this.efficientRedraw();
            //this.redrawPolygons();
        }
    }

    getIMG() {
        return convertCanvasToImage(this._canvas);
    }

    hide() {
        console.log('hide');
        this._container.style.display = 'none';
        document.getElementById('toolbar').style.display = 'none';
        clearRoll();
    }

    unhide() {
        console.log('unhide');
        this._container.style.display = 'block';
        document.getElementById('toolbar').style.display = 'block';
        restoreRoll();
    }

    deserialize(rl) {
        this._cuts = rl.cuts;
        this.redrawPolygons(true);
    }

    serialize() {
        return {'cuts' : this._cuts};
    }

    clear() {
        console.log("Clear Roll");
        clearRoll(this._editor, this._container);
        document.getElementById('toolbar').removeChild(this._container);
        this._canvas = null;
        this._ctx = null;
        this._container = null;
    }
}

function calcLinear(cuts, width) {
    var scale = 220 / (width*3.28084);
    var maxX = 0;
    for (var i = 0; i < cuts.length; i++) {
        var p = cuts[i].polygon;
        for (var z = 0; z < p.length; z++) {
            maxX = Math.max(maxX, p[z].x);
        }
    }
    maxX = maxX / scale;
    return maxX;
}

function removeFake(fake, container) {
    fake ? container.removeChild(fake) : null;
}

function blankFake(fake) {
    fake.clearRect(0, 0, fake.canvas.width, fake.canvas.height);
}

function efficientCopyCanvas(ctx, color, cut, offset) {
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();

    var p = cut.polygon;
    ctx.moveTo(p[0].x + offset.x, p[0].y + offset.y);
    for (var i = 0; i < p.length; i++) {
        ctx.lineTo(p[i].x + offset.x, p[i].y + offset.y);
    }
    ctx.closePath();
    var col = color;
    ctx.stroke();
    ctx.fillStyle = col;
    ctx.fill();
}

function makeFake(oldCanvas, container) {
    var newCanvas = document.createElement('canvas');
    newCanvas.className = 'rollCanvas';
    newCanvas.style.zIndex = 2;

    newCanvas.width = oldCanvas.width;
    newCanvas.height = oldCanvas.height;

    container.appendChild(newCanvas);

    return newCanvas;
}

function polygonSnap(test, shift, bounds) {
    var newShift = shift.clone();
    for (var i = 0; i < test.polygon.length; i++) {
        if (test.polygon[i].x + newShift.x < bounds.min.x) {
            newShift.x += bounds.min.x - (test.polygon[i].x + newShift.x);
        }
        if (test.polygon[i].y + newShift.y < bounds.min.y) {
            newShift.y += bounds.min.y - (test.polygon[i].y + newShift.y);
        }
        if (test.polygon[i].x + newShift.x > bounds.max.x) {
            newShift.x -= (test.polygon[i].x + newShift.x) - bounds.max.x;
        }
        if (test.polygon[i].y + newShift.y > bounds.max.y) {
            newShift.y -= (test.polygon[i].y + newShift.y) - bounds.max.y;
        }
    }
    return newShift;
}

function snapPattern(test, shift, scale) {
    if (test.Offset != undefined) {
        console.log(test);
        var dif = (test.Offset % test.Pattern) * scale;
        var cur = (((test.startx - 5 + shift.x) / scale) % test.Pattern) * scale;
        var newf0 = dif - cur >= 0 ? dif - cur : (test.Pattern * scale) - cur + dif;
        var newf1 = newf0 - (test.Pattern * scale);
        var shift0 = new THREE.Vector2(shift.x + newf0, shift.y);
        var shift1 = new THREE.Vector2(shift.x + newf1, shift.y);
        return [shift1, shift0];
    }
}

function testPolygonOverlap(test, arr, shift, bounds, scl, patt) {
    var fail = false;

    shift = polygonSnap(test, shift, bounds);

    console.log(shift);

    var pattTest = patt ? snapPattern(test, shift, scl * 3.28084) : null;
    shift = pattTest ? pattTest[0] : shift;
    console.log(pattTest);
    console.log(shift);

    var subj_path = [];
    var scale = 1000;

    for (var i = 0; i < test.polygon.length; i++) {
        subj_path.push({ X: (test.polygon[i].x + shift.x) * scale, Y: (test.polygon[i].y + shift.y) * scale });
    }
    var cutgap = 3.0 / 12.0 * scl * scale;
    var subj_2path = offsetPath(subj_path, cutgap);

    for (var z = 0; z < arr.length; z++) {
        var clip_path = [];
        for (var i = 0; i < arr[z].polygon.length; i++) {
            clip_path.push({ X: arr[z].polygon[i].x * scale, Y: arr[z].polygon[i].y * scale });
        }
        var inter = intersectQuick(subj_2path[0], clip_path);
        if (inter.length > 0) {
            fail = true;
        }
    }
    if (!fail) {
        test.min.x += shift.x;
        test.min.y += shift.y;
        test.max.x += shift.x;
        test.max.y += shift.y;
        for (var i = 0; i < test.polygon.length; i++) {
            test.polygon[i] = new THREE.Vector2(test.polygon[i].x + shift.x, test.polygon[i].y + shift.y);
        }
        test.startx = test.startx + shift.x;
    } else if (pattTest && patt != undefined) {
        return testPolygonOverlap(test, arr, pattTest[1], bounds, scl);
    }
    return [test, !fail];
}

function getCursorMouseDown(roll, canvas, event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    roll.clickEvent(new THREE.Vector2(x, y));
    window.addEventListener('mouseup', getCursorMouseUp, false);

    function getCursorMouseUp() {
        window.removeEventListener('mouseup', getCursorMouseUp, false);
        roll.clickRelease();
    }
}

function getCursorMouseMove(roll, canvas, event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    roll.moveEvent(new THREE.Vector2(x, y));
}

function convertCanvasToImage(cnv) {
    var image = new Image();
    image.src = cnv.toDataURL("image/png");
    return image;
}

function packCuts(cuts, ctx, xoff, yoff, width, cutGap, pattern) {
    var retCut = [];
    var scale = 220 / (width);
    var remainderY = 280 - yoff;
    var remainderX = xoff;
    cuts.forEach(function (cut) {
        console.log(cut);
        if (pattern != 0 && cut.Offset != undefined) {
            var dif = (cut.Offset % pattern) * scale;
            var cur = (((xoff - 5) / scale) % pattern) * scale;
            var newf = dif - cur >= 0 ? dif - cur : (pattern * scale) - cur + dif;
            xoff += newf;
        }
        console.log((cut.Max.y - cut.Min.y) * scale);
        console.log(remainderY);
        if ((cut.Max.y - cut.Min.y) * scale < remainderY) {
            ret = addPolygon(ctx, remainderX, 280 - remainderY, cut, width, cutGap);
            xoff = Math.max(ret.xoff, remainderX);
        } else {
            ret = addPolygon(ctx, xoff, yoff, cut, width, cutGap);
            remainderX = xoff;
            xoff = ret.xoff;
        }
        ret['Name'] = cut['Name'];
        ret['Offset'] = cut.Offset;
        ret['Pattern'] = pattern;
        remainderY = 280 - ret.yoff;
        retCut.push(ret);
    });
    return retCut;
}

function makeLayout2D(objs, angle, cutgap) {
    var layc = [];
    var linear = 0;
    var min, max;
    console.log(objs);
    objs.forEach(function (ob) {
        var verts = ob.geometry.vertices;
        var vlist = [];
        verts.forEach(function (v) {
            vlist.push(new THREE.Vector2(v.x, v.z));
        });
        var cent = getCentroid(vlist);
        var lpack = rotatePolygon({ "Vertices": vlist, "Centroid": cent[0], "Area": cent[1] }, angle);
        min = min ? new THREE.Vector2(Math.min(min.x, lpack.Min.x), Math.min(min.y, lpack.Min.y)) : lpack.Min;
        max = max ? new THREE.Vector2(Math.max(max.x, lpack.Max.x), Math.max(max.y, lpack.Max.y)) : lpack.Max;
        lpack['Name'] = ob.name;
        lpack['Offset'] = ob.offset != undefined ? ob.offset : null;
        linear += lpack.Linear * 3.28084;
        linear += cutgap;
        layc.push(lpack);
    });
    linear -= cutgap;
    return { "Cuts": layc, "Linear": linear, "Min": min, "Max": max };
}

function getCentroid(points) {
    var x0, y0, x1, y1;
    var a = 0;
    var area = 0;
    var centx = 0;
    var centy = 0;
    for (var i = 0; i < points.length - 1; i++) {
        x0 = points[i].x;
        y0 = points[i].y;
        x1 = points[i + 1].x;
        y1 = points[i + 1].y;
        a = x0 * y1 - x1 * y0;
        area += a;
        centx += (x0 + x1) * a;
        centy += (y0 + y1) * a;
    }
    x0 = points[points.length - 1].x;
    y0 = points[points.length - 1].y;
    x1 = points[0].x;
    y1 = points[0].y;
    a = x0 * y1 - x1 * y0;
    area += a;
    centx += (x0 + x1) * a;
    centy += (y0 + y1) * a;

    area = area / 2;
    centx = centx / (6 * area);
    centy = centy / (6 * area);
    var centroid = new THREE.Vector2(centx, centy);
    return [centroid, area];
}

function rotatePolygon(poly, angle) {
    var newverts = [];
    var minX, minY, maxX, maxY;
    poly.Vertices.forEach(function (vert) {
        var newv = vert.rotateAround(poly.Centroid, (angle * Math.PI / 180));
        minX = minX ? Math.min(minX, newv.x) : newv.x;
        maxX = maxX ? Math.max(maxX, newv.x) : newv.x;
        minY = minY ? Math.min(minY, newv.y) : newv.y;
        maxY = maxY ? Math.max(maxY, newv.y) : newv.y;
        newverts.push(newv);
    });
    return { "Vertices": newverts, "Centroid": poly.Centroid, "Area": poly.Area, "Min" : new THREE.Vector2(minX, minY), "Max" : new THREE.Vector2(maxX, maxY), "Linear" : maxX-minX };
}

function restoreRoll() {
    var vp = document.getElementById('viewport');
    var container = document.getElementById("toolbar");
    if (vp.style.height != window.innerHeight - 300 + 'px') {
        vp.style.height = window.innerHeight - 300 + 'px';
        container.style.display = 'block';
        editor.signals.windowResize.dispatch();
    }
}

function clearRoll() {
    console.log("clear roll");
    var vp = document.getElementById('viewport');
    if (vp.style.height != window.innerHeight) {
        vp.style.height = '100%';
        document.getElementById('toolbar').style.display = 'none';
        editor.signals.windowResize.dispatch();
    }
}

function blankRoll(ctx, width, scale, pattern) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    drawRoll(scale, width, ctx.canvas, ctx, pattern);
}

function addRoll(editor, name, packet, canvas) {
    if (!document.getElementById('toolbar')) {
        var cont = new UI.Panel();
        cont.setId("toolbar");
        document.body.appendChild(cont.dom);
    }
    var container = document.getElementById('toolbar');
    container.style.display = 'block';

    var vp = document.getElementById('viewport');

    var layDiv = document.createElement("div");
    layDiv.style.width = vp.offsetWidth - 10;
    layDiv.style.height = '300px';
    layDiv.style.overflowX = 'auto';
    layDiv.style.overflowY = 'hidden';
    layDiv.id = "layDiv";

    layDiv.appendChild(canvas);
    container.appendChild(layDiv);

    vp.style.height = vp.offsetHeight - container.offsetHeight + 'px';
    editor.signals.windowResize.dispatch();

    return layDiv;
}

function drawRoll(scale, wid, canvas, ctx, pattern) {

    canvas.width = wid;
    canvas.height = 280;

    ctx.fillStyle = "#FFFF66";
    ctx.fillRect(5, 45, wid - 100, 10);

    ctx.moveTo(5, 40);
    ctx.font = '10px helvetica, sans-serif';
    ctx.fillStyle = 'white';
    ctx.textBaseline = 'bottom';
    ctx.fillText('1 tick= 1ft', wid - 90, 40);

    ctx.strokeStyle = "black";
    for (var i = 1; i * scale <= (wid - 100); i++) {
        ctx.moveTo(5 + i * scale, 55);
        ctx.lineTo(5 + i * scale, 50);
        ctx.stroke();

        if (i % 5 === 0) {
            ctx.fillText(i + ' ', 5 + i * scale, 43);
        }
    }


    ctx.fillStyle = "gray";
    ctx.fillRect(5, 60, wid - 20, 280);
    
    if (pattern) {
        for (var i = 1; i * pattern * 3.28084 <= wid - 100; i++) {
            ctx.moveTo(5 + i * pattern * 3.28084, 60);
            ctx.lineTo(5 + i * pattern * 3.28084, 280);
            ctx.stroke();
        }
    }

    var cylStart = wid - 90;
    var cylEnd = wid - 15;

    ctx.strokeStyle = "gray";
    ctx.beginPath();
    ctx.moveTo(cylStart, 60);
    ctx.bezierCurveTo(cylStart, 40, cylEnd, 40, cylEnd, 60);
    ctx.strokeStyle = "black";
    ctx.moveTo(cylStart, 60);
    ctx.lineTo(cylStart, 280);
    ctx.bezierCurveTo(cylStart, 260, cylEnd, 260, cylEnd, 280);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function drawCanvas(packet, linear) {
    var scale = 220 / (packet.Width * 3.28084);
    var patt = packet.Pattern ? packet.Pattern * scale : null;
    var wid = document.getElementById('viewport').offsetWidth;
    var canvas = document.createElement("CANVAS");
    canvas.className = 'rollCanvas';
    var ctx = canvas.getContext("2d");

    wid = wid - 150 < linear * scale ? linear * scale + 200 : wid;

    drawRoll(scale, wid, canvas, ctx, patt);

    return { "canvas": canvas, "width": wid, "scale": scale };
}

function readdPolygon(ctx, cuts, color, shift) {
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    for (var z = 0; z < cuts.length; z++) {
        var offset = shift && color.index == z ? shift : new THREE.Vector2(0, 0);
        ctx.beginPath();
        var p = cuts[z].polygon;
        ctx.moveTo(p[0].x+offset.x, p[0].y+offset.y);
        for (var i = 0; i < p.length; i++) {
            ctx.lineTo(p[i].x+offset.x, p[i].y+offset.y);
        }
        ctx.closePath();
        var col = color.index == z ? color.color : '#c3e7ff';
        ctx.stroke();
        ctx.fillStyle = col;
        ctx.fill();
    }
}

function addPolygon(ctx, xoffset, yoffset, polygon, width, cutgap, patternStart) {
    //{ "Vertices": newverts, "Centroid": poly.Centroid, "Area": poly.Area, "Min" : new THREE.Vector2(minX, minY) }
    var scale = 220 / (width);
    var translation = new THREE.Vector2(polygon.Min.x, polygon.Min.y);

    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();

    var x = (polygon.Vertices[0].x - translation.x) * scale + xoffset;
    var y = (polygon.Vertices[0].y - translation.y) * scale + yoffset;

    var newPoly = [new THREE.Vector2(x, y)];
    ctx.moveTo(x, y);

    var maxX = x;
    var maxY = y;

    var minX = x;
    var minY = y;
    
    polygon.Vertices.forEach(function (vert) {
        var x0 = (vert.x - translation.x) * scale + xoffset;
        var y0 = (vert.y - translation.y) * scale + yoffset;

        newPoly.push(new THREE.Vector2(x0, y0));

        maxX = Math.max(maxX, x0);
        maxY = Math.max(maxY, y0);

        minX = Math.min(minX, x0);
        minY = Math.min(minY, y0);

        ctx.lineTo(x0, y0);
    });
    ctx.closePath();
    ctx.fillStyle = '#c3e7ff';
    ctx.stroke();
    ctx.fill();
    return { "xoff": maxX + (cutgap * 0.3048 * scale), "yoff": maxY + (cutgap * 0.3048 * scale), "startx" : minX, "polygon": newPoly, "min": new THREE.Vector2(minX, minY), "max" : new THREE.Vector2(maxX, maxY)};
}

// For dragging polygons use combination of two intersection testing techniques
// 1. Quick test with bounding box comparison
// 2. If 1 fails, test intersection of all vectors in both polygons n * e where n and e are edges of each polygon respectively

function mergeSort(cuts) {
    if (cuts.length === 1) {
        return cuts;
    }
    var middle = Math.ceil(cuts.length / 2);
    var left = cuts.slice(0, middle);
    var right = cuts.slice(middle);
    return sortMerge(mergeSort(left), mergeSort(right));
}

function sortMerge(left, right) {
    let result = [];
    let indexLeft = 0;
    let indexRight = 0;

    while (indexLeft < left.length && indexRight < right.length) {
        if (left[indexLeft].Area > right[indexRight].Area) {
            result.push(left[indexLeft]);
            indexLeft++;
        } else {
            result.push(right[indexRight]);
            indexRight++;
        }
    }
    return result.concat(left.slice(indexLeft)).concat(right.slice(indexRight));
}

function sortCuts(cuts) {
    var tmSrt = mergeSort(cuts);
    return tmSrt;
}

function pnpoly(test, vert, nvert) {
    var i, j, c = false;
    for (i = 0, j = nvert - 1; i < nvert; j = i++) {
        if (((vert[i].y > test.y) != (vert[j].y > test.y)) && (test.x < (vert[j].x - vert[i].x) * (test.y - vert[i].y) / (vert[j].y - vert[i].y) + vert[i].x)) {
            c = !c;
        }
    }
    return c;
}

/*
 * function getWinding(verts) {
    var dir = 0;
    for (var i = 0; i < verts.length; i++) {
        var nxt = i == verts.length - 1 ? 0 : i + 1;
        dir += (verts[nxt].x - verts[i].x)*(verts[nxt].z + verts[i].z);
    }
    return Math.sign(dir);
} */

function offsetPath(path, cutgap) {
    var solution = new ClipperLib.Paths();
    var scale = 1000;
    ClipperLib.JS.ScaleUpPath(path, scale);
    var co = new ClipperLib.ClipperOffset(2 * scale, 0.25*scale);
    co.AddPath(path, ClipperLib.JoinType.jtMiter, ClipperLib.EndType.etClosedPolygon);
    co.Execute(solution, cutgap*scale);
    ClipperLib.JS.ScaleDownPaths(solution, scale);
    return solution;
}

function intersectQuick(subj_path, clip_path) {
    var cpr = new ClipperLib.Clipper();
    var scale = 1000;
    var pft = ClipperLib.PolyFillType.pftEvenOdd;

    cpr.AddPath(subj_path, ClipperLib.PolyType.ptSubject, true);
    cpr.AddPath(clip_path, ClipperLib.PolyType.ptClip, true);

    var solution_paths = new ClipperLib.Paths();
    var succeeded = cpr.Execute(ClipperLib.ClipType.ctIntersection, solution_paths, pft, ClipperLib.PolyFillType.pftNonZero);
    return solution_paths;
}