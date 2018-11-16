var JobLoad = function (editor) {
    // Editor Aliases 
    var signals = editor.signals;
    var camera = editor.camera;
    var tempCam = editor.camera;
    var scene = editor.scene;
    var config = editor.config;

    var bx0 = document.getElementById("JobBox");

    var bx1 = document.getElementById("CreateJobBox");
    bx1.onclick = function () {
        signals.changePage.dispatch('makeJob', true, 'loadJob');
    };

    var bx2 = document.getElementById("LoadLocalBox");
    bx2.onclick = function () {
        editor.signals.loadLocal.dispatch();
        $('#loadJob').hide();
        $('#sidebar').show();
        $('#menubar').show();
        signals.changePage.dispatch('splashPage', false);
    };

    var bx3 = document.getElementById("LoadIMSBox");
    bx3.onclick = function () {
        signals.changePage.dispatch('Home', true, 'loadJob');
    };

    var bx4 = document.getElementById("UploadJobBox");
    bx4.onclick = function () {
        signals.changePage.dispatch('productsPage', true, 'loadJob');
    };

    signals.offlineMode.add(function (user) {
        $(bx4).hide();
        $(bx3).hide();
    });

    return bx0;
};