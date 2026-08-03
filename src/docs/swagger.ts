// src/docs/swagger.ts

import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "My API",
      version: "1.0.0",
      description: "REST API documentation",
    },
    servers: [
      {
        url: "http://localhost:8080/api",
      },
    ],
  },
  apis: ["./src/modules/**/*.routes.ts"], // or "./src/**/*.ts"
};

export const swaggerSpec = swaggerJsdoc(options);