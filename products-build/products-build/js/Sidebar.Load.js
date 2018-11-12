Sidebar.Load = function (editor) {
    var signals = editor.signals;

    var config = editor.config;

    var history = editor.history;

    var scene = editor.scene;

    var container = new UI.Panel();

    var reloadbutt = new UI.Button("Reload");
    reloadbutt.dom.style.width = '30%';
    reloadbutt.dom.style.cssFloat = 'right';
    reloadbutt.onClick(function () {
        signals.reloadBox.dispatch();
    });
    container.add(reloadbutt);

    container.add(new UI.Break(), new UI.Break());


    var scrollBox = document.createElement("div");
    scrollBox.style.marginTop = '10px';
    scrollBox.style.width = '290px';
    scrollBox.style.height = '300px';
    scrollBox.style.overflow = 'auto';
    scrollBox.style.backgroundColor = '#222';
    container.dom.appendChild(scrollBox);

    signals.reloadBox.add(function () {
        console.log("RELOAD");
        while (scrollBox.firstChild) {
            scrollBox.removeChild(scrollBox.firstChild);
        }
        $.ajax({
            url: 'http://Tekainos.com/TM2D.php',
            data: "",
            dataType: 'json',
            success: function (data) {
                for (var k = 0; k < data.length; k++) {
                    var load = new UI.Button(data[k]);
                    load.dom.style.width = '100%';
                    load.dom.style.backgroundColor = '#e7e7e7';
                    load.dom.style.marginTop = '10px';
                    load.dom.onclick = function () {
                        urltoload = "https://app.tapmeasure.io/view/" + this.textContent;
                        loadURL(urltoload);
                    };
                    scrollBox.appendChild(load.dom);
                }
            }
        });
    });

    function loadURL(val) {
        signals.cleanLayouts.dispatch();
        console.log(val);
        $.ajax({
            url: val,
            dataType: 'html',
            success: function (data) {
                console.log(data);
                var lines = data.split('\n');
                for (var line = 0; line < lines.length; line++) {
                    if (lines[line].startsWith("            var modelFromJson = JSON.parse")) {
                        linedata = lines[line].trim();
                        var stripped = linedata.replace("var modelFromJson = JSON.parse(\"", "");
                        stripped = stripped.replace("\");", "");
                        stripped = decodeURIComponent(JSON.parse('"' + stripped.replace(/\"/g, '\\"') + '"'));;
                        loadRoom(stripped);
                        loadico.dom.style.display = 'none';
                        url.style.display = 'block';
                        loadbutt.dom.style.display = 'block';
                    }
                }
            }
        });
    }


    function loadRoom(coords) {
        coor = JSON.parse(coords);
        for (var key in coor) {
            if (coor.hasOwnProperty(key)) {
                //console.log(key + " -> " + coor[key]);
            }
        }
        var packet = coor['roomShells'][0]['floorOutline'];
        signals.loadRoomModel.dispatch(packet);
    }


    var url = document.createElement("input");
    url.placeholder = 'Enter Tapmeasure URL';
    url.style.cssFloat = 'left';
    url.style.width = '60%'
    url.setAttribute("id", "url_field");
    container.dom.appendChild(url);

    var loadbutt = new UI.Button("Load");
    loadbutt.dom.style.width = '30%';
    loadbutt.dom.style.cssFloat = 'right';
    loadbutt.onClick(function () {
        loadURL(url.value);
    });
    container.add(loadbutt);

    var loadico = new UI.Text("LOADING");
    loadico.dom.style.display = 'none';
    container.add(loadico);

    return container;
};