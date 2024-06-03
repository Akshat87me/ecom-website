//navbar

const navbar = document.querySelector('.navbar');

window.addEventListener('scroll',() => {
    if(scrollY >= 180){
        navbar.classList.add('bg');
    }else{
        navbar.classList.remove('bg')
    }
    
})
const createNavbar =() => {
    let navbar = document.querySelector('.navbar ');

    navbar.innerHTML += `
    <ul class="links-container">
    <li class="link-item"><a href="index.html" class="link active">home</a></li>
    <li class="link-item"><a href="product.html" class="link">products</a></li>
    <li class="link-item"><a href="about.html" class="link">about</a></li>
    <li class="link-item"><a href="contact.html" class="link">contact</a></li>
    </ul>
    <div class="user-interactions">
    <div class="search-box">
        <input type="text" class="search" placeholder="search item">
        <button class="search-btn"> <img src="../assets/search.png" alt=""></button>
    </div>
    <div class="cart" onclick="location.href = '/cart'">
        <img src="../assets/cart.png" class="cart-icon" alt="">
        <span class="cart-item-count">00</span>

    </div>
    <div class="user">
        <img src="../assets/user.png" class="user-icon" alt="">
        <div class="user-icon-popup">
            <p>login to your account</p>
            <a>login</a>

        </div>

    </div>

</div>

`
}

createNavbar();


//login popup
let userIcon = document.querySelector('.user-icon');
let userPopupIcon = document.querySelector('.user-icon-popup');

userIcon.addEventListener('click', () => userPopupIcon.classList.toggle('active'))

let text = userPopupIcon.querySelector('p');
let actionBtn = userPopupIcon.querySelector('a');
let user =JSON.parse(sessionStorage.user || null);

if(user  != null){
    text.innerHTML = `logged in as, ${user.name}`;
    actionBtn.innerHTML = 'log out';
    actionBtn.addEventListener('click',() => logout());
}else{
    text.innerHTML = 'login to your accont';
    actionBtn.innerHTML = 'login'
    actionBtn.addEventListener('click', () => location.href = '/login');
}

const logout = () => {
    sessionStorage.clear()
    location.reload();
}

//search box

let searchBtn = document.querySelector('.search-btn')
let searchBox = document.querySelector('.search');

searchBtn.addEventListener('click', () => {
    if(searchBox.value.length){
        location.href = `/search/${searchBox.value}`;
    }
})

//nav chart

const updateNavCartCounter = () =>  {
    let cartCounter = document.querySelector('.cart-item-count');

    let cartItem = JSON.parse(localStorage.getItem('cart'));
    if (cartItem == null){
        cartCounter.innerHTML = '00';
    } else {
        if (cartItem.length > 9) {
            cartCounter.innerHTML = '9+';
        } else if (cartItem.length <= 9) {
            cartCounter.innerHTML = `0${cartItem.length}`; // Add the = sign here
        }
    }
}

updateNavCartCounter();




