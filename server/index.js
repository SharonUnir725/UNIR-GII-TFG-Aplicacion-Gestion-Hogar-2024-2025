// server/index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json()); 

//comprobar que el usuario está autenticado via JWT y provee req.user para rutas protegidas.
const authenticate = require('./src/middleware/auth'); 

// Rutas de autenticación (register / login)
const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

// Rutas de usuario
const userRoutes = require('./src/routes/userRoutes');
app.use('/api/users', userRoutes);

// Rutas de familias (usuarios autenticados)
const familyRoutes = require('./src/routes/familyRoutes');
app.use('/api/families', authenticate, familyRoutes);

// Rutas de notificaciones (usuarios autenticados)**
const notificationRoutes = require('./src/routes/notificationRoutes');
app.use('/api/notifications', authenticate, notificationRoutes);


// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Conectado a MongoDB"))
  .catch(err => console.error("Error de conexión a MongoDB:", err));

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));

