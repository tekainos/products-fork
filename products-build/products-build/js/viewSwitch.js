$(document).ready(function () {

    $("#JobsList a").on('click', function (e) {
        e.preventDefault();

        $('#dashboard').hide();

        $('#projectView').show();
    });


});