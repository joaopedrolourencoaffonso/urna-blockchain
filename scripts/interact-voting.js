//Esse script é mais um passo a passo de como interagir com o contrato pela linha de comando que qualquer outra coisa

const hre = require("hardhat");

async function main() {
  try {
    const lista_de_eleitores = await ethers.getSigners();
    const cinco_eleitores = lista_de_eleitores.slice(0,4);
    const outros_eleitores = lista_de_eleitores.slice(5,12);
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
    //
    console.log("Contrato está pausado? -> ", await contrato.paused());

    let eleitores = await contrato.retornaEleitores();
    console.log("Lista de eleitores: ", eleitores);

    approveTx = await contrato.excluiEleitor(lista_de_eleitores[19]);
    approveTx.wait();

    console.log("-----");

    eleitores = await contrato.retornaEleitores();
    console.log("Lista de eleitores: ", eleitores);

    let saida = await contrato.isEleitor(lista_de_eleitores[0]);
    console.log("O endereço ", lista_de_eleitores[0].address, " é um eleitor cadastrado? -> ", saida);

    saida = await contrato.numeroDeEleitores();
    console.log("O número atual de eleitores é: ", saida);

    saida = await contrato.cadastrarVotacao("Plutão é um planeta?","Em Andamento","Eu adoro planetas e queria ter mais um.");
    saida = await contrato.cadastrarVotacao("Tomate é uma fruta?","Em Andamento","Eu não acho que tomate seja uma fruta e você?");
    saida = await contrato.cadastrarVotacao("Devemos investir no FKXT11?","Em Andamento","Os imóveis do fundo são bem localizados e eles acabaram de resolver uma disputa legal. Acho que é uma boa oportunidade.");

    saida = await contrato.statusDeVotacao("Plutão é um planeta?");
    console.log("O status da votação 'Plutão é um planeta?' é: '", saida,"'.");

    for (let eleitor of cinco_eleitores) {
        approveTx = await contrato.connect(eleitor).votar("Plutão é um planeta?", 0);
        approveTx.wait();
    }

    saida = await contrato.votosAtual("Plutão é um planeta?");
    console.log("O número de votos como 'NÃO' é: ", saida[0], " como 'SIM' é: ", saida[1]);

    for (let eleitor of outros_eleitores) {
      approveTx = await contrato.connect(eleitor).votar("Plutão é um planeta?", 0);
      approveTx.wait();
    }
    //saida = await contrato.statusDeVotacao("Plutão é um planeta?");
    console.log("Status da votação 'Plutão é um planeta?' -> ",await contrato.statusDeVotacao("Plutão é um planeta?"), );

    console.log(await contrato.retornaVotacoes());

    console.log("Eleitores que votaram em 'Plutão é um planeta?'\n", await contrato.quemJaVotou('Plutão é um planeta?'))

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
  process.exit(0);
}

main();
