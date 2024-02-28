import express from "express";
import bcrypt from "bcrypt";
import { initializeApp } from "firebase/app";
import {getFirestore,doc,collection,setDoc,getDoc,updateDoc, getDocs, query, where, deleteDoc} from "firebase/firestore"; 
import stripe from 'stripe';
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBeLf_hQcAwTwfxjM4OYlTUtMuMRX0I2xk",
  authDomain: "ecom-website-d19e5.firebaseapp.com",
  projectId: "ecom-website-d19e5",
  storageBucket: "ecom-website-d19e5.appspot.com",
  messagingSenderId: "566565615040",
  appId: "1:566565615040:web:622377d8c6dcd710a44425"
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
const db = getFirestore(); 

//init server
const app = express();

// middlewares
app.use(express.static("public"));
app.use(express.json())  //enables form sharing

//aws
import aws from "aws-sdk";
import "dotenv/config";

//aws setup
const region = "ap-south-1";
const bucketName = "ecom-website0";
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

aws.config.update({
    region,
    accessKeyId,
    secretAccessKey
})

//init s3
const s3 = new aws.S3();

//generate image url
async function generateURL(){
    let date = new Date();

    const imageName = `${date.getTime()}.jpeg`;

    const params = {
        Bucket: bucketName,
        Key: imageName,
        Expires: 300, //300ms
        ContentType: "image/jpeg"
    }
    
    const uploadURL = await s3.getSignedUrlPromise("putObject", params);
    return uploadURL;
}

app.get('/s3url', (req,res) => {
    generateURL().then(url => res.json(url));
})
//routes
//home route
app.get('/',(req,res)=> {
    res.sendFile("index.html", {root : "public"})
})

//signup
app.get('/signup',(req,res) => {
    res.sendFile("signup.html", {root : "public"})

})

app.post('/signup', (req,res) => {
    const { name, email, password, number, tac} = req.body;


    //form validation
    if(name.length < 3){
        res.json({'alert' : 'name must be 3 letters long'});
   } else if(!email.length){
       res.json({'alert' : 'enter your email'});
   } else if(password.length < 8){
       res.json({'alert' : 'password must be 8 letters long'});
   } else if(!Number(number) || number.length < 10){
       res.json({'alert' : 'invalid number,please enter valid number'});
   } else if(!tac){
       res.json({'alert' : 'you must agree to our terms and conditions'});
   }else{
      //store the data in db
      const users = collection(db,"users");

      getDoc(doc(users, email)).then(user => {
        if(user.exists()){
            return res.json({'alert' : 'email already exists'})
        }else{
            //encrypt the password
            bcrypt.genSalt(10,(err, salt) => {
                bcrypt.hash(password,salt, (err,hash) => {
                    req.body.password =hash;
                    req.body.seller = false;    
                    
                    //set the doc
                    setDoc(doc(users,email),req.body).then(data => {
                        res.json({
                            name: req.body.name,
                            email: req.body.email,
                            seller: req.body.seller,
                        })
                    })
                })
            })
        }
      })
   }

})

app.get('/login', (req,res) => {
    res.sendFile("login.html", { root: "public"})
})

app.post('/login', (req, res) => {
    let {email, password} = req.body;

    if(!email.length || !password.length){
        res.json({'alert' : 'fill all the inputs'})
    }

    const users = collection(db,"users");

    getDoc(doc(users, email))
    .then(user => {
        if(!user.exists()){
        return res.json({'alert' : 'email does not exists'});
        } else{
            bcrypt.compare(password, user.data().password,(err,result) => {
                if(result){
                    let data =user.data();
                    return res.json({
                    name: data.name,
                    email: data.email,
                    seller: data.seller
                    })
                } else{
                    return res.json({ 'alert' : 'password is incorrect'})
                }
            })
        }
    })
})

//seller route
app.get('/seller',(req,res) => {
    res.sendFile('seller.html', {root : "public"})
})

app.post('/seller',(req, res) => {
    let {name, address, about, number, email } = req.body;
    if(!name.length || !address.length || !about.length || number.length<10 || !Number(number)){
       return res.json({'alert' : 'some information(s) is/are incorrect '});
    } else{
        //update the seller status
        const sellers = collection(db, "sellers");
        setDoc(doc(sellers,email), req.body)
        .then(data => {
           const users = collection(db,"users");
           updateDoc(doc(users, email),{
            seller:true
           })
           .then(data => {
            res.json({'seller' : true})
           })
        })
    }
})

//dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile('dashboard.html', {root: "public"});
})

//add product
app.get('/add-product', (req,res) => {
    res.sendFile('add-product.html', {root : "public"});
})

app.get('/add-product/:id', (req,res) => {
    res.sendFile('add-product.html', {root : "public"});
})

