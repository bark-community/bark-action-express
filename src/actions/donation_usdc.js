'use strict';

// *********************************************************************************
// USDC Donation Action
import { rpc, host } from '../config.js';
import { Connection, PublicKey } from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import barkbuild from '../barkbuild/barkbuild.js';
import Express from 'express';

const donation_usdc = Express.Router();
// *********************************************************************************

// *********************************************************************************
// USDC Donation Configuration Endpoint
donation_usdc.get('/donate-usdc-config', (req, res) => {
    const response = {
        icon: "https://barkdao.app/images/pfp-416-usdc.png",
        title: "Donate USDC to BarkDAO",
        description: "Enter USDC amount and click Send",
        label: "Donate",
        links: {
            actions: [
                {
                    label: "Send",
                    href: `${host}/donate-usdc-build?amount={amount}`,
                    parameters: [
                        {
                            name: "amount",
                            label: "USDC Amount",
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
// USDC Donation Transaction Endpoint
donation_usdc.post('/donate-usdc-build', async (req, res) => {
    try {
        const { account: userWallet } = req.body;
        const amount = parseFloat(req.query.amount);

        if (!userWallet) {
            return res.status(400).json({ message: "User wallet address is required." });
        }

        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({ message: "Invalid USDC amount specified." });
        }

        // Constants for USDC and recipient
        const DECIMALS = 6;
        const USDC_MINT_ADDRESS = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // USDC mint address
        const TREASURY_WALLET_ADDRESS = new PublicKey('BARKkeAwhTuFzcLHX4DjotRsmjXQ1MshGrZbn1CUQqMo'); // Treasury wallet

        // Initialize connection and addresses
        const connection = new Connection(rpc, "confirmed");
        const fromWallet = new PublicKey(userWallet);
        const transferAmount = amount * Math.pow(10, DECIMALS);

        // Retrieve or create token accounts
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

        // Check if recipient token account exists
        let createATA = false;
        try {
            await splToken.getAccount(connection, toTokenAccount, 'confirmed', splToken.TOKEN_PROGRAM_ID);
        } catch (error) {
            if (error.name === "TokenAccountNotFoundError") {
                createATA = true;
            } else {
                throw error;
            }
        }

        // Prepare transaction instructions
        const instructions = [];
        if (createATA) {
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

        const transferIx = splToken.createTransferInstruction(
            fromTokenAccount,
            toTokenAccount,
            fromWallet,
            transferAmount
        );
        instructions.push(transferIx);

        // Build and send transaction
        const txConfig = {
            rpc,
            account: userWallet,
            instructions,
            signers: false,
            serialize: true,
            encode: true,
            tables: false,
            tolerance: 1.2,
            compute: false,
            fees: false,
            priority: req.query.priority || "Medium"
        };

        const txResponse = await barkbuild.tx(txConfig);
        txResponse.message = `You successfully sent ${amount} USDC!`;
        res.json(txResponse);
    } catch (error) {
        console.error("Error processing USDC donation:", error);
        res.status(500).json({ message: "Internal server error while processing the donation." });
    }
});
// *********************************************************************************

export { donation_usdc };
