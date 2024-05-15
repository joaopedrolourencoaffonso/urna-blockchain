//AINDA NÃO FINALIZADO
const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Contrato voting.sol", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deploy() {
    const lista_de_eleitores = await ethers.getSigners();
    const nove_eleitores = lista_de_eleitores.slice(0,8);
    const onze_eleitores = lista_de_eleitores.slice(9,19);
    const Contrato = await ethers.getContractFactory("Voting");
    const contrato = await Contrato.deploy(lista_de_eleitores[0].address);

    return { contrato, lista_de_eleitores, nove_eleitores, onze_eleitores };
  }

  describe("Deployment", function () {
    it("Funcionamento das funções de pause", async function () {
      const { contrato, lista_de_eleitores } = await loadFixture(deploy);

      // testando funcao paused
      expect(await contrato.paused()).to.equal(false);

      // testando funcao pause
      await contrato.connect(lista_de_eleitores[0]).pause();
      expect(await contrato.paused()).to.equal(true);

      // testando funcao unpause
      await contrato.connect(lista_de_eleitores[0]).unpause();
      expect(await contrato.paused()).to.equal(false);
    });
    it("Testando a função de adicionar eleitor", async function () {
      const { contrato, lista_de_eleitores } = await loadFixture(deploy);

      // Contrato está vazio, então deveria retornar false
      expect(await contrato.isEleitor(lista_de_eleitores[0])).to.equal(false);

      // Adicionando três eleitores
      await contrato.connect(lista_de_eleitores[0]).adicionaEleitor(lista_de_eleitores[0]);
      await contrato.connect(lista_de_eleitores[0]).adicionaEleitor(lista_de_eleitores[1]);
      await contrato.connect(lista_de_eleitores[0]).adicionaEleitor(lista_de_eleitores[2]);

      // Verificando se endereços foram inseridos
      expect(await contrato.isEleitor(lista_de_eleitores[0])).to.equal(true);
      expect(await contrato.isEleitor(lista_de_eleitores[1])).to.equal(true);
      expect(await contrato.isEleitor(lista_de_eleitores[2])).to.equal(true);

      // Verificando se retorna false para endereço que não é eleitor
      expect(await contrato.isEleitor(lista_de_eleitores[3])).to.equal(false);
    });
  });
});
