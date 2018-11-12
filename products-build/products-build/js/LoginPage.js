var Login = function (editor) {
    // Editor Aliases 
    var signals = editor.signals;
    var camera = editor.camera;
    var tempCam = editor.camera;
    var scene = editor.scene;
    var config = editor.config;

    // Splash Dom Element
    var container = new UI.Panel();
    container.setId('login');
    container.dom.className = 'NavDark';

    var tekainos = document.createElement("div");
    tekainos.className = "NameBox";
    tekainos.appendChild(document.createTextNode("Tekainos"));
    container.dom.appendChild(tekainos);

    var internal = document.createElement('div');
    internal.className = "InternalBox";
    internal.style.width = '50%';
    internal.style.marginLeft = '25%';

    var bx0 = document.createElement("div");
    bx0.id = "LoginBox";
    bx0.className = 'DarkBox';

    /*  <label id="icon" for="name"><i class="icon-envelope "></i></label>
  <input type="text" name="name" id="name" placeholder="Email" required/>
  <label id="icon" for="name"><i class="icon-user"></i></label>
  <input type="text" name="name" id="name" placeholder="Name" required/>
  <label id="icon" for="name"><i class="icon-shield"></i></label>
  <input type="password" name="name" id="name" placeholder="Password" required/>*/

    var form = document.createElement("form");
    form.className = "form-group";

    var h0 = document.createElement('h1');
    h0.className = "block-title";
    h0.appendChild(document.createTextNode("Login"));
    form.appendChild(h0);

    var passWrong = document.createElement("h3");
    //passWrong.className = "block-title";
    passWrong.style.color = 'red';
    passWrong.appendChild(document.createTextNode("E-Mail or Password Incorrect"));
    passWrong.style.display = 'none';
    form.appendChild(passWrong);

    var lab0 = document.createElement("label");
    lab0.htmlFor = "username";
    lab0.className = 'inputIcon';
    var icoEmail = document.createElement("i");
    icoEmail.id = 'icon';
    icoEmail.className = "fas fa-user-shield fa-fw";
    lab0.appendChild(icoEmail);

    var email = document.createElement("input");
    email.type = 'text';
    email.name = "username";
    email.id = "username";
    email.placeholder = "Email";
    email.className = "loginInput";
    email.required = true;

    fillLoginEmail(email);

    var row = document.createElement("div");
    row.className = "loginRow";
    row.appendChild(lab0);
    row.appendChild(email);
    form.appendChild(row);

    form.appendChild(document.createElement("br"));

    var lab1 = document.createElement("label");
    lab1.htmlFor = "password";
    lab1.className = "inputIcon";
    var icoPass = document.createElement("i");
    icoPass.id = 'icon';
    icoPass.className = "fas fa-shield-alt fa-fw";
    lab1.appendChild(icoPass);

    var pass = document.createElement("input");
    pass.type = 'password';
    pass.name = "password";
    pass.className = "loginInput";
    pass.id = "password";
    pass.placeholder = "Password";
    pass.required = true;

    var row2 = document.createElement("div");
    row2.className = "loginRow";
    row2.appendChild(lab1);
    row2.appendChild(pass);
    form.appendChild(row2);

    var lines = document.createElement("button");
    lines.innerHTML = "Login";
    lines.className = "loginButton";
    lines.type = 'submit';

    var registerForm = document.createElement("form");
    registerForm.style.display = 'none';
    registerForm.className = "form-group";

    var h1 = document.createElement('h1');
    h1.className = "block-title";
    h1.appendChild(document.createTextNode("Create Account"));
    registerForm.appendChild(h1);

    var passMatch = document.createElement("h3");
    //passMatch.className = "block-title";
    passMatch.style.color = 'red';
    passMatch.appendChild(document.createTextNode("Passwords Do Not Match"));
    passMatch.style.display = 'none';
    registerForm.appendChild(passMatch);

    var contactAdmin = document.createElement("h3");
    //passMatch.className = "block-title";
    contactAdmin.style.color = 'red';
    contactAdmin.appendChild(document.createTextNode("This is a Closed Beta, Please Contact Administrator for Instructions"));
    contactAdmin.style.display = 'none';
    registerForm.appendChild(contactAdmin);

    var unable = document.createElement("h3");
    unable.style.color = 'red';
    unable.appendChild(document.createTextNode("Unable to Create Account, E-Mail in Use"));
    unable.style.display = 'none';
    registerForm.appendChild(unable);

    var emailReg = document.createElement("input");
    emailReg.type = 'text';
    emailReg.id = "emailReg";
    emailReg.className = "loginInput";
    emailReg.placeholder = 'E-Mail';
    emailReg.name = "emailReg";
    emailReg.required = true;

    var labEm = document.createElement("label");
    labEm.htmlFor = "emailReg";
    labEm.className = 'inputIcon';
    var icoEm = document.createElement("i");
    icoEm.id = 'icon';
    icoEm.className = "fas fa-user-shield fa-fw";
    labEm.appendChild(icoEm);

    var row3 = document.createElement("div");
    row3.className = "loginRow";
    row3.appendChild(labEm);
    row3.appendChild(emailReg);
    registerForm.appendChild(row3);
    registerForm.appendChild(document.createElement("br"));

    var passReg = document.createElement("input");
    passReg.type = 'password';
    passReg.name = "password2";
    passReg.className = "loginInput";
    passReg.id = "password2";
    passReg.placeholder = "Password";
    passReg.required = true;

    var labPs = document.createElement("label");
    labPs.htmlFor = "password2";
    labPs.className = 'inputIcon';
    var icoPs = document.createElement("i");
    icoPs.id = 'icon';
    icoPs.className = "fas fa-shield-alt fa-fw";
    labPs.appendChild(icoPs);

    var row4 = document.createElement("div");
    row4.className = "loginRow";
    row4.appendChild(labPs);
    row4.appendChild(passReg);
    registerForm.appendChild(row4);
    registerForm.appendChild(document.createElement("br"));

    var passReg2 = document.createElement("input");
    passReg2.type = 'password';
    passReg2.name = "password3";
    passReg2.className = "loginInput";
    passReg2.id = "password3";
    passReg2.placeholder = "Re-Enter Password";
    passReg2.required = true;

    var labPs2 = document.createElement("label");
    labPs2.htmlFor = "password3";
    labPs2.className = 'inputIcon';
    var icoPs2 = document.createElement("i");
    icoPs2.id = 'icon';
    icoPs2.className = "fas fa-shield-alt fa-fw";
    labPs2.appendChild(icoPs2);

    var row5 = document.createElement("div");
    row5.className = "loginRow";
    row5.appendChild(labPs2);
    row5.appendChild(passReg2);
    registerForm.appendChild(row5);
    registerForm.appendChild(document.createElement("br"));

    var lines3 = document.createElement("button");
    lines3.innerHTML = "Create Account";
    lines3.className = "loginButton";
    lines3.type = 'submit';

    registerForm.appendChild(lines3);

    registerForm.onsubmit = function () {
        if (passReg.value === passReg2.value) {
            if (emailReg.value.substring(emailReg.value.length-11).toLowerCase() === 'uhs-llc.com' || emailReg.value.substring(emailReg.value.length-9).toLowerCase() === 'lowes.com') {
                $.ajax({
                    data: { "email": emailReg.value, "pass": passReg.value },
                    method: 'POST',
                    url: 'http://austinteets.com/createAccount.php',
                    dataType: 'text',
                    success: function (data) {
                        console.log(data);
                        if (!data) {
                            createLoginFile(emailReg.value);
                            editor.signals.login.dispatch(email.value);
                            var home = document.getElementById('loadJob');
                            home.style.display = 'block';

                            var login = document.getElementById('login');
                            login.style.display = 'none';
                        } else {
                            $(unable).show();
                            $(contactAdmin).hide();
                            $(passMatch).hide();
                        }
                    }
                });
            } else {
                console.log(emailReg.value.substring(emailReg.value.length-11).toLowerCase());
                $(passMatch).hide();
                $(unable).hide();
                $(contactAdmin).show();
            }
        } else {
            $(passMatch).show();
            $(unable).hide();
            $(contactAdmin).hide();
        }
        return false;
    };
    
    bx0.appendChild(registerForm);
    bx0.appendChild(form);

    var lines2 = document.createElement("button");
    lines2.innerHTML = "Create Account";
    lines2.className = "loginButton";
    lines2.style.backgroundColor = '#004690';

    bx0.appendChild(lines2);

    var lines4 = document.createElement("button");
    lines4.innerHTML = 'Back';
    lines4.className = 'loginButton';
    lines4.style.backgroundColor = '#004690';
    lines4.style.display = 'none';

    bx0.appendChild(lines4);

    var offline = document.createElement("button");
    offline.innerHTML = 'Start Offline';
    offline.className = 'loginButton';
    offline.style.display = 'none';

    bx0.appendChild(offline);

    offline.onclick = function () {
        var log = checkLoginFile(email);
    };

    var connect = document.createElement("button");
    connect.innerHTML = 'Retry Connection';
    connect.className = 'loginButton';
    connect.style.backgroundColor = '#004690';
    connect.style.display = 'none';

    bx0.appendChild(connect);

    connect.onclick = function () {
        var conn = checkConnections();
        if (conn) {
            $(lines2).show();
            $(form).show();
            $(offline).hide();
            $(connect).hide();
        }
    };

    lines2.onclick = function () {
        $(form).toggle();
        $(lines2).toggle();
        $(lines4).toggle();
        $(registerForm).toggle();
        $(passMatch).hide();
        $(passWrong).hide();
        $(unable).hide();
        $(contactAdmin).hide();
    };

    lines4.onclick = function () {
        $(form).toggle();
        $(lines2).toggle();
        $(lines4).toggle();
        $(registerForm).toggle();
        $(passMatch).hide();
        $(passWrong).hide();
        $(unable).hide();
        $(contactAdmin).hide();
    };

    /*lines.onclick = function () {
        var home = document.getElementById('loadJob');
        home.style.display = 'block';

        var login = document.getElementById('login');
        login.style.display = 'none';
    };*/

    form.appendChild(lines);
    form.onsubmit = function (formans) {
        $.ajax({
            data: { "email": email.value, "pass": pass.value },
            method: 'POST',
            url: 'http://austinteets.com/loginCheck.php',
            dataType: 'text',
            success: function (data) {
                console.log(data);
                if (!data) {
                    createLoginFile(email.value);
                    editor.signals.login.dispatch(email.value);
                    var home = document.getElementById('loadJob');
                    home.style.display = 'block';

                    var login = document.getElementById('login');
                    login.style.display = 'none';
                } else {
                    $(passWrong).show();
                }
            }
        });
        return false;
    };

    internal.appendChild(bx0);
    
    container.dom.appendChild(internal);

    var conn = checkConnections();

    if (!conn) {
        $(lines2).hide();
        $(form).hide();
        $(offline).show();
        $(connect).show();
    }

    return container;
};

