function convertToPDF(room) {
    var ret = [];
    room.forEach(function (cuts) {
        var cut = [];
        var arr = cuts.geometry.attributes.position.array;
        for (var i = 0; i < arr.length; i += 3) {
            var newVec = new THREE.Vector2(arr[i], arr[i + 2]);
            cut.push(newVec);
        }
        ret.push(cut);
    });
    console.log(ret);
    return ret;
}

function createImages(rmSet) {
    var images = [];
    for (var z = 0; z < rmSet.length; z++) {
        var cuts = [];
        for (var i = 0; i < rmSet[z].length; i++) {
            var img = drawCanvasNew(rmSet[z][i]);
            cuts.push(img);
        }
        images.push(cuts);
    }
    console.log(images);
}

function setImg(imgUrl) {
    var img = new Image;
    img.src = imgUrl;
    img.onload = function () {
        var canvas = document.createElement('canvas');
        canvas.height = 300;
        canvas.width = 300;
        var ctx = canvas.getContext("2d");

        ctx.drawImage(img, 0, 0, 300, 300);
        var canvBox = document.getElementById("canvBox");
        canvBox.appendChild(canvas);
    }
}

function saveIMG(img) {
    console.log(img);
    var pnum = document.getElementById('project_field').value;
    $.ajax({
        data: { "projectNum": pnum, "img": img },
        method: 'POST',
        url: 'http://austinteets.com/img.php',
        success: function (data) {
            console.log("Success");
            console.log(data);
        }
    });
}

function createImagePacket(packet) {
    var keys = Object.keys(packet);
    $("#canvBox").html(" ");
    for (var i = 0; i < keys.length; i++) {
        var img = drawCombined(packet[keys[i]]);
        setImg(img);
        saveIMG(img);
    }
}

function savePacket(packet) {
    var pnum = document.getElementById('project_field').value;
    createImagePacket(packet);
    $.ajax({
        data: { "projectNum": pnum, "packet": JSON.stringify(packet) },
        method: 'POST',
        url: 'http://austinteets.com/packet.php',
        success: function (data) {
            console.log("Success");
            console.log(data);
        }
    });
}

