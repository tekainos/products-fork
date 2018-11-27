
$('document').ready(function () {
    // ajax call
    var productsURL = "JSON/products-test.json";

    $.ajax({
        url: productsURL,
        type: 'GET',
        dataType: 'json',
        success: loadProducts,
        fail: productsError
    });


    
    // click trigger to operate accordion
    var categoryPicker = $('.prodcat-picker');
    categoryPicker.click(function () {
        // grab HTML id
        var categoryID = $(this).attr('id');
        categoryAccordion(categoryID);
    });

}); // end document load



// load the data
function loadProducts(data) {

    // build display products data
    $.each(data.rows, function (index, value) {
        var productsList = document.createElement("div");
        productsList.className = 'product-type';
        var productID = document.createElement("p");
        productID.innerText = value.id;
        var productIMG = document.createElement("img");
        productIMG.src = value.imageURL;
        var productName = document.createElement("p");
        productName.innerText = value.Name;
        productsList.appendChild(productID);
        productsList.appendChild(productIMG);
        productsList.appendChild(productName);

        // display data
        var categoryOption = document.querySelector('.prodcat-options');
        categoryOption.appendChild(productsList);
    });

} // end products loading function



// error function if ajax fails
function productsError() {
    console.log("error");
} // end the ajax error handling function



// functionality to show and hide product category options
function categoryAccordion(catID) {
    // build jquery categoryID title selector
    var categoryIDelement = $('#' + catID);
    // get the sibling prodcat-options class related to category's title
    var categorySelected = categoryIDelement.next('.prodcat-options');

    console.log(categoryIDelement.attr('id'));

    // show product category options
    if (categorySelected.css('display') === "none") {
        categorySelected.show(2000);
    }
    else {
        categorySelected.hide();
    }
} // end show and hide 