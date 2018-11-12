var JobLoad = function (editor) {
    // Editor Aliases 
    var signals = editor.signals;
    var camera = editor.camera;
    var tempCam = editor.camera;
    var scene = editor.scene;
    var config = editor.config;

    // Splash Dom Element
    var container = new UI.Panel();
    container.setId('loadJob');
    container.dom.className = 'NavDark appPage';

    var internal = document.createElement('div');
    internal.className = "InternalBox";
    internal.style.width = '75%';
    internal.style.marginLeft = '12.5%';
    

    var bx0 = document.createElement("div");
    bx0.id = "JobBox";
    bx0.className = 'DarkBox';
    
    var tekainos = document.createElement("div");
    tekainos.className = "NameBox";
    tekainos.appendChild(document.createTextNode("Tekainos"));
    container.dom.appendChild(tekainos);
    
    var bx1 = document.createElement("div");
    bx1.id = "CreateJobBox";
    bx1.className = 'splashBox';
    bx1.style.cssFloat = 'left';
    var h1 = document.createElement('h1');
    h1.className = "block-title";
    h1.appendChild(document.createTextNode("Create Job"));
    bx1.appendChild(h1);

    var txt1 = document.createElement('div');
    txt1.className = "LoremIpsum";
    txt1.appendChild(document.createTextNode('Create a new job to be saved locally or assigned to project number at a future date.'));
    bx1.appendChild(txt1);

    bx1.onclick = function () {
        signals.changePage.dispatch('makeJob', true, 'loadJob');
    };
    bx0.appendChild(bx1);

    var bx2 = document.createElement("div");
    bx2.id = "LoadLocalBox";
    bx2.className = 'splashBox';
    bx2.style.cssFloat = 'left';
    var h2 = document.createElement('h1');
    h2.className = "block-title";
    h2.appendChild(document.createTextNode("Load Local"));
    bx2.appendChild(h2);

    var txt2 = document.createElement('div');
    txt2.className = "LoremIpsum";
    txt2.appendChild(document.createTextNode('Load a job that has been saved locally to this device.'));
    bx2.appendChild(txt2);

    bx2.onclick = function () {
        editor.signals.loadLocal.dispatch();
        $('#loadJob').hide();
        $('#sidebar').show();
        $('#menubar').show();
        signals.changePage.dispatch('splashPage', false);
    };
    bx0.appendChild(bx2);

    var bx3 = document.createElement("div");
    bx3.id = "LoadIMSBox";
    bx3.className = 'splashBox';
    bx3.style.cssFloat = 'left';
    var h3 = document.createElement('h1');
    h3.className = "block-title";
    h3.appendChild(document.createTextNode("Load From IMS"));
    bx3.appendChild(h3);

    var txt3 = document.createElement('div');
    txt3.className = "LoremIpsum";
    txt3.appendChild(document.createTextNode('Load a job from the cloud that has been assigned to this account.'));
    bx3.appendChild(txt3);

    bx3.onclick = function () {
        signals.changePage.dispatch('Home', true, 'loadJob');
    };
    bx0.appendChild(bx3);

    var bx4 = document.createElement("div");
    bx4.id = "UploadJobBox";
    bx4.className = 'splashBox';
    bx4.style.cssFloat = 'left';

    var h4 = document.createElement('h1');
    h4.className = "block-title";
    h4.appendChild(document.createTextNode("Upload"));
    bx4.appendChild(h4);

    var txt4 = document.createElement('div');
    txt4.className = "LoremIpsum";
    txt4.appendChild(document.createTextNode('Upload jobs that have been saved locally, assign them to a project number, or share with another account'));
    bx4.appendChild(txt4);

    bx4.onclick = function () {
        $('#loadJob').hide();
        $('#sidebar').show();
        $('#menubar').show();
        signals.changePage.dispatch('splashPage', false);
    };
    bx0.appendChild(bx4);

    signals.offlineMode.add(function (user) {
        $(bx4).hide();
        $(bx3).hide();
    });

    internal.appendChild(bx0);

    container.dom.appendChild(internal);

    return container;
};