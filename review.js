let ratingStarInput = [...document.querySelectorAll('.rating-star')];
let rate = 0;
ratingStarInput.map((star,index) =>{
    star.addEventListener('click', () =>{
        rate = `${index + 1}.0`;
        for(let i=0; i<5; i++)
        if(i <= index){
            ratingStarInput[i].src = "../assets/fill star.png";
        }
         else{
            ratingStarInput[i].src = "../assets/no fill star.png";
        
         }

    })
})

//add review form

let reviewHeadline = document.querySelector('.review-headline');
let review = document.querySelector('.review-field');
let loader = document.querySelector('.loading-container');

let addReviewBtn = document.querySelector('.add-review-btn');

addReviewBtn.addEventListener('click', () => {
    //form validation
    if(user == null){
        location.href = `/login?after_page=${productId}`
    }else{
        if(!reviewHeadline.value.length ||!review.value.length || rate == 0 ){
        showFormError('fill all the inputs');
    }else if(reviewHeadline.value.length>50){
        showFormError('headline should not be more than 50 letters');
    }else if(review.value.length>150){
        showFormError('review should not be more than 150 letters');
    }else{
        //send the data to backend
        loader.style.display = "block";
        sendData('/add-review', {
            headline: reviewHeadline.value,
            review: review.value,
            rate: rate,
            email: user.email,
            product: productId
        })
    }
    } 
})