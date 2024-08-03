'use strict';

// *********************************************************************************
// Imports
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet'; // For added security
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json'; // Swagger documentation
import { barkbuild_mint } from './actions/bark_mint.js';
import { donation_sol } from './actions/donation_sol.js';
import { donation_usdc } from './actions/donation_usdc.js';
import { donation_bark } from './actions/donation_bark.js';
import { host, auto, rules } from './config.js';

// *********************************************************************************
// Initialize server
const app = express();

// Middleware setup
app.use(helmet()); // Adds various security headers
app.use(bodyParser.json());

// Enable CORS with predefined options
app.use(cors({
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Content-Encoding", "Accept-Encoding"],
  preflightContinue: true,
  optionsSuccessStatus: 204
}));

// Middleware to set additional headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Encoding, Accept-Encoding');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.setHeader('Content-Encoding', 'gzip'); // Changed to gzip for better compression
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Include and register actions
app.use("/", barkbuild_mint);
app.use("/", donation_sol);
app.use("/", donation_usdc);
app.use("/", donation_bark);

// Setup Swagger UI for API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Route handlers
app.get("/actions.json", (req, res) => {
  res.json(rules);
});

app.get("/", (req, res) => {
  res.json({ message: 'bark-action-express server is up and running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "An internal server error occurred." });
});

// Start server and optionally open URL
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`bark-action-express is running on port ${port}.`);

  if (host.includes("localhost") && auto) {
    const url = `https://dial.to/?action=bark-action:${host}/${auto}`;
    open(url).catch(err => {
      console.error(`Failed to open URL: ${url}`, err);
    });
  }
});
