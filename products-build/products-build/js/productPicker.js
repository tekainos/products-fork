$(document).ready(function () {
    // storing common HTML elements
    var productCategory = $('.product-category');
    var productOptions = $('.prodcat-options');

    // hide all product category selection sections
    var allCategoryOptions = productCategory.find(productOptions);

    
    // click trigger to operate accordion
    $(productCategory).click(function () {
        // grab HTML id
        var categoryTitle = productCategory.find('.prodcat-picker');
        var categoryID = $(this).find(categoryTitle).attr('id');

        // instantiate switch case variables
        var categoryIDelement;

        //// hide all opened product category options
        //$(allCategoryOptions).hide();

        // show or hide specific category option
        categoryIDelement = $('#' + categoryID);
        // get the sibling .prodcat-options class related to category's title
        var currentCategoryOption = categoryIDelement.next(productOptions);

        showOrHide(currentCategoryOption, allCategoryOptions);

    }); // end click function
});




// functionality to show and hide product category options
function showOrHide(currentSelection, notSelected) {
    // show product category options
    if (currentSelection.css('display') === "none") {

        notSelected.hide();

        currentSelection.show();

    }
    else {
        currentSelection.hide();
    }
} // end show and hide 

