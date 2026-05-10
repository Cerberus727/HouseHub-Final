




const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
require('dotenv').config();


const useMongoDB = !!process.env.MONGODB_URI;
const dbConfig = useMongoDB 
  ? require('./config/database_mongodb')
  : require('./config/database');

const { connectDB, testConnection } = useMongoDB 
  ? dbConfig 
  : { connectDB: async () => {}, testConnection: dbConfig.testConnection };


const errorHandler = require('./middleware/errorHandler');


const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const bookmarkRoutes = require('./routes/bookmarks');
const messageRoutes = require('./routes/messages');


const app = express();
const server = http.createServer(app);


const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000'];


const io = socketIO(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;


app.use(cors({
  origin: (origin, callback) => {
    
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});


app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'HouseHub API is running',
    timestamp: new Date().toISOString()
  });
});


app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/messages', messageRoutes);


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});


app.use(errorHandler);


const userSockets = new Map(); 

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  
  socket.on('join', (userId) => {
    userSockets.set(userId.toString(), socket.id);
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });

  
  socket.on('send_message', (data) => {
    const { receiverId, message } = data;
    const receiverSocketId = userSockets.get(receiverId.toString());
    
    if (receiverSocketId) {
      
      io.to(receiverSocketId).emit('receive_message', message);
    }
  });

  
  socket.on('typing', (data) => {
    const { receiverId, isTyping } = data;
    const receiverSocketId = userSockets.get(receiverId.toString());
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user_typing', { isTyping });
    }
  });

  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        break;
      }
    }
  });
});


const startServer = async () => {
  try {
    
    await connectDB();
    await testConnection();

    
    server.listen(PORT, () => {
      console.log('');
      console.log('🏠 ===================================');
      console.log('🏠   HouseHub API Server Started');
      console.log('🏠 ===================================');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 API URL: http://localhost:${PORT}`);
      console.log(`💬 Socket.IO enabled for real-time messaging`);
      console.log('🏠 ===================================');
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};


process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});


startServer();

module.exports = { app, io };