function downloadDoc(filename, rooms, db) {
    var alphaList = [];
    console.log(db);
    if (db === null) {
        db = { "address": "", "zip": "", "storeNum": "", "projectNum": "", "firstName": "", "lastName": "", "phone": "", "installer": "" };
    }

    var pdf = new jsPDF('landscape', 'pt', 'letter');
    var offset = 0;
    pdf.setFont('times');
    pdf.setFontSize(30);

    var maxLet = 0;
    rooms.forEach(function (element) {
        var ctx = pdf.context2d;
        pdf.setFontSize(12);
        var xset = 290;
        var yset = 50;
        pdf.text(xset, yset, 'Address:  ' + db.address);
        xset += 165;
        pdf.text(xset, yset, 'Zip:     ' + db.zip);
        xset += 85;
        pdf.text(xset, yset, 'Store:    ' + db.storeNum);
        xset += 125;
        pdf.text(xset, yset, 'Project:    ' + db.projectNum);
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

        xset = 295;
        yset = 30;

        cust = db.lastName + ", " + db.firstName;
        pdf.text(xset, yset, 'Customer: \t' + cust);
        xset += 65;
        ctx.moveTo(xset, yset + 2);
        xset += 160;
        ctx.lineTo(xset, yset + 2);
        xset += 10;
        pdf.text(xset, yset, 'Phone:  ' + db.phone);
        xset += 45;
        ctx.moveTo(xset, yset + 2);
        xset += 70;
        ctx.lineTo(xset, yset + 2);
        xset += 10;
        pdf.text(xset, yset, 'Installer: ' + db.installer);
        xset += 45;
        ctx.moveTo(xset, yset + 2);
        xset += 80;
        ctx.lineTo(xset, yset + 2);

        ctx.stroke();
        ctx.closePath();


        var alpha = element[2];
        var yOff = 515;
        var xOff = 25;
        pdf.setFontSize(6);
        var count = 0;
        var better = [];
        for (var keys in alpha) {
            ctx.strokeRect(xOff, yOff, 15, 15);
            ctx.strokeRect(xOff + 15, yOff, 25, 15);
            pdf.text(xOff + 7.5, yOff + 12, keys, null, null, 'center');
            inch = (alpha[keys] * 12).toFixed(2);
            pdf.text(xOff + 15 + 12.5, yOff + 12, inch + ' in', null, null, 'center');
            yOff += 15;
            if (yOff === 575) {
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
        pdf.text(xOff + 40 + 40, yOff, element[4] + " sq ft", null, null, 'center');

        xOff = 670;
        ctx.fillStyle = "#e0e0e0";
        ctx.strokeRect(630, 60, 80, 15);
        ctx.fillRect(630, 60, 80, 15);
        ctx.fillStyle = "black";
        pdf.text(xOff, yOff, 'Perimeter: ', null, null, 'center');
        ctx.strokeRect(710, 60, 60, 15);
        pdf.text(xOff + 40 + 30, yOff, element[5] + " ft", null, null, 'center');

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


        pdf.addImage(element[0], 'png', 20, 55, 500, 500, 'pic', 'FAST');
        pdf.addImage(logo, 'png', 607, 495, 163, 80, 'logo', 'FAST');
        pdf.addImage(header, 'png', 35, 17, 222, 40, 'head', 'FAST');

        ctx.strokeRect(20, 55, 440, 525);
        ctx.strokeRect(20, 10, 260, 45);
        ctx.strokeRect(280, 10, 500, 45);
        ctx.strokeRect(460, 55, 320, 525);
        pdf.setFontSize(10);
        pdf.text(20, 600, "- Generated by TekMeasure3D- Time: " + Date() + " - ");
        pdf.text(665, 600, "Copyright 2017 - Tekainos");
        pdf.addPage();
        console.log(element[0]);
        console.log(logo);
        console.log(header);
    });
    var ctx = pdf.context2d;
    ctx.strokeRect(20, 10, 760, 580);
    pdf.text(20, 600, "- Generated by TekMeasure3D- Time: " + Date() + " - ");
    pdf.text(660, 600, "Copyright 2017 - Tekainos");
    pdf.setFontSize(20);
    pdf.text(25, 55, "NOTES: ");
    pdf.addImage(logo, 'png', 607, 495, 163, 80, 'logo', 'FAST');
    var blobpdf = pdf.output();
    savePDF(blobpdf);
    //writeBlobPDFToFile(Windows.Security.Cryptography.CryptographicBuffer.convertStringToBinary(blobpdf, Windows.Security.Cryptography.BinaryStringEncoding.Utf8), filename);
}


function precise_round(num, decimals) {
    var t = Math.pow(10, decimals);
    return (Math.round((num * t) + (decimals > 0 ? 1 : 0) * (Math.sign(num) * (10 / Math.pow(100, decimals)))) / t).toFixed(decimals);
}

function alphabetList() {
    var alphabetter = [];
    var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    alphabet.forEach(function (letter) {
        alphabetter.push(letter);
    });
    return alphabetter
}

function drawCombined(polygon) {
    var canvas = document.createElement("CANVAS");
    var ctx = canvas.getContext('2d');
    var minX, minY, maxX, maxY;
    minX = polygon.Boundary[0].x;
    maxX = polygon.Boundary[0].x;
    minY = polygon.Boundary[0].y;
    maxY = polygon.Boundary[0].y;
    polygon.Boundary.forEach(function (element) {
        minX = Math.min(minX, element.x);
        minY = Math.min(minY, element.y);
        maxX = Math.max(maxX, element.x);
        maxY = Math.max(maxY, element.y);
    });

    var offsetX = 0 - minX;
    var offsetY = 0 - minY;
    var inch = false;
    var scaleX = (maxX - minX);
    var scaleY = (maxY - minY);
    var scaleFactor = Math.min((400 / scaleX), (400 / scaleY));
    var grid = scaleFactor / 3.28084;
    if (grid >= 520) {
        inch = true;
    }

    canvas.width = 600;
    canvas.height = 600;

    //ctx.fillStyle = 'white';
    //ctx.fillRect(0, 0, canvas.width, canvas.height);
    var offX = 500 / 2 - scaleX * scaleFactor / 2;
    var offY = 500 / 2 - scaleY * scaleFactor / 2;
    ctx.strokeStyle = "black";

    drawBackground(520, 520, 10, ctx, grid, inch);

    ctx.textAlign = 'left';
    addPolygonToCanvas(ctx, polygon.Boundary, scaleFactor, offX, offY, offsetX, offsetY, "", "3");
    for (var i = 0; i < polygon.Layout.Coordinates.length; i++) {
        addPolygonToCanvas(ctx, polygon.Layout.Coordinates[i], scaleFactor, offX, offY, offsetX, offsetY, "#aaaaaa");
    }
    for (var j = 0; j < polygon.Features.FloorFeatures.length; j++) {
        addPolygonToCanvas(ctx, polygon.Features.FloorFeatures[j].Coordinates, scaleFactor, offX, offY, offsetX, offsetY, "#000000", "2", "#dddddd");
    }
    for (var k = 0; k < polygon.Features.WallFeatures.length; k++) {
        addPolygonToCanvas(ctx, polygon.Features.WallFeatures[k].Coordinates, scaleFactor, offX, offY, offsetX, offsetY,"#000000", "1", "#cccccc");
    }


    var dataURL = canvas.toDataURL();
    //var strWindowFeatures = "location=yes,height=570,width=520,scrollbars=yes,status=yes";
    //window.open(dataURL, '_blank', strWindowFeatures);
    return dataURL
}

function addPolygonToCanvas(ctx, polygon, scaleFactor, offX, offY, offsetX, offsetY, style, wid, fills) {
    var coords = [];
    polygon.forEach(function (element) {
        coords.push([(element.x+offsetX) * scaleFactor + offX, (element.y+offsetY) * scaleFactor + offY]);
    });
    
    ctx.strokeStyle = style ? style : "#000000";
    ctx.lineWidth = wid ? wid : '1';
    ctx.moveTo(coords[0][0], coords[0][1]);
    ctx.beginPath();
    for (var i = 0; i < coords.length; i++) {
        ctx.lineTo(coords[i][0], coords[i][1]);
    }
    ctx.lineTo(coords[0][0], coords[0][1]);
    ctx.fillStyle = fills ? fills : "#FFFFFF";

    ctx.fill();
    ctx.stroke();
}

function drawBackground(width, height, p, context, scaler, inch) {
    context.beginPath();
    var scale;
    if (inch) {
        scale = scaler / 12;
    } else {
        scale = scaler;
    }
    var bw = Math.round(width / scale) * scale;
    var bh = Math.round(height / scale) * scale;
    while (bw > width) {
        bw -= scale;
    }
    while (bh > height) {
        bh -= scale;
    }
    for (var x = 0; x <= bw + 1; x += scale) {
        context.moveTo(x + p, p);
        context.lineTo(x + p, bh + p);
    }

    for (var z = 0; z <= bh + 1; z += scale) {
        context.moveTo(p, z + p);
        context.lineTo(bw + p, z + p);
    }

    context.strokeStyle = "#cccccc";
    context.stroke();
    context.closePath();
    context.beginPath();
    context.moveTo(p, bh + p + 5);
    context.lineTo(p, bh + p + 10);

    context.lineTo(scale / 2 + p, bh + p + 10);
    context.lineTo(scale / 2 + p, bh + p + 15);
    context.moveTo(scale / 2 + p, bh + p + 10);
    context.textAlign = 'center';
    if (inch) {
        context.fillText('1 Inch', scale / 2 + p, bh + p + 25);
    } else {
        context.fillText('1 Foot', scale / 2 + p, bh + p + 25);
    }

    context.lineTo(scale + p, bh + p + 10);
    context.lineTo(scale + p, bh + p + 5);
    context.strokeStyle = "black";
    context.stroke();
    context.closePath();
}

function drawCanvasNew(polygon) {
    var letters = alphabetList();
    var letterList = {};
    var canvas = document.createElement("CANVAS");
    var ctx = canvas.getContext('2d');
    var minX, minY, maxX, maxY;
    var coords = [];
    minX = polygon[0].x;
    maxX = polygon[0].x;
    minY = polygon[0].y;
    maxY = polygon[0].y;
    console.log(polygon);
    polygon.forEach(function (element) {
        minX = Math.min(minX, element.x);
        minY = Math.min(minY, element.y);
        maxX = Math.max(maxX, element.x);
        maxY = Math.max(maxY, element.y);
    });
    console.log(minX);
    console.log(minY);
    offsetX = 0 - minX;
    offsetY = 0 - minY;
    var inch = false;
    var scaleX = (maxX - minX);
    var scaleY = (maxY - minY);
    var scaleFactor = Math.min((400 / scaleX), (400 / scaleY));
    var grid = scaleFactor / 3.28084;
    if (grid >= 520) {
        inch = true;
    }
    console.log(scaleFactor);
    canvas.width = 600;
    canvas.height = 600;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    var offX = 500 / 2 - scaleX * scaleFactor / 2;
    var offY = 500 / 2 - scaleY * scaleFactor / 2;
    ctx.strokeStyle = "black";

    polygon.forEach(function (element) {
        coords.push([(element.x + offsetX) * scaleFactor + offX, (element.y + offsetY) * scaleFactor + offY]);
    });
    drawBackground(520, 520, 10, ctx, grid, inch);
    ctx.textAlign = 'left';
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.font = "bold 12px Arial";
    ctx.beginPath();
    var last = [coords[0][0], coords[0][1]];
    ctx.moveTo(coords[0][0], coords[0][1]);
    for (var i = 0; i <= coords.length; i++) {
        var element = coords[i];
        if (i === coords.length) {
            element = coords[0];
        }
        ctx.lineTo(element[0], element[1]);
        var x1 = (last[0] - offX) / scaleFactor;
        var y1 = (last[1] - offY) / scaleFactor;
        var x2 = (element[0] - offX) / scaleFactor;
        var y2 = (element[1] - offY) / scaleFactor;

        var dist = Number(precise_round(Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)), 2));
        var xdist = element[0] - last[0];
        var ydist = element[1] - last[1];
        var thisDirec = [Math.sign(element[0] - last[0]), Math.sign(element[1] - last[1])];
        var ydirec = 0;
        var xdirec = 0;
        var xmult = 10;
        var ymult = 10;
        if (thisDirec[0] > 0) {
            ydirec = -1;
            ymult = 5;
            xdirec = 1;
            xmult = -10;
        } else if (thisDirec[0] < 0) {
            ydirec = 1;
            ymult = 15;
            xdirec = 1;
            xmult = -10;
        }
        if (thisDirec[1] > 0) {
            xdirec = 1;
            xmult = 5;
        } else if (thisDirec[1] < 0) {
            xdirec = -1;
            xmult = 15;
        }

        var tCoordX = last[0] + xdist / 2 + xdirec * xmult;
        var tCoordY = last[1] + ydist / 2 + ydirec * ymult;
        if (dist > 0.1) {
            ftDist = precise_round(dist * 3.28084, 2);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(tCoordX - 3, tCoordY - 12.5, 15, 15);
            ctx.fillStyle = "#000000";

            var abc = letters.splice(0, 1);
            ctx.fillText(abc, tCoordX, tCoordY);
            letterList[abc] = ftDist;
            letters.push(abc + abc);
        }



        if (dist < 0) {
            ftDist = precise_round(dist * 3.28084, 2);
            var textLength = (ftDist.length - 1) * 10;
            if (xmult === 25) {
                tCoordX = last[0] + xdist / 2 + xdirec * textLength;
            }
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(tCoordX - 2.5, tCoordY - 15, textLength, 20);
            ctx.linewidth = 0.5;
            ctx.strokeRect(tCoordX - 2.5, tCoordY - 15, textLength, 20);

            ctx.fillStyle = "#000000";

            ctx.fillText(ftDist, tCoordX, tCoordY);
        }
        ctx.linewidth = 2;
        last[0] = element[0];
        last[1] = element[1];
    }
    ctx.lineTo(coords[0][0], coords[0][1]);
    ctx.closePath();

    ctx.fillStyle = "#FFFFFF";
    ctx.lineWidth = 1;
    ctx.fill();
    ctx.stroke();
    var dataURL = canvas.toDataURL();
    var strWindowFeatures = "location=yes,height=570,width=520,scrollbars=yes,status=yes";
    //window.open(dataURL, '_blank', strWindowFeatures);
    return [dataURL, letterList]
}

