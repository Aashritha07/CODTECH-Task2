const port = 4000;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const bcrypt = require('bcrypt');
const router = express.Router();
const {v4:uuid}= require('uuid')
const stripe = require('stripe')('sk_test_51PeuQrJCaPSpl3feX9Rbi7fUii1hEWlNZAEbtGTwcCaor3N6L4mb6r13WPkyrajyVDNbGw1m142sq3ugRsfsqewV00YA9BVKxO');

// const all_product = require(path.resolve(__dirname, '../Frontend/src/Components/Assets/all_product'));


app.use(express.json());
app.use(cors());

// Ensure upload directory exists
const uploadDir = './upload/images';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

mongoose.connect('mongodb://127.0.0.1:27017/e-commerce', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected...'))
.catch(err => console.error('MongoDB connection error:', err));

// Root route
app.get('/', (req, res) => {
    res.send('Express app is running');
});

// Image storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

// Serve images
app.use('/images', express.static(uploadDir));

// Upload endpoint for images
app.post('/upload', upload.single('product'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: 0, message: 'No file uploaded' });
    }
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    });
});

const productSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    new_price: {
        type: Number,
        required: true,
    },
    old_price: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    available: {
        type: Boolean,
        default: true,
    },
});

const Product = mongoose.model("Product", productSchema);

app.post('/addproduct', async (req, res) => {
    try {
        let products = await Product.find({});
        let id = products.length > 0 ? products[products.length - 1].id + 1 : 1;
        
        const product = new Product({
            id: id,
            name: req.body.name,
            image: req.body.image,
            category: req.body.category,
            new_price: req.body.new_price,
            old_price: req.body.old_price,
        });
        
        await product.save();
        res.json({
            success: true,
            name: req.body.name,
        });
    } catch (err) {
        console.error('Error adding product:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

app.post('/removeproduct', async (req, res) => {
    try {
        await Product.findOneAndDelete({ id: req.body.id });
        res.json({
            success: true,
            name: req.body.name
        });
    } catch (err) {
        console.error('Error removing product:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// User schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String,
    },
    cartData: {
        type: Object,
    },
    dat: {
        type: Date,
        default: Date.now,
    }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const Users = mongoose.model('Users', userSchema);

// Registering user
app.post('/signup', async (req, res) => {
    try {
        let check = await Users.findOne({ email: req.body.email });
        if (check) {
            return res.status(400).json({ success: false, errors: "Existing user found with same email address" });
        }

        let cart = {};
        for (let i = 0; i < 300; i++) {
            cart[i] = 0;
        }
        const user = new Users({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            cartData: cart,
        });

        await user.save();

        const data = {
            user: {
                id: user.id
            }
        }
        const token = jwt.sign(data, "secret-ecom");
        res.json({ success: true, token });

    } catch (err) {
        console.error('Error signing up user:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

app.get('/login', (req, res) => {
    res.send('This is a GET request');
});
// Login user
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, errors: "Please provide both email and password" });
        }

        let user = await Users.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, errors: "Wrong Email ID" });
        }

        // Compare password with hashed password
        const passCompare = await bcrypt.compare(password, user.password);
        if (!passCompare) {
            return res.status(400).json({ success: false, errors: "Wrong password" });
        }

        const data = {
            user: {
                id: user.id
            }
        };
        const token = jwt.sign(data, 'secret-ecom', { expiresIn: '1h' });

        res.json({ success: true, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, errors: "Server error" });
    }
});




const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        console.error('No token provided');
        return res.status(401).send({ errors: "Please authenticate using a valid token" });
    }
    try {
        console.log('Token received:', token);
        const data = jwt.verify(token, 'secret-ecom');
        req.user = data.user;
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        res.status(401).send({ errors: "Please authenticate using a valid token" });
    }
};

app.post('/addtocart', fetchUser, async (req, res) => {
    try {
        let userData = await Users.findOne({ _id: req.user.id });

        if (!userData) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const { itemId } = req.body;
        if (!itemId) {
            return res.status(400).json({ success: false, message: 'Item ID is required' });
        }

        const itemIdParsed = parseInt(itemId, 10);
        if (isNaN(itemIdParsed)) {
            return res.status(400).json({ success: false, message: 'Invalid Item ID' });
        }

        userData.cartData[itemIdParsed] = (userData.cartData[itemIdParsed] || 0) + 1;

        await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });

        res.json({ success: true, message: 'Item added to cart' });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});


