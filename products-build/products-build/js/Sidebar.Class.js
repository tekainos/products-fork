class SidebarPanel {
    constructor(editor) {
        this._scene = editor.scene;
        this._signals = editor.signals;
        this._wallContainer;
        this._wallCollapse;
        this._featureContainer;
        this._featureCollapse;
        this._projectContainer;
        this._projectCollapse;
        this._measureContainer;
        this._measureCollapse;
        this._n = 0;
        this._f = 0;
        this._boxes = {};
        this._rooms = {};
        this._lines = {};
        this._features = {};
        this._animate = true;
    }
    get rooms()     { return this._rooms; }
    get features()  { return this._features; }

    init() {
        var cont3 = containerInit('pledit3', "Project Information");
        this._projectContainer = cont3.container;
        this._projectCollapse = cont3.collapse;
        projboxInit(this._projectContainer, this._signals, this);
    }

    attach() {
        if (!this._wallContainer) {
            var cont = containerInit('pledit', "Walls", 'viewportSidebar');
            this._wallContainer = cont.container;
            this._wallCollapse = cont.collapse;

            var cont2 = containerInit('pledit2', "Features", 'viewportSidebar');
            this._featureContainer = cont2.container;
            this._featureCollapse = cont2.collapse;

            var cont4 = containerInit('pledit4', "Layout", 'viewportSidebar');
            this._layoutContainer = cont4.container;
            this._layoutCollapse = cont4.collapse;
        }
    }

    viewport() {
        $(".viewportSidebar").show();
    }

    mainpages() {
        $(".viewportSidebar").hide();
    }

    addRoom(room) {
        this.attach();
        var selind = addRoomSelect(this._projectContainer, room.name, this._signals);
        for (var box in this._boxes) {
            this._boxes[box].scrollbox.style.display = 'none';
            this._boxes[box].featurebox.style.display = 'none';
            this._boxes[box].layoutbox.style.display = 'none';
        }

        this._f = 0;
        this._rooms[room.name] = room;
        this._boxes[room.name] = { 'ind': selind, 'walls': [], 'sketch': room.name + '-sketch', 'scrollbox': createScrollbox(room.name, this._signals), 'featurebox': createFeaturebox(room.name), 'layoutbox': createLayoutbox(room.name)};
        
        this._wallContainer.appendChild(this._boxes[room.name].scrollbox);
        this._featureContainer.appendChild(this._boxes[room.name].featurebox);
        this._layoutContainer.appendChild(this._boxes[room.name].layoutbox);
        var sel = document.getElementById('roomSelect');
    }

    changeRoom(roomname) {
        for (var box in this._boxes) {
            if (box === roomname && this._boxes[box].scrollbox.style.display == 'none') {
                this._boxes[box].scrollbox.style.display = 'block';
                this._boxes[box].featurebox.style.display = 'block';
                this._boxes[box].layoutbox.style.display = 'block';
                var sel = document.getElementById('roomSelect');
                sel.selectedIndex = 0;
                this._f = this._features[roomname] ? this._features[roomname].length : 0;
                document.getElementById('roomName').value = sel.options[sel.selectedIndex].innerHTML;
            } else if (box != roomname) {
                this._boxes[box].scrollbox.style.display = 'none';
                this._boxes[box].featurebox.style.display = 'none';
                this._boxes[box].layoutbox.style.display = 'none';
            }
        }
    }

    deleteRoom(roomname) {
        this.removeFromSelect(roomname);
        delete this._rooms[roomname];
        if (this._boxes[roomname] && this._wallContainer) {
            this._wallContainer.removeChild(this._boxes[roomname].scrollbox);
            this._featureContainer.removeChild(this._boxes[roomname].featurebox);
            this._layoutContainer.removeChild(this._boxes[roomname].layoutbox);
            delete this._boxes[roomname];
        }
        //this._container.removeChild(this._boxes[roomname].Layout);
    }

    toggleAnimations() {
        this._animate = !this._animate;
    }

    addLine(roomname, type) {
        var sb = this._boxes[roomname].scrollbox;
        if (sb) {
            if (roomname in this._lines) {
                this._lines[roomname].push(addWall(sb, this._n, roomname));
            } else {
                this._lines[roomname] = [addWall(sb, this._n, roomname)];
            }
            if (this._animate) {
                $(this._wallContainer).is(':visible') ? null : $(this._wallCollapse).trigger('click');
            }
            this._n += 1;
        }
    }

    updateLine(roomname, meas, index) {
        var ln = index == null ? this._lines[roomname][this._lines[roomname].length - 1] : this._lines[roomname][index];
        ln[1].value = meas[0];
        ln[2].value = meas[1];
        ln[3].value = meas.length == 3 ? meas[2] : ln[3].value;
    }

    highlightLine(roomname, type, num) {
        var box;
        if (type == 'Wall') {
            box = this._boxes[roomname].scrollbox;
            for (var i = 0; i < box.childNodes.length; i++) {
                box.childNodes[i].style.backgroundColor = '#222';
            }
            if (num >= 0) {
                var x = this._lines[roomname][num].length - 1;
                var ln = this._lines[roomname][num][x];
                $(box).animate(
                    {
                        scrollTop: $(box).scrollTop() + $(ln).position().top - ($(box).height() / 2 + 2 * $(ln).height())
                    }
                );
                //$(box).scrollTop($(ln).offset().top-10);
                $(ln).css("background-color", '#444');
            }
        } else if (type === 'Door' || type === 'Stairs') {
            box = this._boxes[roomname].featurebox;
            for (var i = 0; i < box.childNodes.length; i++) {
                box.childNodes[i].style.backgroundColor = box.childNodes[i].id == num ? '#444' : '#222';
                box.childNodes[i].id == num ? box.childNodes[i].scrollIntoView({ behavior: "smooth" }) : null;
            }
        }
    }

    addFeatureLine(feature, roomname, featname, winding, top, bottom) {
        //feature = { "mesh": msh, "dist": d1 / odist.length(), "odist" : odist.length(), "doorway": new THREE.Mesh(ge2, material) }
        var fb = this._boxes[roomname].featurebox;
        if (!(roomname in this._features)) {
            this._features[roomname] = [];
        }
        var ln;
        switch (featname.slice(0, 3)) {
            case "Box":
                var d1 = feature.dist * feature.odist;
                var d2 = feature.dist2 * feature.odist;
                var wd = feature.width;
                ln = addDoorLine(fb, this._f, featname, d1, d2, wd, winding, top, bottom);
                break;
            case "Cus":
                ln = { "box": addCustomBox(fb, this._f, featname), "lines": [], "name": featname, "boxname": featname + '-container' + this._f };
                break;
            case "Str":
                ln = addStairLine(fb, this._f, featname, feature.rise, feature.run, feature.width, feature.stairCount, feature.angle);
                break;
        }
        this._features[roomname].push(ln);
        if (this._animate) {
            $(this._featureContainer).is(':visible') ? null : $(this._featureCollapse).trigger('click');
        }
        this._f += 1;
        return this._f-1;
    }

    addCustom(roomname, f) {
        var sb = this._features[roomname][f];
        if (sb) {
            this._features[roomname][f].lines.push(addCustomLine(sb.box, sb.lines.length, sb.name, f));
            if (this._animate) {
                $(this._featureContainer).is(':visible') ? null : $(this._featureCollapse).trigger('click');
            }
        }
    }

    removeCustom(roomname, f) {
        var sb = this._features[roomname][f];
        console.log(this._boxes);
        console.log(this._features[roomname]);
        var bx = document.getElementById(sb.boxname);
        this._boxes[roomname].featurebox.removeChild(bx);
        this._features[roomname][f] = [];
    }

    updateCustom(roomname, f, meas) {
        if (this._features[roomname][f]) {
            var ln = this._features[roomname][f].lines[this._features[roomname][f].lines.length - 1];
            ln[1].value = meas[0];
            ln[2].value = meas[1];
            ln[3].value = meas[2];
        }
    }

    addMeasuretape(meas) {
        if (!this._measureContainer) {
            var cont3 = containerInit('pledit5', "Measurements", 'viewportSidebar');
            this._measureContainer = cont3.container;
            this._measureCollapse = cont3.collapse;
        }
        if (this._animate) {
            $(this._measureContainer).is(':visible') ? null : $(this._measureCollapse).trigger('click');
        }
        addMeasure(this._measureContainer, meas);
    }

    clearMeasuretape() {
        if (this._measureContainer) {
            this._measureContainer.innerHTML = '';
        }
    }

    updateMeasuretape(meas, index) {
        $('#meas-' + index).val(meas.ft);
        $('#meas-in-' + index).val(meas.in);
        $('#meas-ang-' + index).val(meas.ang);
    }

    removeFeatureLine(roomname, featName) {
        console.log(featName);
        var bar = document.getElementById(featName);
        if (bar) {
            bar.parentNode.removeChild(bar);
            this._features[roomname].forEach(function (elem) {
                elem = elem.name == featName ? [] : elem; 
            });
        }
    }

    updateFeatureLine(feature, roomname, id) {
        var dlen = feature.odist;
        var d1 = convertToFeetInch(feature.dist * dlen);
        var d2 = convertToFeetInch(feature.dist2 * dlen);
        var wd = feature.width;
        this._features[roomname].forEach(function (elem) {
            if (elem[0] == id) {
                elem[1].value = d1.feet;
                elem[2].value = d1.inch;
                elem[3].value = d2.feet;
                elem[4].value = d2.inch;
                elem[5].value = Math.round(wd * 39.370078740157477);
            }
        });
    }

    setFeatMeas(id, roomname, meas) {
        var d1 = convertToFeetInch(meas);
        this._features[roomname].forEach(function (elem) {
            if (elem[0] == id) {
                elem[1].value = d1.feet;
                elem[2].value = d1.inch;
            }
        });
    }

    getFeatMeas(id) {
        return {
            'ft0': $("#" + id).find(".feetLeft").val(),
            'in0': $("#" + id).find(".inchLeft").val(),
            'ft1': $("#" + id).find(".feetRight").val(),
            'in1': $("#" + id).find(".inchRight").val(),
            'ft2': $("#" + id).find(".feetTop").val(),
            'in2': $("#" + id).find(".inchTop").val(),
            'ft3': $("#" + id).find(".feetBottom").val(),
            'in3': $("#" + id).find(".inchBottom").val(),
            'indoor': $("#" + id).find(".width").val(),
            'select': $("#" + id).find(".swing").val(), 
            'type': $("#" + id).find(".type").val()
        };
    }

    setFeatureMeasurement(id, meas) {
        $("#" + id).find(".feetRight").val(meas[0]);
        $("#" + id).find(".inchRight").val(meas[1]);
    }

    displayInfo(pk) {
        console.log(pk);
    }

    getStairMeas(id) {
        return {
            'rise': $("#" + id).find(".rise").val() * 0.0254,
            'run': $("#" + id).find(".run").val() * 0.0254,
            'width': $("#" + id).find(".width").val() * 0.0254,
            'stairCount': $("#" + id).find(".count").val(),
            'angle': $("#" + id).find(".angle").val() * Math.PI / 180,
            'select': $("#" + id).find(".swing").val(),
            'cutout': $("#" + id).find(".cut").val()
        };
    }

    getMeas(id) {
        return {
            'feet': $("#" + id).parent().find(".feet").val(),
            'inch': $("#" + id).parent().find(".inch").val(),
            'angle': $("#" + id).parent().find(".angle").val()
        };
    }

    getHeight(id) {
        return {
            'feet': $("#" + id).parent().find(".heightf").val(),
            'inch': $("#" + id).parent().find(".heighti").val()
        };
    }

    newLayout(roomname, pack) {
        if (this._animate) {
            $(this._featureContainer).is(':visible') ? $(this._featureCollapse).trigger('click') : null;
            $(this._wallContainer).is(':visible') ? $(this._wallCollapse).trigger('click') : null;
            $(this._layoutContainer).is(':visible') ? null : $(this._layoutCollapse).trigger('click');
        }

        addCalculated(this._boxes[roomname].layoutbox, pack);
    }

    getLayout(roomname) {
        var box = this._boxes[roomname].layoutbox;
        var ret = {
            'Name': $("#" + box.id).find(".material").val(),
            'Price': $("#" + box.id).find(".price").val(),
            'Height': parseFloat($("#" + box.id).find(".height").val()) * 0.3048,
            'Width': parseFloat($("#" + box.id).find(".width").val()) * 0.3048,
            'Grain': parseFloat($("#" + box.id).find(".angle").val()),
            'Stagger': $("#" + box.id).find(".stagger").val()
        };
        return ret;
    }

    setLayout(roomname, packet) {
        var box = this._boxes[roomname].layoutbox;
        $("#" + box.id).find(".material").val(packet.Name);
        if (packet.Name == 'tile') {
            $("#" + box.id).find(".material").trigger('change');
        }
        $("#" + box.id).find(".price").val(packet.Price);
        $("#" + box.id).find(".height").val(packet.Height / 0.3048);
        $("#" + box.id).find(".width").val(packet.Width / 0.3048);
        $("#" + box.id).find(".angle").val(packet.Grain);
        $("#" + box.id).find(".stagger").val(packet.Stagger);
    }

    removeFromSelect(roomname) {
        console.log("Remove " + roomname);
        $("#roomSelect option[value = '" + roomname + "']").remove();
    }

    serialize() {
        var parts = { 'numwalls': this._n, 'numfeats': this._f, 'boxes': this._boxes, 'lines': this._lines, 'features': this._features };
        return parts;
    }

    emptyBoxes(roomname) {
        console.log("Empty Boxes");
        this._boxes[roomname].scrollbox.innerHTML = "";
        this._lines[roomname] = [];
        this._n = 0;

        //this._boxes[roomname].featurebox.innerHTML = "";
        //this._boxes[roomname].layoutbox.innerHTML = "";
        //this._features[roomname] = [];
        //this._f = 0;
    }

    emptyCustom(roomname, id) {
        if (this._features[roomname][id]) {
            this._features[roomname][id].box.innerHTML = '';
            this._features[roomname][id].lines = [];
        }
    }

    clearMeasurements() {
        if (this._measureContainer) {
            document.getElementById('pledit5').innerHTML = '';
            this._measureContainer = null;
            this._measureCollapse = null;
        }
    }

    clear() {
        if (this._wallContainer) {
            document.getElementById('pledit').innerHTML = '';
            document.getElementById('pledit2').innerHTML = '';
            document.getElementById('pledit4').innerHTML = '';
            this._wallContainer = null;
            this._wallCollapse = null;
            this._featureContainer = null;
            this._featureCollapse = null;
            this._layoutContainer = null;
            this._layoutCollapse = null;
        }
        this._rooms = {};
        this._lines = {};
        this._n = 0;
        this._features = {};
    }
}

