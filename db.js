const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://adminapp:adminapp@everymundo.aijly.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Ha ocurrido un error en la conexión a MongoDB:'));
db.once('open', () => {
    console.log('Conectado a MongoDB Atlas');
});

module.exports = db;
