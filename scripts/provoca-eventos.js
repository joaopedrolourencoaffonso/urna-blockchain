const hre = require("hardhat");
const { expect } = require("chai");

async function main() {
  try {
    const lista_de_eleitores = await ethers.getSigners();
    const cinco_eleitores = lista_de_eleitores.slice(0,4);
    const outros_eleitores = lista_de_eleitores.slice(5,12);
    const Contrato = await ethers.getContractFactory("PesquisaDeOpiniao");
    const contrato = await Contrato.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");

    // Adiciona eleitor
    let approveTx;
    let receipt;

    for (let eleitor of lista_de_eleitores) {
        approveTx = await contrato.adicionaEleitor(eleitor);
        approveTx.wait();
    }
    //
    approveTx = await contrato.cadastrarVotacao("string","string",3);
    approveTx.wait();
    approveTx = await contrato.cadastrarVotacao("string","string",3);
    approveTx.wait();
    approveTx = await contrato.cadastrarVotacao("string","string",3);
    approveTx.wait();

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
  process.exit(0);
}

main();