function addCustomBox(featurebox, f, featname) {
    var divbar = document.createElement('div');
    divbar.className = "custbar";
    divbar.id = featname + '-container' + f;
    divbar.name = f;

    divbar.onmouseover = function () {
        editor.signals.selectFeature.dispatch(this.name);
        return false;
    };


    var del = document.createElement("button");
    del.textContent = "\u26D2";
    del.className = 'delbutt';
    del.id = 'df' + f;
    del.type = 'button';
    del.addEventListener('click', function (event) {
        event.preventDefault();
        var numbc = this.parentNode.name;
        editor.signals.deleteCustom.dispatch(numbc);
    });


    var heightbar = document.createElement("form");
    heightbar.id = featname + 'htform' + f;
    heightbar.name = f;
    heightbar.className = "custformheight";
    heightbar.onsubmit = function () {
        editor.signals.setCustomHeight.dispatch(parseInt(this.id.match(/[a-zA-Z]+|[0-9]+/g).slice(-1)), this.id, "length");
        return false;
    }

    var wallnum = document.createElement("span");
    wallnum.style.display = 'inline-block';
    wallnum.style.width = '45px';
    wallnum.textContent ='Height : ';

    var footinput = document.createElement("input");
    footinput.setAttribute('type', 'number');
    footinput.className = 'boxinput heightf';
    footinput.min = '0';
    footinput.id = 'hf' + f;
    footinput.value = '3';

    var inchinput = document.createElement("input");
    inchinput.setAttribute('type', 'number');
    inchinput.className = 'boxinput heighti';
    inchinput.min = '0';
    inchinput.value = '0';
    inchinput.id = 'hi' + f;

    var sub = document.createElement("input");
    sub.setAttribute('type', 'submit');
    sub.className = 'hiddenSubmit';

    nspan = document.createElement("span");
    nspan.name = f;
    var txt = (new UI.Text("Feature " + f)).dom;
    txt.style.width = '80px';
    nspan.appendChild(txt);
    nspan.appendChild(del);
    divbar.appendChild(nspan);

    heightbar.appendChild(wallnum);
    heightbar.appendChild(footinput);
    heightbar.appendChild((new UI.Text(" '")).dom);
    heightbar.appendChild(inchinput);
    heightbar.appendChild((new UI.Text(" \"")).dom);
    heightbar.appendChild(sub);
    divbar.appendChild(heightbar);

    var linesbar = document.createElement("div");
    divbar.appendChild(linesbar);

    $(featurebox).scrollTop($(featurebox)[0].scrollHeight);
    featurebox.appendChild(divbar);
    return linesbar;
}

