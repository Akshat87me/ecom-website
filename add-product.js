let user = JSON.parse(sessionStorage.user || null);

window.onload = () => {
    if(user == null){
        location.replace('/login')
    }
}

let editable = [...document.querySelectorAll('*[contenteditable = "true"]')];

editable.map((element) => {
    let placeholder = element.getAttribute('data-placholder');
    element.innerHTML = placeholder;
    element.addEventListener('focus', () => {
        if(element.innerHTML === placeholder){
            element.innerHTML ='';
        }
    })
    element.addEventListener('focusout', () => {
        if(!element.innerHTML.length){
            element.innerHTML = placeholder;
        }
    })
})

//image upload

let uploadInput = document.querySelector('#upload-image');
let imagePath = 'img/noImage.png'; //default img
let uploadPath = '';
uploadInput.addEventListener('change', () => {
    const file = uploadInput.files[0];
    let imageUrl;

    if(file.type.includes('image')){
        fetch('/s3url').then(res => res.json())
        .then(url => {
            fetch(url, {
                method: 'PUT',
                headers: new Headers({'Content-Type': 'image/jpeg'}),
                body: file
            }).then(res => {
                imagePath = res.url.split("?")[0];
                let productImage = document.querySelector('.upload-img');
                productImage.src = imagePath;
                uploadPath = imagePath;
            })
            console.log(url);
        })
    }
})

//form submission

let addProductBtn = document.querySelector('.add-product-btn');
let loader = document.querySelector('.loading-container');
let productName = document.querySelector('.product-title');
let shortDes = document.querySelector('.product-des');
let price = document.querySelector('.price');
let detail = document.querySelector('.des');
let tags = document.querySelector('.tags');



addProductBtn.addEventListener('click', () => {

    //verification
    if(productName.innerHTML == productName.getAttribute('data-placeholder')){
        showFormError('should enter product');
    } else if(shortDes.innerHTML == shortDes.getAttribute('data-placeholder')){
        showFormError('short des must be 80 letters long');
    
    }else if(price.innerHTML == price.getAttribute('data-placeholder') || !Number(price.innerHTML)){
        showFormError('enter valid price');
    }
    else if(detail.innerHTML == detail.getAttribute('data-placeholder')){
        showFormError('must enter');
    }else if(tags.innerHTML == tags.getAttribute('data-placeholder')){
        showFormError('enter tags');
    }else{
        //submit form
        loader.style.display = 'block';
        let data = productData();
        if(productId){
            data.Id = productId;
        }
        console.log(data)
        sendData('/add-product',data)
    }
})

const productData = () => {
    let tagsArr = tags.innerText.split(",");
    tagsArr.forEach((item,i)=> tagsArr[i].trim().toLowerCase());
     return{
        name: productName.innerText,
        shortDes: shortDes.innerText,
        price: price.innerText,
        detail: detail.innerText,
        tags:tagsArr,
        image:uploadPath,
        email: JSON.parse(sessionStorage.user).email,
        draft: false

     }
}

//edit page



const fetchProductData = () => {
    addProductBtn.innerHTML = 'save product';
    fetch('/get-products', {
        method: 'post',
        headers: new Headers({'Content-Type': 'application/json'}),
        body: JSON.stringify({id:productId})
    }).then(res => res.json)
    .then(data => {
        setFormData(data)
    })
    .catch(err => console.log(err))
}

const setFormData = (data) => {
    productName.innerHTML = data.name;
    shortDes.innerHTML = data.shortDes;
    price.innerHTML = data.price;
    detail.innerHTML = data.detail;
    tags.innerHTML = data.tags;

    let productImg = document.querySelector('.upload-img')
    productImg.src = imagePath = data.image;
}

let productId = null;
if(location.pathname != '/add-product'){
    productId = decodeURI(location.pathname.split('/').pop());
    fetchProductData();
}