app.post('/removefromcart', fetchUser, async (req, res) => {
    try {
        let userData = await Users.findOne({ _id: req.user.id });

        if (!userData) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!req.body.itemId) {
            return res.status(400).json({ success: false, message: 'Item ID is required' });
        }

        let itemId = parseInt(req.body.itemId, 10);

        if (userData.cartData[itemId] && userData.cartData[itemId] > 0) {
            userData.cartData[itemId] -= 1;

            if (userData.cartData[itemId] === 0) {
                delete userData.cartData[itemId]; // Optionally, you can remove the item from the cart if the quantity is zero.
            }

            await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });

            res.json({ success: true, message: 'Item removed from cart' });
        } else {
            res.status(400).json({ success: false, message: 'Item not found in cart or quantity is already zero' });
        }
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});



app.post('/getcart', fetchUser, async (req, res) => {
    try {
        console.log("Fetching cart items for user:", req.user.id);
        let userData = await Users.findOne({ _id: req.user.id });
        
        if (!userData) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(userData.cartData);
    } catch (error) {
        console.error('Error fetching cart data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.use('/images', express.static(path.join(__dirname, '../Frontend/src/Components/Assets')));


// app.post('/create-checkout-session', async (req, res) => {
//     const { products } = req.body;

//     const lineItems = products.map((product) => ({
//         price_data: {
//             currency: "usd", 
//             product_data: {
//                 name: product.name,
//                 images: [product.image]
//             },
//             unit_amount: product.new_price * 100, // Amount in cents
//         },
//         quantity: product.quantity
//     }));

//     try {
//         const session = await stripe.checkout.sessions.create({
//             payment_method_types: ["card"], // Corrected from "payment_mehod_types" to "payment_method_types"
//             line_items: lineItems,
//             mode: "payment", // Corrected from "Payment" to "payment"
//             success_url: "https://your-domain.com/success", // Provide your success URL
//             cancel_url: "https://your-domain.com/cancel" // Provide your cancel URL
//         });

//         res.json({ id: session.id }); // Corrected response format
//     } catch (error) {
//         console.error("Error creating checkout session:", error);
//         res.status(500).json({ error: error.message });
//     }
// });

app.get('/payment',async (req,res)=>{
    res.send('working')
})


app.post('/payment', async (req, res) => {
    console.log('Received request body:', req.body);
    try {
        const { products, token } = req.body;
        

        const line_items = products.map((item) => {
            const priceInCents = parseInt(item.price * 100, 10); // Ensure price is in cents and is a number
            const quantity = parseInt(item.quantity, 10); // Ensure quantity is a number

            if (isNaN(priceInCents) || isNaN(quantity)) {
                throw new Error('Invalid product price or quantity');
            }

            return {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.name,
                        images: [item.image],
                    },
                    unit_amount: priceInCents, // amount in cents
                },
                quantity: quantity,
            };
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            success_url: 'http://localhost:3000/Success',
            cancel_url: 'http://localhost:3000/Cancel',
            customer_email: token.email,
            shipping_address_collection: {
                allowed_countries: ['US', 'IN'],
            },
            shipping_options: [
                {
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: { amount: 0, currency: 'usd' },
                        display_name: 'Free shipping',
                        delivery_estimate: {
                            minimum: { unit: 'business_day', value: 5 },
                            maximum: { unit: 'business_day', value: 7 },
                        },
                    },
                },
            ],
        });

        res.status(200).json({ id: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error.message);
        res.status(400).json({ error: error.message });
    }
});


app.post('/create-checkout-session', async (req, res) => {
    try {
        const { products } = req.body;

        const line_items = products.map(product => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: product.name,
                    images: [product.image],
                },
                unit_amount: product.price * 100,
            },
            quantity: product.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            success_url: 'http://localhost:3000/success',
            cancel_url: 'http://localhost:3000/cancel',
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).send('Internal Server Error');
    }
});




// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
