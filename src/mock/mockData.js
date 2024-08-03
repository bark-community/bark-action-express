'use strict';

export const mockData = {
    donationSolConfig: {
        minimumAmount: 0.01,
        maximumAmount: 100,
        currency: 'SOL',
        description: 'Donate SOL to support our cause!',
        tiers: [
            { level: 'Bronze', minAmount: 0.01, maxAmount: 10 },
            { level: 'Silver', minAmount: 10.01, maxAmount: 50 },
            { level: 'Gold', minAmount: 50.01, maxAmount: 100 }
        ]
    },

    donationBarkConfig: {
        minimumAmount: 10,
        maximumAmount: 10000,
        currency: 'BARK',
        description: 'Donate BARK to support our cause!',
        tiers: [
            { level: 'Bronze', minAmount: 10, maxAmount: 1000 },
            { level: 'Silver', minAmount: 1001, maxAmount: 5000 },
            { level: 'Gold', minAmount: 5001, maxAmount: 10000 }
        ]
    },

    barkMintConfig: {
        mintingFee: 1,
        maximumMints: 10,
        currency: 'BARK',
        description: 'Mint your BARK NFT with the following details.',
        maxPerAccount: 5 // New field to specify the max number of NFTs per account
    }
};
