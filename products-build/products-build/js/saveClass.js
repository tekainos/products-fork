class SaveLoad {
    constructor(editor) {
        this._editor = editor;
        this._scene = editor.scene;
        this._signals = editor.signals;
    }

    loadPOList() {
        $.ajax({
            url: 'http://austinteets.com/db.php',
            data: "",
            dataType: 'json',
            success: function (data) {
                for (var k = 0; k < data.length; k++) {
                    var load = new UI.Button(data[k][1] + " : " + data[k][2]);
                    load.dom.id = data[k][1];
                    load.dom.name = data[k][3];
                    load.dom.style.width = '100%';
                    load.dom.style.backgroundColor = '#e7e7e7';
                    load.dom.style.marginTop = '10px';
                    load.dom.onclick = function () {
                        pnum = this.id;
                        addr = this.name;
                        loadFromDB(pnum, addr);
                    };
                    //scrollBox.appendChild(load.dom);
                }
            }
        });
    }

    loadFromDB(pnum) {
        //document.getElementById('address_field').value = address;
        var signal = this._signals;
        //var pnum = !(pnum) ? document.getElementById('project_field').value : pnum;
        $.ajax({
            method: 'GET',
            url: 'http://austinteets.com/house.php',
            data: { "pnum": pnum },
            dataType: 'text',
            success: function (ret) {
                if (ret) {
                    signal.loaded.dispatch(ret);
                } else {
                    document.getElementById('project_field').value = pnum;
                }
            }
        });
    }

    loadLocal() {
        console.log("Picking");
        var file = pickTekFile();
    }

    saveToDB(pnum, pack) {
        console.log("NOW SAVING");
        pack = JSON.stringify(pack);
        pnum = document.getElementById('loadedPN') ? document.getElementById('loadedPN').value : pnum;
        this.saveToFile(pnum, pack);
        $.ajax({
            data: { "projectNum": pnum, "tekfile": pack, 'username' : editor.user },
            method: 'POST',
            url: 'http://austinteets.com/house_save.php',
            dataType: 'text',
            success: function (data) {
                console.log("Success");
                console.log(data);
            }
        });
    }

    saveToFile(pnum, pack) {
        writeBlobToFile(pack, pnum);
    }
}

function pickSingleFile() {
    //createUI({ 'name': "Blah" });
    // Clean scenario output 
    WinJS.log && WinJS.log("", "sample", "status");

    // Create the picker object and set options 
    var openPicker = new Windows.Storage.Pickers.FileOpenPicker();
    openPicker.viewMode = Windows.Storage.Pickers.PickerViewMode.thumbnail;
    openPicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.objects3D;

    openPicker.fileTypeFilter.append(".jpg");
    openPicker.fileTypeFilter.append(".jpeg");
    openPicker.fileTypeFilter.append(".png");
    openPicker.fileTypeFilter.append(".pdf");
    openPicker.fileTypeFilter.append(".docx");
    openPicker.fileTypeFilter.append(".doc");
    openPicker.fileTypeFilter.append(".txt");

    openPicker.pickSingleFileAsync().then(function (file) {
        console.log("LOAD");
        if (file) {
            createUI(file);
        } else {
            // The picker was dismissed with no selected file 
            WinJS.log && WinJS.log("Operation cancelled.", "sample", "status");
        }
    });
}

function pickTekFile() {
    //createUI({ 'name': "Blah" });
    // Clean scenario output 
    WinJS.log && WinJS.log("", "sample", "status");

    // Create the picker object and set options 
    var openPicker = new Windows.Storage.Pickers.FileOpenPicker();
    openPicker.viewMode = Windows.Storage.Pickers.PickerViewMode.thumbnail;
    openPicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.objects3D;

    openPicker.fileTypeFilter.append(".Tek");

    openPicker.pickSingleFileAsync().then(function (file) {
        console.log("LOAD");
        if (file) {
            Windows.Storage.FileIO.readTextAsync(file).done(function (fileContent) {
                editor.signals.loaded.dispatch(fileContent);
            });
        } else {
            // The picker was dismissed with no selected file 
            WinJS.log && WinJS.log("Operation cancelled.", "sample", "status");
        }
    });
}

function createUI(file) {
    console.log(file);
    var row = document.createElement("div");
    row.className = 'filediv';
    var name = document.createElement("h3");
    name.style.display = 'inline-block';
    name.className = 'filename';
    name.appendChild(document.createTextNode(file.name));
    row.appendChild(name);
    var notes = document.createElement("input");
    notes.type = 'text';
    notes.className = 'filenotes';
    notes.placeholder = 'Notes';
    row.appendChild(notes);
    var elem = document.getElementById("UploadBox");
    elem.appendChild(document.createElement("br"));
    elem.appendChild(row);
}

function writeBlobToFile(blob, filename) {
    var savePicker = new Windows.Storage.Pickers.FileSavePicker();
    savePicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.objects3D;
    // Dropdown of file types the user can save the file as
    savePicker.fileTypeChoices.insert("Tek Measure File", [".Tek"]);
    // Default file name if the user does not type one in or select a file to replace
    savePicker.suggestedFileName = filename;

    savePicker.pickSaveFileAsync().then(function (file) {
        if (file) {
            // Prevent updates to the remote version of the file until we finish making changes and call CompleteUpdatesAsync.
            Windows.Storage.CachedFileManager.deferUpdates(file);
            // write to file
            Windows.Storage.FileIO.writeTextAsync(file, blob).done(function () {
                // Let Windows know that we're finished changing the file so the other app can update the remote version of the file.
                // Completing updates may require Windows to ask for user input.
                Windows.Storage.CachedFileManager.completeUpdatesAsync(file).done(function (updateStatus) {
                    if (updateStatus === Windows.Storage.Provider.FileUpdateStatus.complete) {
                        WinJS.log && WinJS.log("File " + file.name + " was saved.", "sample", "status");
                    } else {
                        WinJS.log && WinJS.log("File " + file.name + " couldn't be saved.", "sample", "status");
                    }
                });
            });
        } else {
            WinJS.log && WinJS.log("Operation cancelled.", "sample", "status");
        }
    });
}