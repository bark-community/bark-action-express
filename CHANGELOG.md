# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **CNFT Minter Action:**
  - **Mint Configuration Endpoint (`/bark-mint-config`):**
    - Provides configuration details for minting a BARK CNFT, including an icon, title, description, and a link to initiate the minting process.
  - **Mint Transaction Endpoint (`/bark-mint-build`):**
    - Handles CNFT minting transactions by validating inputs, calculating fees, and preparing transaction instructions.
    - Includes logic to create a temporary fee account, encode transaction instructions, and handle various transaction priorities (VeryHigh, High, Medium, Low, Min).

### Updated
- **Mint Transaction Processing:**
  - Integrated comprehensive fee calculation based on program state and whitelist discounts.
  - Improved validation for user wallet addresses and transaction priority settings.
  - Refined transaction payload configuration to include correct handling of fees, instructions, and account signers.

### Fixed
- **Fee Calculation and Account Management:**
  - Corrected fee calculation logic for CNFT minting, ensuring proper handling of whitelist discounts and temporary fee accounts.
  - Addressed issues related to the creation and management of temporary fee accounts to ensure successful minting transactions.

### Removed
- **Deprecated or Unused Features:**
  - Removed outdated or unused components from the minting logic, focusing on the new streamlined process for CNFT minting.

### Miscellaneous
- **Documentation and Comments:**
  - Updated and clarified comments and documentation to provide a clearer understanding of the CNFT minting process and code functionality.
  - Added details on the custom struct layouts and program state structures used in the CNFT minting logic.
