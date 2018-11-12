paintClass = function (editor) {

    var signals = editor.signals;

    var config = editor.config;

    var history = editor.history;

    var scene = editor.scene;

    var container = new UI.Panel();

    var faceList = [];

    var firstLoad = true;

    var colorList = [];
    var curColor;
    var planefunct = 0;

    var oldHi = [3, 3];

    var xy = [260, 260];

    var currentCanvas = [];
    var currentComp;

    container.add(new UI.Text('Color Selector'));
    container.add(new UI.Break(), new UI.Break());

    var selectRow = new UI.Row();
    selectRow.add(new UI.Text('Select Brand').setWidth('120px'));

    var company = new UI.Select().setWidth('130px');
    var selOps = [];
    company.setId('brandSelect');
    company.setOptions([]);

    selectRow.add(company);

    container.add(selectRow);

    container.add(new UI.Break());

    var canvas = document.createElement("CANVAS");
    var ctx = canvas.getContext("2d");
    canvas.width = 266;
    canvas.height = 266;

    var canSelect = document.createElement("CANVAS");
    var ctSelect = canSelect.getContext("2d");
    canSelect.width = 70;
    canSelect.height = 70;

    var doubleBox = document.createElement("div");
    doubleBox.style.width = '290px';
    doubleBox.style.height = '70px';


    var selectBox = document.createElement("div");
    selectBox.style.width = '70px';
    selectBox.style.height = '70px';
    selectBox.style.float = 'left';
    selectBox.style.backgroundColor = '#222';
    selectBox.style.border = '5px solid gray';
    selectBox.style.marginBottom = '10px';
    selectBox.appendChild(canSelect);

    var selectText = document.createElement("textarea");
    selectText.setAttribute('id', 'selected');
    selectText.setAttribute('readonly', true);
    selectText.style.resize = 'none';
    selectText.style.width = '170px';
    selectText.style.height = '70px';
    selectText.style.float = 'right';
    selectText.value = 'Choose a color';

    doubleBox.appendChild(selectText);
    doubleBox.appendChild(selectBox);

    var scrollBox = document.createElement("div");
    scrollBox.style.marginTop = '10px';
    scrollBox.style.width = '290px';
    scrollBox.style.height = '300px';
    scrollBox.style.overflow = 'auto';
    scrollBox.style.backgroundColor = '#222';
    scrollBox.appendChild(canvas);



    var search = document.createElement("input");
    search.setAttribute('type', 'text');
    search.style.marginTop = '10px';
    search.style.width = '290px';
    search.placeholder = 'Search by name or code';
    var searchVal = search.value;


    container.dom.appendChild(doubleBox);
    container.dom.appendChild(search);
    container.dom.appendChild(scrollBox);

    container.add(new UI.Break());

    var buttonRow = new UI.Row();
    var download = new UI.Button('Create Shopping List');
    download.onClick(function () {
        var paintsNeeded = [];
        faceList.forEach(function (item) {
            if (paintsNeeded[item[2][0]] == undefined) {
                paintsNeeded[item[2][0]] = [item[2][1], Number(item[1])];
            } else {
                paintsNeeded[item[2][0]][1] += Number(item[1]);
            }
        });
        var csv = 'Brand,Paint,Code,Area(Sq Ft),Gallons(Per Coat),Quarts(Per Coat),\n';
        for (var keys in paintsNeeded) {
            var gal = (Number(paintsNeeded[keys][1]) / 325).toFixed(2);
            var qt = Math.ceil(Number(paintsNeeded[keys][1]) / 100);
            var ar = Number(paintsNeeded[keys][1]).toFixed(2);
            csv += currentComp + ',' + keys + ',' + paintsNeeded[keys][0] + ',' + ar + ',' + gal + ',' + qt;
            csv += '\n';
        }
        var hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
        hiddenElement.target = '_blank';

        hiddenElement.download = 'paintList.csv';
        hiddenElement.click();
    });
    buttonRow.add(download);

    var clearALL = new UI.Button('Clear Paint');
    clearALL.dom.style.cssFloat = 'right';
    clearALL.onClick(function () {
        signals.clearColor.dispatch();
        faceList = [];
    });
    buttonRow.add(clearALL);

    container.add(buttonRow);

    var restricted = false;
    var reString = '';


    var file1 = 'colors/olympic.csv';
    var file2 = 'colors/sherwinwilliams.csv';
    var file3 = 'colors/valspar.csv';
    readTextFile(file1);
    readTextFile(file2);
    readTextFile(file3);

    function drawCanvas(comp, restrict, string) {
        currentCanvas = [];
        currentComp = comp;
        ctx.clearRect(0, 0, xy[0] + 3, xy[1]);

        var xMax = 266;
        var x = -20;
        var y = 6;
        colorList[comp].forEach(function (element) {
            if (element[0] != undefined) {
                var name = element[0].toLowerCase();
                var id = element[1].toLowerCase();
                string = string.toLowerCase();
                if ((restrict && (name.includes(string) || id.includes(string))) || !restrict) {
                    if (x < xMax - 26) {
                        x += 26;
                    } else {
                        x = 6;
                        y += 26;
                    } if (y >= canvas.height) {
                        canvas.height = canvas.height + 26;
                    }
                    ctx.fillStyle = element[2];
                    ctx.fillRect(x, y, 20, 20)
                    currentCanvas.push([x, y, element]);
                }
            }
        });
        if (y >= xy[1]) {
            xy[1] = y + 20;
            maxY = xy[1];
        } else {
            xy[1] = maxY;
        }
    }

    function readTextFile(file) {
        var rawFile = new XMLHttpRequest();
        rawFile.open("GET", file, true);
        rawFile.onreadystatechange = function () {
            if (rawFile.readyState === 4) {
                if (rawFile.status === 200 || rawFile.status == 0) {
                    var allText = rawFile.responseText;
                    var read = CSVToArray(allText);
                    signals.fileRead.dispatch(read);
                }
            }
        }
        rawFile.send(null);
    }


    function CSVToArray(strData, strDelimiter) {
        strDelimiter = (strDelimiter || ",");
        var objPattern = new RegExp(
            (
                // Delimiters.
                "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
                // Quoted fields.
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
                // Standard fields.
                "([^\"\\" + strDelimiter + "\\r\\n]*))"
            ),
            "gi"
        );
        var arrData = [[]];
        var arrMatches = null;
        while (arrMatches = objPattern.exec(strData)) {
            var strMatchedDelimiter = arrMatches[1];
            if (
                strMatchedDelimiter.length &&
                (strMatchedDelimiter != strDelimiter)
            ) {
                arrData.push([]);
            }
            if (arrMatches[2]) {
                var strMatchedValue = arrMatches[2].replace(
                    new RegExp("\"\"", "g"),
                    "\""
                );
            } else {
                var strMatchedValue = arrMatches[3];
            }
            arrData[arrData.length - 1].push(strMatchedValue);
        }
        return (arrData);
    }
    signals.fileRead.add(function (array) {
        var colorName = array[1][0];
        if (colorList[colorName] == undefined) {
            colorList[colorName] = [];
        }
        array.forEach(function (element) {
            if (element[0] != undefined) {
                var temp = [];
                var rgb = 'rgb( ' + element[3] + ', ' + element[4] + ', ' + element[5] + ')';
                temp.push(element[1]);
                temp.push(element[2]);
                temp.push(rgb);
                colorList[colorName].push(temp);
            }
        });
        selOps[colorName] = colorName;
        company.setOptions(selOps);
        company.dom.options[0].defaultSelected = true;
        if (firstLoad) {
            drawCanvas(company.dom.options[0].value, false, '');
            drawCanvas(company.dom.options[0].value, false, '');
            firstLoad = false;
        }
    });

    function updateSelect(element) {
        ctSelect.fillStyle = element[2][2];
        ctSelect.fillRect(0, 0, 70, 70);
        selectText.value = 'Name: ' + element[2][0] + '\n' + 'ID:   ' + element[2][1];
        curColor = [element[2][0], element[2][1]];
        signals.colorChange.dispatch(element[2][2]);
    }
    function checkSearch() {
        if (searchVal != search.value) {
            scrollBox.scrollTop = 0;
            searchVal = search.value;
            restricted = true;
            reString = searchVal;
            drawCanvas(currentComp, restricted, searchVal);
            drawCanvas(currentComp, restricted, searchVal);
        }
    }

    function getCursorPosition(event) {
        var rect = canvas.getBoundingClientRect();
        var box = scrollBox.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;

        var xx = event.clientX - box.left;
        var yy = event.clientY - box.top;
        if (x >= 0 && y >= 0 && xx >= 0 && yy >= 0 && yy <= 300) {
            currentCanvas.forEach(function (element) {
                if (x >= element[0] && x <= element[0] + 20 && y >= element[1] && y <= element[1] + 20) {
                    drawCanvas(currentComp, restricted, reString);
                    drawCanvas(currentComp, restricted, reString);
                    var hiX = element[0] - 3;
                    var hiY = element[1] - 3;
                    ctx.beginPath();
                    ctx.lineWidth = "6";
                    ctx.strokeStyle = "red";
                    ctx.rect(hiX, hiY, 23, 23);
                    ctx.stroke();
                    updateSelect(element);
                }
            });
        }
    }

    function checkFaceList(face, SA) {
        for (var i = faceList.length - 1; i >= 0; i--) {
            if (faceList[i][0] == face.object.name && faceList[i][1] == SA) {
                faceList.splice(i, 1);
            }
        }
    }

    signals.compSwitch.add(function (compVal) {
        scrollBox.scrollTop = 0;
        drawCanvas(compVal, false, '');
        drawCanvas(compVal, false, '');
        ctSelect.clearRect(0, 0, 70, 70);
        selectText.value = 'Choose a Color';
        search.value = '';
        restricted = false;
        searchVal = '';
    });

    signals.refreshSidebarObject3D.add(function (face, SA) {
        if (face && planefunct == 1) {
            checkFaceList(face, SA);
            faceList.push([face.object.name, SA, curColor]);
        } else if (planefunct == 2 && Number(SA) < 0) {
            var ind = -1;
            for (var i = 0; i < faceList.length; i++) {
                if (faceList[i][0] == face.object.name && Number(SA) * -1 == Number(faceList[i][1])) {
                    ind = i;
                }
            }
            if (ind >= 0) {
                faceList.splice(ind, 1);
            }
        }
    });
    signals.toolChange.add(function (tool) {
        if (tool == 'paint') {
            planefunct = 1;
        } else if (tool == 'counter') {
            planefunct = 2;
        } else {
            planefunct = 0;
        }
    });

    container.dom.addEventListener('keyup', checkSearch, false);
    container.dom.addEventListener('mousedown', getCursorPosition, false);
    return container;
};