function addCustomLine(scrollbox, f, featname, id) {
    var divbar = document.createElement('div');
    divbar.id = featname + '-form' + f;
    divbar.className = "custform";

    var wallbar = document.createElement("form");
    wallbar.id = featname + '-lenform-' + id + "-" + f;
    wallbar.name = id;
    wallbar.className = 'inline-form';

    wallbar.onsubmit = function () {
        console.log(this.id);
        editor.signals.constrainCustom.dispatch(parseInt(this.id.match(/[a-zA-Z]+|[0-9]+/g).slice(-1)), this.id, "length");
        return false;
    };

    var anglebar = document.createElement("form");
    anglebar.id = featname + '-angform-' + id + "-" + f;
    anglebar.name = id;

    anglebar.onsubmit = function () {
        editor.signals.constrainCustom.dispatch(parseInt(this.id.match(/[a-zA-Z]+|[0-9]+/g).slice(-1)), this.id, "angle");
        return false;
    };
    anglebar.className = 'inline-form';

    var lockcheck = document.createElement("input");
    lockcheck.className = "lockcheck";
    lockcheck.id = "lock" + f;
    lockcheck.setAttribute('type', 'checkbox');

    var label = document.createElement("label");
    label.className = "locklabel";
    label.htmlFor = "lock" + f;


    var wallnum = document.createElement("span");
    wallnum.style.display = 'inline-block';
    wallnum.style.width = '25px';
    wallnum.textContent = f + ': ';

    var footinput = document.createElement("input");
    footinput.setAttribute('type', 'number');
    footinput.className = 'boxinput feet';
    footinput.min = '0';
    footinput.id = 'ft' + f;
    footinput.value = '0';
    footinput.addEventListener('focus', function (event) { this.select(); }, false);

    var inchinput = document.createElement("input");
    inchinput.setAttribute('type', 'number');
    inchinput.className = 'boxinput inch';
    inchinput.min = '0';
    inchinput.value = '0';
    inchinput.id = 'in' + f;

    var anginput = document.createElement("input");
    anginput.setAttribute('type', 'number');
    anginput.className = 'boxinput angle';
    anginput.min = '0';
    anginput.value = '90';
    anginput.id = 'ang' + f;

    var sub = document.createElement("input");
    sub.setAttribute('type', 'submit');
    sub.className = 'hiddenSubmit';
    
    wallbar.appendChild(lockcheck);
    wallbar.appendChild(label);
    wallbar.appendChild(wallnum);
    wallbar.appendChild(sub);
    wallbar.appendChild(footinput);
    wallbar.appendChild((new UI.Text(" '")).dom);
    wallbar.appendChild(inchinput);
    wallbar.appendChild((new UI.Text(" \"")).dom);
    anglebar.appendChild(anginput);
    anglebar.appendChild(document.createTextNode('\u00B0'));

    divbar.appendChild(wallbar);
    divbar.appendChild(anglebar);

    //$(scrollbox).is(":visible") ? null : $('#' + scrollbox.parentNode.parentNode.id + '-collapse').trigger('click');
    $(scrollbox).scrollTop($(scrollbox)[0].scrollHeight);
    scrollbox.appendChild(divbar);

    return [f, footinput, inchinput, anginput];
}

