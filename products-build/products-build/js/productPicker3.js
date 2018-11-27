$('document').ready(function () {
    // fetch products via AJAX call
    var productsURL = 'JSON/products-test.json';

    $.get(productsURL, function (result) {
        // parse json
        result = JSON.parse(result);

        // load products
        loadData(result);

        // accordion functionality
        pickerAccordion();

    }); // end ajax
}); // end doc ready




// build display for products data
function loadData(data) {
    $.each(data.rows, function (index, value) {
        var productType = document.createElement("div");
        productType.className = 'product-type';
        var productId = document.createElement("p");
        productId.innerText = value.id;
        var productImg = document.createElement("img");
        productImg.src = value.imageURL;
        var productName = document.createElement("p");
        productName.innerText = value.Name;
        productType.appendChild(productId);
        productType.appendChild(productImg);
        productType.appendChild(productName);

        // display data
        $('.prodcat-options').append(productType);
    });
} // end load data function



// accordion showing and hiding
function pickerAccordion() {
    var categoryPicker = $('.prodcat-picker');

    // click function
    categoryPicker.click(function () {
        var categoryOptions = $('.prodcat-options');

        // expand or collapse selected picker
        $(this).next(categoryOptions).toggle(2000);

        // hide other panels not selected
        categoryOptions.not($(this).next()).slideUp(1000);
    });
} // end accordion