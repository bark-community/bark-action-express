'use strict';

// *********************************************************************************
// BARK Donation Action
import { rpc, host } from '../config.js';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import barkbuild from '../barkbuild/barkbuild.js';
import Express from 'express';

const donationBarkRouter = Express.Router();
// *********************************************************************************

// *********************************************************************************
// BARK Donation Configuration
donationBarkRouter.get('/donate-bark-config', (req, res) => {
    const response = {
        icon: "https://ucarecdn.com/74392932-2ff5-4237-a1fa-e0fd15725ecc/bark.svg",
        title: "Donate BARK to Charity Aid Campaign",
        description: "Enter BARK amount and click Send",
        label: "Donate",
        links: {
            actions: [
                {
                    label: "Send",
                    href: `${host}/donate-bark-build?amount={amount}`,
                    parameters: [
                        {
                            name: "amount", // Input field name
                            label: "BARK Amount", // Text input placeholder
                            required: true
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
// BARK Donation Transaction
donationBarkRouter.post('/donate-bark-build', async (req, res) => {
    const { account: userWallet } = req.body;
    const amount = parseFloat(req.query.amount);
    const priority = req.query.priority || 'Medium';

    // Validate inputs
    if (!userWallet) {
        return res.status(400).json({ message: "User wallet address is required." });
    }

    if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: "Invalid BARK amount specified." });
    }

    // Convert BARK amount to lamports (1 BARK = 1e9 lamports)
    const lamports = amount * 1_000_000_000;

    try {
        const fromPublicKey = new PublicKey(userWallet);
        const charityPublicKey = new PublicKey("BARKkeAwhTuFzcLHX4DjotRsmjXQ1MshGrZbn1CUQqMo"); // Replace with the actual charity account address

        // Create transaction instruction
        const transferInstruction = SystemProgram.transfer({
            fromPubkey: fromPublicKey,
            toPubkey: charityPublicKey,
            lamports
        });

        // Build transaction payload
        const transactionPayload = {
            rpc, // RPC endpoint
            account: userWallet, // User's wallet address
            instructions: [transferInstruction], // Array of instructions
            signers: false, // Default to false
            serialize: true, // Default to true
            encode: true, // Default to true
            tables: false, // Default to false
            tolerance: 2, // Default tolerance level
            compute: false, // Default to false
            fees: false, // Default to false; Helius RPC required if true
            priority // Transaction priority
        };

        // Package the transaction
        const transactionResponse = await barkbuild.tx(transactionPayload);

        // Add success message
        transactionResponse.message = `You successfully sent ${amount} BARK!`;
        res.json(transactionResponse);
    } catch (error) {
        console.error('Error processing BARK donation:', error);
        res.status(500).json({ message: "An internal server error occurred while processing the donation." });
    }
});
// *********************************************************************************

export { donationBarkRouter };
