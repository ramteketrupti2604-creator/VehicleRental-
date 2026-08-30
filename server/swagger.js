const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Vehicle Rental System API',
      version: '1.0.0',
      description: 'MERN Stack Internship Assignment - Vehicle Rental APIs'
    },
    servers: [{ url: 'http://localhost:5000' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    }
  },
  // YE LINE SABSE IMPORTANT HAI - Yahi galat hogi tumhari
  apis: ['./routes/*.js', './server.js'], // agar routes folder me hai
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;