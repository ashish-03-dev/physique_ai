const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const cookieParser = require('cookie-parser');
const PORT = 4000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/userdb')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    uuid: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

// Middleware to handle user cookie
const userCookieMiddleware = async (req, res, next) => {
    try {
        if (req.cookies.userId) {
            const user = await User.findOne({ uuid: req.cookies.userId });
            if (user) {
                req.newUser = false; // Existing user
                return next();
            }
        }

        const newUuid = uuidv4();
        await User.create({ uuid: newUuid });

        res.cookie('userId', newUuid, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        req.newUser = true; // New user
        req.userId = newUuid; // Optional: forward userId
        next();
    } catch (error) {
        console.error('Middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


// Middleware setup
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(userCookieMiddleware);

// Routes
app.get('/', (req, res) => {
    if (req.newUser) {
        return res.json({ message: 'New user created', userId: req.userId });
    } else {
        return res.json({ message: 'Welcome back!' });
    }
});

app.use('/upload', require('./routes/upload'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/generate', require('./routes/generate'));
app.use('/generated', express.static(path.join(__dirname, 'generated')));
app.use('/image', require('./routes/imageRoutes'));
app.use('/analyze', require('./routes/analyze'));
app.use('/workout', require('./routes/workout'));

app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));