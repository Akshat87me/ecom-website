const searchKey = decodeURI(location.pathname.split('/').pop());

getProducts(searchKey).then(data => createProductCars(data, searchKey,'.search-listing'))