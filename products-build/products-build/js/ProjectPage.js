var Project = function (editor) {
    // Editor Aliases 
    var signals = editor.signals;
    var camera = editor.camera;
    var tempCam = editor.camera;
    var scene = editor.scene;
    var config = editor.config;

    // Splash Dom Element
    var container = new UI.Panel();
    container.setId('project');
    container.dom.className = 'NavPage';

    var internal = document.createElement('div');
    internal.className = "InternalFrame";

    var bx0 = document.createElement("div");
    bx0.id = "ProjectBox";
    bx0.className = 'BigBox';

    var h0 = document.createElement('h1');
    h0.className = "block-title";
    h0.appendChild(document.createTextNode("Projects"));
    bx0.appendChild(h0);

    internal.appendChild(bx0);

    container.dom.appendChild(internal);



    return container;
};