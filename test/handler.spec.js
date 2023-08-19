const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const fareService = require('../services/fareService');
const handler = require('../handler');
const formatFare = require('../formatFare');

describe('Handler', function () {
    describe('getFares', function () {
        it('Debería retornar un array de Fares', async function () {
            const mockFares = [{}, {}];
            sinon.stub(fareService, 'getAllFares').returns(mockFares);

            const response = await handler.getFares();

            expect(response.statusCode).to.equal(200);
            expect(JSON.parse(response.body)).to.deep.equal({ fares: mockFares });

            fareService.getAllFares.restore();
        });

        it('Debería manejar un error y retornar un 500', async function () {
            sinon.stub(fareService, 'getAllFares').throws(new Error('Error simulado'));

            const response = await handler.getFares();

            expect(response.statusCode).to.equal(500);
            expect(JSON.parse(response.body)).to.deep.equal({ error: 'Ha ocurrido un error' });

            fareService.getAllFares.restore();
        });
    });

    describe('getFare', function () {
        let fareServiceStub;

        beforeEach(function () {
            fareServiceStub = sinon.stub(fareService, 'getFareById');
        });

        afterEach(function () {
            fareServiceStub.restore();
        });

        it('Debería retornar un Fare existente', async function () {
            const mockFare = {};
            const mockEvent = { pathParameters: { id: 'someId' } };
            fareServiceStub.returns(mockFare);

            const response = await handler.getFare(mockEvent);

            expect(response.statusCode).to.equal(200);
            expect(JSON.parse(response.body)).to.deep.equal(mockFare);
        });

        it('Debería retornar 404 si no se encuentra el Fare', async function () {
            const mockEvent = { pathParameters: { id: 'nonExistentId' } };
            fareServiceStub.returns(null);

            const response = await handler.getFare(mockEvent);

            expect(response.statusCode).to.equal(404);
            expect(JSON.parse(response.body)).to.deep.equal({ error: 'No existe un Fare con el id ingresado' });
        });

        it('Debería manejar un error en fareService y retornar un 500', async function () {
            const mockEvent = { pathParameters: { id: 'someId' } };
            fareServiceStub.throws(new Error('Error simulado'));

            const response = await handler.getFare(mockEvent);

            expect(response.statusCode).to.equal(500);
            expect(JSON.parse(response.body)).to.deep.equal({ error: 'Ha ocurrido un error' });
        });
    });

    describe('createFare', function () {
        let formatFareStub;

        beforeEach(function () {
            formatFareStub = sinon.stub(formatFare, 'formatFare');
        });

        afterEach(function () {
            sinon.restore();
        });

        it('Debería crear un nuevo Fare', async function () {
            const mockFareData = { amount: 100, currency: 'USD', country: 'USA' };
            const mockFormattedFare = '$ 100.00';
            const mockCreatedFare = {};

            formatFareStub.returns({ codigo: 0, mensaje: mockFormattedFare });
            sinon.stub(fareService, 'createFare').returns(mockCreatedFare);

            const mockEvent = {
                body: JSON.stringify(mockFareData)
            };

            const response = await handler.createFare(mockEvent);

            expect(response.statusCode).to.equal(201);
            expect(JSON.parse(response.body)).to.deep.equal({ mensaje: 'Fare creado con éxito', fareCreado: mockCreatedFare });

            formatFare.formatFare.restore();
            fareService.createFare.restore();
        });

        it('Debería manejar un error en el formato y retornar un 400', async function () {
            const mockFareData = { amount: 100, currency: 'USD', country: 'US' };
            const mockFormatError = "El campo 'country' debe ser uno de los siguientes países: 'usa', 'argentina', 'spain', 'germany'";

            formatFareStub.returns({ codigo: -1, mensaje: mockFormatError });

            const mockEvent = {
                body: JSON.stringify(mockFareData)
            };

            const response = await handler.createFare(mockEvent);

            expect(response.statusCode).to.equal(400);
            expect(JSON.parse(response.body)).to.deep.equal({ error: mockFormatError });

            formatFare.formatFare.restore();
        });

        it('Debería manejar un error en fareService y retornar un 500', async function () {
            const mockFareData = { amount: 100, currency: 'USD', country: 'USA' };

            formatFareStub.returns({ codigo: 0, mensaje: '$ 100.00' });

            sinon.stub(fareService, 'createFare').throws(new Error('Error simulado'));

            const mockEvent = {
                body: JSON.stringify(mockFareData)
            };

            const response = await handler.createFare(mockEvent);

            expect(response.statusCode).to.equal(500);
            expect(JSON.parse(response.body)).to.deep.equal({ error: 'Ha ocurrido un error' });

            formatFare.formatFare.restore();
            fareService.createFare.restore();
        });
    });

    describe('updateFare', function () {
        let fareGetServiceStub;
        let fareServiceStub;
        let formatFareStub;

        beforeEach(function () {
            fareGetServiceStub = sinon.stub(fareService, 'getFareById');
            fareServiceStub = sinon.stub(fareService, 'updateFare');
            formatFareStub = sinon.stub(formatFare, 'formatFare');
        });

        afterEach(function () {
            sinon.restore();
        });

        it('Debería actualizar un Fare existente', async function () {
            const mockId = '6151c19d8a483e0017f0e7a7';
            const mockEvent = {
                pathParameters: { id: mockId },
                body: JSON.stringify({
                    amount: 150,
                    currency: 'EUR',
                    country: 'Spain'
                })
            };

            const mockFareConsultado = { _id: mockId, amount: 100, currency: 'USD', country: 'USA' };
            const mockFareActualizado = { _id: mockId, amount: 150, currency: 'EUR', country: 'Spain', formattedFare: '€ 150.00' };

            fareGetServiceStub.returns(mockFareConsultado);
            formatFareStub.returns({ codigo: 1, mensaje: '€ 150.00' });
            fareServiceStub.returns(mockFareActualizado);

            const response = await handler.updateFare(mockEvent);

            expect(response.statusCode).to.equal(200);
            expect(JSON.parse(response.body)).to.deep.equal({ mensaje: 'Fare actualizado con éxito', fareActualizado: mockFareActualizado });

            fareService.getFareById.restore();
            formatFare.formatFare.restore();
            fareService.updateFare.restore();
        });


        it('Debería manejar un error en el formato y retornar un 400', async function () {
            const mockId = '6151c19d8a483e0017f0e7a7';
            const mockEvent = {
                pathParameters: { id: mockId },
                body: JSON.stringify({
                    amount: 150,
                    currency: 'EURO',
                    country: 'Spain'
                })
            };

            const mockFareConsultado = { _id: mockId, amount: 100, currency: 'USD', country: 'USA' };
            const mockFormatError = "El campo 'currency' debe ser uno de los siguientes códigos de moneda: 'usd', 'eur'";

            fareGetServiceStub.returns(mockFareConsultado);
            formatFareStub.returns({ codigo: -1, mensaje: mockFormatError });

            const response = await handler.updateFare(mockEvent);

            expect(response.statusCode).to.equal(400);
            expect(JSON.parse(response.body)).to.deep.equal({ error: mockFormatError });

            fareService.getFareById.restore();
            formatFare.formatFare.restore();
        });

        it('Debería manejar un error en fareService y retornar un 500', async function () {
            const mockId = '6151c19d8a483e0017f0e7a7';
            const mockEvent = {
                pathParameters: { id: mockId },
                body: JSON.stringify({
                    amount: 150,
                    currency: 'EUR',
                    country: 'Spain'
                })
            };

            const mockFareConsultado = { _id: mockId, amount: 100, currency: 'USD', country: 'USA' };
            const mockFormattedFare = '€ 150';
            const mockUpdatedFare = {};
            const mockErrorMessage = 'Error simulado';

            fareGetServiceStub.returns(mockFareConsultado);
            formatFareStub.returns({ codigo: 0, mensaje: mockFormattedFare });
            fareServiceStub.throws(new Error(mockErrorMessage));

            const response = await handler.updateFare(mockEvent);

            expect(response.statusCode).to.equal(500);
            expect(JSON.parse(response.body)).to.deep.equal({ error: 'Ha ocurrido un error' });

            fareService.getFareById.restore();
            formatFare.formatFare.restore();
            fareService.updateFare.restore();
        });
    });

    describe('deleteFare', function () {
        it('Debería eliminar un Fare existente', async function () {
            const mockId = '6151c19d8a483e0017f0e7a7';
            const mockEvent = {
                pathParameters: { id: mockId }
            };

            const mockFareEliminado = { _id: mockId, amount: 100, currency: 'USD', country: 'USA' };

            sinon.stub(fareService, 'deleteFare').returns(mockFareEliminado);

            const response = await handler.deleteFare(mockEvent);

            expect(response.statusCode).to.equal(200);
            expect(JSON.parse(response.body)).to.deep.equal({ mensaje: 'Fare eliminado con éxito', fareEliminado: mockFareEliminado });

            fareService.deleteFare.restore();
        });

        it('Debería manejar un Fare inexistente y retornar un 404', async function () {
            const mockId = '6151c19d8a483e0017f0e7a7';
            const mockEvent = {
                pathParameters: { id: mockId }
            };

            sinon.stub(fareService, 'deleteFare').returns(null);

            const response = await handler.deleteFare(mockEvent);

            expect(response.statusCode).to.equal(404);
            expect(JSON.parse(response.body)).to.deep.equal({ error: 'No existe un Fare con el id ingresado' });

            fareService.deleteFare.restore();
        });

        it('Debería manejar un error y retornar un 500', async function () {
            const mockId = '6151c19d8a483e0017f0e7a7';
            const mockEvent = {
                pathParameters: { id: mockId }
            };
            const mockErrorMessage = 'Error simulado';

            sinon.stub(fareService, 'deleteFare').throws(new Error(mockErrorMessage));

            const response = await handler.deleteFare(mockEvent);

            expect(response.statusCode).to.equal(500);
            expect(JSON.parse(response.body)).to.deep.equal({ error: 'Ha ocurrido un error' });

            fareService.deleteFare.restore();
        });
    });
});
