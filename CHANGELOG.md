# Changelog

## [Unreleased]

### Added
- **SOL Donation Action**
  - Added `/donate-sol-config` endpoint for SOL donation configuration.
  - Added `/donate-sol-build` endpoint to handle SOL donation transactions.
  - Included robust input validation and error handling for SOL transactions.
  - Provided clear success messages for successful SOL donations.

- **USDC Donation Action**
  - Added `/donate-usdc-config` endpoint for USDC donation configuration.
  - Added `/donate-usdc-build` endpoint to handle USDC donation transactions.
  - Implemented USDC token account creation if not existing.
  - Enhanced error handling and validation for USDC transactions.
  - Provided clear success messages for successful USDC donations.

- **BARK CNFT Minting Action**
  - Added `/bark-mint-config` endpoint to configure CNFT minting.
  - Added `/bark-mint-build` endpoint to handle CNFT minting transactions.
  - Included robust transaction preparation and fee calculation for CNFT minting.
  - Provided clear success messages for successful CNFT minting.

### Changed
- **USDC Donation Action**
  - Updated handling of floating-point precision for USDC amount conversion.
  - Added PublicKey validation for user wallet addresses.

- **Error Handling and Logging**
  - Improved error messages and logging for better diagnostics across all endpoints.

### Fixed
- **USDC Donation Action**
  - Corrected handling of USDC token account retrieval and creation.

- **General Improvements**
  - Enhanced input validation across all donation and minting endpoints.
  - Improved response messages for clarity and user guidance.

## [Previous Versions]

### [1.0.0] - 2024-08-01
- Initial release with basic donation endpoints for SOL, USDC, and CNFT minting.
