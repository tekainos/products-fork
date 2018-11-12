/**
 * @author mrdoob / http://mrdoob.com/
 */

var Toolbar = function (editor) {

    var signals = editor.signals;

    var container = new UI.Panel();
    container.setId('toolbar');

    var off = 10;
    var packList = [];
    var boundBox = [];
    var smartLays = [];
    var optimized = [];
    var linear = 0;
    var matWidth = 0;
    var opti = false;
    var canvWidth;

    var mult, over, grain;

    var vp = document.getElementById('viewport');
    var layDiv = document.createElement("div");
    layDiv.style.width = vp.offsetWidth - 10;
    layDiv.style.height = '300px';
    layDiv.style.overflowX = 'auto';
    layDiv.style.overflowY = 'hidden';

    return container;

};

    /*
    var zip = sessionStorage.getItem('zip');
    var house = sessionStorage.getItem('house');
    var room = sessionStorage.getItem('room0');
    signals.roomSwitch.add(function (fn) {
        room = fn;
    });
    var filename = room;

    var logo;
    var header;
    imgToURL("img/TekBW.png", "img/TekHead.png");

    var vpWid = vp.offsetWidth;

    var canvas = document.createElement("CANVAS");
    var ctx = canvas.getContext("2d");

    drawCanvas(vpWid - 10);

    layDiv.appendChild(canvas);
    container.dom.appendChild(layDiv);

    function drawCanvas(wid) {
        canvWidth = wid;
        canvas.width = wid;
        canvas.height = 280;


        ctx.fillStyle = "#FFFF66";
        ctx.fillRect(5, 45, wid - 100, 10);
        var scale;
        if (mult !== 0 && mult) {
            scale = 0.3048 * mult;
        } else {
            scale = 220 / 12;
        }

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
        off = 10;
        if (!optimized || optimized.length === 0) {
            packList.forEach(function (pk) {
                addCut(pk);
            });
        } else {
            optiprint();
        }
    }

    signals.newLayout.add(function (id, planePack, gr, width, olap) {
        matWidth = width;
        var pack = centerLayout(planePack, gr, id);
        mult = 220 / width;
        over = (olap * mult) / 2;
        grain = gr;
        var widft = 3.28084 * width;
        widft = widft.toFixed(1);
        linear += pack[0][0] * mult + olap * mult;
        if (linear + 90 >= canvas.width) {
            drawCanvas(linear + 110);
            ctx.fillText('x' + widft + 'ft', linear + 110 - 43, 40);
        } else if (linear < vpWid - 10 - 110) {
            drawCanvas(vpWid - 10);
            ctx.fillText('x' + widft + 'ft', vpWid - 10 - 43, 40);
        }
        packList.push(pack);
        addCut(pack);
    });

    signals.opticut.add(function () {
        drawCanvas(canvWidth);
    });

    signals.clearLayout.add(function () {
        off = 10;
        packList = [];
        boundBox = [];
        smartLays = [];
        optimized = [];
        linear = 0;
        matWidth = 0;
        opti = false;
        canvWidth = (vpWid - 10);
        mult = 0;
        over = 0;
        grain = 0;
        drawCanvas(vpWid - 10);
    });

    // Called a lot
    function addCut(pack, remX, setY) {
        var firstPath = pack[0][2];
        var tempoff = 0;
        var xlength = pack[0][0];
        var ywidth = pack[0][1];

        var xuse = (xlength * mult) + (2 * over);
        var overY = 0;
        if (off === 10) {
            overY = 2 * over;
        }
        if (remX) {
            tempoff = off;
            off -= remX;
        }
        var xset = over + off;

        var yset = overY + 60;

        if (setY) {
            yset += setY;
        }

        var yuse = (ywidth * mult) + (2 * overY);
        if (yuse < (matWidth * mult) && xuse > 5 && (matWidth * mult - yuse) > 5) {
            if (smartLays.indexOf(pack[0][3]) < 0) {
                boundBox.push([xset, yset, xuse, yuse, packList.length - 1]);
                smartLays.push(pack[0][3]);
            }
        }

        var tempX = firstPath[0].x * mult + xset;
        var tempY = firstPath[0].y * mult + yset;
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(tempX, tempY);
        for (var i = 1; i < firstPath.length; i++) {
            tempX = firstPath[i].x * mult + xset;
            tempY = firstPath[i].y * mult + yset;
            ctx.lineTo(tempX, tempY);
        }
        ctx.closePath();
        ctx.fillStyle = '#c3e7ff';
        ctx.stroke();
        ctx.fill();
        if (pack.length > 1) {
            pack.forEach(function (hole) {
                var holePath = hole[2];
                tempX = holePath[0].x * mult + over + off;
                tempY = holePath[0].y * mult + overY + 60;
                ctx.beginPath();
                ctx.moveTo(tempX, tempY);
                for (var z = holePath.length - 1; z > 0; z--) {
                    tempX = holePath[z].x * mult + over + off;
                    tempY = holePath[z].y * mult + overY + 60;
                    ctx.lineTo(tempX, tempY);
                }
                ctx.closePath();
                ctx.stroke();
                ctx.fill();
            });
        }
        if (remX) {
            off = tempoff;
        } else {
            off += pack[0][0] * mult + over * 2;
        }
        if (boundBox.length > 0) {
            optimized = optimizeCuts();
        }

    }

    signals.windowResize.add(function () {
        vpWid = vp.offsetWidth;
        layDiv.style.width = vpWid - 10;
    });

    // UNUSED
    function optiprint() {
        var fullWids = optimized[0];
        var cuts = optimized[1];
        var cutStacks = optimized[2];
        fullWids.forEach(function (pack) {
            addCut(pack);
        });

        var prev;
        var shiftx = 0;
        var shifty = 0;
        var prevCol = -1;
        cutStacks.forEach(function (cut) {
            var remX;
            var setY;
            var box;
            if (cut[1][0] < 0 && prev) {
                var tempx = cuts[cut[1][1]][2];
                remX = cuts[prev[1][0]][2] - cuts[prev[1][1]][2];
                setY = cuts[prev[1][0]][3];
                if (cut[1][0] === prevCol) {
                    setY += shifty;
                    shiftx = Math.max(shiftx, tempx);
                } else {
                    remX -= shiftx;
                    shifty = 0;
                }
            } else {
                remX = cuts[cut[1][0]][2];
                setY = cuts[cut[1][0]][3];
                box = cuts[cut[1][0]][4];

                addCut(packList[box]);
            }
            for (var i = 1; i < cut[1].length; i++) {
                box = cuts[cut[1][i]][4];
                addCut(packList[box], remX, setY);
                setY = setY + cuts[cut[1][i]][3];
            }
            if (cut[1][0] >= 0) {
                shiftx = 0;
                shifty = 0;
                prev = cut.slice();
            } else {
                shifty += cuts[cut[1][1]][3];
                prevCol = cut[1][0];
            }
        });
    }

    function isArray(arr) {
        return Object.prototype.toString.call(arr) === '[object Array]';
    }

    function filtMerge(arr, arr2) {
        var newArray = arr.concat(arr2);
        return newArray.filter(function (item, index) {
            return newArray.indexOf(item) === index;
        });
    }

    function optimizeCuts() {
        var fullWid = [];
        var pieces = [];
        var squares = [];
        packList.forEach(function (elem) {
            var ind = smartLays.indexOf(elem[0][3]);
            if (ind < 0) {
                fullWid.push(elem);
            } else {
                pieces.push([elem, ind]);
                squares.push(new THREE.Vector2(boundBox[ind][2], boundBox[ind][3]));
            }
        });
        var ret = squaresort(squares, pieces);
        if (ret.length > 1) {
            return [fullWid, boundBox, packem(ret)]
        } else {
            return false
        }
    }

    function handleNest(sub, used, depth) {
        var fail = false;
        var list = [];
        var tempUse = used.slice();
        for (var i = 1; i < sub[1].length; i++) {
            if (tempUse.indexOf(sub[1][i]) < 0) {
                tempUse.push(sub[1][i]);
            } else {
                fail = true;
            }
        }

        sub[1][0] = depth;
        list.push([sub[0], sub[1]]);
        for (var z = 2; z < sub.length; z++) {
            var ret = handleNest(sub[z], tempUse, depth - 1);
            if (ret[0].length > 0) {
                tempUse = ret[1].slice();
                list = list.concat(ret[0]);
            }
        }
        used = tempUse.slice();
        return [list, used];
    }

    function packem(sqr) {
        var xcost = sqr[0].x + 5;
        var used = [];
        var rem = new THREE.Vector2(xcost, matWidth * mult);
        var currBest = [];
        var bestList = [];
        var currentUse = [];
        while (used.length < sqr.length) {
            var bestFill = fillRem(sqr, rem, used, currentUse);
            if (bestFill.length > 2) {
                bestList.push([bestFill[0], bestFill[1]]);
                if (!isArray(bestFill[1][0])) {
                    for (var i = 0; i < bestFill[1].length; i++) {
                        if (used.indexOf(bestFill[1][i]) < 0) {
                            used.push(bestFill[1][i]);
                        }
                    }
                }
                var count = 2;
                while (count < bestFill.length) {
                    var sub = bestFill[count].slice();
                    var retList = handleNest(sub, used.slice(), -1);
                    bestList = bestList.concat(retList[0]);
                    used = retList[1].slice();
                    count++;
                }
            } else {
                bestList.push(bestFill);
            }
            var unused = [];
            sqr.forEach(function (un) {
                var ind = sqr.indexOf(un);
                if (used.indexOf(ind) < 0 && bestFill[1].indexOf(ind) >= 0) {
                    used.push(ind);
                } else if (used.indexOf(ind) < 0) {
                    unused.push(ind);
                }
            });
            if (unused.length > 0) {
                var next = unused.splice(0, 1);
                used.push(next[0]);
                currentUse = [next[0]];
                rem = new THREE.Vector2(sqr[next[0]].x, matWidth * mult - sqr[next[0]].y);
                if (unused.length === 0) {
                    bestList.push([rem.x * rem.y, currentUse]);
                }
            }
        }
        if (currBest.length > 0) {
            bestList.push(currBest);
        }
        return bestList;
    }

    function fillRem(sqr, rem, used, currentUse) {
        var currBest;
        var tempUse = used.slice();
        for (var i = 0; i < sqr.length; i++) {
            if (tempUse.indexOf(i) < 0) {
                if (sqr[i].y < rem.y && sqr[i].x <= rem.x) {
                    var user = tempUse.slice();
                    user.push(i);
                    var tempRem = new THREE.Vector2(rem.x, rem.y - sqr[i].y);

                    var currtemp;
                    var tempBest;
                    if (currentUse && currentUse.length > 0) {
                        currtemp = currentUse.slice();
                        currtemp.push(i);
                        tempBest = [tempRem.x * tempRem.y, currtemp];
                    } else {
                        tempBest = [tempRem.x * tempRem.y, user];
                    }
                    if (currBest === undefined) {
                        currBest = tempBest;
                    }
                    var test = fillRem(sqr, tempRem, user, currtemp);
                    if (test && currBest && test[0] < currBest[0]) {
                        currBest = test.slice();
                        if (rem.x - sqr[i].x > 0 && currBest.length <= 2) {
                            var subrem = new THREE.Vector2(rem.x - sqr[i].x, rem.y);
                            var sub = fillRem(sqr, subrem, filtMerge(user.slice(), test[1].slice()), [[currBest[1][0], sqr[i]]]);
                            if (sub[1].length > 1) {
                                currBest.push(sub);
                            }
                        }
                    }
                }
            }
        }
        if (currBest === undefined) {
            if (!currentUse || currentUse.length === 0) {
                return [rem.x * rem.y, used]
            } else {
                return [rem.x * rem.y, currentUse];
            }

        }
        return currBest;
    }

    function squaresort(sqr, pc) {
        var srted = [];
        var indlist = [];
        for (var i = 0; i < sqr.length; i++) {
            if (srted.length === 0) {
                srted.push(sqr[i]);
                indlist.push(i);
            } else {
                var count = 0;
                while (count < srted.length && (sqr[i].x < srted[count].x || (sqr[i].x === srted[count].x && sqr[i].y <= srted[count].y))) {
                    count++;
                }
                srted.splice(count, 0, sqr[i]);
                indlist.splice(count, 0, i);
            }
        }
        var newBound = [];
        indlist.forEach(function (el) {
            newBound.push(boundBox[el].slice());
        });
        boundBox = newBound;
        return srted
    }

    function centerLayout(pack, grain, id) {
        var centeredPack = [];
        var minX, minY, maxX, maxY;
        var offsetX, offsetY;
        pack.forEach(function (element) {
            minX = element[1][0].x;
            maxX = element[1][0].x;
            minY = element[1][0].y;
            maxY = element[1][0].y;
            element[1].forEach(function (pt) {
                maxX = Math.max(maxX, pt.x);
                maxY = Math.max(maxY, pt.y);
                minX = Math.min(minX, pt.x);
                minY = Math.min(minY, pt.y);
            });
            if (!offsetX) {
                offsetX = 0 - minX;
                if (grain === 90 || grain === 180) {
                    offsetX = maxX;
                }
                offsetY = 0 - minY;
            }
            var pack = [];
            if (grain === 90 || grain === 180) {
                element[1].forEach(function (pt) {
                    pack.push(new THREE.Vector2(pt.y + offsetY, -1 * pt.x + offsetX));
                });
                centeredPack.push([maxY - minY, maxX - minX, pack, id]);
            } else {
                element[1].forEach(function (pt) {
                    pack.push(new THREE.Vector2(pt.x + offsetX, pt.y + offsetY));
                });
                centeredPack.push([maxX - minX, maxY - minY, pack, id]);
            }
        });
        return centeredPack;
    }

    signals.downloadLayout.add(function () {
        var alphaList = [];
		/* var data = optionsToString(outliner.options);
		if (data.length == 0) {
			return;
        pdfDraws = ['1', '2'];
        var pdf = new jsPDF('landscape', 'pt', 'letter');
        var offset = 0;
        pdf.setFont('times');
        pdf.setFontSize(30);

        var maxLet = 0;
        pdfDraws.forEach(function (element) {
            var ctx = pdf.context2d;
            pdf.setFontSize(12);
            var xset = 290;
            var yset = 50;
            pdf.text(xset, yset, 'Address:  ' + house.replace(/([A-Z])/g, ' $1').trim());
            xset += 165;
            pdf.text(xset, yset, 'Zip:     ' + zip);
            xset += 85;
            pdf.text(xset, yset, 'Room:    '); //+ planeDraws[element][3]);
            xset += 125;
            pdf.text(xset, yset, 'Surface:    '); //+ planeDraws[element][1]);
            ctx.beginPath();

            yset = 52;
            xset = 335;
            ctx.moveTo(xset, yset);
            xset += 95;
            ctx.lineTo(xset + 10, yset);
            xset += 45;
            ctx.moveTo(xset, yset);
            xset += 45;
            ctx.lineTo(xset, yset);
            xset += 60;
            ctx.moveTo(xset, yset);
            xset += 80;
            ctx.lineTo(xset, yset);
            xset += 55;
            ctx.moveTo(xset, yset);
            xset += 65;
            ctx.lineTo(xset, yset);

            xset = 290;
            yset = 30;

            pdf.text(xset, yset, 'Customer: ');
            xset += 65;
            ctx.moveTo(xset, yset + 2);
            xset += 135;
            ctx.lineTo(xset, yset + 2);
            xset += 10;
            pdf.text(xset, yset, 'Store #:  ');
            xset += 45;
            ctx.moveTo(xset, yset + 2);
            xset += 70;
            ctx.lineTo(xset, yset + 2);
            xset += 10;
            pdf.text(xset, yset, 'Installer: ');
            xset += 45;
            ctx.moveTo(xset, yset + 2);
            xset += 105;
            ctx.lineTo(xset, yset + 2);

            ctx.stroke();
            ctx.closePath();


            //var alpha = planeDraws[element][2];
            var yOff = 515;
            var xOff = 25;
            pdf.setFontSize(6);
            var count = 0;
            var better = [];
			/* 
			for (var keys in alpha) {
				ctx.strokeRect(xOff, yOff, 15, 15);
				ctx.strokeRect(xOff+15, yOff, 25, 15);
				pdf.text(xOff + 7.5, yOff+12, keys, null, null, 'center');
				inch = (alpha[keys] *12).toFixed(2);
				pdf.text(xOff + 15 + 12.5, yOff+12, inch + ' in', null, null, 'center');
				yOff += 15;
				if (yOff == 575) {
					xOff += 40;
					yOff = 515;
				}
				better.push(keys);
				count++;
			} 
            if (count > maxLet) {
                maxLet = count;
                alphaList = better;
            }
            ctx.fillStyle = "#e0e0e0";
            pdf.setFontSize(12);
            xOff = 510;
            yOff = 73;
            ctx.strokeRect(470, 60, 80, 15);
            ctx.fillRect(470, 60, 80, 15);
            ctx.fillStyle = "black";
            pdf.text(xOff, yOff, 'Surface Area: ', null, null, 'center');
            ctx.strokeRect(550, 60, 80, 15);
            //pdf.text(xOff+40+40, yOff, planeDraws[element][4] + " sq ft", null, null, 'center');

            xOff = 670;
            ctx.fillStyle = "#e0e0e0";
            ctx.strokeRect(630, 60, 80, 15);
            ctx.fillRect(630, 60, 80, 15);
            ctx.fillStyle = "black";
            pdf.text(xOff, yOff, 'Perimeter: ', null, null, 'center');
            ctx.strokeRect(710, 60, 60, 15);
            //pdf.text(xOff+40+30, yOff, planeDraws[element][5] + " ft", null, null, 'center');

            xOff = 470;
            yOff = 85;
            ctx.fillStyle = "#e0e0e0";
            for (var i = 0; i <= 129; i++) {
                if (yOff === 85) {
                    ctx.fillRect(xOff, yOff, 60, 15);
                }
                ctx.strokeRect(xOff, yOff, 60, 15);
                xOff += 60;
                if (xOff === 770) {
                    yOff += 15;
                    xOff = 470;
                }
            }
            pdf.setFontSize(10);
            ctx.fillStyle = "black";
            pdf.text(500, 95, 'Material', null, null, 'center');
            pdf.text(560, 95, 'Cost', null, null, 'center');
            pdf.text(620, 95, 'Extras', null, null, 'center');
            pdf.text(680, 95, 'Cuts Needed', null, null, 'center');
            pdf.text(740, 95, 'Time Estimate', null, null, 'center');
            pdf.text(490, 490, 'NOTES: ', null, null, 'center');

            var tempcan = crop(canvas, { x: 0, y: 0 }, { x: 500, y: 500 });
            pdf.addImage(tempcan.toDataURL(), 'PNG', 20, 55, 500, 500, undefined, 'FAST');
            pdf.addImage(logo, 'PNG', 607, 495, 163, 80, 'logo', 'FAST');
            pdf.addImage(header, 'PNG', 35, 17, 222, 40, 'header', 'FAST');

            ctx.strokeRect(20, 55, 440, 525);
            ctx.strokeRect(20, 10, 260, 45);
            ctx.strokeRect(280, 10, 500, 45);
            ctx.strokeRect(460, 55, 320, 525);
            pdf.setFontSize(10);
            pdf.text(20, 600, "- Generated by TekMeasure3D- Time: " + Date() + " - ");
            pdf.text(665, 600, "Copyright 2017 - Tekainos");
            pdf.addPage();
        });
        var ctx = pdf.context2d;
        ctx.strokeRect(20, 10, 760, 580);
        pdf.text(20, 600, "- Generated by TekMeasure3D- Time: " + Date() + " - ");
        pdf.text(660, 600, "Copyright 2017 - Tekainos");
        pdf.setFontSize(20);
        pdf.text(25, 55, "NOTES: ");
        pdf.addImage(logo, 'PNG', 607, 495, 163, 80, 'logo', 'FAST');
        //pdf.output('dataurlnewwindow');

        pdf.save(filename + '.pdf');

		/* var csv;
		if (atLeast && atLeast2) {
			csv = 'Name,Distance,Unit,Area,Unit,Perimeter,Unit,' + alphaList.join() + '\n';
		}
		else if (atLeast) {
			csv = 'Name,Area,Unit,Perimeter,Unit,' + alphaList.join() + '\n';
		}
		else {
			csv = 'Name,Distance,Unit\n';
		}
		data.forEach(function(row) {
				var type = row.splice(row.length-1);
				if (type == 'plane' && atLeast2) {
					row.splice(1, 0, ',');
				}
				csv += row.join(',');
				csv += "\n";
		}); */

		/* var hiddenElement = document.createElement('a');
		hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
		hiddenElement.target = '_blank';
		
		hiddenElement.download = filename+ '.csv';
		hiddenElement.click(); 
        atLeast = false;
        atLeast2 = false;

    });

    function crop(can, a, b) {
        // get your canvas and a context for it
        var ct2 = can.getContext('2d');

        // get the image data you want to keep.
        var imageData = ct2.getImageData(a.x, a.y, b.x, b.y);

        // create a new cavnas same as clipped size and a context
        var newCan = document.createElement('canvas');
        newCan.width = b.x - a.x;
        newCan.height = b.y - a.y;
        var newCtx = newCan.getContext('2d');

        // put the clipped image on the new canvas.
        newCtx.putImageData(imageData, 0, 0);

        return newCan;
    }

    function imgToURL(img, img2) {
        var canvas = document.createElement("CANVAS");
        var context = canvas.getContext('2d');

        var base_image = new Image();
        base_image.src = img;
        base_image.onload = function () {
            canvas.width = base_image.width;
            canvas.height = base_image.height;
            context.drawImage(base_image, 0, 0);
            logo = canvas.toDataURL();
        }
        var canvas2 = document.createElement("CANVAS");
        var context2 = canvas2.getContext('2d');
        var base = new Image();
        base.src = img2;
        base.onload = function () {
            canvas2.width = base.width;
            canvas2.height = base.height;
            context2.drawImage(base, 0, 0);
            header = canvas2.toDataURL();
        }
    }

	/*var buttons = new UI.Panel();
	container.add( buttons );

	var outliner = new UI.THREE.Boolean(false, 'Surface Mode');
	outliner.onChange(function {
		var value = this.getValue();
		if (value) {
			
		}
	});
	//buttons.add(outliner);
	
	// translate / rotate / scale
	var house = sessionStorage.getItem('house');
	var rooms = [];
	var count = 0;
	rooms.push(sessionStorage.getItem('room'+count));
	while (rooms[rooms.length-1] != null) {
		count++;
		rooms.push(sessionStorage.getItem('room'+count));
	}
	rooms.pop();
	
	var options = {};
	for (var i=0; i < rooms.length; i++) {
		var path = 'models/' + house + '/' + rooms[i] + '.dae';
		options[path] = rooms[i];
	}

	
	var room = new UI.Select().setWidth( '150px' );
	room.setOptions( options );

	room.onChange( function () {

		var value = this.getValue();
		var loader = new THREE.FileLoader();
		editor.scene = new THREE.Scene();
		editor.scene.name = 'Scene';
		editor.scene.background = new THREE.Color( 0xaaaaaa );
		editor.clear();
		console.log(value);
		loadRoomToViewer(value);

	} );
	buttons.add(room);

	// grid


	
	function loadRoomToViewer(path) {
		var loader = new THREE.ColladaLoader();
		loader.load(path, function(collada) {
			collada.scene.name = 'base-scene';
			editor.addObject(collada.scene);
			collada = editor.scene.getObjectByName('base-scene');
			var bbox = new THREE.Box3().setFromObject(collada);
			var xmax = 0.5*(bbox.min.x - bbox.max.x);
			var zmax = 0.5*(bbox.min.z - bbox.max.z);
			var list = [];
			collada.traverse(function(element) {
				if (element.type == "Mesh") {
					list.push([element, element.parent.name]);
				}
			});
			var name = list[0][1];
			var count = -1;
			list.forEach(function(element) {
				THREE.SceneUtils.detach(element[0], element[0].parent, editor.scene);
				element[0].updateMatrixWorld();
				if (element[1] == name) {
					count += 1; 
				}
				else {
					name = element[1];
					count = 0;
				}
				element[0].name = name + count + '-bs';
				
				var geom = new THREE.Geometry().fromBufferGeometry(element[0].geometry);
				var material = new THREE.MeshBasicMaterial({color: 0x1D6DA0, shading: THREE.FlatShading});
				var copyCat = new THREE.Mesh(geom, material);
				copyCat.copy(element[0], false);
				editor.addObject(copyCat);
				var object = copyCat;
				object.translateX(xmax);
				object.translateY(zmax);
				object.updateMatrix();
				object.geometry.applyMatrix( object.matrix );
				object.position.set( 0, 0, 0 );
				object.rotation.set( 0, 0, 0 );
				object.scale.set( 1, 1, 1 );
				object.geometry.mergeVertices();
				object.updateMatrix();
				if (name == 'Ceiling') {
					copyCat.visible = false;
				}
				
				var geo = new THREE.EdgesGeometry( element[0].geometry ); // or WireframeGeometry( geometry )
				var mat = new THREE.LineBasicMaterial( { color: 0xFFE8B2, linewidth: 5} );
				var wireframe = new THREE.LineSegments( geo, mat );
				wireframe.copy(element[0], false);
				wireframe.name = element[0].name.substring(0, element[0].name.length-3) + "-wf";
				editor.addObject( wireframe );
				var object = wireframe;
				object.geometry.applyMatrix( object.matrix );
				object.position.set( 0, 0, 0);
				object.rotation.set( 0, 0, 0 );
				object.translateX(xmax);
				object.translateZ(-zmax);
				object.scale.set( 1, 1, 1 );
				object.updateMatrix();
				editor.scene.remove(element[0]);
			});
			editor.scene.remove(collada);
			editor.storage.clear();
			editor.scene.background = new THREE.Color( 0x051D41 );
			editor.signals.sceneGraphChanged.active = true;
			editor.signals.sceneGraphChanged.dispatch();
		});
	}
	*/