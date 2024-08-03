'use strict';

// *********************************************************************************
// SOL Donation Action
import { rpc, host } from '../config.js';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import barkbuild from '../barkbuild/barkbuild.js';
import Express from 'express';
import { mockData } from '../mockData.js';

const donation_sol = Express.Router();
// *********************************************************************************

// *********************************************************************************
// SOL Donation Configuration Endpoint
donation_sol.get('/donate-sol-config', (req, res) => {
    res.json(mockData.donationSolConfig);
});
// *********************************************************************************

// *********************************************************************************
// SOL Donation Transaction Endpoint
donation_sol.post('/donate-sol-build', async (req, res) => {
    try {
        const { account: userWallet } = req.body;
        const amount = parseFloat(req.query.amount);

        if (!userWallet) {
            return res.status(400).json({ message: "User wallet address is required." });
        }

        try {
            new PublicKey(userWallet); // Validate the wallet address
        } catch (e) {
            return res.status(400).json({ message: "Invalid user wallet address." });
        }

        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({ message: "Invalid SOL amount specified. Amount should be a positive number." });
        }

        const lamports = Math.floor(amount * 1_000_000_000); // Convert SOL to lamports
        const fromPubkey = new PublicKey(userWallet);
        const toPubkey = new PublicKey("BARKkeAwhTuFzcLHX4DjotRsmjXQ1MshGrZbn1CUQqMo"); // Charity account address

        // Create transfer instruction
        const transferInstruction = SystemProgram.transfer({
            fromPubkey,
            toPubkey,
            lamports
        });

        // Transaction configuration
        const txConfig = {
            rpc,
            account: userWallet,
            instructions: [transferInstruction],
            signers: [],
            serialize: true,
            encode: true,
            tables: false,
            tolerance: 2,
            compute: false,
            fees: false,
            priority: req.query.priority || "Medium"
        };

        // Build and send the transaction
        const txResponse = await barkbuild.tx(txConfig);
        txResponse.message = `Successfully sent ${amount} SOL! Thank you for your donation.`;
        res.json(txResponse);
    } catch (error) {
        console.error("Error processing SOL donation:", error.stack || error.message);
        res.status(500).json({ message: "Internal server error while processing the donation." });
    }
});
// *********************************************************************************

export { donation_sol };
