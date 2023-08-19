const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const swaggerUI = require('swagger-ui-dist');

var SwaggerUIBundle = require('swagger-ui-dist').SwaggerUIBundle

module.exports.handler = async (event, context) => {
    try {
        const swaggerFilePath = path.join(__dirname, 'swagger.yml'); // Ajusta la ruta al archivo YAML
        const swaggerContent = fs.readFileSync(swaggerFilePath, 'utf-8');
        const swaggerJSON = yaml.load(swaggerContent);

        const swaggerUIHTML = `
        <!DOCTYPE html>
        <html>
            <head>
            <title>Swagger UI</title>
            <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4.1.0/swagger-ui.css">
            </head>
            <body>
            <div id="swagger-ui"></div>
            <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4.1.0/swagger-ui-bundle.js"></script>
            <script>
                const spec = ${JSON.stringify(swaggerJSON)};
                const ui = SwaggerUIBundle({
                spec: spec,
                dom_id: '#swagger-ui',
                });
            </script>
            </body>
        </html>
        `;

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'text/html' },
            body: swaggerUIHTML,
        };
    } catch (error) {
        console.log(error)
        return {
            statusCode: 500,
            body: JSON.stringify({ error: `Ha ocurrido un error al cargar la especificación Swagger` }),
        };
    }
};