function addStairLine(featurebox, f, featname, rise, run, wid, stairCt, angle) {
    var featbar = document.createElement("form");
    featbar.id = featname;
    featbar.className = "featbar";

    featbar.onsubmit = function () {
        editor.signals.updateFeature.dispatch(this.id);
        return false;
    };

    featbar.onmouseover = function () {
        editor.signals.selectFeature.dispatch(this.id);
        return false;
    };

    var featnum = document.createElement("span");
    featnum.style.display = 'inline-block';
    featnum.style.width = '60px';
    featnum.textContent = "Stairs" + f + " : ";

    var oplist = ['Straight', 'Curved', 'Spiral', 'Hollywood'];
    var swingSel = document.createElement("select");
    swingSel.className = 'boxselect swing';
    swingSel.id = 'sel' + f;

    for (var i = 0; i < oplist.length; i++) {
        var option = document.createElement("option");
        option.value = oplist[i];
        option.text = oplist[i];
        swingSel.appendChild(option);
    }

    var oplist2 = ['No Cutout', 'Cutout'];
    var cutSel = document.createElement("select");
    cutSel.className = 'boxselect cut';
    cutSel.id = 'csel' + f;

    for (var c = 0; c < oplist2.length; c++) {
        var option2 = document.createElement("option");
        option2.value = oplist2[c];
        option2.text = oplist2[c];
        cutSel.appendChild(option2);
    }
    cutSel.onchange = function () {
        var numbc = this.parentNode.id;
        editor.signals.updateFeature.dispatch(numbc);
    };

    var del = document.createElement("button");
    del.textContent = "\u26D2";
    del.className = 'delbutt';
    del.id = 'df' + f;
    del.type = 'button';
    del.addEventListener('click', function (event) {
        event.preventDefault();
        var numbc = this.parentNode.id;
        editor.signals.deleteFeature.dispatch(numbc);
    });

    var riseInp = document.createElement("input");
    riseInp.setAttribute('type', 'number');
    riseInp.className = 'boxinput rise';
    riseInp.min = '5';
    riseInp.id = 'rs' + f;
    riseInp.setAttribute('step', '0.01');
    riseInp.value = rise;
    riseInp.addEventListener('focus', function (event) { this.select(); }, false);

    var runInp = document.createElement("input");
    runInp.setAttribute('type', 'number');
    runInp.className = 'boxinput run';
    runInp.min = '5';
    runInp.setAttribute('step', '0.01');
    runInp.value = run;
    runInp.id = 'rn' + f;

    var widInp = document.createElement("input");
    widInp.setAttribute('type', 'number');
    widInp.className = 'boxinput width';
    widInp.min = '1';
    widInp.setAttribute('step', '0.01');
    widInp.value = wid;
    widInp.id = 'wd' + f;
    

    var countInp = document.createElement("input");
    countInp.setAttribute('type', 'number');
    countInp.className = 'boxinput count';
    countInp.min = '1';
    countInp.id = 'ct' + f;
    countInp.value = stairCt;
    countInp.addEventListener('focus', function (event) { this.select(); }, false);

    var angInp = document.createElement("input");
    angInp.setAttribute('type', 'number');
    angInp.className = 'boxinput angle';
    angInp.min = '0';
    angInp.value = angle;
    angInp.id = 'ag' + f;

    var pang = document.createElement("button");
    pang.setAttribute('type', 'submit');
    pang.className = 'hiddenSubmit';

    featbar.appendChild(featnum);
    featbar.appendChild((new UI.Text("Ct: ")).dom);
    featbar.appendChild(countInp);
    featbar.appendChild((new UI.Text("Ang: ")).dom);
    featbar.appendChild(angInp);
    featbar.appendChild(del);

    featbar.appendChild(document.createElement("br"));
    
    featbar.appendChild((new UI.Text("Rise: ")).dom);
    featbar.appendChild(riseInp);
    featbar.appendChild((new UI.Text(" \"")).dom);
    featbar.appendChild((new UI.Text("Run: ")).dom);
    featbar.appendChild(runInp);
    featbar.appendChild((new UI.Text(" \"")).dom);
    featbar.appendChild((new UI.Text("Wid: ")).dom);
    featbar.appendChild(widInp);
    featbar.appendChild((new UI.Text(" \"")).dom);

    featbar.appendChild(document.createElement("br"));

    featbar.appendChild(swingSel);
    featbar.appendChild(cutSel);

    featbar.appendChild(pang);


    //$(featurebox).is(":visible") ? null : $('#' + featurebox.parentNode.parentNode.id + '-collapse').trigger('click');
    featurebox.appendChild(featbar);
    $(featurebox).scrollTop($(featurebox)[0].scrollHeight);
    return [f, riseInp, runInp, countInp, angInp, widInp, swingSel]
}

function addMeasure(container, measurement) {
    var sqrow = document.createElement("span");
    sqrow.className = 'rowbar';

    var ct = $(container).children().length;


    var sqft = document.createElement("input");
    sqft.className = 'boxinput';
    sqft.value = measurement;
    sqft.id = 'meas-' + ct;

    var sqin = document.createElement("input");
    sqin.className = 'boxinput';
    sqin.value = measurement;
    sqin.id = 'meas-in-' + ct;

    var sqang = document.createElement("input");
    sqang.className = 'boxinput';
    sqang.value = measurement;
    sqang.id = 'meas-ang-' + ct;


    /*sqft.addEventListener('change', function (event) {
        event.preventDefault();
        editor.signals.updateTape.dispatch(this.value, this.id);
    });*/

    sqrow.appendChild(document.createTextNode("Tape" + ct + ": "));
    sqrow.appendChild(sqft);
    sqrow.appendChild(document.createTextNode("'"));
    sqrow.appendChild(sqin);
    sqrow.appendChild(document.createTextNode("\""));
    sqrow.appendChild(sqang);
    sqrow.appendChild(document.createTextNode('\u00B0'));

    var del = document.createElement("button");
    del.textContent = "\u26D2";
    del.className = 'delbutt';
    del.id = 'delmeas' + $(container).children().length;
    del.type = 'button';
    del.addEventListener('click', function (event) {
        event.preventDefault();
        editor.signals.deleteTape.dispatch(this.id);
    });
    sqrow.appendChild(del);

    container.appendChild(sqrow);
}

