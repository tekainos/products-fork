var Submit = function (editor) {
    // Editor Aliases 
    var signals = editor.signals;
    var camera = editor.camera;
    var tempCam = editor.camera;
    var scene = editor.scene;
    var config = editor.config;

    // Splash Dom Element
    var container = document.getElementById('submitPage');

    var lines = document.getElementById("submitProject");
    lines.onclick = function () {
        editor.signals.uploadJson.dispatch();
    };

    return container;
};