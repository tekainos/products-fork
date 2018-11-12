var Submit = function (editor) {
    // Editor Aliases 
    var signals = editor.signals;
    var camera = editor.camera;
    var tempCam = editor.camera;
    var scene = editor.scene;
    var config = editor.config;

    // Splash Dom Element
    var container = new UI.Panel();
    container.setId('submitPage');
    container.dom.className = 'NavPage appPage';

    var internal = document.createElement('div');
    internal.className = "InternalFrame";

    var bx0 = document.createElement("div");
    bx0.id = "UploadBox";
    bx0.className = 'BigBox';

    var h0 = document.createElement('h1');
    h0.className = "block-title";
    h0.appendChild(document.createTextNode("Submit"));
    bx0.appendChild(h0);

    var selVers = document.createElement("select");
    selVers.className = "selectVersion";
    var opt = document.createElement("option");
    opt.text = "Draft";
    selVers.appendChild(opt);

    var opt2 = document.createElement("option");
    opt2.text = "Final";
    selVers.appendChild(opt2);

    var opt3 = document.createElement("option");
    opt3.text = "Refigure";
    selVers.appendChild(opt3);

    var canvBox = document.createElement("div");
    canvBox.className = "canvasBox";
    canvBox.id = "canvBox";
    bx0.appendChild(canvBox);

    var div2 = document.createElement("div");
    div2.className = "submitDiv";
    
    div2.appendChild(selVers);

    var name = document.createElement("input");
    name.className = "nameInput";
    name.placeholder = "Submission Name";
    div2.appendChild(name);

    var notes = document.createElement("textarea");
    notes.className = 'submitNotes';
    notes.placeholder = 'Notes';
    div2.appendChild(notes);

    bx0.appendChild(div2);

    var lines = document.createElement("button");
    lines.innerHTML = "Submit";
    lines.id = 'submitProject';
    lines.className = "submitPageButton";
    lines.style.width = "80%";
    lines.onclick = function () {
        editor.signals.uploadJson.dispatch();
    };
    bx0.appendChild(lines);
    
    internal.appendChild(bx0);

    container.dom.appendChild(internal);

    return container;
};