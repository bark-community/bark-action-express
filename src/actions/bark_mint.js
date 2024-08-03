'use strict';

// *********************************************************************************
// CNFT Minter Action
import { rpc, host } from '../config.js';
import { Connection, PublicKey, Keypair, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import BufferLayout from "@solana/buffer-layout";
import BN from "bn.js";
import barkbuild from '../barkbuild/bark.js';
import Express from 'express';

const barkbuild_mint = Express.Router();

// Define layouts for custom struct
const publicKeyLayout = (property = "publicKey") => BufferLayout.blob(32, property);
const uint64Layout = (property = "uint64") => BufferLayout.blob(8, property);

// Define the program state structure
const BARK_PROGRAM_STATE = BufferLayout.struct([
    BufferLayout.u8("is_initialized"),
    uint64Layout("next_paid_index"),
    uint64Layout("next_index"),
    uint64Layout("max"),
    publicKeyLayout("merkle_tree"),
    publicKeyLayout("collection_mint"),
    publicKeyLayout("collection_metadata"),
    publicKeyLayout("collection_master_edition"),
    uint64Layout("fee_lamports"),
    publicKeyLayout("bark_protocol_treasury"),
    publicKeyLayout("artist_treasury"),
    uint64Layout("default_per_wallet"),
    uint64Layout("default_time_limit"),
    BufferLayout.u8("whitelist_only"),
    BufferLayout.u8("whitelist_discount"),
]);

// *********************************************************************************

// *********************************************************************************
// Mint Configuration Endpoint
barkbuild_mint.get('/bark-mint-config', (req, res) => {
    const response = {
        icon: "https://ucarecdn.com/74392932-2ff5-4237-a1fa-e0fd15725ecc/bark.svg",
        title: "Mint (0.15 BARK CNFT)",
        description: "Mint a BARK NFT here!",
        label: "Mint",
        links: {
            actions: [
                {
                    label: "Mint",
                    href: `${host}/bark-mint-build?priority=High`,
                }
            ]
        }
    };
    res.json(response);
});
// *********************************************************************************

// *********************************************************************************
// Mint Transaction Endpoint
barkbuild_mint.post('/bark-mint-build', async (req, res) => {
    const userWallet = req.body.account;
    const priority = req.query.priority || 'Medium';

    // Validate inputs
    if (!userWallet) {
        return res.status(400).json({ message: "User wallet address is required." });
    }

    if (!['VeryHigh', 'High', 'Medium', 'Low', 'Min'].includes(priority)) {
        return res.status(400).json({ message: "Invalid or missing transaction priority." });
    }

    try {
        const connection = new Connection(rpc, "confirmed");
        const programId = new PublicKey("BARKkeAwhTuFzcLHX4DjotRsmjXQ1MshGrZbn1CUQqMo");
        const wallet = new PublicKey(userWallet);

        // Fetch program state
        const [programStatePDA] = PublicKey.findProgramAddressSync([Buffer.from("program-state")], programId);
        const programState = await connection.getAccountInfo(programStatePDA);

        if (!programState) {
            throw new Error("Program state not found.");
        }

        const decodedState = BARK_PROGRAM_STATE.decode(programState.data);
        const feeLamports = new BN(decodedState.fee_lamports, 10, "le").toNumber();
        const barkProtocolTreasury = new PublicKey(decodedState.bark_protocol_treasury);
        const whitelistOnly = new BN(decodedState.whitelist_only, 10, "le").toNumber() === 1;
        const whitelistDiscount = new BN(decodedState.whitelist_discount, 10, "le").toNumber();

        // Calculate total fee
        let totalFee = feeLamports;
        if (whitelistOnly) {
            totalFee = feeLamports * (whitelistDiscount / 100);
        }

        // Create temporary fee account
        const tempFeeAccount = new Keypair();
        const createTempFeeAccountIx = SystemProgram.createAccount({
            programId,
            space: 0,
            lamports: totalFee,
            fromPubkey: wallet,
            newAccountPubkey: tempFeeAccount.publicKey,
        });

        // Prepare transaction instruction
        const [receiptStatePDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("receipt-state"), wallet.toBytes(), tempFeeAccount.publicKey.toBytes()],
            programId
        );
        const data = Buffer.from([5]); // 5 = cnft_minter PayForMint instruction

        const keys = [
            { pubkey: wallet, isSigner: true, isWritable: true },
            { pubkey: programStatePDA, isSigner: false, isWritable: true },
            { pubkey: PublicKey.findProgramAddressSync([Buffer.from("wallet-state"), wallet.toBytes()], programId)[0], isSigner: false, isWritable: true },
            { pubkey: tempFeeAccount.publicKey, isSigner: true, isWritable: true },
            { pubkey: receiptStatePDA, isSigner: false, isWritable: true },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
            { pubkey: barkProtocolTreasury, isSigner: false, isWritable: true },
        ];

        const mintIx = new TransactionInstruction({
            programId,
            data,
            keys,
        });

        // Build transaction payload
        const transactionPayload = {
            rpc,
            account: userWallet,
            signers: [tempFeeAccount],
            serialize: true,
            encode: true,
            table: false,
            tolerance: 1.2,
            priority,
            instructions: [createTempFeeAccountIx, mintIx],
            compute: false,
            fees: false,
        };

        const tx = await barkbuild.tx(transactionPayload);
        tx.message = "You minted a BARK CNFT!";
        res.json(tx);

    } catch (error) {
        console.error('Error processing CNFT minting:', error);
        res.status(500).json({ message: "An internal server error occurred while processing the minting." });
    }
});
// *********************************************************************************

export { barkbuild_mint };
