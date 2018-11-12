var Splash = function (editor) {
    // Editor Aliases 
    var signals = editor.signals;
    var camera = editor.camera;
    var tempCam = editor.camera;
    var scene = editor.scene;
    var config = editor.config;

    // Splash Dom Element
    var container = new UI.Panel();
    container.setId('splashPage');
    container.dom.className = 'NavPage appPage';

    var internal = document.createElement('div');
    internal.className = "InternalBox";

    var bx0 = document.createElement("div");
    bx0.id = "ViewportBox";
    bx0.className = 'splashBox';
    bx0.style.cssFloat = 'left';

    var img0 = document.createElement('img');
    img0.src = '/icon/bluetooth-REC.png';
    img0.className = 'NavIcon';
    bx0.appendChild(img0);

    var h0 = document.createElement('h1');
    h0.className = "block-title";
    h0.appendChild(document.createTextNode("Measure"));
    bx0.appendChild(h0);

    var txt = document.createElement('div');
    txt.className = "LoremIpsum";
    txt.appendChild(document.createTextNode(' Capture room measurements, add room features such as stairs, cabinets, doors, pillars.  Select new flooring type, layout patterns and directions, and  seam placement .  Calculate material sizes needed.'));
    
    bx0.appendChild(txt);
    bx0.onclick = function () {
        signals.changePage.dispatch('viewport', true);
    }
    internal.appendChild(bx0);

    var bx1 = document.createElement("div");
    bx1.id = "FormBox";
    bx1.className = 'splashBox';
    bx1.style.cssFloat = 'right';

    var img1 = document.createElement('img');
    img1.src = '/icon/note-REC.png';
    img1.className = 'NavIcon';
    bx1.appendChild(img1);

    var h1 = document.createElement('h1');
    h1.className = "block-title";
    h1.appendChild(document.createTextNode("Estimate"));

    bx1.appendChild(h1);

    var txt2 = document.createElement('div');
    txt2.className = "LoremIpsum";
    txt2.appendChild(document.createTextNode('Enter home and room project information, demolition and preparation requirements, appliance and fixture movement, and select new product materials.'));

    bx1.appendChild(txt2);
    bx1.onclick = function () {
        signals.changePage.dispatch('questionPage', true);
    }
    internal.appendChild(bx1);

    var bx2 = document.createElement("div");
    bx2.id = "DocumentBox";
    bx2.className = 'splashBox';
    bx2.style.cssFloat = 'left';

    var img2 = document.createElement('img');
    img2.src = '/icon/upload-REC.png';
    img2.className = 'NavIcon';
    bx2.appendChild(img2);

    var h2 = document.createElement('h1');
    h2.className = "block-title";
    h2.appendChild(document.createTextNode("Attach"));
    bx2.appendChild(h2);

    var txty = document.createElement('div');
    txty.className = "LoremIpsum";
    txty.appendChild(document.createTextNode('Save job photographs and documents such as spreadsheets and permits.'));

    bx2.appendChild(txty);
    bx2.onclick = function () {
        signals.changePage.dispatch('uploadPage', true);
    }
    internal.appendChild(bx2);

    var bx3 = document.createElement("div");
    bx3.id = "SubmitBox";
    bx3.className = 'splashBox';
    bx3.style.cssFloat = 'right';

    var img3 = document.createElement('img');
    img3.src = '/icon/approve-REC.png';
    img3.className = 'NavIcon';
    bx3.appendChild(img3);

    var h3 = document.createElement('h1');
    h3.className = "block-title";
    h3.appendChild(document.createTextNode("Submit"));
    bx3.appendChild(h3);

    var txt3 = document.createElement('div');
    txt3.className = "LoremIpsum";
    txt3.appendChild(document.createTextNode(' Submit completed projects to enter into the bid process defined by your organization.'));

    bx3.appendChild(txt3);
    bx3.onclick = function () {
        signals.savePDF.dispatch();
        signals.changePage.dispatch('submitPage', true);
    }
    internal.appendChild(bx3);

    container.dom.appendChild(internal);

    return container;
};