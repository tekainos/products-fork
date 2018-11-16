var Upload = function (editor) {
    // Editor Aliases 
    var signals = editor.signals;
    var camera = editor.camera;
    var tempCam = editor.camera;
    var scene = editor.scene;
    var config = editor.config;

    // Splash Dom Element

    var container = document.getElementById("uploadPage");

    var loadbutt = document.getElementById("uploadButton");
    loadbutt.onclick = function () {
        pickSingleFile();
    };
    
    return container;
};