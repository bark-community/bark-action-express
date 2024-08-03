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
// Endpoint to provide donation configuration
donationBarkRouter.get('/donate-bark-config', (req, res) => {
    const response = {
        icon: "https://ucarecdn.com/74392932-2ff5-4237-a1fa-e0fd15725ecc/bark.svg",
        title: "Donate BARK to Charity Aid Campaign",
        description: "Enter the amount of BARK you wish to donate and click Send.",
        label: "Donate",
        links: {
            actions: [
                {
                    label: "Send",
                    href: `${host}/donate-bark-build?amount={amount}`,
                    parameters: [
                        {
                            name: "amount", // Input field name
                            label: "BARK Amount", // Placeholder text
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
// BARK Donation Transaction
// Endpoint to handle the donation transaction
donationBarkRouter.post('/donate-bark-build', async (req, res) => {
    const { account: userWallet } = req.body;
    const amount = parseFloat(req.query.amount);
    const priority = req.query.priority || 'Medium';

    // Validate inputs
    if (!userWallet) {
        return res.status(400).json({ message: "User wallet address is required." });
    }

    if (!PublicKey.isOnCurve(userWallet)) {
        return res.status(400).json({ message: "Invalid user wallet address." });
    }

    if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: "Invalid BARK amount specified. Amount should be a positive number." });
    }

    // Convert BARK amount to lamports (1 BARK = 1e9 lamports)
    const lamports = amount * 1_000_000_000;

    try {
        const fromPublicKey = new PublicKey(userWallet);
        const charityPublicKey = new PublicKey("BARKkeAwhTuFzcLHX4DjotRsmjXQ1MshGrZbn1CUQqMo"); // Replace with actual charity account address

        // Create transaction instruction for transferring BARK
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
            signers: [], // No additional signers needed for this transaction
            serialize: true, // Serialize the transaction
            encode: true, // Encode the transaction
            tables: false, // Do not include tables
            tolerance: 2, // Tolerance level for transaction
            compute: false, // Do not include compute budget
            fees: false, // Do not include fees
            priority // Transaction priority
        };

        // Package and send the transaction
        const transactionResponse = await barkbuild.tx(transactionPayload);

        // Add success message to response
        transactionResponse.message = `Successfully sent ${amount} BARK! Thank you for your donation.`;
        res.json(transactionResponse);
    } catch (error) {
        console.error('Error processing BARK donation:', error.message);
        res.status(500).json({ message: "An internal server error occurred while processing the donation." });
    }
});
// *********************************************************************************

export { donationBarkRouter };