app.post('/add-product', (req,res) => {
    let { name,shortDes, detail, price, image, tags, email, draft, id} = req.body;

    if(!name.length){
        res.json({'alert': 'should enter product'});
    } else if(!shortDes.length){
        res.json({'alert' : 'short des must be 80 letters long'});
    
    }else if(!price.length || !Number(price)){
        res.json({'alert' : 'enter valid price'});
    }
    else if(!detail.length){
        res.json({'alert' : 'must enter'});
    }else if(!tags.length){
        res.json({'alert' : 'enter tags'});
    }

    //add product
    let docName = id == undefined ? `${name.toLowerCase()}-${Math.floor(Math.random()* 50000)}` : id;


    let products = collection(db, "products");
    setDoc(doc(products, docName), req.body)
    .then(data => {
        res.json({ 'productId': docName, 'product': name });
    })
    .catch(err => {
        res.json({'alert' : 'some error occured'})
    })
})

app.post('/get-products', (req,res) => {
    let {email, id,tag} = req.body

    let products = collection(db, "products");
    let docRef;

    if(id){
        docRef = getDoc(doc(products, id));
    }
    else if(tag){
        docRef = getDocs(query(products,where("tags", "array-contains",tag)))
    }
    else{
        docRef = getDocs(query(products, where("email", "==", email)))

    }

    
    docRef.then(products => {
        if(products.empty){
            return res.json('no products');
        }
        let productArr = [];

        if(id){
            return res.json(products.data());
        }else{
            products.forEach(item => {
                let data = item.data();
                data.id = item.id;
                productArr.push(data);
            })
        }
        res.json(productArr);
    })
})



app.post('/delete-product', (req,res) => {
    let { id } = req.body;

    deleteDoc(doc(collection(db, "products"), id))
    .then(data => {
        res.json('success');
    }).catch(err => {
        res.json('err');
    })
})

app.get('/product/:id',(req,res) => {
    res.sendFile("product.html",{root: "public"})
} )

app.get('/search/:key', (req, res) => {
    res.sendFile("search.html", { root: "public" });
});


//review route
app.post('/add-review', (req,res) => {
    let { headline,review,rate,email,product} = req.body;
    //form validation
    if(!headline.length||!review.length || rate == 0 || email == null || !product ){
        return res.json({'alert':'fill all the inputs'});
    }

    // storing in the firestore
    let reviews = collection(db, "reviews");
    let docName = `review-${email}-${product}`;

    setDoc(doc(reviews,docName),req.body)
    .then(data => {
        return res.json({'review': req.body });
    }).catch(err => {
        return res.json({'alert': 'some err occured'});
    });
})

app.get('/cart', (req,res) => {
    res.sendFile("cart.html",{root :"public"})
})
app.get('/about', (req,res) => {
    res.sendFile("about.html",{root :"public"})
})
app.get('/checkout' ,(req,res) => {
    res.sendFile("checkout.html",{root :"public"})
});
//stripe payment
let stripeGateway = stripe(process.env.stripe_key);
let DOMAIN = process.env.DOMAIN;

app.post('/stripe-checkout', async (req,res) => {
    const session = await stripeGateway.checkout.sessions.create({
        payment_method_types:  ["card"],
        mode: "payment",
        success_url: `${DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}&order=${JSON.stringify(req.body)}`,
        cancel_url: `${DOMAIN}/CHECKOUT`,
        billing_address_collection: 'required', // Explicitly set this

        line_items: req.body.items.map(item => {
            return {
                price_data: {
                    currency: "inr",
                    product_data: {
                        name: item.name,
                        description: item.shortDes,
                        images: [item.image]
                    },
                    unit_amount: item.price * 100
                },
                quantity: item.item   
            };
        })  
    })
    res.json(session.url)

});

app.get('/success', async(req,res) => {
    let {order,session_id} = req.query;
    console.dir(stripeGateway)
    try{
        const session = await stripeGateway.checkout.session.retrieve(session_id);
        const customer = await stripeGateway.customers.retrieve(session.customer);  
    let date = new Date();
    let orders_collection = collection(db,"orders");
    let docName = `${customer.email}-order-${date.getTime()}`;
    
    setDoc(doc(orders_collection,docName), JSON.parse(order))
    .then(data => {
        res.redirect('/checkout?payment=done')
    })
    }catch(e){
        console.log(e)
        res.redirect("/404");
    }
})

//404 route
app.get('/404',(req,res) => {
    res.sendFile("404.html",{root :"public"})
})

app.use((req,res) => {
    res.redirect('/404')
})

app.use((err, req, res, next) => {
    console.error(err); // Log the error to the console
    res.status(500).json({ error: 'Internal Server Error' });
  });
  
app.listen(3000,() => {
    console.log('listening on port 3000')
})