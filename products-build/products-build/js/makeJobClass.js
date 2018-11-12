var JobCreator = function (editor) {
    // Editor Aliases 
    var signals = editor.signals;
    var camera = editor.camera;
    var tempCam = editor.camera;
    var scene = editor.scene;
    var config = editor.config;

    // Splash Dom Element
    var container = new UI.Panel();
    container.setId('makeJob');
    container.dom.className = 'NavDark appPage';

    var internal = document.createElement('div');
    internal.className = "InternalBox";
    internal.style.width = '75%';
    internal.style.marginLeft = '12.5%';


    var tekainos = document.createElement("div");
    tekainos.className = "NameBox";
    tekainos.appendChild(document.createTextNode("Tekainos"));
    container.dom.appendChild(tekainos);

    var fields = [ {
            "id": "inputJobid",
            "placeholder": "ID",
            "icon": "fas fa-info-circle fa-fw",
            "width": "40%",
            "className": "loginInput",
            "type": 'text',
            "name": "JobID",
            "required" : true
        }, {
            "id": "inputAddress",
            "placeholder": "Install Address",
            "icon": "fas fa-building fa-fw",
            "width": "40%",
            "className": "loginInput",
            "type": 'text',
            "name": "address",
            "required": true
        }, {
            "id": "inputCustomer",
            "placeholder": "Customer Name",
            "icon": "fas fa-user fa-fw",
            "width": "50%",
            "className": "loginInput",
            "type": 'text',
            "name": "custName",
            "required": true
        }, {
            "id": "inputPhone",
            "placeholder": "Customer Phone",
            "icon": "fas fa-phone fa-fw",
            "width": "30%",
            "className": "loginInput",
            "type": 'tel',
            "name": "phoneNum",
            "required": false
        }, {
            "id": "inputDescript",
            "placeholder": "Description",
            "icon": "fas fa-comment fa-fw",
            "width": "90%",
            "className": "loginInput",
            "type": 'text',
            "name": "description",
            "required": false
        }, {
            "id": "inputDate",
            "placeholder": "Date",
            "icon": "fas fa-comment fa-fw",
            "width": "90%",
            "className": "loginInput",
            "type": 'date',
            "name": "date",
            "required": false
        }, {
            "id": "inputZip",
            "placeholder": "Zip Code",
            "icon": "fas fa-comment fa-fw",
            "width": "90%",
            "className": "loginInput",
            "type": 'number',
            "name": "zipcode",
            "required": false
        }
    ];

    var bx0 = document.createElement("div");
    bx0.id = "JobBox";
    bx0.className = 'DarkBox';

    var form = document.createElement("div");
    form.className = "form-group";

    fields.forEach(function (field) {
        var label = document.createElement("label");
        label.htmlFor = field.name;
        label.className = 'inputIcon';

        var icon = document.createElement("i");
        icon.id = 'icon';
        icon.className = field.icon;
        label.appendChild(icon);

        var input = document.createElement("input");
        input.type = field.type;
        input.name = field.name;
        input.id = field.id;
        input.placeholder = field.placeholder;
        input.className = field.className;
        input.required = field.required;
        input.width = field.width;

        var row = document.createElement("div");
        row.className = "loginRow";
        row.width = field.width;
        row.appendChild(label);
        row.appendChild(input);
        form.appendChild(row);
        
        //form.appendChild(document.createElement("br"));
    });

    bx0.appendChild(form);

    var lines = document.createElement("button");
    lines.innerHTML = "Create Job";
    lines.className = "loginButton";
    lines.id = 'createJobLocal';
    lines.style.backgroundColor = '#004690';
    bx0.appendChild(lines);
    lines.onclick = function () {
        $('#loadJob').hide();
        $('#sidebar').show();
        $('#menubar').show();
        var data = {
            "PN": $("#inputJobid").val(),
            "Address": $("#inputAddress").val(),
            "Description": $("#inputDescript").val(),
            "Customer": $("#inputCustomer").val(),
            "Cust Phone": $("#inputPhone").val(),
            "Date": $("#inputDate").val(),
            "Zip": $("#inputZip").val()
        };
        signals.loadProjURL.dispatch(data);
        signals.changePage.dispatch('splashPage', false);
    };

    internal.appendChild(bx0);

    container.dom.appendChild(internal);

    return container;
};