var Login = function (editor) {
    // Editor Aliases 
    var signals = editor.signals;
    var camera = editor.camera;
    var tempCam = editor.camera;
    var scene = editor.scene;
    var config = editor.config;

    var container = document.getElementById("login");

    var form = document.getElementById("LoginForm");
    
    var passWrong = document.getElementById("loginWrong");
    var email = document.getElementById("username");

    fillLoginEmail(email);

    var pass = document.getElementById("password");
    var registerForm = document.getElementById("registerForm");
    var passMatch = document.getElementById("regPassMatch");
    var contactAdmin = document.getElementById("contactAdmin");
    var unable = document.getElementById("unableReg");
    var emailReg = document.getElementById("emailReg");
    var passReg = document.getElementById("password2");
    var passReg2 = document.getElementById("password3");

    var lines2 = document.getElementById("createAccountButton");
    var lines4 = document.getElementById("loginBackButton");
    var offline = document.getElementById("offlineButton");
    offline.onclick = function () {
        var log = checkLoginFile(email);
    };

    var connect = document.getElementById("retryConnectionButton");
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
                            editor.signals.login.dispatch(emailReg.value);
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

    registerForm.onsubmit = function () {
        if (passReg.value === passReg2.value) {
            if (emailReg.value.substring(emailReg.value.length - 11).toLowerCase() === 'uhs-llc.com' || emailReg.value.substring(emailReg.value.length - 9).toLowerCase() === 'lowes.com') {
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
                console.log(emailReg.value.substring(emailReg.value.length - 11).toLowerCase());
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