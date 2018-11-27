$(document).ready(function() {

    // storing common HTML elements
    var productCategory = $('.product-category');
    var categoryTitle = productCategory.find('.prodcat-picker');
    var productOptions = $('.prodcat-options');

    // hide all product category selection sections
    var allCategoryOptions = productCategory.find(productOptions);



    // products AJAX call
    var productsURL = 'JSON/products-test.json';

   $.get(productsURL, function(data) {
        // parse json
       data = JSON.parse(data);

       // build display products data
       $.each(data.rows, function (index, value) {
           var productOther = document.createElement("div");
           productOther.className = 'product-type';
           var p = document.createElement("p");
           p.innerText = value.id;
           var img = document.createElement("img");
           img.src = value.imageURL;
           var p2 = document.createElement("p");
           p2.innerText = value.Name;
           productOther.appendChild(p);
           productOther.appendChild(img);
           productOther.appendChild(p2);

           // display data
           currentCategoryOption.append(productOther);
       });

        // click trigger to operate accordion
        $(categoryTitle).click(function() {
            // grab HTML id
            var categoryID = $(this).attr('id');

            // build jquery categoryID title selector
            var categoryIDelement = $('#' + categoryID);

            // get the sibling prodcat-options class related to category's title
            var currentCategoryOption = categoryIDelement.next(productOptions);

            // call the accordion functionality
            showOrHideAccordion(currentCategoryOption, allCategoryOptions);
       }); // end click function

    }); // end AJAX call

}); // end doc ready




// functionality to show and hide product category options
function showOrHideAccordion(currentSelection, notSelected) {
    // show product category options
    if (currentSelection.css('display') === "none") {
        notSelected.hide();
        currentSelection.show(2000);
    }
    else {
        currentSelection.hide();
    }
} // end show and hide 