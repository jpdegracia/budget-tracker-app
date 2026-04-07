import 'dotenv/config';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { connectDB } from './db/connectDB.js';

//import of routes
import userRoutes from './routes/UserRoutes.js';

dotenv.config();

const app = express();

const corsOption = {
    origin: (origin, callback) => {
        const allowedOrigins = [
            'http://localhost:4000',
            'http://localhost:5173'
        ];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`CORS: origin '($origin)' not allowed`);
            callback(new Error('Not Allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'UPDATE', 'PATCH'],
    allowedHeaders: ['Content-type', 'Authorization']
};

const PORT = process.env.PORT || 4000;

app.use(cors(corsOption));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send("Hello Welcome to Budget Tracker API")
});

//API routes
app.use('/users', userRoutes);

//Database
connectDB()
    .then(() => {
        console.log('MongoDB connected successfully.');
        app.listen(PORT, () => {
            console.log(`Server is running on port: ${PORT}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });