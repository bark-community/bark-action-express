# Bark Action Express

Bark Action Express is a Solana actions API server that facilitates various donation actions, including SOL, USDC, and BARK token donations. This server interacts with the Solana blockchain to perform token transfers and provides endpoints for configuring and processing donations.

## Features

- **Donation Endpoints**: APIs for donating SOL, USDC, and BARK tokens.
- **RPC Configuration**: Configurable RPC endpoints for Solana network interactions.
- **Security**: Includes middleware for enhanced security.

## Installation and Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/get-npm) (comes with Node.js)

### Installation

1. **Clone the Repository**:

    ```bash
    git clone https://github.com/bark-community/bark-action-express.git
    cd bark-action-express
    ```

2. **Install Dependencies**:

    ```bash
    npm install
    ```

### Configuration

1. **RPC Configuration**:

    Update the `rpcs/rpcs.json` file with your Solana RPC endpoints. This file should include an array of RPC URLs.

    ```json
    [
      { "url": "https://api.mainnet-beta.solana.com" },
      { "url": "https://api.testnet.solana.com" }
    ]
    ```

2. **Server Configuration**:

    Modify the `config.js` file to adjust server settings such as `host`, `PORT`, and `AUTO_ACTION`.

    ```javascript
    const LOCALHOST = "http://localhost"; // Default URL for local development
    const PORT = 3000; // Default port for local development
    const AUTO_ACTION = "donate-usdc-config"; // Dial.to test window; set to false for production

    let host = LOCALHOST; // Initialize host
    ```

### Running the Server

- **Development Mode**: For development with live reloading:

    ```bash
    npm run dev
    ```

- **Production Mode**: To start the server in production:

    ```bash
    npm start
    ```

### API Endpoints

- **GET /donate-sol-config**: Provides configuration for SOL donations.
- **POST /donate-sol-build**: Processes SOL donation transactions.

- **GET /donate-usdc-config**: Provides configuration for USDC donations.
- **POST /donate-usdc-build**: Processes USDC donation transactions.

- **GET /donate-bark-config**: Provides configuration for BARK token donations.
- **POST /donate-bark-build**: Processes BARK token donation transactions.

- **GET /actions.json**: Returns the action rules.

### Security

The server uses `helmet` middleware to enhance security by adding various HTTP headers. Ensure your deployment environment follows best security practices.

### License

This project is licensed under the [MIT License](LICENSE). See the LICENSE file for details.

### Contributing

Contributions are welcome! Please follow these steps for contributing:

1. Fork the repository.
2. Create a new branch for your feature or fix.
3. Make your changes and commit them with clear messages.
4. Push your branch and create a pull request.
