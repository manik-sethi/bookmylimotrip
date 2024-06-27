const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/limousine', { useNewUrlParser: true, useUnifiedTopology: true });

// Define User schema and model
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, unique: true },
    password: String
});

const User = mongoose.model('User', userSchema);

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public'))); // Serve static files from the "public" directory
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/limousine' })
}));

// Routes
app.post('/api/signup', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword
        });

        await newUser.save();
        req.session.userId = newUser._id;
        req.session.firstName = newUser.firstName; // Store the user's first name in the session
        res.status(201).json({ success: true, message: 'User created successfully.' });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ success: false, message: 'Email already in use.' });
        } else {
            res.status(500).json({ success: false, message: 'Internal server error.' });
        }
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            res.status(400).json({ success: false, message: 'Invalid email or password.' });
        } else {
            req.session.userId = user._id;
            req.session.firstName = user.firstName; // Store the user's first name in the session
            res.json({ success: true, message: 'Login successful.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});
// Add this route to handle booking and payment
app.post('/api/book', (req, res) => {
    const {
        serviceType,
        pickupDate,
        pickupTime,
        pickupLocation,
        dropoffLocation,
        passengers,
        luggage,
        cardNumber,
        expiryDate,
        cvv
    } = req.body;

    // Here you would normally handle payment processing with a payment gateway

    // Save booking details to the database (excluding payment details for security reasons)
    const booking = new Booking({
        serviceType,
        pickupDate,
        pickupTime,
        pickupLocation,
        dropoffLocation,
        passengers,
        luggage,
        userId: req.session.userId
    });

    booking.save((err) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Booking failed.' });
        } else {
            res.status(201).json({ success: true, message: 'Booking successful.' });
        }
    });
});

// Define Booking schema and model
const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    serviceType: String,
    pickupDate: String,
    pickupTime: String,
    pickupLocation: String,
    dropoffLocation: String,
    passengers: Number,
    luggage: Number,
    createdAt: { type: Date, default: Date.now }
});

const Booking = mongoose.model('Booking', bookingSchema);

app.get('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Internal server error.' });
        } else {
            res.json({ success: true, message: 'Logout successful.' });
        }
    });
});

// Route to get the current user's session data
app.get('/api/session', (req, res) => {
    if (req.session.userId) {
        res.json({ loggedIn: true, firstName: req.session.firstName });
    } else {
        res.json({ loggedIn: false });
    }
});

// Serve index.html for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Serve other HTML files
app.get('/signup.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'signup.html'));
});

app.get('/fleet.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'fleet.html'));
});

app.get('/services.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'services.html'));
});

app.get('/about.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'about.html'));
});

app.get('/contact.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'contact.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
