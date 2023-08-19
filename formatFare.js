const numeral = require('numeral');

function formatFare(amount, currency, country) {
    let respuesta = {
        codigo: null,
        mensaje: null
    }
    let formattedFare = "";
    let finalAmount = amount;
    let options = {
        symbol: null,
        displaySymbolBefore: null,
        formattedAmount: null
    }

    if (amount === 0) {
        respuesta.codigo = -3
        respuesta.mensaje = `Debe ingresar un valor mayor que 0 para 'amount'`
        return respuesta
    }

    if (currency.toLowerCase() === 'usd') {
        options.symbol = "$"
    }
    else if (currency.toLowerCase() === 'eur') {
        options.symbol = "€"
    }
    else {
        respuesta.codigo = -1
        respuesta.mensaje = `El campo 'currency' debe ser uno de los siguientes códigos de moneda: 'usd', 'eur'`
        return respuesta
    }

    if (country.toLowerCase() === 'usa') {
        options.displaySymbolBefore = true;
        // options.formattedAmount = finalAmount.toLocaleString('en-US')
        options.formattedAmount = numeral(finalAmount).format('0,0.00');
    }
    else if (country.toLowerCase() === 'argentina') {
        options.displaySymbolBefore = true;
        finalAmount = Math.round(amount);
        // options.formattedAmount = finalAmount.toLocaleString('es-AR')
        options.formattedAmount = numeral(finalAmount).format('0,0');
    }
    else if (country.toLowerCase() === 'spain') {
        options.displaySymbolBefore = false;
        finalAmount = Math.round(amount);
        // options.formattedAmount = finalAmount.toLocaleString('es-ES')
        options.formattedAmount = numeral(finalAmount).format('0,0');
    }
    else if (country.toLowerCase() === 'germany') {
        options.displaySymbolBefore = true;
        finalAmount = Math.round(amount);
        options.formattedAmount = finalAmount.toLocaleString('de-DE')
        // options.formattedAmount = numeral(finalAmount).format('0.0');
    }
    else {
        respuesta.codigo = -2
        respuesta.mensaje = `El campo 'country' debe ser uno de los siguientes países: 'usa', 'argentina', 'spain', 'germany'`
        return respuesta
    }

    if (options.displaySymbolBefore) {
        formattedFare = options.symbol + " " + options.formattedAmount
    } else {
        formattedFare = options.formattedAmount + " " + options.symbol
    }

    respuesta.codigo = 1
    respuesta.mensaje = formattedFare
    return respuesta
}

module.exports = { formatFare };
