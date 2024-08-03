'use strict';

// *********************************************************************************
// name: bark-action-express
// author: @bark_protocol
// repo: github.com/bark-community/bark-action-express
// *********************************************************************************

// *********************************************************************************
// Import necessary modules and configurations
import { host, auto, rules } from './config.js';
import open from 'open';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Import route handlers
import { bark_mint } from './actions/bark_mint.js';
import { donation_sol } from './actions/donation_sol.js';
import { donation_usdc } from './actions/donation_usdc.js';
import { donation_bark } from './actions/donation_bark.js';

// Load environment variables
dotenv.config();

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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

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
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }
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

// *********************************************************************************
