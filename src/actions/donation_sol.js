'use strict';

// *********************************************************************************
// SOL Donation Action
import { rpc, host } from '../config.js';
import { PublicKey, SystemProgram } from "@solana/web3.js";
import barkbuild from '../barkbuild/barkbuild.js';
import Express from 'express';

const donation_sol = Express.Router();
// *********************************************************************************

// *********************************************************************************
// SOL Donation Configuration Endpoint
donation_sol.get('/donate-sol-config', (req, res) => {
    const response = {
        icon: "https://barkdao.app/images/pfp-416.png",
        title: "Donate SOL to BarkDAO",
        description: "Enter SOL amount and click Send",
        label: "Donate",
        links: {
            actions: [
                {
                    label: "Send",
                    href: `${host}/donate-sol-build?amount={amount}`,
                    parameters: [
                        {
                            name: "amount",
                            label: "SOL Amount",
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
// SOL Donation Transaction Endpoint
donation_sol.post('/donate-sol-build', async (req, res) => {
    try {
        // Extract and validate input
        const { account: userWallet } = req.body;
        const amount = parseFloat(req.query.amount);

        if (!userWallet) {
            return res.status(400).json({ message: "User wallet address is required." });
        }

        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({ message: "Invalid SOL amount specified." });
        }

        // Convert SOL amount to lamports
        const lamports = amount * 1_000_000_000;
        const fromPubkey = new PublicKey(userWallet);
        const toPubkey = new PublicKey("BARKkeAwhTuFzcLHX4DjotRsmjXQ1MshGrZbn1CUQqMo"); // Treasury wallet address

        // Create transaction instruction
        const transferInstruction = SystemProgram.transfer({
            fromPubkey,
            toPubkey,
            lamports
        });

        // Prepare transaction configuration
        const txConfig = {
            rpc,
            account: userWallet,
            instructions: [transferInstruction],
            signers: false,
            serialize: true,
            encode: true,
            tables: false,
            tolerance: 2,
            compute: false,
            fees: false,
            priority: req.query.priority || "Medium"
        };

        // Build and send transaction
        const txResponse = await barkbuild.tx(txConfig);
        txResponse.message = `You have successfully sent ${amount} SOL!`;
        res.json(txResponse);
    } catch (error) {
        console.error("Error processing SOL donation:", error);
        res.status(500).json({ message: "Internal server error while processing donation." });
    }
});
// *********************************************************************************

export { donation_sol };
