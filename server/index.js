// server/index.js
// Iniciar el backend

// Importación de dependencias necesarias
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Aplicación de middlewares globales
app.use(cors()); 
app.use(express.json()); 

// Middleware de autenticación para rutas protegidas
const authenticate = require('./src/middleware/auth'); 

// Definición de rutas públicas y protegidas
// Rutas de autenticación (login y registro)
const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

// Rutas de usuario
const userRoutes = require('./src/routes/userRoutes');
app.use('/api/users', userRoutes);

// Rutas de familias (usuarios autenticados)
const familyRoutes = require('./src/routes/familyRoutes');
app.use('/api/families', authenticate, familyRoutes);

// Rutas de notificaciones (usuarios autenticados)
const notificationRoutes = require('./src/routes/notificationRoutes');
app.use('/api/notifications', authenticate, notificationRoutes);

// Rutas de direcciones físicas (usuarios autenticados)
const addressRoutes = require('./src/routes/addressRoutes');
app.use('/api/address', authenticate, addressRoutes);

// Rutas de tareas (usuarios autenticados)
const taskRoutes = require('./src/routes/taskRoutes');
app.use('/api/tasks', authenticate, taskRoutes);

// Rutas de eventos (usuarios autenticados)
const eventRoutes = require('./src/routes/eventRoutes');
app.use('/api/events', authenticate, eventRoutes);

// Conexión a la base de datos MongoDB usando la URI desde .env
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Conectado a MongoDB"))
  .catch(err => console.error("Error de conexión a MongoDB:", err));

// Inicialización del servidor en el puerto especificado
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));

