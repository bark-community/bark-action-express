'use strict';

// *********************************************************************************
// Server Configuration
const LOCALHOST = process.env.LOCALHOST || "http://localhost"; // Default URL for local development
const PORT = process.env.PORT || 3000; // Default port for local development
const AUTO_ACTION = process.env.AUTO_ACTION || "donate-usdc-config"; // Dial.to test window; set to false for production

let host = `${LOCALHOST}:${PORT}`; // Initialize host with port

// Server Configuration
// *********************************************************************************

// *********************************************************************************
// Action Rules for Development
const rules = {
  "rules": [
    { "pathPattern": "/donate-sol-config", "apiPath": `${host}/donate-sol-config` },
    { "pathPattern": "/donate-usdc-config", "apiPath": `${host}/donate-usdc-config` },
    { "pathPattern": "/donate-bark-config", "apiPath": `${host}/donate-bark-config` }
  ]
};
// Action Rules for Development
// *********************************************************************************

// *********************************************************************************
// RPC Configuration
const RPC_FILE_PATH = process.env.RPC_FILE_PATH || "rpcs/rpcs.json"; // Path to RPC configuration file
const RPC_INDEX = parseInt(process.env.RPC_INDEX, 10) || 0; // Index of the RPC URL in the configuration file

import fs from 'fs';

// Function to load RPC configuration
function loadRPCConfig(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    const rpcData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(rpcData);
  } catch (error) {
    console.error(`Error reading RPC configuration file at ${filePath}: ${error.message}`);
    process.exit(1); // Exit process with failure code
  }
}

const rpcs = loadRPCConfig(RPC_FILE_PATH);
const rpc = rpcs[RPC_INDEX]?.url; // Optional chaining for safety

// Validate RPC URL
if (!rpc) {
  console.error("RPC URL is missing in the configuration file.");
  process.exit(1); // Exit process with failure code
}

// Export configuration
export { host, RPC_FILE_PATH as rpcFile, RPC_INDEX as rpcId, AUTO_ACTION as auto, rpcs, rpc, rules };
// *********************************************************************************
