var Upload = function (editor) {
    // Editor Aliases 
    var signals = editor.signals;
    var camera = editor.camera;
    var tempCam = editor.camera;
    var scene = editor.scene;
    var config = editor.config;

    // Splash Dom Element

    var container = new UI.Panel();
    container.setId('uploadPage');
    container.dom.className = 'NavPage appPage';

    var internal = document.createElement('div');
    internal.className = "InternalFrame";

    var bx0 = document.createElement("div");
    bx0.id = "UploadBox";
    bx0.className = 'BigBox';

    var h0 = document.createElement('h1');
    h0.className = "block-title";
    h0.appendChild(document.createTextNode("Upload"));
    bx0.appendChild(h0);
    
    var loadbutt = new UI.Button("Upload");
    loadbutt.dom.style.width = '30%';
    loadbutt.dom.style.color = 'black';
    loadbutt.dom.onclick = function () {
        pickSingleFile();
    };
    bx0.appendChild(loadbutt.dom);


    internal.appendChild(bx0);

    container.dom.appendChild(internal);

    return container;
};