class TileEditor {
    constructor(editor) {
        this._editor = editor;
        this._signals = editor.signals;
        this._colors = ["Silver", "DarkBlue", "Orange", "Green", "Black", "AliceBlue", "Aqua", "BlueViolet", "Brown", "CadetBlue", "Crimson", "DarkGoldenRod", "DarkOliveGreen"];
        this._canvas;
        this._tiles;
        this._tileColors;
        this._numColors = 1;
        this._container = this.makeContainer();
    }

    get dom() { return this._container; }

    makeContainer() {
        var panel = document.createElement('div');
        panel.className = 'tileContainer';
        this.addCanvas(panel);
        this.addForm(panel);
        this.addMaterial(this._numColors, panel);
        return panel;
    }

    addCanvas(panel) {
        var canv = document.createElement("canvas");
        canv.width = 300;
        canv.height = 300;
        this._canvas = canv;
        this._ctx = canv.getContext("2d");
        var tile = this;
        this._canvas.addEventListener('mousedown', function (event) { getCursorMouseDown(tile, tile._canvas, event); }, false);
        this.drawTiles(3, 3);
        this._signals.updateTile.add(function (x, y) {
            console.log("Thing");
            tile.drawTiles(x, y);
        });
        panel.appendChild(canv);
    }

    drawTiles(numx, numy) {
        console.log("clear");
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        this._ctx.moveTo(5, 5);
        var offx = (this._canvas.width-25) / numx;
        var offy = (this._canvas.height) / numy;
        offx = offx > offy ? offy : offx;
        offy = offy > offx ? offx : offy;
    
        this._tiles = [];
        this._tileColors = [];
        this._numColors = 1;
        this._ctx.beginPath();
        this._ctx.strokeStyle = "red";
        this._ctx.fillStyle = this._colors[0];
        this._ctx.fillRect(12.5, 5, offx * numx, offy * numy);
        for (var i = 0; i < numy; i++) {
            for (var z = 0; z < numx; z++) {
                var y0 = offy * i + 5;
                var x0 = offx * z + 12.5;
                this._ctx.rect(x0, y0, offx, offy);
                this._tiles.push([new THREE.Vector2(x0, y0), new THREE.Vector2(x0 + offx, y0), new THREE.Vector2(x0 + offx, y0 + offy), new THREE.Vector2(x0, y0 + offy)]);
                this._tileColors.push(0);
                this._ctx.stroke();
            }
        }
    }

    clickEvent(pos) {
        console.log(pos);
        for (var i = 0; i < this._tiles.length; i++) {
            if (pnpoly(pos, this._tiles[i], 4)) {
                this.color(i);
            }
        }
    }

    clickRelease() {

    }

    color(i) {
        var wid = this._tiles[i][2].x - this._tiles[i][0].x;
        var ht = this._tiles[i][3].y - this._tiles[i][1].y;
        this._tileColors[i] = this._tileColors[i] === this._numColors ? 0 : this._tileColors[i] + 1;
        this._ctx.fillStyle = this._colors[this._tileColors[i]];
        this._ctx.fillRect(this._tiles[i][0].x, this._tiles[i][1].y, wid, ht);
        this._ctx.stroke();
    }

    addColor() {
        this._numColors = this._numColors < this._colors.length - 1 ? this._numColors + 1 : this._numColors;
        this.addMaterial(this._numColors, this._container);
    }

    removeColor() {
        this._numColors = this._numColors > 1 ? this._numColors - 1 : 1;
        for (var i = 0; i < this._tileColors.length; i++) {
            if (this._tileColors[i] > this._numColors) {
                var wid = this._tiles[i][2].x - this._tiles[i][0].x;
                var ht = this._tiles[i][3].y - this._tiles[i][1].y;
                this._tileColors[i] = 0;
                this._ctx.fillStyle = this._colors[0];
                this._ctx.fillRect(this._tiles[i][0].x, this._tiles[i][1].y, wid, ht);
                this._ctx.stroke();
            }
        }
        this.removeMaterial();
    }

    addMaterial(num, panel) {
        var key = document.createElement('div');
        var blc = document.createElement('div');
        blc.style.height = '20px';
        blc.style.width = '20px';
        blc.style.display = 'inline';
        blc.style.backgroundColor = this._colors[num];
        key.appendChild(blc);
        key.appendChild(document.createTextNode("Material " + num));

        panel.appendChild(key);
    }

    removeMaterial() {

    }

    addForm(panel) {
        var form = document.createElement("form");

        var x = document.createElement('input');
        x.type = 'number';
        x.className = 'layinput';
        x.value = 4;
        var row = document.createElement("span");
        row.appendChild(document.createTextNode('X: '));
        row.className = 'tileInput';
        row.appendChild(x);
        form.appendChild(row);
        
        var y = document.createElement('input');
        y.type = 'number';
        y.className = 'layinput';
        y.value = 4;
        var row2 = document.createElement("span");
        row2.appendChild(document.createTextNode('Y: '));
        row2.className = 'tileInput';
        row2.appendChild(y);
        form.appendChild(row2);

        var butt = new UI.Button("Add Material");
        butt.dom.id = "ButtonForCanvas";
        var tile = this;
        butt.dom.onclick = function () {
            tile.addColor();
            return false;
        };

        var butt2 = new UI.Button("Remove Material");
        butt2.dom.id = "ButtonForCanvas2";
        butt2.dom.onclick = function () {
            tile.removeColor();
            return false;
        };

        var btsub = document.createElement("input");
        btsub.type = 'submit';
        btsub.style.display = 'none';
        form.appendChild(btsub);

        form.onsubmit = function () {
            console.log("submit");
            tile.drawTiles(x.value, y.value);
            return false;
        };

        form.appendChild(document.createElement('br'));
        form.appendChild(document.createElement('br'));

        panel.appendChild(form);
        panel.appendChild(butt.dom);
        panel.appendChild(butt2.dom);
    }
}