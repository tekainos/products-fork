var fn;
var editor = new Editor();

var makerjs = require('makerjs');

document.body.style.backgroundColor = '#555222';

var backButt = makeBackButton();
backButt.id = 'backButton';
backButt.addEventListener('click', function (event) {
    editor.signals.changePage.dispatch('splashPage', false);
});
backButt.style.display = 'none';
document.body.appendChild(backButt);

var login = new Login(editor);
document.body.appendChild(login.dom);
login.dom.style.display = 'none';
login.dom.className = 'appPage';

var loadJob = new JobLoad(editor);
document.body.appendChild(loadJob.dom);
loadJob.dom.style.display = 'none';

var makeJob = new JobCreator(editor);
document.body.appendChild(makeJob.dom);
makeJob.dom.style.display = 'none';

var tileEditor = new TileEditor(editor);
document.body.appendChild(tileEditor.dom);
tileEditor.dom.style.display = 'none';

var splash = new Splash(editor);
document.body.appendChild(splash.dom);
splash.dom.style.display = 'none';

window.addEventListener("load", function (event) {
    var login = document.getElementById('login');
    login.style.display = 'block';
});

var upload = new Upload(editor);
document.body.appendChild(upload.dom);
upload.dom.style.display = 'none';

var submit = new Submit(editor);
document.body.appendChild(submit.dom);
submit.dom.style.display = 'none';

var viewport = new Viewport(editor);
document.body.appendChild(viewport.dom);
viewport.dom.style.display = 'none';
viewport.dom.className = 'appPage';
/*
$.getJSON("JSON/QA.json", function (json) {
    var resp = new Form(editor, json);
    document.body.appendChild(resp[0].dom);
    for (var i = 0; i < resp[1]; i++) {
        $("input[type='radio'][name='radio-" + i + "']").checkboxradio({icon: false});
        $("input[type='radio'][name='radio-" + i + "']").change(function () {
            editor.signals.questionAnswered.dispatch(this.id);
        });
    }
    resp[0].dom.style.display = 'none';
});*/

