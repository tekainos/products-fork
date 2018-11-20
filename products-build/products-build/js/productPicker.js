$(document).ready(function() {

    // products AJAX call
    var productsURL = 'JSON/products-test.json';

    $.get(productsURL, function(data) {
        // parse json
        data = JSON.parse(data);

        // iterate over json data
        $.each(data.rows, function(index, value) {
            console.log(value.id);
        });
    }); // end AJAX call



    // storing common HTML elements
    var productCategory = $('.product-category');
    var categoryTitle = productCategory.find('.prodcat-picker');
    var productOptions = $('.prodcat-options');

    // hide all product category selection sections
    var allCategoryOptions = productCategory.find(productOptions);

    // build category selection currently clicked

    
    // click trigger to operate accordion
    $(categoryTitle).click(function() {
        // grab HTML id
        var categoryID = $(this).attr('id');

        // build jquery categoryID title selector
        var categoryIDelement = $('#' + categoryID);
        // get the sibling prodcat-options class related to category's title
        var currentCategoryOption = categoryIDelement.next(productOptions);

        // call the accordion functionality
        showOrHide(currentCategoryOption, allCategoryOptions);

    }); // end click function

}); // end doc ready




// functionality to show and hide product category options
function showOrHide(currentSelection, notSelected) {
    // show product category options
    if (currentSelection.css('display') === "none") {
        notSelected.hide();
        currentSelection.show(2000);
    }
    else {
        currentSelection.hide();
    }
} // end show and hide 