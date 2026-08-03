import express from 'express'
import type {Express} from 'express'
import { authRouter } from './modules/auth/auth.routes';
import { errorHandler } from './middleware/erroeHandler';
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { swaggerSpec } from './docs/swagger';
import { roleRouter } from './modules/roles/roles.routes';

export const app: Express = express();

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
    },
  },
  apis: ["./src/modules/**/*.ts"],
};


app.use(express.json())
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(errorHandler)
app.use('/api/auth',authRouter);
app.use('/api/roles',roleRouter);