const hre = require("hardhat");

// 7 eleitores
lista_de_eleitores = ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
"0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
"0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
"0x90F79bf6EB2c4f870365E785982E1f101E93b906",
"0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
"0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
"0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"
];

async function main() {
  try {
    const Contrato = await ethers.getContractFactory("Voting");
    const contrato = await Contrato.deploy("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");

    //await contrato.deployed();

    // Caso queira interagir com um contrato já deployado
    /*
    const Contrato = await hre.ethers.getContractFactory("Voting");
    const enderecoContrato = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const contrato = await Contrato.attach(enderecoContrato);
    */

    // Adiciona eleitor
    let approveTx;

    for (let eleitor of lista_de_eleitores) {
        approveTx = await contrato.adicionaEleitor(eleitor);
        approveTx.wait();
    }
    // Retrieve the updated message
    let eleitores = await contrato.retornaEleitores();
    console.log("Lista de eleitores: ", eleitores);

    approveTx = await contrato.excluiEleitor(lista_de_eleitores[3]);
    approveTx.wait();

    console.log("-----");

    eleitores = await contrato.retornaEleitores();
    console.log("Lista de eleitores: ", eleitores);

    let saida = await contrato.isEleitor(lista_de_eleitores[0]);
    console.log("O endereço ", lista_de_eleitores[0], ": ", saida);

    saida = await contrato.numeroDeEleitores();
    console.log("O número atual de eleitores é: ", saida);

    saida = await contrato.cadastrarVotacao("Plutão é um planeta?","Em Andamento");

    saida = await contrato.statusDeVotacao("Plutão é um planeta?");
    console.log("O status da votação é: ", saida);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
  process.exit(0);
}

main();
