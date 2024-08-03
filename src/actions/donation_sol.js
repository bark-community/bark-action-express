'use strict';

// *********************************************************************************
// SOL Donation Action
import { rpc, host } from '../config.js';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import barkbuild from '../barkbuild/barkbuild.js';
import Express from 'express';

const donation_sol = Express.Router();
// *********************************************************************************

// *********************************************************************************
// SOL Donation Configuration Endpoint
// Provides configuration details for initiating a SOL donation
donation_sol.get('/donate-sol-config', (req, res) => {
    const response = {
        icon: "https://barkdao.app/images/pfp-416.png",
        title: "Donate SOL to BarkDAO",
        description: "Enter the amount of SOL you wish to donate and click Send.",
        label: "Donate",
        links: {
            actions: [
                {
                    label: "Send",
                    href: `${host}/donate-sol-build?amount={amount}`,
                    parameters: [
                        {
                            name: "amount", // Input field name
                            label: "SOL Amount", // Placeholder text
                            required: true // Field is mandatory
                        }
                    ]
                }
            ]
        }
    };
    res.json(response);
});
// *********************************************************************************

// *********************************************************************************
// SOL Donation Transaction Endpoint
// Handles the donation transaction by transferring SOL to the charity wallet
donation_sol.post('/donate-sol-build', async (req, res) => {
    try {
        // Extract and validate input
        const { account: userWallet } = req.body;
        const amount = parseFloat(req.query.amount);

        if (!userWallet) {
            return res.status(400).json({ message: "User wallet address is required." });
        }

        // Validate user wallet address
        try {
            new PublicKey(userWallet);
        } catch (e) {
            return res.status(400).json({ message: "Invalid user wallet address." });
        }

        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({ message: "Invalid SOL amount specified. Amount should be a positive number." });
        }

        // Convert SOL amount to lamports (1 SOL = 1e9 lamports)
        const lamports = amount * 1_000_000_000;
        const fromPubkey = new PublicKey(userWallet);
        const toPubkey = new PublicKey("BARKkeAwhTuFzcLHX4DjotRsmjXQ1MshGrZbn1CUQqMo"); // Replace with the actual charity account address

        // Create transaction instruction for transferring SOL
        const transferInstruction = SystemProgram.transfer({
            fromPubkey,
            toPubkey,
            lamports
        });

        // Prepare transaction configuration
        const txConfig = {
            rpc, // RPC endpoint
            account: userWallet, // User's wallet address
            instructions: [transferInstruction], // Array of instructions
            signers: [], // No additional signers needed for this transaction
            serialize: true, // Serialize the transaction
            encode: true, // Encode the transaction
            tables: false, // Do not include tables
            tolerance: 2, // Tolerance level for transaction
            compute: false, // Do not include compute budget
            fees: false, // Do not include fees
            priority: req.query.priority || "Medium" // Transaction priority
        };

        // Build and send the transaction
        const txResponse = await barkbuild.tx(txConfig);
        txResponse.message = `Successfully sent ${amount} SOL! Thank you for your donation.`;
        res.json(txResponse);
    } catch (error) {
        console.error("Error processing SOL donation:", error.message);
        res.status(500).json({ message: "Internal server error while processing the donation." });
    }
});
// *********************************************************************************

export { donation_sol };
