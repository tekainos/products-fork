$(document).ready(function () {

    $('#closeProjectBtn').on('click', function () {
        console.log("X button click");

        // hide project view to display dashboard / jobs list
        $('#projectView').hide();

        // show dashboard when projectView closed
        $('#dashboard').show();
    });
});