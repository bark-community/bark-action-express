export const mockData = {
    donationSolConfig: {
        icon: "https://barkdao.app/images/pfp-416.png",
        title: "Donate SOL to BarkDAO",
        description: "Enter the amount of SOL you wish to donate and click Send.",
        label: "Donate",
        links: {
            actions: [
                {
                    label: "Send",
                    href: "/donate-sol-build?amount={amount}",
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
    },
    donationUsdcConfig: {
        icon: "https://barkdao.app/images/pfp-416-usdc.png",
        title: "Donate USDC to BarkDAO",
        description: "Enter the amount of USDC you wish to donate and click Send.",
        label: "Donate",
        links: {
            actions: [
                {
                    label: "Send",
                    href: "/donate-usdc-build?amount={amount}",
                    parameters: [
                        {
                            name: "amount", // Input field name
                            label: "USDC Amount", // Placeholder text
                            required: true // Field is mandatory
                        }
                    ]
                }
            ]
        }
    },
    donationBarkConfig: {
        icon: "https://ucarecdn.com/74392932-2ff5-4237-a1fa-e0fd15725ecc/bark.svg",
        title: "Donate BARK to Charity Aid Campaign",
        description: "Enter the amount of BARK you wish to donate and click Send.",
        label: "Donate",
        links: {
            actions: [
                {
                    label: "Send",
                    href: "/donate-bark-build?amount={amount}",
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
    },
    barkMintConfig: {
        icon: "https://ucarecdn.com/74392932-2ff5-4237-a1fa-e0fd15725ecc/bark.svg",
        title: "Mint (0.15 BARK CNFT)",
        description: "Mint a BARK NFT here!",
        label: "Mint",
        links: {
            actions: [
                {
                    label: "Mint",
                    href: "/bark-mint-build?priority=High",
                }
            ]
        }
    }
};