function containerInit(id, words, subclass) {
    var container = document.getElementById(id);

    var collapse = document.createElement('div');
    collapse.id = id + '-collapse';
    collapse.className = subclass ? 'collapseBar ' + subclass : 'collapseBar';
    collapse.textContent = words;

    var carrot = document.createElement('span');
    carrot.id = id + '-carrot';
    carrot.className = 'glyphicon glyphicon-menu-down';
    carrot.style.cssFloat = 'right';
    carrot.style.marginRight = '15px';

    var carrot2 = document.createElement('span');
    carrot2.id = id + '-carrot2';
    carrot2.className = 'glyphicon glyphicon-menu-up';
    carrot2.style.cssFloat = 'right';
    carrot2.style.marginRight = '15px';
    carrot2.style.display = 'none';

    collapse.appendChild(carrot);
    collapse.appendChild(carrot2);
    container.appendChild(collapse);

    var content = document.createElement('div');
    content.id = id + '-container';
    content.className = 'collapsePanel';
    content.style.display = 'none';
    container.appendChild(content);

    $(collapse).click(function () {
        $(content).slideToggle('fast', function () {
            $(carrot).toggle();
            $(carrot2).toggle();
        });
    });

    return { 'container': content, 'collapse': collapse };
}

function loadProjURL(pnum, container) {
    $.ajax({
        type: "POST",
        url: "http://austinteets.com/2DJobs.php",
        data: { 'pnum': pnum },
        datatype: 'text',
        success: function (data) {
            console.log(data);
            if (data) {
                var parsed = JSON.parse(data)[0];
                editor.signals.loadProjURL.dispatch(parsed);
            }
        }
    });
}

function sidebarLoadJob(parsed, container) {
    if (parsed) {
        console.log(parsed);
        var keys = Object.keys(parsed);
        for (var i = 0; i < keys.length; i++) {
            var sqrow = document.createElement("span");
            sqrow.className = 'rowbar';
            var sqft = document.createElement("input");
            sqft.setAttribute('readonly', 'readonly');
            sqft.className = 'layinput';
            sqft.style.width = '60%';
            sqft.value = parsed[keys[i]];
            sqft.id = 'loaded' + keys[i];
            sqrow.appendChild(document.createTextNode(keys[i] + ":"));
            sqrow.appendChild(sqft);
            container.appendChild(sqrow);
        }
    }
}

function projboxInit(container, signals, sidebar) {

    var proj = new UI.Div();
    /*
    var addr = document.createElement('input');
    addr.id = 'address_field';
    addr.style.cssFloat = 'left';
    addr.className = 'roomBar';
    */

    var pnum = document.createElement("input");
    pnum.id = 'project_field';
    pnum.value = '000000000';
    pnum.style.cssFloat = 'right';
    pnum.className = 'roomBar';
    pnum.style.display = 'none';

    //proj.dom.appendChild(addr);
    proj.dom.appendChild(pnum);

    
    $(function () {
        $("#loadjobbutt").click(function () {
            var pn = $("#houseselect :selected").val();
            console.log(pn);
            loadProjURL(pn, container);
            editor.signals.loadPacket.dispatch(pn);
            
            $('#Home').hide();
            $('#sidebar').show();
            $('#menubar').show();
            editor.signals.changePage.dispatch('splashPage');
        });

        editor.signals.loadProjURL.add(function (parsed) {
            sidebarLoadJob(parsed, container);
        });
        /*$("#loadjoblocal").click(function () {
            editor.signals.loadLocal.dispatch();
            $('#Home').hide();
            $('#sidebar').show();
            $('#menubar').show();
            editor.signals.changePage.dispatch('splashPage');
        });*/
    });

    container.appendChild(proj.dom);
    //container.appendChild(loadbutt.dom);
}

function addRoomSelect(container, name, signals) {
    var sel, inp;
    if (!document.getElementById('roomSelect')) {
        
        inp = document.createElement("input");
        inp.id = 'roomName';
        inp.className = 'roomBar';
        inp.style.cssFloat = 'left';
        inp.addEventListener('change', function () {
            var sel = document.getElementById('roomSelect');
            sel.options[sel.selectedIndex].innerHTML = inp.value;
            signals.roomNameChange.dispatch(inp.value);
        });

        sel = document.createElement("select");
        sel.id = 'roomSelect';
        sel.className = 'roomBar';
        sel.style.cssFloat = 'right';
        sel.addEventListener('change', function () {
            var rm = sel.options[sel.selectedIndex].value;
            document.getElementById('roomName').value = sel.options[sel.selectedIndex].innerHTML;
            signals.roomSwitch.dispatch(rm);
        });
        container.appendChild(inp);
        container.appendChild(sel);


    } else {
        inp = document.getElementById('roomName');
        sel = document.getElementById('roomSelect');
    }
    var option = document.createElement("option");
    option.value = name;
    option.text = name;
    option.id = name;
    inp.value = name;
    sel.appendChild(option);
    sel.selectedIndex = option.index;
    return option.index;
}

function addLayout(name, signals) {
    var planeswitch = new UI.Button("Surface Editing and Estimation");
    planeswitch.dom.style.width = '290px';
    planeswitch.dom.style.marginLeft = '5px';
    planeswitch.dom.id = name + '-lay';
    planeswitch.onClick(function () {
        signals.layout.dispatch(name);
    });
    return planeswitch.dom;
}


function createScrollbox(name) {
    var scrollBox = document.createElement("div");
    scrollBox.className = 'collapsePanel';
    scrollBox.id = name + '-scroll';


    scrollBox.onmouseleave = function () {
        editor.signals.selectWall.dispatch(-1);
        return false;
    }
    /*
    $(scrollBox).scroll(function () {
        if ($(this)[0].scrollHeight - $(this).scrollTop() === $(this).outerHeight()) {
            var popped = $(this).find(".formbar:first").detach();
            $(this).append(popped);
            popped = $(this).find(".formbar:first").detach();
            $(this).append(popped);
            $(this).scrollTop($(this).scrollTop() - 85);
        } else if ($(this).scrollTop() === 0) {
            var popped = $(this).find(".formbar:last").detach();
            $(this).prepend(popped);
            popped = $(this).find(".formbar:last").detach();
            $(this).prepend(popped);
            $(this).scrollTop(85);
        }
    });
    */
    return scrollBox;
}

function createFeaturebox(name) {
    var itemBox = document.createElement("div");
    itemBox.className = 'collapsePanel';
    itemBox.id = name + '-feat';

    itemBox.onmouseleave = function () {
        editor.signals.selectFeature.dispatch('none');
        return false;
    }

    return itemBox;
}

