const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Testando contrato de votações", function () {
  async function deploy() {
    const lista_de_eleitores = await ethers.getSigners();
    const nove_eleitores = lista_de_eleitores.slice(0,8);
    const dez_eleitores = lista_de_eleitores.slice(9,18);
    const Contrato = await ethers.getContractFactory("MultiplaEscolha");
    const contrato = await Contrato.deploy(lista_de_eleitores[0].address);

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

      // Deveria reverter alertando que o contrato está pausado
      await contrato.connect(lista_de_eleitores[0]).pause();
      await expect(contrato.connect(lista_de_eleitores[0]).adicionaEleitor(lista_de_eleitores[3])).to.be.revertedWith("Contrato pausado.");
      await expect(contrato.connect(lista_de_eleitores[0]).eleitorCadastrado(lista_de_eleitores[3])).to.be.revertedWith("Contrato pausado.");
      await expect(contrato.retornaEleitores()).to.be.revertedWith("Contrato pausado.");
    });
  });
});