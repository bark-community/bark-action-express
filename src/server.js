'use strict';

// *********************************************************************************
// name: bark-action-express
// author: @bark_protocol
// repo: github.com/bark-community/bark-action-express
// *********************************************************************************

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Import necessary modules and configurations
import { host, auto, rules } from './config.js';
import open from 'open';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { bark_mint } from './actions/bark_mint.js';
import { donation_sol } from './actions/donation_sol.js';
import { donation_usdc } from './actions/donation_usdc.js';
import { donation_bark } from './actions/donation_bark.js';

// Initialize express app
const app = express();

// Middleware setup
app.use(helmet()); // Adds various security headers
app.use(compression()); // Enables gzip compression
app.use(bodyParser.json()); // Parses JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parses URL-encoded bodies

// Enable CORS with predefined options
app.use(cors({
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Content-Encoding", "Accept-Encoding"],
  preflightContinue: true,
  optionsSuccessStatus: 204
}));

// Include and register routes for different actions
app.use("/bark-mint", bark_mint);
app.use("/donate-sol", donation_sol);
app.use("/donate-usdc", donation_usdc);
app.use("/donate-bark", donation_bark);

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
const server = app.listen(port, () => {
  console.log(`bark-action-express is running on port ${port}.`);

  if (host.includes("localhost") && auto) {
    const url = `https://dial.to/?action=bark-action:${host}/${auto}`;
    open(url).catch(err => {
      console.error(`Failed to open URL: ${url}`, err);
    });
  }
});

// Graceful shutdown
function shutdown() {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// *********************************************************************************