function createLayoutbox(name) {
    var layoutBox = document.createElement("div");
    layoutBox.className = 'collapsePanel';
    layoutBox.id = name + '-layout';

    var layoutForm = document.createElement("form");

    //{ 'Name': 'Carpet', 'Width': 3.6576, 'Sold In': 'Rolls', 'Price': 2, 'Price-Unit': 'SqFt', 'Pattern': false, 'Grain' : ang }
    var material = document.createElement("span");
    material.className = 'rowbar';
    var sel = document.createElement("select");
    sel.id = 'mat';
    sel.className = 'layinput material';
    sel.style.cssFloat = 'right';

    var option = document.createElement("option");
    option.value = 'carpet';
    option.text = "Carpet";
    option.id = 'carpet';
    sel.appendChild(option);

    var option2 = document.createElement("option");
    option2.value = 'tile';
    option2.text = "Tile";
    option2.id = 'tile';
    sel.appendChild(option2);

    material.appendChild(document.createTextNode("Material : "));
    material.appendChild(sel);
    layoutForm.appendChild(material);

    //Staggering
    var stag = document.createElement("span");
    stag.style.display = 'none';
    stag.className = 'rowbar';
    var sel2 = document.createElement("select");
    sel2.id = 'mat';
    sel2.className = 'layinput stagger';
    sel2.style.cssFloat = 'right';

    var option6 = document.createElement("option");
    option6.value = 'stacked';
    option6.text = "Stacked";
    option6.id = 'stacked';
    sel2.appendChild(option6);

    var option3 = document.createElement("option");
    option3.value = 'staggered';
    option3.text = "Staggered 1/2";
    option3.id = 'staggered';
    sel2.appendChild(option3);

    var option7 = document.createElement("option");
    option7.value = 'staggered2';
    option7.text = "Staggered 1/3";
    option7.id = 'staggered2';
    sel2.appendChild(option7);

    var option5 = document.createElement("option");
    option5.value = 'herringbone';
    option5.text = "Herringbone";
    option5.id = 'herringbone';
    sel2.appendChild(option5);

    var option8 = document.createElement("option");
    option8.value = 'pinwheel';
    option8.text = "Pinwheel";
    option8.id = 'pinwheel';
    sel2.appendChild(option8);

    var option9 = document.createElement("option");
    option9.value = 'parquet';
    option9.text = "Parquet";
    option9.id = 'parquet';
    sel2.appendChild(option9);

    stag.appendChild(document.createTextNode("Offset : "));
    stag.appendChild(sel2);
    layoutForm.appendChild(stag);

    var widrow = document.createElement("span");
    widrow.className = 'rowbar';
    var width = document.createElement("input");
    width.setAttribute('type', 'number');
    width.className = 'layinput width';
    width.min = '0';
    width.setAttribute('step', '0.1');
    width.id = 'matwid';
    width.value = '12';
    widrow.appendChild(document.createTextNode("Width (ft) : "));
    widrow.appendChild(width);
    layoutForm.appendChild(widrow);

    var htrow = document.createElement("span");
    htrow.className = 'rowbar';
    var height = document.createElement("input");
    height.setAttribute('type', 'number');
    height.className = 'layinput height';
    height.min = '0';
    height.setAttribute('step', '0.1');
    height.id = 'matht';
    height.value = '12';
    htrow.appendChild(document.createTextNode("Length (ft) : "));
    htrow.appendChild(height);
    htrow.style.display = 'none';
    layoutForm.appendChild(htrow);

    sel.onchange = function () {
        $(htrow).toggle();
        $(stag).toggle();
    };

    var angRow = document.createElement("span");
    angRow.className = 'rowbar';
    var ang = document.createElement("input");
    ang.setAttribute('type', 'number');
    ang.className = 'layinput angle';
    ang.min = '0';
    ang.id = 'matang';
    ang.value = '90';
    angRow.appendChild(document.createTextNode("Angle (deg) : "));
    angRow.appendChild(ang);
    layoutForm.appendChild(angRow);

    var priceRow = document.createElement("form");
    priceRow.className = 'rowbar';
    var price = document.createElement("input");
    price.setAttribute('type', 'number');
    price.className = 'layinput price';
    price.min = '0';
    price.setAttribute('step', '0.01');
    price.id = 'matpr';
    price.value = '2.05';
    priceRow.appendChild(document.createTextNode("Price (per linear ft) : "));
    priceRow.appendChild(price);

    var fang = document.createElement("button");
    fang.setAttribute('type', 'submit');
    fang.className = 'hiddenSubmit';
    priceRow.appendChild(fang);

    var pang = document.createElement("button");
    pang.setAttribute('type', 'submit');
    pang.className = 'hiddenSubmit';
    layoutForm.appendChild(pang);

    layoutForm.onsubmit = function () {
        editor.signals.layout.dispatch(this.id);
        return false;
    };
    layoutBox.appendChild(layoutForm);

    priceRow.onsubmit = function () {
        editor.signals.priceChanged.dispatch(this.id);
        return false;
    };
    layoutBox.appendChild(priceRow);

    return layoutBox;
}

function addCalculated(layoutbox, pack) {
    var tst = layoutbox.querySelector('#matlin');
    if (tst) {
        var sqtst = layoutbox.querySelector('#matsqf');
        var prtst = layoutbox.querySelector('#matcost');
        tst.value = pack.linear;
        sqtst.value = pack.sqft;
        prtst.value = pack.price;
    } else {
        var widrow = document.createElement("span");
        widrow.className = 'rowbar';

        var width = document.createElement("input");
        width.setAttribute('type', 'number');
        width.setAttribute('readonly', 'readonly');
        width.className = 'layinput';
        width.min = '0';
        width.setAttribute('step', '0.1');
        width.id = 'matlin';
        width.value = pack.linear;
        widrow.appendChild(document.createTextNode("Linear Feet : "));
        widrow.appendChild(width);
        layoutbox.appendChild(widrow);

        var sqrow = document.createElement("span");
        sqrow.className = 'rowbar';
        var sqft = document.createElement("input");
        sqft.setAttribute('type', 'number');
        sqft.setAttribute('readonly', 'readonly');
        sqft.className = 'layinput';
        sqft.min = '0';
        sqft.setAttribute('step', '0.1');
        sqft.id = 'matsqf';
        sqft.value = pack.sqft;
        sqrow.appendChild(document.createTextNode("SQ Feet: "));
        sqrow.appendChild(sqft);
        layoutbox.appendChild(sqrow);

        var prrow = document.createElement("span");
        prrow.className = 'rowbar';
        var price = document.createElement("input");
        price.setAttribute('type', 'number');
        price.setAttribute('readonly', 'readonly');
        price.className = 'layinput';
        price.min = '0';
        price.setAttribute('step', '0.01');
        price.id = 'matcost';
        price.value = pack.price;
        prrow.appendChild(document.createTextNode("Material Cost ($): "));
        prrow.appendChild(price);
        layoutbox.appendChild(prrow);
    }
    $(layoutbox).scrollTop($(layoutbox)[0].scrollHeight);
}

