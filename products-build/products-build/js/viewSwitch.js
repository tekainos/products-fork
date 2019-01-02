$(document).ready(function () {

    $("#JobsList a").on('click', function (e) {
        e.preventDefault();

        $('#dashboard').hide();

        $('#projectView').show();
    });




    $('#closeProjectBtn').on('click', function () {
        // hide project view to display dashboard / jobs list
        $('#projectView').hide();

        // show dashboard when projectView closed
        $('#dashboard').show();
    });


    $('#roomAttachment').on('click', function () {
        $('#estimateDetails').hide();
        $('#measureView').hide();

        $('#roomAttachView').show();
    });


    $('#roomEstimate').on('click', function () {
        $('#measureView').hide();
        $('#roomAttachView').hide();

        $('#estimateDetails').show();
    });

});