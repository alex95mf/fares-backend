const Fare = require('../models/Fare');

async function createFare(amount, currency, country, formattedFare) {
    try {
        const fare = new Fare({ amount, currency, country, formattedFare });
        await fare.save();
        return fare;
    } catch (error) {
        return error;
    }
}

async function getAllFares() {
    try {
        const allFares = await Fare.find();
        return allFares;
    } catch (error) {
        return error;
    }
}

async function getFareById(id) {
    try {
        const fare = await Fare.findById(id);
        return fare;
    } catch (error) {
        return error;
    }

}

async function updateFare(id, updates) {
    try {
        const fare = await Fare.findByIdAndUpdate(id, updates, { new: true });
        return fare;
    } catch (error) {
        return error;
    }
}

async function deleteFare(id) {
    try {
        const fareEliminado = await Fare.findByIdAndDelete(id);
        return fareEliminado;
    } catch (error) {
        return error;
    }
}

module.exports = {
    createFare,
    getAllFares,
    getFareById,
    updateFare,
    deleteFare,
};