function addDoorLine(featurebox, f, featname, len1, len2, width, winding, top, bottom) {

    var dist1 = convertToFeetInch(len1);
    var dist2 = convertToFeetInch(len2);

    var featbar = document.createElement("form");
    featbar.id = featname;
    featbar.className = "featbar";

    featbar.onsubmit = function () {
        editor.signals.updateFeature.dispatch(this.id);
        return false;
    };
    
    featbar.onmouseover = function () {
        editor.signals.selectFeature.dispatch(this.id);
        editor.signals.selectDoor.dispatch(this.id);
        return false;
    };

    var featnum = document.createElement("span");
    featnum.style.display = 'inline-block';
    featnum.style.width = '60px';
    featnum.textContent = "WFeat" + f + " : ";

    var oplist = ['LH In Swing', 'LH Out Swing', 'RH In Swing', 'RH Out Swing', 'French In Doors', 'French Out Doors', 'Leaf'];
    var swingSel = document.createElement("select");
    swingSel.className = 'boxselect swing';
    swingSel.id = 'sel' + f;

    for (var i = 0; i < oplist.length; i++) {
        var option = document.createElement("option");
        option.value = oplist[i];
        option.text = oplist[i];
        swingSel.appendChild(option);
    }

    swingSel.onchange = function () {
        editor.signals.updateFeature.dispatch(this.parentNode.id);
    };

    var oplist2 = ['No Transition', 'Carpet', 'Hardwood', 'Linoleum', 'Vinyl', 'Tile', 'Laminate'];
    var cutSel = document.createElement("select");
    cutSel.className = 'boxselect trans';
    cutSel.id = 'csel' + f;

    for (var c = 0; c < oplist2.length; c++) {
        var option2 = document.createElement("option");
        option2.value = oplist2[c];
        option2.text = oplist2[c];
        cutSel.appendChild(option2);
    }

    var oplist1 = ['Door', 'Window'];
    var typeSel = document.createElement("select");
    typeSel.className = 'boxselect type';
    typeSel.id = 'csel' + f;

    for (var d = 0; d < oplist1.length; d++) {
        var option1 = document.createElement("option");
        option1.value = oplist1[d];
        option1.text = oplist1[d];
        typeSel.appendChild(option1);
    }

    typeSel.onchange = function () {
        $(cutSel).toggle();
        $(swingSel).toggle();
        editor.signals.updateFeature.dispatch(this.parentNode.id);
    };
    
    var del = document.createElement("button");
    del.textContent = "\u26D2";
    del.className = 'delbutt';
    del.id = 'df' + f;
    del.type = 'button';
    del.addEventListener('click', function (event) {
        event.preventDefault();
        var numbc = this.parentNode.id;
        editor.signals.deleteFeature.dispatch(numbc);
    });

    var footinput = document.createElement("input");
    footinput.setAttribute('type', 'number');
    footinput.className = 'boxinput feetLeft';
    footinput.min = '0';
    footinput.id = 'fta' + f;
    footinput.value = dist1.feet;
    footinput.addEventListener('focus', function (event) { this.select(); }, false);

    var inchinput = document.createElement("input");
    inchinput.setAttribute('type', 'number');
    inchinput.className = 'boxinput inchLeft';
    inchinput.min = '0';
    inchinput.value = dist1.inch;
    inchinput.id = 'ina' + f;

    var lefttext = document.createElement("span");
    lefttext.style.display = 'inline-block';
    lefttext.style.width = '30px';
    lefttext.textContent = "L:";
    lefttext.style.textAlign = "right";

    var footinput2 = document.createElement("input");
    footinput2.setAttribute('type', 'number');
    footinput2.className = 'boxinput feetRight';
    footinput2.min = '0';
    footinput2.id = 'ftb' + f;
    footinput2.value = dist2.feet;
    footinput2.addEventListener('focus', function (event) { this.select(); }, false);

    var inchinput2 = document.createElement("input");
    inchinput2.setAttribute('type', 'number');
    inchinput2.className = 'boxinput inchRight';
    inchinput2.min = '0';
    inchinput2.value = dist2.inch;
    inchinput2.id = 'inb' + f;

    var righttext = document.createElement("span");
    righttext.style.display = 'inline-block';
    righttext.style.width = '30px';
    righttext.textContent = "R:";
    righttext.style.textAlign = "right";

    var doortext = document.createElement("span");
    doortext.style.display = 'inline-block';
    doortext.style.width = '30px';
    doortext.textContent = "W:";
    doortext.style.textAlign = 'right';

    var doorwidth = document.createElement("input");
    doorwidth.setAttribute('type', 'number');
    doorwidth.className = 'boxinput width';
    doorwidth.min = '0';
    doorwidth.value = Math.round(width * 39.370078740157477);
    doorwidth.id = 'indoor' + f;


    var toptext = document.createElement("span");
    toptext.style.display = 'inline-block';
    toptext.style.width = '30px';
    toptext.textContent = "H:";
    toptext.style.textAlign = "right";

    var finchTop = convertToFeetInch(top);

    var footinput3 = document.createElement("input");
    footinput3.setAttribute('type', 'number');
    footinput3.className = 'boxinput feetTop';
    footinput3.min = '0';
    footinput3.id = 'ftc' + f;
    footinput3.value = finchTop.feet;
    footinput3.addEventListener('focus', function (event) { this.select(); }, false);

    var inchinput3 = document.createElement("input");
    inchinput3.setAttribute('type', 'number');
    inchinput3.className = 'boxinput inchTop';
    inchinput3.min = '0';
    inchinput3.value = finchTop.inch;
    inchinput3.id = 'inc' + f;

    var bottext = document.createElement("span");
    bottext.style.display = 'inline-block';
    bottext.style.width = '30px';
    bottext.textContent = "B:";
    bottext.style.textAlign = "right";

    var finchBot = convertToFeetInch(bottom);

    var footinput4 = document.createElement("input");
    footinput4.setAttribute('type', 'number');
    footinput4.className = 'boxinput feetBottom';
    footinput4.min = '0';
    footinput4.id = 'ftd' + f;
    footinput4.value = finchBot.feet;
    footinput4.addEventListener('focus', function (event) { this.select(); }, false);

    var inchinput4 = document.createElement("input");
    inchinput4.setAttribute('type', 'number');
    inchinput4.className = 'boxinput inchBottom';
    inchinput4.min = '0';
    inchinput4.value = finchBot.inch;
    inchinput4.id = 'ind' + f;

    var pang = document.createElement("button");
    pang.setAttribute('type', 'submit');
    pang.style.position = "absolute";
    pang.style.top = '-10000px';
    pang.style.left = '-10000px';

    featbar.appendChild(featnum);
    featbar.appendChild(typeSel);
    featbar.appendChild(del);

    featbar.appendChild(document.createElement("br"));
    featbar.appendChild(swingSel);
    featbar.appendChild(cutSel);
    featbar.appendChild(document.createElement("br"));


    if (winding > 0) {
        featbar.appendChild(lefttext);
        featbar.appendChild(footinput2);
        featbar.appendChild((new UI.Text(" '")).dom);
        featbar.appendChild(inchinput2);
        featbar.appendChild((new UI.Text(" \"")).dom);
        featbar.appendChild(righttext);
        featbar.appendChild(footinput);
        featbar.appendChild((new UI.Text(" '")).dom);
        featbar.appendChild(inchinput);
        featbar.appendChild((new UI.Text(" \"")).dom);
    } else {
        featbar.appendChild(lefttext);
        featbar.appendChild(footinput);
        featbar.appendChild((new UI.Text(" '")).dom);
        featbar.appendChild(inchinput);
        featbar.appendChild((new UI.Text(" \"")).dom);
        featbar.appendChild(righttext);
        featbar.appendChild(footinput2);
        featbar.appendChild((new UI.Text(" '")).dom);
        featbar.appendChild(inchinput2);
        featbar.appendChild((new UI.Text(" \"")).dom);
    }


    featbar.appendChild(doortext);
    featbar.appendChild(doorwidth);
    featbar.appendChild((new UI.Text(" \"")).dom);

    featbar.appendChild(document.createElement("br"));

    featbar.appendChild(toptext);
    featbar.appendChild(footinput3);
    featbar.appendChild((new UI.Text(" '")).dom);
    featbar.appendChild(inchinput3);
    featbar.appendChild((new UI.Text(" \"")).dom);
    
    featbar.appendChild(bottext);
    featbar.appendChild(footinput4);
    featbar.appendChild((new UI.Text(" '")).dom);
    featbar.appendChild(inchinput4);
    featbar.appendChild((new UI.Text(" \"")).dom);
    featbar.appendChild(pang);


    //$(featurebox).is(":visible") ? null : $('#' + featurebox.parentNode.parentNode.id + '-collapse').trigger('click');
    featurebox.appendChild(featbar);
    //$(featurebox).scrollTop($(featurebox)[0].scrollHeight);
    return [f, footinput, inchinput, footinput2, inchinput2, doorwidth, swingSel];
}

