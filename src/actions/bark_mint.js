'use strict';

// *********************************************************************************
// BARK Minting Action
import { rpc, host } from '../config.js';
import Express from 'express';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import barkbuild from '../barkbuild/barkbuild.js';
import { mockData } from '../mockData.js';

const barkMintRouter = Express.Router();
// *********************************************************************************

// *********************************************************************************
// BARK Minting Configuration Endpoint
barkMintRouter.get('/bark-mint-config', (req, res) => {
    res.json(mockData.barkMintConfig);
});
// *********************************************************************************

// *********************************************************************************
// BARK Minting Transaction Endpoint
barkMintRouter.post('/bark-mint-build', async (req, res) => {
    const { account: userWallet } = req.body;
    const priority = req.query.priority || 'Medium';

    // Validate user wallet address
    if (!userWallet) {
        return res.status(400).json({ message: "User wallet address is required." });
    }

    // Validate if user wallet address is a valid PublicKey
    try {
        new PublicKey(userWallet);
    } catch (error) {
        return res.status(400).json({ message: "Invalid user wallet address." });
    }

    try {
        const fromPublicKey = new PublicKey(userWallet);

        // Define minting instructions (Placeholder)
        // Replace with your actual minting logic and data
        const mintInstruction = new TransactionInstruction({
            keys: [
                { pubkey: fromPublicKey, isSigner: true, isWritable: true },
                // Add more keys as required by your minting logic
            ],
            programId: new PublicKey("BARK_CNFT_PROGRAM_ID"), // Replace with your actual program ID
            data: Buffer.from([]), // Replace with your actual minting data
        });

        // Define transaction configuration
        const txConfig = {
            rpc,
            account: userWallet,
            instructions: [mintInstruction], // Include actual minting instructions
            signers: [], // Include any signers if required
            serialize: true,
            encode: true,
            tables: false,
            tolerance: 2,
            compute: false,
            fees: false,
            priority
        };

        // Process the transaction
        try {
            const txResponse = await barkbuild.tx(txConfig);
            txResponse.message = `Successfully minted BARK NFT!`;
            res.json(txResponse);
        } catch (error) {
            console.error("Error processing BARK minting:", error.stack || error.message);
            res.status(500).json({ message: "Internal server error while processing the minting." });
        }
    } catch (error) {
        console.error("Error in BARK minting:", error.stack || error.message);
        res.status(500).json({ message: "Internal server error while processing the request." });
    }
});
// *********************************************************************************

export { barkMintRouter };
