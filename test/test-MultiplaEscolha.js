const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

let approveTx;

describe("Testando contrato de votações", function () {
  async function deploy() {
    const lista_de_eleitores = await ethers.getSigners();
    const nove_eleitores = lista_de_eleitores.slice(0,8);
    const dez_eleitores = lista_de_eleitores.slice(9,18);
    const Contrato = await ethers.getContractFactory("MultiplaEscolha");
    const contrato = await Contrato.deploy(lista_de_eleitores[0].address);

    return { contrato, lista_de_eleitores, nove_eleitores, dez_eleitores };
  }

  async function votacaoCadastrada() {
    const { contrato, lista_de_eleitores, nove_eleitores, dez_eleitores } = await loadFixture(deploy);

    // Adicionando eleitores
    for (eleitor of nove_eleitores) {
      approveTx = await contrato.adicionaEleitor(eleitor);
      approveTx.wait();
    }

    approveTx = await contrato.cadastrarVotacao("abc","2 + 2 = ? \n\nA - 2\nB - 4\nC - 8",3);
    approveTx.wait();

    return { contrato, lista_de_eleitores, nove_eleitores, dez_eleitores };
  }

  describe("Testando funções básicas", function () {
    it("Funcionamento das funções de pause", async function () {
      const { contrato, lista_de_eleitores } = await loadFixture(deploy);

      // testando funcao paused
      expect(await contrato.paused()).to.equal(false);

      // Deveria reverter pois o endereço não é o dono do contrato
      await expect(contrato.connect(lista_de_eleitores[1]).pause()).to.be.reverted;

      // testando funcao pause
      await contrato.connect(lista_de_eleitores[0]).pause();
      expect(await contrato.paused()).to.equal(true);

      // Deveria reverter pois o endereço não é o dono do contrato
      await expect(contrato.connect(lista_de_eleitores[1]).unpause()).to.be.reverted;

      // testando funcao unpause
      await contrato.connect(lista_de_eleitores[0]).unpause();
      expect(await contrato.paused()).to.equal(false);
    });
    it("Testando as funções de adicionar e verificar eleitor", async function () {
      const { contrato, lista_de_eleitores } = await loadFixture(deploy);

      // Adicionando três eleitores
      await contrato.connect(lista_de_eleitores[0]).adicionaEleitor(lista_de_eleitores[0]);
      await contrato.connect(lista_de_eleitores[0]).adicionaEleitor(lista_de_eleitores[1]);
      await contrato.connect(lista_de_eleitores[0]).adicionaEleitor(lista_de_eleitores[2]);

      // Verificando se endereços foram inseridos
      expect(await contrato.eleitorCadastrado(lista_de_eleitores[0])).to.equal(true);
      expect(await contrato.eleitorCadastrado(lista_de_eleitores[1])).to.equal(true);
      expect(await contrato.eleitorCadastrado(lista_de_eleitores[2])).to.equal(true);

      // Verificando a função que retorna todos os eleitores
      listaDeEleitores = await contrato.retornaEleitores();

      expect(listaDeEleitores[0]).to.equal(lista_de_eleitores[0].address);
      expect(listaDeEleitores[1]).to.equal(lista_de_eleitores[1].address);
      expect(listaDeEleitores[2]).to.equal(lista_de_eleitores[2].address);

      // Deveria reverter alertando que o usuário não é eleitor
      await expect(contrato.connect(lista_de_eleitores[3]).retornaEleitores()).to.be.revertedWith("Eleitor nao cadastrado.");

      // Verificando se retorna false para endereço que não é eleitor
      expect(await contrato.eleitorCadastrado(lista_de_eleitores[3])).to.equal(false);

      // Deveria reverter alertando que o eleitor já foi cadastrado
      await expect(contrato.connect(lista_de_eleitores[0]).adicionaEleitor(lista_de_eleitores[1])).to.be.revertedWith("Eleitor ja cadastrado.");

      // Deveria reverter pois o endereço não é o dono do contrato
      await expect(contrato.connect(lista_de_eleitores[1]).adicionaEleitor(lista_de_eleitores[3])).to.be.reverted;

      // Deveria reverter alertando que o endereço de envio não é um eleitor
      await expect(contrato.connect(lista_de_eleitores[3]).eleitorCadastrado(lista_de_eleitores[1])).to.be.revertedWith("Eleitor nao cadastrado.");

      // Deveria excluir o eleitor 1
      approveTx = await contrato.excluiEleitor(lista_de_eleitores[1])
      approveTx.wait();
      expect(await contrato.eleitorCadastrado(lista_de_eleitores[1])).to.equal(false);

      // Deveria reverter pois o eleitor 1 não está mais cadastrado
      await expect(contrato.excluiEleitor(lista_de_eleitores[1])).to.be.revertedWith("Eleitor nao cadastrado.");

      // Deveria falhar em excluir o eleitor 2, pois a conta de envio não é o dono do contrato
      await expect(contrato.connect(lista_de_eleitores[1]).excluiEleitor(lista_de_eleitores[2])).to.be.reverted;

      // Deveria reverter alertando que o contrato está pausado
      await contrato.connect(lista_de_eleitores[0]).pause();
      await expect(contrato.connect(lista_de_eleitores[0]).adicionaEleitor(lista_de_eleitores[3])).to.be.revertedWith("Contrato pausado.");
      await expect(contrato.connect(lista_de_eleitores[0]).eleitorCadastrado(lista_de_eleitores[3])).to.be.revertedWith("Contrato pausado.");
      await expect(contrato.retornaEleitores()).to.be.revertedWith("Contrato pausado.");
    });
  });
  describe("Testando cadastro de votacoes", function () {
    it("Cadastro de Votacao", async function () {
      const { contrato, lista_de_eleitores, nove_eleitores } = await loadFixture(deploy);

      // Adicionando eleitores
      for (eleitor of nove_eleitores) {
        approveTx = await contrato.adicionaEleitor(eleitor);
        approveTx.wait();
      }

      // Cadastrando votacao
      approveTx = await contrato.cadastrarVotacao("xyz","2 + 2 = ... \n\nA - 2\nB - 4\nC - 8",3);
      approveTx.wait();

      // deveria reverter pois a conta não é eleitor
      await expect(contrato.connect(lista_de_eleitores[10]).cadastrarVotacao("abc","2 + 2 = ... \n\nA - 2\nB - 4\nC - 8",3)).to.be.revertedWith("Eleitor nao cadastrado.");
    });
    it("Função getStatus", async function () {
      const { contrato, lista_de_eleitores } = await loadFixture(votacaoCadastrada);

      // Status de votação
      expect(await contrato.getStatusDaVotacao("abc")).to.equal(true);
      
      // deveria reverter pois o eleitor 9 não está cadastrado
      await expect(contrato.connect(lista_de_eleitores[9]).getStatusDaVotacao("xyz")).to.be.revertedWith("Eleitor nao cadastrado.");

      // deveria reverter pois a eleição não existe
      await expect(contrato.getStatusDaVotacao("xyz")).to.be.revertedWith("Votacao nao existe.");
    });
    it("Função getInfo", async function () {
      const { contrato, lista_de_eleitores } = await loadFixture(votacaoCadastrada);

      // deveria retornar a info da votação
      expect(await contrato.getInfo("abc")).to.equal("2 + 2 = ? \n\nA - 2\nB - 4\nC - 8");

      // deveria reverter pois a eleição não existe
      await expect(contrato.getInfo("xyz")).to.be.revertedWith("Votacao nao existe.");

      // deveria reverter pois o eleitor 9 não está cadastrado
      await expect(contrato.connect(lista_de_eleitores[9]).getInfo("abc")).to.be.revertedWith("Eleitor nao cadastrado.");
    });
    it("Função getDonoDaVotacao", async function () {
      const { contrato, lista_de_eleitores } = await loadFixture(votacaoCadastrada);

      // deveria retornar a info da votação
      expect(await contrato.getDonoDaVotacao("abc")).to.equal(lista_de_eleitores[0]);

      // deveria reverter pois a eleição não existe
      await expect(contrato.getDonoDaVotacao("xyz")).to.be.revertedWith("Votacao nao existe.");

      // deveria reverter pois o eleitor 9 não está cadastrado
      await expect(contrato.connect(lista_de_eleitores[9]).getDonoDaVotacao("abc")).to.be.revertedWith("Eleitor nao cadastrado.");
    });
    it("Função getVotacoesIniciadasPorEleitor", async function () {
      const { contrato, lista_de_eleitores } = await loadFixture(votacaoCadastrada);

      // deveria retornar a info da votação
      let votacoes = await contrato.getVotacoesIniciadasPorEleitor(lista_de_eleitores[0].address);
      expect(votacoes[0]).to.equal("abc");

      // deveria reverter pois o eleitor 10 não está cadastrado
      await expect(contrato.connect(lista_de_eleitores[10]).getVotacoesIniciadasPorEleitor(lista_de_eleitores[0].address)).to.be.revertedWith("Eleitor nao cadastrado.");
    });
    it("Funções getListaDeNomesDeVotacoesAtivas e getListaDeNomesDeVotacoesInativas", async function () {
      const { contrato, lista_de_eleitores } = await loadFixture(votacaoCadastrada);

      // cadastrando mais duas votações
      approveTx = await contrato.cadastrarVotacao("def","2 + 2 = ? \n\nA - 2\nB - 4\nC - 8",3);
      approveTx.wait();
      approveTx = await contrato.cadastrarVotacao("ghi","2 + 2 = ? \n\nA - 2\nB - 4\nC - 8",3);
      approveTx.wait();

      // deveria retornar a info da votação
      let votacoes = await contrato.getListaDeNomesDeVotacoesAtivas();
      expect(votacoes[0]).to.equal("abc");
      expect(votacoes[1]).to.equal("def");
      expect(votacoes[2]).to.equal("ghi");

      // deveria reverter pois o eleitor 10 não está cadastrado
      await expect(contrato.connect(lista_de_eleitores[10]).getListaDeNomesDeVotacoesAtivas()).to.be.revertedWith("Eleitor nao cadastrado.");

      // encerrando a votação
      approveTx = await contrato.encerraVotacao("abc","Teste");
      approveTx.wait();
      approveTx = await contrato.encerraVotacao("def","Teste");
      approveTx.wait();
      //console.log(1);

      // deveria retornar lista de votações ativas
      votacoes = await contrato.getListaDeNomesDeVotacoesAtivas();
      expect(votacoes[0]).to.equal("ghi");

      // deveria retornar lista de votações inativas
      votacoes = await contrato.getListaDeNomesDeVotacoesInativas();
      expect(votacoes[0]).to.equal("abc");
      expect(votacoes[1]).to.equal("def");

      // deveria reverter pois o eleitor 10 não está cadastrado
      await expect(contrato.connect(lista_de_eleitores[10]).getListaDeNomesDeVotacoesInativas()).to.be.revertedWith("Eleitor nao cadastrado.");
    });
  });
  describe("Testando votos", function () {
    it("Função: getNumeroDeVotosPorVotacao", async function () {
      const { contrato, lista_de_eleitores } = await loadFixture(votacaoCadastrada);

      approveTx = await contrato.votar("abc",0);
      approveTx.wait();

      let votos = await contrato.getNumeroDeVotosPorVotacao("abc");
      expect(votos[0]).to.equal(1);
      expect(votos[1]).to.equal(0);
      expect(votos[2]).to.equal(0);

    });
  });
});