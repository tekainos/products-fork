class Menubar {
    constructor(editor) {
        this._editor = editor;
        this._signals = editor.signals;
        this._container = document.getElementById('menubar');
        this._head = new MenuHead(editor);
    }

    get signals()   { return this._signals; }
    get container() { return this._container; }
}

MenuHead = function (editor) {

    var op1 = document.getElementById("menuop-logout");
    op1.onclick = function () {
        editor.clear();
    };

    var op2 = document.getElementById("menuop-save");
    op2.onclick = function () {
        editor.signals.savePacket.dispatch();
    };

    var op3 = document.getElementById("menuop-pdf");
    op3.onclick = function () {
        editor.signals.savePDF.dispatch();
    };

    var op4 = document.getElementById("menuop-export");
    op4.onclick = function () {
        editor.signals.exportDXF.dispatch();
    };

    var op41 = document.getElementById("menuop-exportObj");
    op41.onclick = function () {
        editor.signals.export.dispatch('OBJ');
    };

    var op42 = document.getElementById("menuop-exportStl");
    op42.onclick = function () {
        editor.signals.export.dispatch('STL');
    };
    var op5 = document.getElementById("menuop-tape");
    op5.onclick = function () {
        editor.signals.measure.dispatch();
    };

    var op6 = document.getElementById("menuop-addRoom");
    op6.onclick = function () {
        editor.signals.addRoom.dispatch();
    };

    var op7 = document.getElementById("menuop-addStair");
    op7.onclick = function () {
        editor.signals.addFeature.dispatch("Stairs");
    };

    var op8 = document.getElementById("menuop-addDoor");
    op8.onclick = function () {
        editor.signals.addFeature.dispatch("Door");
    };

    var op9 = document.getElementById("menuop-addCutout");
    op9.onclick = function () {
        editor.signals.floorFeature.dispatch();
    };

    var op10 = document.getElementById("menuop-drag");
    op10.onclick = function () {
        editor.signals.dragRoom.dispatch();
    };

    var op11 = document.getElementById("menuop-delete");
    op11.onclick = function () {
        editor.signals.deleteRoom.dispatch();
    };

    var op12 = document.getElementById("menuop-newLayout");
    op12.onclick = function () {
        editor.signals.layout.dispatch();
    };

    var op13 = document.getElementById("menuop-tseam");
    op13.onclick = function () {
        editor.signals.tseam.dispatch();
    };

    var op14 = document.getElementById("menuop-compress");
    op14.onclick = function () {
        editor.signals.compress.dispatch();
    };

    var op15 = document.getElementById("menuop-clear");
    op15.onclick = function () {
        editor.signals.clearLayout.dispatch();
    };

    var op16 = document.getElementById("menuop-camera");
    op16.onclick = function () {
        editor.signals.cameraSwitch.dispatch();
    };
    var op17 = document.getElementById("menuop-bluetooth");
    op17.onclick = function () {
        editor.signals.startWatcher.dispatch();
    };
};


