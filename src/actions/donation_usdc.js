'use strict';

// *********************************************************************************
// USDC Donation Action
import { rpc, host } from '../config.js';
import { Connection, PublicKey } from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import barkbuild from '../barkbuild/barkbuild.js';
import Express from 'express';
import { mockData } from '../mockData.js';

const donation_usdc = Express.Router();
// *********************************************************************************

// *********************************************************************************
// USDC Donation Configuration Endpoint
donation_usdc.get('/donate-usdc-config', (req, res) => {
    res.json(mockData.donationUsdcConfig);
});
// *********************************************************************************

// *********************************************************************************
// USDC Donation Transaction Endpoint
donation_usdc.post('/donate-usdc-build', async (req, res) => {
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
            return res.status(400).json({ message: "Invalid USDC amount specified. Amount should be a positive number." });
        }

        const DECIMALS = 6;
        const USDC_MINT_ADDRESS = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // USDC mint address
        const TREASURY_WALLET_ADDRESS = new PublicKey('BARKkeAwhTuFzcLHX4DjotRsmjXQ1MshGrZbn1CUQqMo'); // Treasury wallet address

        const connection = new Connection(rpc, "confirmed");
        const fromWallet = new PublicKey(userWallet);
        const transferAmount = Math.floor(amount * Math.pow(10, DECIMALS)); // Convert amount to smallest unit

        // Get associated token accounts
        const fromTokenAccount = await splToken.getAssociatedTokenAddress(
            USDC_MINT_ADDRESS,
            fromWallet,
            false,
            splToken.TOKEN_PROGRAM_ID,
            splToken.ASSOCIATED_TOKEN_PROGRAM_ID
        );

        const toTokenAccount = await splToken.getAssociatedTokenAddress(
            USDC_MINT_ADDRESS,
            TREASURY_WALLET_ADDRESS,
            false,
            splToken.TOKEN_PROGRAM_ID,
            splToken.ASSOCIATED_TOKEN_PROGRAM_ID
        );

        let createATA = false;
        try {
            // Check if the recipient's token account exists
            await splToken.getAccount(connection, toTokenAccount, 'confirmed', splToken.TOKEN_PROGRAM_ID);
        } catch (error) {
            if (error.name === "TokenAccountNotFoundError") {
                createATA = true; // Set flag to create account if it doesn't exist
            } else {
                throw error;
            }
        }

        const instructions = [];
        if (createATA) {
            // Create associated token account if necessary
            const createATAIx = splToken.createAssociatedTokenAccountInstruction(
                fromWallet,
                toTokenAccount,
                TREASURY_WALLET_ADDRESS,
                USDC_MINT_ADDRESS,
                splToken.TOKEN_PROGRAM_ID,
                splToken.ASSOCIATED_TOKEN_PROGRAM_ID
            );
            instructions.push(createATAIx);
        }

        // Create transfer instruction
        const transferIx = splToken.createTransferInstruction(
            fromTokenAccount,
            toTokenAccount,
            fromWallet,
            transferAmount
        );
        instructions.push(transferIx);

        // Transaction configuration
        const txConfig = {
            rpc,
            account: userWallet,
            instructions,
            signers: [],
            serialize: true,
            encode: true,
            tables: false,
            tolerance: 1.2,
            compute: false,
            fees: false,
            priority: req.query.priority || "Medium"
        };

        // Build and send the transaction
        const txResponse = await barkbuild.tx(txConfig);
        txResponse.message = `Successfully sent ${amount} USDC! Thank you for your donation.`;
        res.json(txResponse);
    } catch (error) {
        console.error("Error processing USDC donation:", error.stack || error.message);
        res.status(500).json({ message: "Internal server error while processing the donation." });
    }
});
// *********************************************************************************

export { donation_usdc };
