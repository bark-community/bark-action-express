'use strict';

import { PublicKey, Connection, TransactionMessage, VersionedTransaction, ComputeBudgetProgram } from '@solana/web3.js';
import bs58 from 'bs58';

class BarkBuild {
    constructor() {
        this.name = "barkbuild";
    }

    /**
     * Polls for the status of a transaction until it is finalized or the maximum number of attempts is reached.
     * @param {string} cluster - The cluster URL.
     * @param {string} sig - The transaction signature.
     * @param {number} [max=10] - Maximum number of attempts.
     * @param {number} [interval=4] - Interval between attempts in seconds.
     * @returns {Promise<string>} - The status of the transaction.
     */
    async getStatus(cluster, sig, max = 10, interval = 4) {
        const connection = new Connection(cluster, "confirmed");
        let attempts = 0;

        return new Promise((resolve) => {
            const intervalID = setInterval(async () => {
                try {
                    const { value } = await connection.getSignatureStatuses([sig], { searchTransactionHistory: true });
                    const txStatus = value?.[0];

                    if (!txStatus) {
                        console.log("Failed to get status...");
                        return;
                    }

                    console.log(`${++attempts}: ${sig}`);
                    console.log(txStatus);

                    if (txStatus.confirmationStatus === "finalized") {
                        clearInterval(intervalID);
                        resolve(txStatus.err ? 'Program error!' : 'Finalized');
                    } else if (["confirmed", "processed"].includes(txStatus.confirmationStatus)) {
                        attempts = 0; // Reset attempts counter
                    }

                    if (++attempts >= max) {
                        clearInterval(intervalID);
                        resolve(`${max * interval} seconds max wait reached`);
                    }
                } catch (error) {
                    console.error("Error getting status:", error);
                    clearInterval(intervalID);
                    resolve('Error getting status');
                }
            }, interval * 1000);
        });
    }

    /**
     * Simulates a transaction to estimate compute unit limits.
     * @param {string} cluster - The cluster URL.
     * @param {object} payer - The payer object with publicKey property.
     * @param {Array} instructions - The transaction instructions.
     * @param {number} tolerance - Tolerance for compute units.
     * @param {string} blockhash - The recent blockhash.
     * @param {boolean} [tables=false] - Flag indicating if tables are used.
     * @returns {Promise<number|object>} - The compute unit limit or an error message.
     */
    async computeLimit(cluster, payer, instructions, tolerance, blockhash, tables = false) {
        const connection = new Connection(cluster, 'confirmed');
        const computeLimitIx = ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 });
        const allInstructions = [computeLimitIx, ...instructions];
        const transactionMessage = new TransactionMessage({
            payerKey: payer.publicKey,
            recentBlockhash: blockhash,
            instructions: allInstructions,
        }).compileToV0Message(tables ? tables : []);
        const tx = new VersionedTransaction(transactionMessage);

        try {
            const result = await connection.simulateTransaction(tx, { replaceRecentBlockhash: true, sigVerify: false });
            console.log("Simulation Results:", result.value);

            if (result.value.err) {
                return { message: "Error during simulation", logs: result.value.logs };
            }

            const consumedUnits = result.value.unitsConsumed;
            return Math.ceil(consumedUnits * tolerance);
        } catch (error) {
            console.error("Error simulating transaction:", error);
            return { message: "Error during simulation" };
        }
    }

    /**
     * Estimates the transaction fee based on priority level.
     * @param {string} cluster - The cluster URL.
     * @param {object} payer - The payer object with publicKey property.
     * @param {string} priorityLevel - The priority level ("High", "Medium", "Low").
     * @param {Array} instructions - The transaction instructions.
     * @param {string} blockhash - The recent blockhash.
     * @param {boolean} [tables=false] - Flag indicating if tables are used.
     * @returns {Promise<number>} - The estimated fee in microLamports.
     */
    async feeEstimate(cluster, payer, priorityLevel, instructions, blockhash, tables = false) {
        const transactionMessage = new TransactionMessage({
            payerKey: payer.publicKey,
            recentBlockhash: blockhash,
            instructions,
        }).compileToV0Message(tables ? tables : []);
        const tx = new VersionedTransaction(transactionMessage);
        const serializedTx = bs58.encode(tx.serialize());

        try {
            const response = await fetch(`${cluster}/rpc`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    id: "1",
                    method: "getPriorityFeeEstimate",
                    params: [
                        {
                            transaction: serializedTx, // Serialize and encode the transaction
                            options: { priorityLevel },
                        },
                    ],
                }),
            });

            const data = await response.json();
            console.log("Estimate response:", data);

            return Math.max(parseInt(data.result.priorityFeeEstimate, 10), 10_000); // Ensure a minimum fee
        } catch (error) {
            console.error("Error estimating fee:", error);
            return 10_000; // Default minimum fee in case of error
        }
    }

    /**
     * Creates a transaction with the given parameters and optionally signs, serializes, and encodes it.
     * @param {object} data - The transaction data.
     * @returns {Promise<object>} - The transaction result.
     */
    async tx(data) {
        const { rpc, account, instructions, signers = [], priority = "Medium", tolerance = 1.1, serialize = false, encode = false, tables = false, compute = true, fees = true } = data;

        if (!rpc || !account || !instructions) {
            return { message: "Missing required parameters" };
        }

        const payerPublicKey = new PublicKey(account);
        const connection = new Connection(rpc, "confirmed");
        const blockhash = (await connection.getLatestBlockhash('confirmed')).blockhash;
        const priorityLevel = priority === "Extreme" ? "VeryHigh" : priority;

        if (compute) {
            const computeLimit = await this.computeLimit(rpc, { publicKey: payerPublicKey }, instructions, tolerance, blockhash, tables);
            if (computeLimit.message) return computeLimit;
            instructions.unshift(ComputeBudgetProgram.setComputeUnitLimit({ units: computeLimit }));
        }

        if (fees) {
            const feeEstimate = await this.feeEstimate(rpc, { publicKey: payerPublicKey }, priorityLevel, instructions, blockhash, tables);
            instructions.unshift(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: feeEstimate }));
        }

        const transactionMessage = new TransactionMessage({
            payerKey: payerPublicKey,
            recentBlockhash: blockhash,
            instructions,
        }).compileToV0Message(tables ? tables : []);
        const tx = new VersionedTransaction(transactionMessage);

        if (signers.length > 0) {
            tx.sign(signers);
        }

        if (serialize) {
            return { message: "Success", transaction: tx.serialize() };
        }

        if (encode) {
            return { message: "Success", transaction: Buffer.from(tx.serialize()).toString("base64") };
        }

        return { message: "Success", transaction: tx };
    }
}

export default new BarkBuild();
