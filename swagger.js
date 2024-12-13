const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'streamflix API',
        description: 'API for a movie web app'
    },
    host: 'localhost:3000',
    schemes: ['https', 'http']
};

const outputFile = './swagger.json';
const endpointsFiles = ['./routes/index.js'];

// this will generate swagger.json
swaggerAutogen(outputFile, endpointsFiles, doc);
