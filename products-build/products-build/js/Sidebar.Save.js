Sidebar.Save = function (editor) {
    var signals = editor.signals;

    var config = editor.config;

    var history = editor.history;

    var scene = editor.scene;

    var container = new UI.Panel();

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;

    var logo, header;
    var measureURL;

    imgToURL("img/TekBW.png", "img/TekHead.png");

    var planeDraws = [];

    var butt = new UI.Button("Save");
    butt.onClick(function () {
        signals.savePacket.dispatch();
        //var jsed = editor.toJSON();
    });
    butt.dom.style.width = '45%';
    butt.dom.style.margin = '2px';
    butt.dom.style.float = 'left';
    container.add(butt);

    var loadbutt = new UI.Button("Load");
    loadbutt.onClick(function () {
        signals.loadPacket.dispatch();
        //var jsed = editor.toJSON();
    });
    //loadbutt.dom.addEventListener("click", signals.loadPacket.dispatch(), false);
    loadbutt.dom.style.width = '45%';
    loadbutt.dom.style.margin = '2px';
    loadbutt.dom.style.float = 'right';
    container.add(loadbutt);

    var exportButt = new UI.Button("Export PDF");
    exportButt.dom.style.width = '45%';
    exportButt.dom.style.margin = '2px';
    exportButt.dom.style.float = 'left';
    exportButt.dom.addEventListener("click", exportDoc, false);
    container.add(exportButt);

    var poload = new UI.Button("Load PO List");
    poload.dom.addEventListener("click", reloadPO, false);
    poload.dom.style.width = '45%';
    poload.dom.style.margin = '2px';
    poload.dom.style.float = 'right';
    container.add(poload);

    var scrollBox = document.createElement("div");
    scrollBox.style.marginTop = '10px';
    scrollBox.style.width = '290px';
    scrollBox.style.height = '300px';
    scrollBox.style.overflow = 'auto';
    scrollBox.style.backgroundColor = '#222';
    container.dom.appendChild(scrollBox);

    var qabutt = new UI.Button("Specify Room Properties");
    qabutt.dom.addEventListener("click", switchToQA, false);
    qabutt.dom.style.width = '100%';
    qabutt.dom.style.margin = '2px';
    container.add(qabutt);

    function loadFile() {
        var loader = new THREE.JSONLoader();
        var url = "C:\\Users\\TekDev\\3D Objects\\Address-000000000.Tek";
        pickSingleFile();
    }

    signals.sendToSidebar.add(function (packet) {
        console.log(packet);
        var blob = new Blob([JSON.stringify(packet)], { type: "application/json" });
        var addr = document.getElementById("address_field").value;
        var pnum = document.getElementById("project_field").value;
        saveToDB(pnum, JSON.stringify(packet));
        var filename = addr + "-" + pnum + ".Tek";
        console.log(packet);
        writeBlobToFile(packet, filename);
        
    });


    signals.cleanLayouts.add(function () {
        planeDraws = [];
    });

    function reloadPO() {
        fn = document.getElementById('project_field').value + ".pdf";
        signals.reloadPO.dispatch(fn);
    }

    signals.reloadPO.add(function () {
        signals.cleanLayouts.dispatch();
        console.log("Load PO");
        while (scrollBox.firstChild) {
            scrollBox.removeChild(scrollBox.firstChild);
        }
        $.ajax({
            url: 'http://austinteets.com/db.php',
            data: "",
            dataType: 'json',
            success: function (data) {
                console.log(data);
                for (var k = 0; k < data.length; k++) {
                    var load = new UI.Button(data[k][1] + " : " + data[k][2]);
                    load.dom.id = data[k][1];
                    load.dom.name = data[k][3];
                    load.dom.style.width = '100%';
                    load.dom.style.backgroundColor = '#e7e7e7';
                    load.dom.style.marginTop = '10px';
                    load.dom.onclick = function () {
                        house = this.id;
                        nm = this.name;
                        loadhouse(house, nm);
                    };
                    scrollBox.appendChild(load.dom);
                }
            }
        });
    });

    function exportDoc() {
        signals.download.dispatch(document.getElementById('address_field').value);
    }

    function loadhouse(house, nm) {
        while (scrollBox.firstChild) {
            scrollBox.removeChild(scrollBox.firstChild);
        }
        document.getElementById('address_field').value = nm;
        document.getElementById('project_field').value = house;
        $.ajax({
            method: 'GET',
            url: 'http://austinteets.com/house.php',
            data: { "pnum": house },
            dataType: 'text',
            success: function (ret) {
                console.log(ret);
                if (ret) {
                    editor.fromJSON(ret);
                }
            }
        });
    }

    function saveToDB(pn, pack) {
        console.log("NOW SAVING");
        $.ajax({
            data: { "projectNum": pn, "tekfile": pack },
            method: 'POST',
            url: 'http://austinteets.com/house_save.php',
            dataType: 'text',
            success: function (data) {
                console.log("Success");
                console.log(data);
            }
        });
    }

    function onloaded(geometry, materials) {
        console.log(geometry);
        console.log(materials);
    }

    function writeBlobToFile(blob, filename) {
        var savePicker = new Windows.Storage.Pickers.FileSavePicker();
        savePicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.objects3D;
        // Dropdown of file types the user can save the file as
        savePicker.fileTypeChoices.insert("Tek Measure File", [".Tek"]);
        // Default file name if the user does not type one in or select a file to replace
        savePicker.suggestedFileName = filename;

        savePicker.pickSaveFileAsync().then(function (file) {
            if (file) {
                // Prevent updates to the remote version of the file until we finish making changes and call CompleteUpdatesAsync.
                Windows.Storage.CachedFileManager.deferUpdates(file);
                // write to file
                Windows.Storage.FileIO.writeTextAsync(file, JSON.stringify(blob)).done(function () {
                    // Let Windows know that we're finished changing the file so the other app can update the remote version of the file.
                    // Completing updates may require Windows to ask for user input.
                    Windows.Storage.CachedFileManager.completeUpdatesAsync(file).done(function (updateStatus) {
                        if (updateStatus === Windows.Storage.Provider.FileUpdateStatus.complete) {
                            WinJS.log && WinJS.log("File " + file.name + " was saved.", "sample", "status");
                        } else {
                            WinJS.log && WinJS.log("File " + file.name + " couldn't be saved.", "sample", "status");
                        }
                    });
                });
            } else {
                WinJS.log && WinJS.log("Operation cancelled.", "sample", "status");
            }
        });
    } 

    function writeBlobPDFToFile(blob, filename) {
        var savePicker = new Windows.Storage.Pickers.FileSavePicker();
        savePicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.objects3D;
        // Dropdown of file types the user can save the file as
        savePicker.fileTypeChoices.insert("Tek Measure PDF", [".PDF"]);
        // Default file name if the user does not type one in or select a file to replace
        savePicker.suggestedFileName = filename;

        savePicker.pickSaveFileAsync().then(function (file) {
            if (file) {
                // Prevent updates to the remote version of the file until we finish making changes and call CompleteUpdatesAsync.
                Windows.Storage.CachedFileManager.deferUpdates(file);
                // write to file
                Windows.Storage.FileIO.writeBufferAsync(file, blob).done(function () {
                    // Let Windows know that we're finished changing the file so the other app can update the remote version of the file.
                    // Completing updates may require Windows to ask for user input.
                    Windows.Storage.CachedFileManager.completeUpdatesAsync(file).done(function (updateStatus) {
                        if (updateStatus === Windows.Storage.Provider.FileUpdateStatus.complete) {
                            WinJS.log && WinJS.log("File " + file.name + " was saved.", "sample", "status");
                        } else {
                            WinJS.log && WinJS.log("File " + file.name + " couldn't be saved.", "sample", "status");
                        }
                    });
                });
            } else {
                WinJS.log && WinJS.log("Operation cancelled.", "sample", "status");
            }
        });
    } 

    function pickSingleFile() {
        // Clean scenario output 
        WinJS.log && WinJS.log("", "sample", "status");

        // Create the picker object and set options 
        var openPicker = new Windows.Storage.Pickers.FileOpenPicker();
        openPicker.viewMode = Windows.Storage.Pickers.PickerViewMode.thumbnail;
        openPicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.objects3D;

        openPicker.fileTypeFilter.replaceAll([".Tek"]);

        openPicker.pickSingleFileAsync().then(function (file) {
            if (file) {
                Windows.Storage.FileIO.readTextAsync(file).then(function (fileContent) {
                    editor.fromJSON(fileContent);
                    WinJS.log && WinJS.log("Recieved File: " + file.name + "\n" + "File Content: " + fileContent, "sample", "status");
                }); 
            } else {
                // The picker was dismissed with no selected file 
                WinJS.log && WinJS.log("Operation cancelled.", "sample", "status");
            }
        });

    }

    signals.measureTaken.add(function (measurement, perimeter, url, letters) {
        console.log(url);
        planeDraws.push([url, '', letters, '', measurement, perimeter]);
        if (url) {
            measureURL = url;
        }
    });

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
        };

        var canvas2 = document.createElement("CANVAS");
        var context2 = canvas2.getContext('2d');
        var base = new Image();
        base.src = img2;
        base.onload = function () {
            canvas2.width = base.width;
            canvas2.height = base.height;
            context2.drawImage(base, 0, 0);
            header = canvas2.toDataURL();
        };
    }

    async function getJobData(filename) {
        house = document.getElementById('project_field').value;
        console.log(house);
        var result = $.ajax({
            method: 'GET',
            url: 'http://austinteets.com/doc.php',
            data: { "pnum": house },
            dataType: 'text',
            success: function (data) {
                console.log(data);
                downloadDoc(filename, JSON.parse(data)[0]);
            }
        });
    }

    async function switchToQA() {
        house = document.getElementById('project_field').value;
        console.log(house);
        var result = $.ajax({
            method: 'GET',
            url: 'http://austinteets.com/doc.php',
            data: { "pnum": house },
            dataType: 'text',
            success: function (data) {
                switch_page(data, measureURL);
            }
        });
    }

    function switch_page(data, measureURL) {
        signals.questionPage.dispatch(data, measureURL);
    }

    signals.download.add(function (filename) {
        getJobData(filename);
    });

    function downloadDoc(filename, db) {
        var alphaList = [];
        console.log(db);
        if (db == null) {
            db = { "address": "", "zip": "", "storeNum": "", "projectNum" : "", "firstName" : "", "lastName" : "", "phone" : "", "installer" : ""};
        }

        var pdf = new jsPDF('landscape', 'pt', 'letter');
        var offset = 0;
        pdf.setFont('times');
        pdf.setFontSize(30);

        var maxLet = 0;
        console.log(planeDraws);
        planeDraws.forEach(function (element) {
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
        console.log(blobpdf);
        writeBlobPDFToFile(Windows.Security.Cryptography.CryptographicBuffer.convertStringToBinary(blobpdf, Windows.Security.Cryptography.BinaryStringEncoding.Utf8), filename);
    }

    return container;

};