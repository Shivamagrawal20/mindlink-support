import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/database.js';

// Import routes
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import supportCircleRoutes from './routes/supportCircles.js';
import agoraRoutes from './routes/agora.js';
import moodRoutes from './routes/mood.js';
import gameRoutes from './routes/games.js';
import chatRoutes from './routes/chat.js';

// Import auto-close job
import closeExpiredRooms from './jobs/closeExpiredRooms.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Express
const app = express();

// CORS configuration - Must be FIRST, before any other middleware
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200,
}));

// Security middleware - Disable Helmet in development to avoid CORS issues
if (process.env.NODE_ENV === 'production') {
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));
}

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MindLink AI Backend is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/support-circles', supportCircleRoutes);
app.use('/api/agora', agoraRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/chat', chatRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  
  // Start auto-close job - check every minute
  setInterval(async () => {
    try {
      await closeExpiredRooms();
    } catch (error) {
      console.error('Error in auto-close job:', error);
    }
  }, 60 * 1000); // Run every 60 seconds (1 minute)
  
  console.log('⏰ Auto-close job started (checks every minute)');
});

