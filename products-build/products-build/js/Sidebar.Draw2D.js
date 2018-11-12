Sidebar.Draw2D = function (editor) {
    var signals = editor.signals;
    var config = editor.config;
    var history = editor.history;
    var scene = editor.scene;

    var completed = false;
    var sqfoot = 0;
    var rot = 0;
    var n = 0;
    var nm = 'Room0w';
    var curr = false;

    var containerB = new UI.Panel();
    containerB.dom.id = 'pledit';

    return containerB;

};
/*

    var planeswitch = new UI.Button("Camera Switch");
    planeswitch.dom.style.width = '290px';
    planeswitch.dom.style.marginLeft = '5px';
    planeswitch.dom.id = 'Cam';
    planeswitch.onClick(function () {
        signals.cameraSwitch.dispatch();
    });
    containerB.add(planeswitch);

    containerB.add(new UI.Break(), new UI.Break());

    var newRoom = new UI.Button("Add Room")
    newRoom.dom.style.display = 'inline';
    newRoom.dom.style.width = '30%';
    newRoom.dom.style.cssFloat = 'left';
    newRoom.dom.id = 'addRoomButton';
    newRoom.dom.style.marginRight = '5px';
    newRoom.dom.style.marginLeft = '5px';
    newRoom.onClick(function () {
        signals.addRoom.dispatch();
    });
    containerB.add(newRoom);

    var clear = new UI.Button("Clear");
    clear.dom.style.display = 'inline';
    clear.dom.style.width = '30%';
    clear.dom.style.cssFloat = 'right';
    clear.dom.id = 'clearButton';
    clear.dom.style.marginLeft = '5px';
    clear.dom.style.marginRight = '0px';
    clear.onClick(function () {
        signals.cleanLayouts.dispatch();
    });
    containerB.add(clear);
    containerB.add(new UI.Break());


    return containerB;
};

    /*
    var containerB = new UI.Panel();
    var newRoom = new UI.Button("Add Room")
    newRoom.dom.style.display = 'inline';
    newRoom.dom.style.width = '30%';
    newRoom.dom.style.cssFloat = 'left';
    newRoom.dom.id = 'pledBut';
    newRoom.dom.marginRight = '10px';
    newRoom.onClick(function () {
        signals.addRoom.dispatch();
    });
    containerB.add(newRoom);

    var clear = new UI.Button("Clear");
    clear.dom.style.display = 'inline';
    clear.dom.style.width = '30%';
    clear.dom.style.cssFloat = 'right';
    clear.dom.id = 'pledBut';
    clear.dom.marginLeft = '10px';
	clear.onClick(function () {
        signals.cleanLayouts.dispatch();
        container.dom.style.display = 'none';
        containerD.dom.style.display = 'none';
        planeswitch.dom.style.display = 'none';
        addwall.dom.style.display = 'none';
        addCouch.dom.style.display = 'none';
        scrollBox.style.display = 'none';
        itemBox.style.display = 'none';
		complete.dom.style.display = 'none';
		newroom.dom.style.display = 'block';
		dyndraw.dom.style.display = 'block';
		containerE.dom.style.display = 'block';
		while (scrollBox.firstChild) {
            scrollBox.removeChild(scrollBox.firstChild);
        }
        while (itemBox.firstChild) {
            itemBox.removeChild(itemBox.firstChild);
        }
		n=0;
    });
	
	containerB.add(clear);

	var splitline = document.createElement("div");
	splitline.style.borderBottom = "thin solid #a6a6a6";
	containerB.add(new UI.Break(), new UI.Break());
	containerB.dom.appendChild(splitline);
	containerB.add(new UI.Break());

	var containerE = new UI.Panel();	
	var newroom = new UI.Button("Draw New Room");
	newroom.dom.style.width = '45%';
    newroom.dom.style.cssFloat = 'left';
    newroom.dom.style.marginLeft = '5px';
	newroom.onClick(function () {
		signals.switchTool.dispatch('custom');
	});
	containerE.add(newroom);
	
	//containerE.add(new UI.Break(), new UI.Break());
	
	var dyndraw = new UI.Button("Dynamic Draw");
    dyndraw.dom.style.width = '45%';
    dyndraw.dom.style.cssFloat = 'right';
	dyndraw.dom.style.marginRight = '5px';
	dyndraw.onClick(function () {
		signals.activeDraw.dispatch();
	});
	containerE.add(dyndraw);
	
	var scrollBox = document.createElement("div");
    scrollBox.style.marginTop = '10px';
    scrollBox.style.marginLeft = '5px';
	scrollBox.style.width = '290px';
	scrollBox.style.height = '200px';
	scrollBox.style.overflow = 'auto';
	scrollBox.style.backgroundColor = '#222';
	scrollBox.style.display = 'none';
    scrollBox.id = 'measurementbox';

    var itemBox = document.createElement("div");
    itemBox.style.marginTop = '10px';
    itemBox.style.marginLeft = '5px';
    itemBox.style.width = '290px';
    itemBox.style.height = '200px';
    itemBox.style.overflow = 'auto';
    itemBox.style.backgroundColor = '#222';
    itemBox.style.display = 'none';
    itemBox.id = 'itembox';


    var addwall = new UI.Button("Add a Door");
    addwall.dom.style.width = '45%';
    addwall.dom.style.marginTop = '5px';
    addwall.dom.style.marginBottom = '5px';
    addwall.dom.style.marginLeft = '5px';
    addwall.dom.style.cssFloat = 'left';
    addwall.onClick(function () {
        signals.addDoor.dispatch();
    });
    addwall.dom.style.display = 'none';

    var addCouch = new UI.Button("Add a Couch");
    addCouch.dom.style.width = '45%';
    addCouch.dom.style.marginTop = '5px';
    addCouch.dom.style.marginBottom = '5px';
    addCouch.dom.style.marginLeft = '5px';
    addCouch.dom.style.cssFloat = 'right';
    addCouch.onClick(function () {
        signals.addCouch.dispatch();
    });
    addCouch.dom.style.display = 'none';

    var complete = new UI.Button("Complete Room");
	complete.dom.style.width = "45%";
    complete.dom.style.cssFloat = 'right';
    complete.dom.style.marginTop = '5px';
    complete.dom.style.marginRight = '5px';
    complete.dom.style.marginBottom = '5px';
	complete.onClick(function () {
		signals.completeRoom.dispatch(n-1);
	});
	complete.dom.style.display = 'none';
	
	function makeWall(mult = 1, measurements) {
        var ct = 0;
        while (ct < mult) {
            var wallbar = document.createElement("form");
            wallbar.id = 'wallform' + n;
            wallbar.className = "formbar";

            wallbar.onsubmit = function () {
                editor.signals.constrainWall.dispatch(parseInt(this.id.substring(8)));
                return false;
            };

            var lockcheck = document.createElement("input");
            lockcheck.className = "lockcheck";
            lockcheck.id = "lock" + n;
            lockcheck.setAttribute('type', 'checkbox');

            var label = document.createElement("label");
            label.className = "locklabel";
            label.htmlFor = "lock" + n;

            wallbar.appendChild(lockcheck);
            wallbar.appendChild(label);

            var wallnum = document.createElement("span");
            wallnum.style.display = 'inline-block';
            wallnum.style.width = '25px';
            wallnum.textContent = n + ': ' ;
            wallbar.appendChild(wallnum);

            var footinput = document.createElement("input");
            footinput.setAttribute('type', 'number');
            footinput.className = 'boxinput';
            footinput.min = '0';
            footinput.id = 'ft' + n;
            footinput.value = '0';
            footinput.addEventListener('focus', function (event) { this.select(); }, false);

            var inchinput = document.createElement("input");
            inchinput.setAttribute('type', 'number');
            inchinput.className = 'boxinput';
            inchinput.min = '0';
            inchinput.value = '0';
            inchinput.id = 'in' + n;

            var anginput = document.createElement("input");
            anginput.setAttribute('type', 'number');
            anginput.className = 'boxinput';
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
            left.className = "togglebutton";
            left.id = 'l' + n;
            left.onclick = function () {
                var numba = this.id.substring(1);
                console.log(numba);
                editor.signals.flip.dispatch(numba);
            };


            var right = document.createElement('button');
            right.textContent = ">";
            right.id = 'r' + n;
            right.className = "togglebutton";
            right.onclick = function () {
                var numbb = this.id.substring(1);
                console.log(numbb);
                editor.signals.flip.dispatch(numbb);
            };
            right.disabled = true;

            del = document.createElement("button");
            del.textContent = "\u26D2";
            del.className = 'delbutt';
            del.id = 'd' + n;
            del.addEventListener('click', function (event) {
                var numbc = this.id.substring(1);
                console.log(numbc);
                editor.signals.deleteWall.dispatch(numbc);
            });
            del.disabled = true;

            wallbar.appendChild(sub);
            wallbar.appendChild(footinput);
            wallbar.appendChild((new UI.Text(" '")).dom);
            wallbar.appendChild(inchinput);
            wallbar.appendChild((new UI.Text(" \"")).dom);
            wallbar.appendChild(anginput);
            wallbar.appendChild(document.createTextNode('\u00B0'));
            wallbar.appendChild(left);
            wallbar.appendChild(right);
            wallbar.appendChild(del);

            scrollBox.appendChild(wallbar);
            footinput.focus();
            if (mult > 1) {
                footinput.value = measurements[ct][1];
                inchinput.value = measurements[ct][2];
                anginput.value = measurements[ct][3];
                left.disabled = measurements[ct][4];
                right.disabled = !measurements[ct][4];
            }
            n += 1;
            ct += 1;
        }
    }

    function addDoorLine(door) {
        doorspl = door.name.match(/[a-zA-Z]+|[0-9]+/g);
        console.log(doorspl);
        doorbar = document.createElement('form');
        doorbar.id = 'doorform' + doorspl[1] + "-" + doorspl[5];

        var n = "W" + doorspl[1] + "D" + doorspl[5];

        var wallnum = document.createElement("span");
        wallnum.style.display = 'inline-block';
        wallnum.style.width = '40px';
        wallnum.textContent =  n + ': ';
        doorbar.appendChild(wallnum);

        var footinput = document.createElement("input");
        footinput.setAttribute('type', 'number');
        footinput.className = 'boxinput';
        footinput.min = '0';
        footinput.id = 'ft' + n;
        footinput.value = '0';
        footinput.addEventListener('focus', function (event) { this.select(); }, false);

        var inchinput = document.createElement("input");
        inchinput.setAttribute('type', 'number');
        inchinput.className = 'boxinput';
        inchinput.min = '0';
        inchinput.value = '0';
        inchinput.id = 'in' + n;

        doorbar.appendChild(footinput);
        doorbar.appendChild((new UI.Text(" '")).dom);
        doorbar.appendChild(inchinput);
        doorbar.appendChild((new UI.Text(" \"")).dom);

        doorbar.appendChild((new UI.Text(" -L")).dom);

        itemBox.appendChild(doorbar);
    }

    signals.addBar.add(function (wallbar) {
        scrollBox.appendChild(wallbar);
    });

    signals.loaded.add(function (raw) {
        scene = editor.scene;
        var meas = raw.values.Measurements;
        if (scrollBox.style.display !== 'block' && meas.length > 0) {
            makeWall(meas.length, meas);
            signals.nav.dispatch('Draw Room');

            scrollBox.style.display = 'block';
            itemBox.style.display = 'block';
            itemBox.appendChild(document.createTextNode("Features"));
            scrollBox.appendChild(document.createTextNode("Walls"));

            newroom.dom.style.display = 'none';
            dyndraw.dom.style.display = 'none';
            addwall.dom.style.display = 'block';
            addCouch.dom.style.display = 'block';
            complete.dom.style.display = 'block';
            document.getElementById("ft" + (n - 1)).focus();
        }
        completed = true;
        planeswitch.dom.style.display = 'block';
        addwall.dom.style.display = 'none';
        addCouch.dom.style.display = 'none';
        complete.dom.style.display = 'none';
    });
	
	containerB.add(containerE);
	
	containerB.dom.appendChild(scrollBox);

    containerB.dom.appendChild(itemBox);

    tooltipSpan = document.createElement("div");
    tooltipSpan.id = "tooltipSpan";
    tooltipSpan.setAttribute("class", "tooltip");
    tooltipSpan.display = "none";
    containerB.dom.appendChild(tooltipSpan);

    containerB.add(addwall);
    containerB.add(addCouch);
    containerB.dom.appendChild(complete.dom);

    var planeswitch = new UI.Button("Surface Editing and Estimation");
    planeswitch.dom.style.width = '290px';
    planeswitch.dom.style.marginLeft = '5px';
    planeswitch.dom.id = 'pledBut';
    planeswitch.onClick(function () {
        if (container.dom.style.display == 'block') {
            container.dom.style.display = 'none';
        } else {
            container.dom.style.display = 'block';
        }
    });
    planeswitch.dom.style.display = 'none';
    containerB.add(planeswitch);

    container.add(new UI.Text('Material Estimation - '));

    container.add(new UI.Break(), new UI.Break());

    container.add(new UI.Text('Enter Material Price: '));

    var pr = new UI.Text(' per sq/ft');
    pr.dom.style.cssFloat = 'right';
    container.add(pr);

    var price = new UI.Number(0.00);
    price.dom.style.width = '40px';
    price.dom.style.marginLeft = '5px';
    price.dom.style.marginRight = '5px';
    price.dom.style.cssFloat = 'right';
    container.add(price);

    var dol = new UI.Text('$');
    dol.dom.style.cssFloat = 'right';
    container.add(dol);


    var splitline3 = document.createElement("div");
    splitline3.style.borderBottom = "thin dashed #666666";

    container.add(new UI.Break(), new UI.Break());
    container.dom.appendChild(splitline3);
    container.add(new UI.Break());

    var sqRow = new UI.Row();
    var sqtext = new UI.Text('Total Square Footage: ');
    var sqtotal = new UI.Text('0.00 sq ft');
    sqtotal.dom.style.cssFloat = 'right';
    sqtext.dom.style.cssFloat = 'left';
    sqRow.add(sqtotal, sqtext);

    var prRow = new UI.Row();
    var ptext = new UI.Text('Total Price: ');
    var pprice = new UI.Text('$0.00');
    pprice.dom.style.cssFloat = 'right';
    ptext.dom.style.cssFloat = 'left';
    prRow.add(pprice, ptext);

    container.add(sqRow);

    container.add(prRow);

    var splitline4 = document.createElement("div");
    splitline4.style.borderBottom = "thin solid #a6a6a6";
    container.dom.appendChild(splitline4);
    container.add(new UI.Break());

    container.add(new UI.Text('Material Width '));

    var wid = new UI.Number();
    wid.dom.value = 12.00;
    wid.dom.style.width = "30px";
    wid.dom.style.cssFloat = 'right';
    wid.dom.id = 'wid';
    var widText = new UI.Text('Feet');
    widText.dom.style.cssFloat = 'right';
    container.add(widText);
    container.add(wid);
    container.add(new UI.Break(), new UI.Break());

    container.add(new UI.Text('Material Overlap '));
    var ov = new UI.Number();
    ov.dom.value = 2.00;
    ov.dom.style.width = "30px";
    ov.dom.style.cssFloat = 'right';
    ov.dom.id = 'over';
    var ovText = new UI.Text('Inches');
    ovText.dom.style.cssFloat = 'right';
    container.add(ovText);
    container.add(ov);
    container.add(new UI.Break(), new UI.Break());

    var genLay = new UI.Button("Quick Layout");
    genLay.dom.style.width = '150px';
    genLay.dom.style.cssFloat = 'left';
    genLay.onClick(function () {
        rot = 0;
        signals.layout.dispatch(wid.dom.value, ov.dom.value);
        signals.layout.dispatch(wid.dom.value, ov.dom.value);
    });
    container.add(genLay);

    var rotLay = new UI.Button("Rotate Layout");
    rotLay.dom.style.cssFloat = 'right';
    rotLay.dom.style.width = '100px';
    rotLay.onClick(function () {
        if (rot == 0) {
            rot = 90;
        } else {
            rot = 0;
        }
        signals.layout.dispatch(wid.dom.value, ov.dom.value, rot);
    });
    container.add(rotLay);
    container.add(new UI.Break(), new UI.Break());

    var numseams = new UI.Integer(1);
    numseams.setRange(0, 25);
    numseams.dom.style.cssFloat = 'left';
    numseams.dom.style.width = '50px';
    container.add(numseams);
    container.add(new UI.Text('Split(s)'));

    var tseam = new UI.Button("Add T-Seams");
    tseam.dom.style.cssFloat = 'right';
    tseam.onClick(function () {
        signals.tseam.dispatch(numseams.dom.value);
    });
    container.add(tseam);

    container.add(new UI.Break(), new UI.Break());

    var tip = new UI.Text('This is an Experimental Feature');
    tip.dom.style.fontStyle = 'italic';

    container.add(tip);

    price.dom.onchange = function () {
        var multPrice = Number(price.dom.value) * Number(sqfoot);
        pprice.dom.innerHTML = '$' + multPrice.toFixed(2);
    }

    signals.priceSwitch.add(function (newPL) {
        var SA = newPL.toFixed(2);
        sqfoot = Number(SA);
        var multPrice = Number(price.dom.value) * sqfoot;

        sqtotal.dom.innerHTML = sqfoot.toFixed(2) + ' sq ft';
        pprice.dom.innerHTML = '$' + multPrice.toFixed(2);
    });


    signals.updateMeas.add(function (feet, inchval, angle) {
        document.getElementById("ft" + (n - 1)).value = feet;
        document.getElementById("in" + (n - 1)).value = inchval;
    });

    signals.backspace.add(function () {
        signals.deleteWall.dispatch(n - 1);
    });

    signals.setWallValue.add(function (nm, concheck = false) {
        if (document.getElementById("ft0") === null) {
            signals.activeDraw.dispatch();
        }
        var current = document.activeElement.id;
        var curind = n - 1;
        var ftin;
        if (concheck) {
            ftin = nm;
        } else {
            console.log(current);
            if (current.substring(0, 1) === 'ft' || current.substring(0, 1) === 'in') {
                curind = Integer.parseInt(current.id.substring(2));
            } else if (current.substring(0, 2) === 'ang') {
                curind = Integer.parseInt(current.id.substring(3));
            }
            console.log(curind);

            ftin = toFtInch(nm);
        }


        document.getElementById("ft" + curind).value = ftin[0];
        document.getElementById("in" + curind).value = ftin[1];
        signals.drawSprite.dispatch(ftin[0], ftin[1], n);
        if (curind === n - 1) {
            signals.constrainWall.dispatch(0);
        }
    });

    signals.newRoom.add(function () {
        ct = 0;
        wform = document.getElementById('wallform' + ct);
        lsw = document.getElementById('l' + ct);
        rsw = document.getElementById('r' + ct);
        while (wform != null && lsw != null) {
            wform.removeChild(lsw);
            wform.removeChild(rsw);
            ct += 1;
            wform = document.getElementById('wallform' + ct);
            lsw = document.getElementById('l' + ct);
            rsw = document.getElementById('r' + ct);
        }
    });

    signals.doorAdded.add(function (door) {
        addDoorLine(door);
    });

    function toFtInch(numb) {
        var inft = numb / 0.3048;
        var ft = Math.floor(inft);
        var temp = (inft - Math.trunc(inft)) / 0.083333333333;
        var incher = Math.ceil(temp);
        if (incher >= 12) {
            incher -= 12;
            ft += 1;
        }
        return [ft, incher];
    }

    signals.addRoom.add(function (name) {

        scrollBox.appendChild(document.createTextNode(name));

    });

	signals.activeDraw.add(function () {
		makeWall();
        scrollBox.style.display = 'block';
        itemBox.style.display = 'block';

        itemBox.appendChild(document.createTextNode("Features"));
        scrollBox.appendChild(document.createTextNode("Walls"));

        newroom.dom.style.display = 'none';
		dyndraw.dom.style.display = 'none';
		complete.dom.style.display = 'block';
		document.getElementById("ft" + (n-1)).focus();
	});
	
	signals.switchTool.add(function () {
        scrollBox.style.display = 'block';
        itemBox.style.display = 'block';

        itemBox.appendChild(document.createTextNode("Features"));
        scrollBox.appendChild(document.createTextNode("Walls"));

		newroom.dom.style.display = 'none';
		dyndraw.dom.style.display = 'none';
		complete.dom.style.display = 'block';
	});
	
	signals.addWall.add(function() {
        makeWall();
        if (n >= 2) {
            document.getElementById('d' + (n - 2)).disabled = false;
        }
		document.getElementById("ft" + (n-1)).focus();
	});
	
	signals.deleteWall.add(function (d) {
        for (var i = d; i < n - 2; i++) {
			document.getElementById("ft" + i).value = document.getElementById("ft" + (i+1)).value;
			document.getElementById("in" + i).value = document.getElementById("in" + (i+1)).value;
			document.getElementById("ang" + i).value = document.getElementById("ang" + (i+1)).value;
		}
		document.getElementById('wallform' + (n-1)).remove();
		n -=1;
		if (n > 0) {
			document.getElementById("ft" + (n-1)).focus();
			document.getElementById("d" + (n-1)).disabled = true;			
		}
	});
	
    signals.completeRoom.add(function () {
        planeswitch.dom.style.display = 'block';
		completed = true;
		n-=1;
	});
	
	signals.newRoom.add(function () {
        completed = true;
        planeswitch.dom.style.display = 'block';
        addwall.dom.style.display = 'block';
        addCouch.dom.style.display = 'block';
		complete.dom.style.display = 'none';
	});
	
	signals.loadPlanes.add(function (pack) {
		scene = editor.scene;
		if (pack !== '') {
			console.log("No Plane");
		} else {
			signals.planeSwitch.dispatch('switch');
//			document.getElementById('pledit').style.display = 'block';
//			document.getElementById('pledBut').style.display = 'none';
			signals.cleanLayouts.dispatch();		
			curr = true;
		}
	});
	
	signals.flip.add(function () {
		var t = n-1;
		(document.getElementById("ft" + t)).focus();
	});

	signals.roomSwitch.add(function () {
		if (curr) {
			signals.planeSwitch.dispatch('switch');
			signals.cleanLayouts.dispatch();
			document.getElementById('pledit').style.display = 'none';
			document.getElementById('pledBut').style.display = 'block';
			curr = false; 
		}
	});
	
	containerB.add(new UI.Break(), new UI.Break());
	
	var containerD = new UI.Panel();
	containerD.add(new UI.Text("Edit Wall"));
	
	containerD.add(new UI.Break());
	var bt = new UI.Button("Update");
	bt.dom.style.width = '60px';
	bt.dom.style.cssFloat = "right";
	containerD.add(bt);
	
	var ed = new UI.Input("Set");
	ed.dom.style.width = '60px';
	ed.dom.style.cssFloat = "left";
	containerD.add(ed);
	
	signals.activeWall.add(function(arrs) {
		
		document.getElementById("ft" + arrs[3]).focus();
		/*
		var vs = arrs[0];
		var dist = 0;
		containerD.dom.style.display = 'block';
		containerE.dom.style.display = 'none';
	
		if (arrs[3] == arrs.length-1) {
			dist = vs[arrs[3]].distanceTo(vs[0]);
		} else {
			dist = vs[arrs[3]].distanceTo(vs[arrs[3]+1]);
		}
		ed.dom.value = dist;
		bt.dom.removeAttribute("onclick");
		bt.dom.onclick = function () {
			if (Number(ed.dom.value) > 0) {
				signals.updateWall.dispatch(arrs, Number(ed.dom.value));
			}
		}; */
/*	});
	
	signals.constrainWall.add(function () {
		document.getElementById("ft" + (n-1)).focus();
	});
	
	containerD.dom.style.display = 'none';
    containerB.add(containerD);

    container.dom.style.display = 'none';
    containerB.add(container);

	
	containerB.add(new UI.Break(), new UI.Break());

    return containerB;
*/