function addWall(scrollbox, n, roomname) {
    var divbar = document.createElement('div');
    divbar.id = roomname + '-form' + n;
    divbar.className = "formbar";

    var wallbar = document.createElement("form");
    wallbar.id = roomname + '-lenform' + n;
    wallbar.className = 'inline-form';

    wallbar.onsubmit = function () {
        editor.signals.constrainWall.dispatch(parseInt(this.id.match(/[a-zA-Z]+|[0-9]+/g).slice(-1)), this.id, "length");
        return false;
    };

    divbar.onmouseover = function () {
        editor.signals.selectWall.dispatch(parseInt(this.id.match(/[a-zA-Z]+|[0-9]+/g).slice(-1)));
        return false;
    };

    var anglebar = document.createElement("form");
    anglebar.id = roomname + '-angform' + n;

    anglebar.onsubmit = function () {
        editor.signals.constrainWall.dispatch(parseInt(this.id.match(/[a-zA-Z]+|[0-9]+/g).slice(-1)), this.id, "angle");
        return false;
    };
    anglebar.className = 'inline-form';

    var lockcheck = document.createElement("input");
    lockcheck.className = "lockcheck";
    lockcheck.id = "lock" + n;
    lockcheck.setAttribute('type', 'checkbox');

    var label = document.createElement("label");
    label.className = "locklabel";
    label.htmlFor = "lock" + n;

    /*
    $(lockcheck).change(function () {
        editor.signals.lockWall.dispatch(parseInt(this.id.match(/[a-zA-Z]+|[0-9]+/g).slice(-1)));
    });*/

    var wallnum = document.createElement("span");
    wallnum.style.display = 'inline-block';
    wallnum.style.width = '25px';
    wallnum.textContent = n + ': ';

    var footinput = document.createElement("input");
    footinput.setAttribute('type', 'number');
    footinput.className = 'boxinput feet';
    footinput.min = '0';
    footinput.id = 'ft' + n;
    footinput.value = '0';
    footinput.addEventListener('focus', function (event) { this.select(); }, false);

    var inchinput = document.createElement("input");
    inchinput.setAttribute('type', 'number');
    inchinput.className = 'boxinput inch';
    inchinput.min = '0';
    inchinput.value = '0';
    inchinput.id = 'in' + n;

    var anginput = document.createElement("input");
    anginput.setAttribute('type', 'number');
    anginput.setAttribute('step', '0.1');
    anginput.className = 'boxinput angle';
    anginput.min = '0';
    anginput.value = '90';
    anginput.id = 'ang' + n;

    var sub = document.createElement("input");
    sub.setAttribute('type', 'submit');
    sub.style.position = "absolute";
    sub.style.top = '-10000px';
    sub.style.left = '-10000px';

    var left = document.createElement('button');
    left.textContent = "<";
    left.type = 'button';
    left.className = "togglebutton";
    left.id = 'l' + n;
    left.style.display = 'none';
    left.onclick = function () {
        var numba = this.id.substring(1);
        console.log(numba);
        editor.signals.flip.dispatch(numba);
    };
    var right = document.createElement('button');
    right.textContent = ">";
    right.id = 'r' + n;
    right.type = 'button';
    right.className = "togglebutton";
    right.style.display = 'none';
    right.onclick = function () {
        var numbb = this.id.substring(1);
        console.log(numbb);
        editor.signals.flip.dispatch(numbb);
    };
    right.disabled = true;

    /*
    del = document.createElement("button");
    del.textContent = "\u26D2";
    del.className = 'delbutt';
    del.id = 'd' + n;
    del.addEventListener('click', function (event) {
        var numbc = this.id.substring(1);
        editor.signals.deleteWall.dispatch(numbc);
    });
    del.disabled = false;
    */
    wallbar.appendChild(lockcheck);
    wallbar.appendChild(label);
    wallbar.appendChild(wallnum);
    wallbar.appendChild(sub);
    wallbar.appendChild(footinput);
    wallbar.appendChild((new UI.Text(" '")).dom);
    wallbar.appendChild(inchinput);
    wallbar.appendChild((new UI.Text(" \"")).dom);
    anglebar.appendChild(anginput);
    anglebar.appendChild(document.createTextNode('\u00B0'));
    anglebar.appendChild(left);
    anglebar.appendChild(right);
    //wallbar.appendChild(del);

    divbar.appendChild(wallbar);
    divbar.appendChild(anglebar);

    //$(scrollbox).is(":visible") ? null : $('#' + scrollbox.parentNode.parentNode.id + '-collapse').trigger('click');
    $(scrollbox).scrollTop($(scrollbox)[0].scrollHeight);
    scrollbox.appendChild(divbar);

    return [n, footinput, inchinput, anginput, left, right, divbar];
}