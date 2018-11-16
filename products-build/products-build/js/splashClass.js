var Splash = function (editor) {
    // Editor Aliases 
    var signals = editor.signals;
    var camera = editor.camera;
    var tempCam = editor.camera;
    var scene = editor.scene;
    var config = editor.config;

    // Splash Dom Element
    var container = document.getElementById('splashPage');

    var bx0 = document.getElementById("ViewportBox");
    bx0.onclick = function () {
        signals.changePage.dispatch('viewport', true);
    };

    var bx1 = document.getElementById("FormBox");
    bx1.onclick = function () {
        signals.changePage.dispatch('questionPage', true);
    };

    var bx2 = document.getElementById("DocumentBox");
    bx2.onclick = function () {
        signals.changePage.dispatch('uploadPage', true);
    };

    var bx3 = document.getElementById("SubmitBox");
    bx3.onclick = function () {
        signals.savePDF.dispatch();
        signals.changePage.dispatch('submitPage', true);
    };

    return container;
};