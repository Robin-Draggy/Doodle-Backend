import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

const app = express();

// Security headers
app.use(helmet());

// Logging
app.use(morgan('dev'));

// Rate limiting (basic)
app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);

// CORS
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Cookies
app.use(cookieParser());

// Static files
app.use(express.static('public'));

// Health check route (important in production)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});


// Routes
import { router as userRoutes } from './routes/user.routes.js';
import { router as productRoutes } from './routes/product.routes.js';
import { router as categoryRoutes } from './routes/category.routes.js';
import { router as reviewRoutes } from './routes/review.routes.js';
import { router as wishlistRoutes } from './routes/wishlist.routes.js';
import { router as cartRoutes } from './routes/cart.routes.js';
import { router as addressRoutes } from './routes/address.routes.js';
import { ApiError } from './utils/ApiError.js';

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/addresses', addressRoutes);

// Global error handler

app.use((err, req, res, next) => {
  console.log('ERROR:', err);

  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(err);
  }

  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

export default app;
