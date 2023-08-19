const mongoose = require('mongoose');

const fareSchema = new mongoose.Schema({
    amount: Number,
    currency: String,
    country: String,
    formattedFare: String
});

const Fare = mongoose.model('Fare', fareSchema);

module.exports = Fare;