function checkConnections() {
    var connections = Windows.Networking.Connectivity.NetworkInformation.getInternetConnectionProfile();
    if (connections != null) {
        var networkConnectivityLevel = connections.getNetworkConnectivityLevel();
        if (networkConnectivityLevel == Windows.Networking.Connectivity.NetworkConnectivityLevel.internetAccess) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

function fillLoginEmail(field) {
    var localFolder = Windows.Storage.ApplicationData.current.localFolder;
    localFolder.getFileAsync("log.tek").then(
        function (file) {
            console.log(file);
            Windows.Storage.FileIO.readTextAsync(file).then(function (fileContent) {
                console.log(fileContent);
                var cont = fileContent.split(".-.");
                field.value = cont[0];
            });
            //Windows.Storage.FileIO.writeTextAsync(file, email + ".-." + Date.now() + ".-." + (Date.now() + 604800000));
        }
    );
}

function checkLoginFile(email) {
    var localFolder = Windows.Storage.ApplicationData.current.localFolder;
    localFolder.getFileAsync("log.tek").then(
        function (file) {
            console.log(file);
            Windows.Storage.FileIO.readTextAsync(file).then(function (fileContent) {
                console.log(fileContent);
                var cont = fileContent.split(".-.");
                console.log(cont);
                if (parseInt(cont[2]) > Date.now()) {
                    editor.signals.offlineMode.dispatch(cont[0]);
                    editor.signals.login.dispatch(email.value);
                    var home = document.getElementById('loadJob');
                    home.style.display = 'block';

                    var login = document.getElementById('login');
                    login.style.display = 'none';
                } else {
                    return false;
                }
            });
            //Windows.Storage.FileIO.writeTextAsync(file, email + ".-." + Date.now() + ".-." + (Date.now() + 604800000));
        }
    );
}

function createLoginFile(email) {
    var localFolder = Windows.Storage.ApplicationData.current.localFolder;
    localFolder.createFileAsync("log.tek", 1).then(
        function (file) {
            console.log(file);
            Windows.Storage.FileIO.writeTextAsync(file, email + ".-." + Date.now() + ".-." + (Date.now() + 604800000));
        }
    );
}