$.ajax({
    url: "http://austinteets.com/getjson.php",
    data: {},
    dataType: 'json',
    success: function (json) {
        json = JSON.parse(json[0].tekjson.replace(/\'/g, '"'));
        var resp = new Form(editor, json);
        document.body.appendChild(resp[0].dom);
        for (var i = 0; i < resp[1]; i++) {
            $("input[type='radio'][name='radio-" + i + "']").checkboxradio({ icon: false });
            $("input[type='radio'][name='radio-" + i + "']").change(function () {
                editor.signals.questionAnswered.dispatch(this.id);
            });
        }
        resp[0].dom.style.display = 'none';
    }, error: function () {
        $.getJSON("JSON/QA.json", function (json) {
            var resp = new Form(editor, json);
            document.body.appendChild(resp[0].dom);
            for (var i = 0; i < resp[1]; i++) {
                $("input[type='radio'][name='radio-" + i + "']").checkboxradio({ icon: false });
                $("input[type='radio'][name='radio-" + i + "']").change(function () {
                    editor.signals.questionAnswered.dispatch(this.id);
                });
            }
            resp[0].dom.style.display = 'none';
        });
    }
});

//var menubar = new Menubar( editor );
//document.body.appendChild( menubar.dom );

var isMobile = false; //initiate as false

var sidebar = new Sidebar(editor);
document.body.appendChild(sidebar.dom);
sidebar.dom.style.display = 'none';

var menubar = new Menubar(editor);
document.body.appendChild(menubar.container.dom);
menubar.container.dom.style.display = 'none';

editor.setTheme(editor.config.getKey('theme'));

//var elem = document.getElementById('sidebar');
//elem.style.height = '100%';
//elem = document.getElementById('viewport');
//elem.style.height = '100%';

var config = editor.config;

var rendererTypes = {

    'WebGLRenderer': THREE.WebGLRenderer,
    'CanvasRenderer': THREE.CanvasRenderer,
    'SVGRenderer': THREE.SVGRenderer,
    'SoftwareRenderer': THREE.SoftwareRenderer,
    'RaytracingRenderer': THREE.RaytracingRenderer

};

function createRenderer(type, antialias, shadows, gammaIn, gammaOut) {

    if (type === 'WebGLRenderer' && System.support.webgl === false) {

        type = 'CanvasRenderer';

    }

    var renderer = new rendererTypes[type]({ antialias: antialias });
    renderer.gammaInput = gammaIn;
    renderer.gammaOutput = gammaOut;
    if (shadows && renderer.shadowMap) {

        renderer.shadowMap.enabled = true;
        // renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    }

    editor.signals.rendererChanged.dispatch(renderer);

}

createRenderer(config.getKey('project/renderer'), config.getKey('project/renderer/antialias'), config.getKey('project/renderer/shadows'), config.getKey('project/renderer/gammaInput'), config.getKey('project/renderer/gammaOutput'));


function hideAll() {
    $('.appPage').hide();
}

editor.signals.changePage.add(function (page, back, backret) {
    hideAll();
    var pg = document.getElementById(page);
    pg.style.display = 'block';
    var bk = document.getElementById('backButton');
    bk.style.display = back ? 'block' : 'none';
    bk.onclick = backret ? function () {
        editor.signals.changePage.dispatch(backret, false);
    } : function () {
        editor.signals.changePage.dispatch('splashPage', false);
    };
    page === 'viewport' ? editor.signals.windowResize.dispatch() : null;
});

editor.signals.editorCleared.add(function () {
    console.log("Reload");
    window.location.reload(true);
});

editor.signals.tileEditor.add(function () {
    tileEditor.dom.style.display = 'block';
});

editor.signals.hideTile.add(function () {
    tileEditor.dom.style.display = 'none';
});

/*editor.signals.cleanLayouts.add(function () {
    var tbarCheck = document.getElementById('toolbar');
    if (tbarCheck) {
        tbarCheck.parentNode.removeChild(tbarCheck);
        viewport.dom.style.height = '100%';
        editor.signals.windowResize.dispatch();
    }
});
*/

if (localStorage.TM3DPacket) {
    var packet = JSON.parse(localStorage.getItem("TM3DPacket"));
    editor.signals.loadPlanes.dispatch(packet);
} else {
    editor.signals.loadPlanes.dispatch('');
}

document.addEventListener('dragover', function (event) {

    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';

}, false);

document.addEventListener('drop', function (event) {

    event.preventDefault();

    if (event.dataTransfer.files.length > 0) {

        editor.loader.loadFile(event.dataTransfer.files[0]);

    }

}, false);


/* 
	All Room Viewer additions to editor

*/


document.addEventListener('keydown', function (event) {

    switch (event.keyCode) {

        case 90: // Register Ctrl-Z for Undo, Ctrl-Shift-Z for Redo

            if (event.ctrlKey && event.shiftKey) {
                editor.redo();
            } else if (event.ctrlKey) {
                editor.undo();
            }
            break;

        case 87: // Register W for translation transform mode
            var output = editor.scene.toJSON();
            try {
                output = JSON.stringify(output, null, '\t');
                output = output.replace(/[\n\t]+([\d\.e\-\[\]]+)/g, '$1');
            } catch (e) {
                output = JSON.stringify(output);
            }
            //save( new Blob( [ output ], { type: 'text/plain' } ), fn );

            //editor.signals.transformModeChanged.dispatch( '' );
            break;

        case 69: // Register E for rotation transform mode
            editor.signals.transformModeChanged.dispatch('rotate');
            break;

        case 82: // Register R for scaling transform mode
            editor.signals.transformModeChanged.dispatch('scale');
            break;
    }

}, false);

var link = document.createElement('a');
link.style.display = 'none';
document.body.appendChild(link);

function save(blob, filename) {

    link.href = URL.createObjectURL(blob);
    link.download = filename || 'data.json';
    link.click();

    // URL.revokeObjectURL( url ); breaks Firefox...

}


function onWindowResize(event) {

    editor.signals.windowResize.dispatch();

}

window.addEventListener('resize', onWindowResize, false);

onWindowResize();

//

var isLoadingFromHash = false;
var hash = window.location.hash;

if (hash.substr(1, 5) === 'file=') {

    var file = hash.substr(6);

    if (confirm('Any unsaved data will be lost. Are you sure?')) {

        var loader = new THREE.FileLoader();
        loader.crossOrigin = '';
        loader.load(file, function (text) {

            editor.clear();
            editor.fromJSON(JSON.parse(text));

        });

        isLoadingFromHash = true;

    }
}


function makeBackButton() {

    var canvas = document.createElement("CANVAS");
    canvas.className = 'backButt';
    canvas.width = 100;
    canvas.height = 50;

    var ctx = canvas.getContext("2d");

    var img = new Image();
    img.src = 'icon/back-MCTR.png';
    img.onload = function () {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.font = '20px helvetica, sans-serif';
        ctx.fillStyle = "#004690";
        ctx.fillText('Back', 40, 32);
    }
    /*
    
    ctx.fillStyle = '#003a77';
    ctx.moveTo(5, 25);
    
    ctx.strokeStyle = "#444";
    ctx.beginPath();
    ctx.lineTo(25, 5);
    ctx.lineTo(25, 15);
    ctx.lineTo(75, 15);
    ctx.lineTo(75, 35);
    ctx.lineTo(25, 35);
    ctx.lineTo(25, 45);
    ctx.lineTo(5, 25);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.font = '14px helvetica, sans-serif';
    ctx.fillStyle = 'white';
    ctx.textBaseline = 'bottom';
    ctx.fillText('Back', 30, 32);
    */
    //canvDiv.appendChild(canvas);
    return canvas;
}


