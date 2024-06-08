const { ethers } = require("ethers");

const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; // Your contract address
// AJUSTE ESSA LINHA PARA O SEU PATH
const contractArtifact = require("..\\artifacts\\contracts\\PesquisaDeOpiniao.sol\\PesquisaDeOpiniao.json"); // Adjust the path accordingly
const contractABI = contractArtifact.abi;

async function main() {
    const provider = ethers.getDefaultProvider("http://127.0.0.1:8545"); // Use the default provider
    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    const filter = contract.filters.VotacaoCadastrada(); // Replace with your actual event name
    const events = await contract.queryFilter(filter);

    events.forEach((event) => {
        console.log("Event:", event.event);
        console.log("Args:", event.args);
        console.log("Block Number:", event.blockNumber);
        console.log("Timestamp:", new Date(event.blockTimestamp * 1000).toLocaleString());
        console.log("--------------------");
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});