$(document).ready(function () {
    // define buttons
    var measureNavBtn = $('#roomMeasure');
    var attachNavBtn = $('#roomAttachment');
    var estimateNavBtn = $('#roomEstimate');
    var roomBackBtn = $('#backToJob');
    var roomBtn = $('#livingRoomBtn');

    // get navigation elements
    var roomNav = $('#roomNav');
    var customerNav = $('#customerInfo');

    // get page views
    var jobPage = $('#jobDetails');
    var measurePage = $('#measureView');
    var estimatePage = $('#estimateDetails');
    var roomAttachPage = $('#roomAttachView');


    // navigate to room estimate when job page room clicked
    $(roomBtn).on('click', function () {
        // show room navigation
        $(roomNav).show();

        // hide other pages
        $(jobPage).hide();
        $(measurePage).hide();
        $(roomAttachPage).hide();

        // show correct page
        $(estimatePage).show();

        // add and remove nav buttons highlight
        $(measureNavBtn).removeClass('activeNavBtn');
        $(attachNavBtn).removeClass('activeNavBtn');
        $(estimateNavBtn).addClass('activeNavBtn');
    });


    // navigate to room attach page
    $(attachNavBtn).on('click', function () {
        // show room navigation
        $(roomNav).show();

        // hide other pages
        $(jobPage).hide();
        $(measurePage).hide();
        $(estimatePage).hide();

        // show correct page
        $(roomAttachPage).show();

        // add and remove nav buttons highlight
        $(measureNavBtn).removeClass('activeNavBtn');
        $(estimateNavBtn).removeClass('activeNavBtn');
        $(attachNavBtn).addClass('activeNavBtn');
    });


    // navigate to room attach page
    $(measureNavBtn).on('click', function () {
        // show room navigation
        $(roomNav).show();

        // hide other pages
        $(jobPage).hide();
        $(roomAttachPage).hide();
        $(estimatePage).hide();

        // show correct page
        $(measurePage).show();

        // add and remove nav buttons highlight
        $(estimateNavBtn).removeClass('activeNavBtn');
        $(attachNavBtn).removeClass('activeNavBtn');
        $(measureNavBtn).addClass('activeNavBtn');
    });


    // navigate to room attach page
    $(estimateNavBtn).on('click', function () {
        // show room navigation
        $(roomNav).show();

        // hide other pages
        $(jobPage).hide();
        $(roomAttachPage).hide();
        $(measurePage).hide();

        // show correct page
        $(estimatePage).show();

        // add and remove nav buttons highlight
        $(attachNavBtn).removeClass('activeNavBtn');
        $(measureNavBtn).removeClass('activeNavBtn');
        $(estimateNavBtn).addClass('activeNavBtn');
    });


    // navigate to room attach page
    $(roomBackBtn).on('click', function () {
        // show room navigation
        $(roomNav).hide();

        // hide other pages
        $(estimatePage).hide();
        $(roomAttachPage).hide();
        $(measurePage).hide();

        // show correct page
        $(jobPage).show();

        // add and remove nav buttons highlight
        $(attachNavBtn).removeClass('activeNavBtn');
        $(measureNavBtn).removeClass('activeNavBtn');
        $(estimateNavBtn).removeClass('activeNavBtn');
    });
});