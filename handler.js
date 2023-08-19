const { formatFare } = require('./formatFare');
const db = require('./db');
const fareService = require('./services/fareService');

module.exports.getFares = async () => {
    try {
        const fares = await fareService.getAllFares();

        return {
            statusCode: 200,
            body: JSON.stringify({ fares }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Ha ocurrido un error' }),
        };
    }
};

module.exports.getFare = async (event) => {
    try {
        const fareId = event.pathParameters.id;

        const fare = await fareService.getFareById(fareId);

        if (!(fare)) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: `No existe un Fare con el id ingresado` }),
            };
        }

        if ('_id' in fare) {
            return {
                statusCode: 200,
                body: JSON.stringify(fare),
            };
        } else if (fare) {
            if (fare.name && fare.name === "CastError") {
                return {
                    statusCode: 404,
                    body: JSON.stringify({ error: `No existe un Fare con el id ingresado` }),
                };
            } else {
                return {
                    statusCode: 200,
                    body: JSON.stringify(fare),
                };
            }
        }
        else {

            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'No existe ningún fare con el id ingresado' }),
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Ha ocurrido un error' }),
        };
    }
};

module.exports.createFare = async (event) => {
    try {
        const { amount, currency, country } = JSON.parse(event.body);

        if (!amount || !currency || !country) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: `Los campos 'amount', 'currency', y 'country' son obligatorios` }),
            };
        }

        const respuestaFormato = formatFare(amount, currency, country);
        if (respuestaFormato.codigo < 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: respuestaFormato.mensaje }),
            };
        }

        const fareCreado = await fareService.createFare(amount, currency, country, respuestaFormato.mensaje);

        return {
            statusCode: 201,
            body: JSON.stringify({ mensaje: `Fare creado con éxito`, fareCreado }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Ha ocurrido un error' }),
        };
    }
};

module.exports.updateFare = async (event) => {
    try {
        const id = event.pathParameters.id;
        const { amount, currency, country } = JSON.parse(event.body);

        const fareConsultado = await fareService.getFareById(id);

        if (!(fareConsultado)) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: `No existe un Fare con el id ingresado` }),
            };
        }

        if (!('_id' in fareConsultado)) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: `No existe un Fare con el id ingresado` }),
            };
        }

        const respuestaFormato = formatFare(amount ? amount : fareConsultado.amount, currency ? currency : fareConsultado.currency,
            country ? country : fareConsultado.country);
        if (respuestaFormato.codigo < 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: respuestaFormato.mensaje }),
            };
        }

        const updatedFields = {}

        if (amount) {
            updatedFields.amount = amount
        }
        if (currency) {
            updatedFields.currency = currency
        }
        if (country) {
            updatedFields.country = country
        }
        updatedFields.formattedFare = respuestaFormato.mensaje

        const fareActualizado = await fareService.updateFare(id, updatedFields);

        if (!(fareActualizado)) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: `No existe un Fare con el id ingresado` }),
            };
        }

        if ('_id' in fareActualizado) {
            return {
                statusCode: 200,
                body: JSON.stringify({ mensaje: `Fare actualizado con éxito`, fareActualizado }),
            };
        } else {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: `No existe un Fare con el id ingresado` }),
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Ha ocurrido un error' }),
        };
    }
};

module.exports.deleteFare = async (event) => {
    try {
        const id = event.pathParameters.id;

        const fareEliminado = await fareService.deleteFare(id);

        if (!(fareEliminado)) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: `No existe un Fare con el id ingresado` }),
            };
        }

        if ('_id' in fareEliminado) {
            return {
                statusCode: 200,
                body: JSON.stringify({ mensaje: `Fare eliminado con éxito`, fareEliminado }),
            };
        } else {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: `No existe un Fare con el id ingresado` }),
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Ha ocurrido un error' }),
        };
    }
};