const express = require('express');
const mongoose = require('mongoose');

const app = express();


mongoose.connect('mongodb+srv://alexds:passtest@cluster0.erpuayi.mongodb.net/test',
{ useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(() => console.log('Connexion à MongoDB échouée !'));

const sauceRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');



app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);
 

module.exports = app;