/*
MenuSettings = function (editor) {
    var container = new UI.Panel();
    container.setClass('menu');

    var title = new UI.Panel();
    title.setClass('title');
    title.setTextContent('Settings');
    container.add(title);

    var options = new UI.Panel();
    options.setClass('options');
    container.add(options);

    //Camera Change
    var camswitch = new UI.Row();
    camswitch.setClass('option');
    camswitch.setTextContent('Change Camera');
    camswitch.onClick(function () {
        editor.signals.cameraSwitch.dispatch();
    });
    options.add(camswitch);
    options.add(new UI.HorizontalRule());

    //Camera Change
    var adddev = new UI.Row();
    adddev.setClass('option');
    adddev.setTextContent('Add Bluetooth Device');
    adddev.onClick(function () {
        editor.signals.startWatcher.dispatch();
    });
    options.add(adddev);
    options.add(new UI.HorizontalRule());

    return container;
}

MenuLayout = function (editor) {
    var container = new UI.Panel();
    container.setClass('menu');

    var title = new UI.Panel();
    title.setClass('title');
    title.setTextContent('Layout');
    container.add(title);

    var options = new UI.Panel();
    options.setClass('options');
    container.add(options);

    //Add Layout
    var addlayout = new UI.Row();
    addlayout.setClass('option');
    addlayout.setTextContent('New Layout');
    addlayout.onClick(function () {
        editor.signals.layout.dispatch();
    });
    options.add(addlayout);
    options.add(new UI.HorizontalRule());

    var addtseam = new UI.Row();
    addtseam.setClass('option');
    addtseam.setTextContent('T-Seam');
    addtseam.onClick(function () {
        editor.signals.tseam.dispatch();
    });
    options.add(addtseam);
    options.add(new UI.HorizontalRule());

    var compress = new UI.Row();
    compress.setClass('option');
    compress.setTextContent('Compress Roll');
    compress.onClick(function () {
        editor.signals.compress.dispatch();
    });
    options.add(compress);
    options.add(new UI.HorizontalRule());

    // Delete Layout
    var dellayout = new UI.Row();
    dellayout.setClass('option');
    dellayout.setTextContent('Clear Layout');
    dellayout.onClick(function () {
        editor.signals.clearLayout.dispatch();
    });
    options.add(dellayout);
    options.add(new UI.HorizontalRule());

    return container;
}

MenuInsert = function (editor) {
    var container = new UI.Panel();
    container.setClass('menu');

    var title = new UI.Panel();
    title.setClass('title');
    title.setTextContent('Edit');
    container.add(title);

    var options = new UI.Panel();
    options.setClass('options');
    container.add(options);

    //Measure
    var meas = new UI.Row();
    meas.setClass('option');
    meas.setTextContent('Tape Measure');
    meas.onClick(function () {
        editor.signals.measure.dispatch();
    });
    options.add(meas);
    options.add(new UI.HorizontalRule());

    //Add Room
    var addroom = new UI.Row();
    addroom.setClass('option');
    addroom.setTextContent('Add Room');
    addroom.onClick(function () {
        editor.signals.addRoom.dispatch();
    });
    options.add(addroom);
    options.add(new UI.HorizontalRule());

    //Add Stairs
    var addstair = new UI.Row();
    addstair.setClass('option');
    addstair.setTextContent('Add Stairs');
    addstair.onClick(function () {
        editor.signals.addFeature.dispatch("Stairs");
    });
    options.add(addstair);
    options.add(new UI.HorizontalRule());

    //Add Door
    var adddoor = new UI.Row();
    adddoor.setClass('option');
    adddoor.setTextContent('Add Wall Feature');
    adddoor.onClick(function () {
        editor.signals.addFeature.dispatch("Door");
    });
    options.add(adddoor);
    options.add(new UI.HorizontalRule());

    //Add Floor Feature
    var addfloor = new UI.Row();
    addfloor.setClass('option');
    addfloor.setTextContent('Add Room Feature');
    addfloor.onClick(function () {
        editor.signals.floorFeature.dispatch();
    });
    options.add(addfloor);
    options.add(new UI.HorizontalRule());

    // Drag Room
    var option2 = new UI.Row();
    option2.setClass('option');
    option2.setTextContent('Drag Room');
    option2.onClick(function () {
        editor.signals.dragRoom.dispatch();
    });
    options.add(option2);
    options.add(new UI.HorizontalRule());


    // Delete Room
    var option = new UI.Row();
    option.setClass('option');
    option.setTextContent('Delete Room');
    option.onClick(function () {
        editor.signals.deleteRoom.dispatch();
    });
    options.add(option);
    options.add(new UI.HorizontalRule());

    return container;
}


MenuFile = function (editor) {
    var config = editor.config;

    var container = new UI.Panel();
    container.setClass('menu');

    var title = new UI.Panel();
    title.setClass('title');
    title.setTextContent('File');
    container.add(title);

    var options = new UI.Panel();
    options.setClass('options');
    container.add(options);

    // New
    var option = new UI.Row();
    option.setClass('option');
    option.setTextContent('Logout');
    option.onClick(function () {
        editor.clear();
    });
    options.add(option);
    options.add(new UI.HorizontalRule());

    // Save Project
    var adddev = new UI.Row();
    adddev.setClass('option');
    adddev.setTextContent('Save Project');
    adddev.onClick(function () {
        editor.signals.savePacket.dispatch();
    });
    options.add(adddev);
    options.add(new UI.HorizontalRule());

    // Save Project
    var exp = new UI.Row();
    exp.setClass('option');
    exp.setTextContent('Save PDF');
    exp.onClick(function () {
        editor.signals.savePDF.dispatch();
    });
    options.add(exp);
    options.add(new UI.HorizontalRule());


    var exporter = new UI.Row();
    exporter.setClass('option');
    exporter.setTextContent('Export DXF');
    exporter.onClick(function () {
        editor.signals.exportDXF.dispatch();
    });
    options.add(exporter);
    options.add(new UI.HorizontalRule());

    /*

    var form = document.createElement('form');
    form.style.display = 'none';
    document.body.appendChild(form);

    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.addEventListener('change', function (event) {

        editor.loader.loadFile(fileInput.files[0]);
        form.reset();

    });
    form.appendChild(fileInput);

    var option = new UI.Row();
    option.setClass('option');
    option.setTextContent('Import');
    option.onClick(function () {

        fileInput.click();

    });
    options.add(option);

    //

    options.add(new UI.HorizontalRule());

    // Export Geometry

    var option = new UI.Row();
    option.setClass('option');
    option.setTextContent('Export Geometry');
    option.onClick(function () {

        var object = editor.selected;

        if (object === null) {

            alert('No object selected.');
            return;

        }

        var geometry = object.geometry;

        if (geometry === undefined) {

            alert('The selected object doesn\'t have geometry.');
            return;

        }

        var output = geometry.toJSON();

        try {

            output = JSON.stringify(output, parseNumber, '\t');
            output = output.replace(/[\n\t]+([\d\.e\-\[\]]+)/g, '$1');

        } catch (e) {

            output = JSON.stringify(output);

        }

        saveString(output, 'geometry.json');

    });
    options.add(option);

    // Export Object

    var option = new UI.Row();
    option.setClass('option');
    option.setTextContent('Export Object');
    option.onClick(function () {

        var object = editor.selected;

        if (object === null) {

            alert('No object selected');
            return;

        }

        var output = object.toJSON();

        try {

            output = JSON.stringify(output, parseNumber, '\t');
            output = output.replace(/[\n\t]+([\d\.e\-\[\]]+)/g, '$1');

        } catch (e) {

            output = JSON.stringify(output);

        }

        saveString(output, 'model.json');

    });
    options.add(option);

    // Export Scene

    var option = new UI.Row();
    option.setClass('option');
    option.setTextContent('Export Scene');
    option.onClick(function () {

        var output = editor.scene.toJSON();

        try {

            output = JSON.stringify(output, parseNumber, '\t');
            output = output.replace(/[\n\t]+([\d\.e\-\[\]]+)/g, '$1');

        } catch (e) {

            output = JSON.stringify(output);

        }

        saveString(output, 'scene.json');

    });
    options.add(option);

    //

    options.add(new UI.HorizontalRule());

    // Export GLB

    var option = new UI.Row();
    option.setClass('option');
    option.setTextContent('Export GLB');
    option.onClick(function () {

        var exporter = new THREE.GLTFExporter();

        exporter.parse(editor.scene, function (result) {

            saveArrayBuffer(result, 'scene.glb');

            // forceIndices: true, forcePowerOfTwoTextures: true
            // to allow compatibility with facebook
        }, { binary: true, forceIndices: true, forcePowerOfTwoTextures: true });

    });
    options.add(option);

    // Export GLTF

    var option = new UI.Row();
    option.setClass('option');
    option.setTextContent('Export GLTF');
    option.onClick(function () {

        var exporter = new THREE.GLTFExporter();

        exporter.parse(editor.scene, function (result) {

            saveString(JSON.stringify(result, null, 2), 'scene.gltf');

        });


    });
    options.add(option);

    // Export OBJ

    var option = new UI.Row();
    option.setClass('option');
    option.setTextContent('Export OBJ');
    option.onClick(function () {

        var object = editor.selected;

        if (object === null) {

            alert('No object selected.');
            return;

        }

        var exporter = new THREE.OBJExporter();

        saveString(exporter.parse(object), 'model.obj');

    });
    options.add(option);

    // Export STL

    var option = new UI.Row();
    option.setClass('option');
    option.setTextContent('Export STL');
    option.onClick(function () {

        var exporter = new THREE.STLExporter();

        saveString(exporter.parse(editor.scene), 'model.stl');

    });
    options.add(option);

    //

    options.add(new UI.HorizontalRule());

    // Publish

    var option = new UI.Row();
    option.setClass('option');
    option.setTextContent('Publish');
    option.onClick(function () {

        var zip = new JSZip();

        //

        var output = editor.toJSON();
        output.metadata.type = 'App';
        delete output.history;

        var vr = output.project.vr;

        output = JSON.stringify(output, parseNumber, '\t');
        output = output.replace(/[\n\t]+([\d\.e\-\[\]]+)/g, '$1');

        zip.file('app.json', output);

        //

        var title = config.getKey('project/title');

        var manager = new THREE.LoadingManager(function () {

            save(zip.generate({ type: 'blob' }), (title !== '' ? title : 'untitled') + '.zip');

        });

        var loader = new THREE.FileLoader(manager);
        loader.load('js/libs/app/index.html', function (content) {

            content = content.replace('<!-- title -->', title);

            var includes = [];

            if (vr) {

                includes.push('<script src="js/WebVR.js"></script>');

            }

            content = content.replace('<!-- includes -->', includes.join('\n\t\t'));

            var editButton = '';

            if (config.getKey('project/editable')) {

                editButton = [
                    '',
                    '			var button = document.createElement( \'a\' );',
                    '			button.href = \'https://threejs.org/editor/#file=\' + location.href.split( \'/\' ).slice( 0, - 1 ).join( \'/\' ) + \'/app.json\';',
                    '			button.style.cssText = \'position: absolute; bottom: 20px; right: 20px; padding: 12px 14px; color: #fff; border: 1px solid #fff; border-radius: 4px; text-decoration: none;\';',
                    '			button.target = \'_blank\';',
                    '			button.textContent = \'EDIT\';',
                    '			document.body.appendChild( button );',
                    ''
                ].join('\n');
            }

            content = content.replace('\n\t\t\t/* edit button \n', editButton);

            zip.file('index.html', content);

        });
        loader.load('js/libs/app.js', function (content) {

            zip.file('js/app.js', content);

        });
        loader.load('../build/three.min.js', function (content) {

            zip.file('js/three.min.js', content);

        });

        if (vr) {

            loader.load('../examples/js/vr/WebVR.js', function (content) {

                zip.file('js/WebVR.js', content);

            });

        }

    });
    options.add(option);

    //

    */
/*
    var link = document.createElement('a');
    link.style.display = 'none';
    document.body.appendChild(link); // Firefox workaround, see #6594

    function save(blob, filename) {

        link.href = URL.createObjectURL(blob);
        link.download = filename || 'data.json';
        link.click();

        // URL.revokeObjectURL( url ); breaks Firefox...

    }

    function saveArrayBuffer(buffer, filename) {

        save(new Blob([buffer], { type: 'application/octet-stream' }), filename);

    }

    function saveString(text, filename) {

        save(new Blob([text], { type: 'text/plain' }), filename);

    }

    return container;

};*/