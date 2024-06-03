window.onload = () => {
    if(!sessionStorage.user){
        location.replace('/login')
    }
    
}

//select place order button
const placeOrderBtn = document.querySelector('.place-order-btn');

    placeOrderBtn.addEventListener('click',() => {
    let address = getAddress();

    //send data to backend
    fetch('/stripe-checkout', {
        method: 'post',
        headers: new Headers({'Content-type': 'application/json'}),
        body: JSON.stringify({
            items: JSON.parse(localStorage.getItem('cart')),
            address: address,
            email: JSON.parse(sessionStorage.user).email
        })
    })
    .then(res => res.json())
    .then(url => {
        location.href = url;
    })
    .catch(err => console.log(err))
})
//form validation
const getAddress = () => {
    let address = document.querySelector('#address').value;
    let street = document.querySelector('#street').value;
    let city = document.querySelector('#city').value;
    let state = document.querySelector('#state').value;
    let pincode = document.querySelector('#pincode').value;
    let landmark = document.querySelector('#landmark').value;

    if(!address.length || !street.length || !state.length || !pincode.length || !landmark.length ) {
        return showFormError("fill all the inputs");
    }else{
        return{address,street,city,state,pincode,landmark}
    }

}