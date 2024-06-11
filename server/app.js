require('dotenv').config();
const express = require('express');
const { Web3 } = require('web3');

const app = express();
const port = 3000;

// Load environment variables
const blockchainAddress = process.env.ADDRESS;
const blockchainPort = process.env.PORT;
const smartContractAddress = process.env.SMART_CONTRACT_ADDRESS;

// Setup Web3 connection
const web3 = new Web3(`http://${blockchainAddress}:${blockchainPort}`);

// pegando a ABI do contrato
const fs = require('fs');
const jsonFile = '..\\artifacts\\contracts\\Rocket.sol\\Rocket.json'; // Adjust the path as needed
const parsed = JSON.parse(fs.readFileSync(jsonFile));
const contractABI = parsed.abi;

// Create contract instance
const contract = new web3.eth.Contract(contractABI, smartContractAddress);

app.get('/', async (req, res) => {
    try {
        // Call the getMessage function
        const message = await contract.methods.getStatus().call();
        
        // Send the message as the response
        res.send(`<h1>Message from Smart Contract: ${message}</h1>`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving message from smart contract');
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
