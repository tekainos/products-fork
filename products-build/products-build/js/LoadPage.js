var Load = function (editor) {
    // Editor Aliases 
    var signals = editor.signals;
    var camera = editor.camera;
    var tempCam = editor.camera;
    var scene = editor.scene;
    var config = editor.config;

    // Splash Dom Element
    var container = new UI.Panel();
    container.dom.id = 'loadingPage';
    container.dom.className = 'NamePage';

    var internal = document.createElement('div');
    internal.className = "NameBox";
    internal.appendChild(document.createTextNode("Tekainos"));

    container.dom.appendChild(internal);

    return container;
};