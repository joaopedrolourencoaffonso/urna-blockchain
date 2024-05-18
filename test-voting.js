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
    const dez_eleitores = lista_de_eleitores.slice(9,18);
    const Contrato = await ethers.getContractFactory("Voting");
    const contrato = await Contrato.deploy(lista_de_eleitores[0].address);

    return { contrato, lista_de_eleitores, nove_eleitores, dez_eleitores };
  }

  describe("Testando funções básicas", function () {
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
    it("Testando as funções de adicionar e verificar eleitor", async function () {
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

      // Deveria reverter alertando que o eleitor já foi cadastrado
      await expect(contrato.connect(lista_de_eleitores[0]).adicionaEleitor(lista_de_eleitores[1])).to.be.revertedWith("Eleitor ja cadastrado.");

      // Deveria reverter alertando que o contrato está pausado
      await contrato.connect(lista_de_eleitores[0]).pause();
      await expect(contrato.connect(lista_de_eleitores[0]).adicionaEleitor(lista_de_eleitores[3])).to.be.revertedWith("Contrato pausado.");
      await expect(contrato.connect(lista_de_eleitores[0]).isEleitor(lista_de_eleitores[3])).to.be.revertedWith("Contrato pausado.");
    });
    it("Verificando número de eleitores e exclusão de eleitores", async function () {
      const { contrato, lista_de_eleitores } = await loadFixture(deploy);
      
      expect(await contrato.numeroDeEleitores()).to.equal(0);

      await contrato.connect(lista_de_eleitores[0]).adicionaEleitor(lista_de_eleitores[0]);
      expect(await contrato.numeroDeEleitores()).to.equal(1);

      await contrato.connect(lista_de_eleitores[0]).adicionaEleitor(lista_de_eleitores[1]);
      await contrato.connect(lista_de_eleitores[0]).adicionaEleitor(lista_de_eleitores[2]);
      expect(await contrato.numeroDeEleitores()).to.equal(3);

      await contrato.connect(lista_de_eleitores[0]).excluiEleitor(lista_de_eleitores[1]);
      expect(await contrato.numeroDeEleitores()).to.equal(2);

      await expect(contrato.connect(lista_de_eleitores[0]).excluiEleitor(lista_de_eleitores[1])).to.be.revertedWith("Eleitor nao cadastrado.");

      // verificando quando o contrato está pausado
      await contrato.connect(lista_de_eleitores[0]).pause();
      await expect(contrato.connect(lista_de_eleitores[0]).numeroDeEleitores()).to.be.revertedWith("Contrato pausado.");
      await expect(contrato.connect(lista_de_eleitores[0]).excluiEleitor(lista_de_eleitores[1])).to.be.revertedWith("Contrato pausado.");
    });
    it("Testando retornar eleitores", async function () {
      const { contrato, lista_de_eleitores } = await loadFixture(deploy);

      await contrato.connect(lista_de_eleitores[0]).adicionaEleitor(lista_de_eleitores[0]);
      await contrato.connect(lista_de_eleitores[0]).adicionaEleitor(lista_de_eleitores[1]);
      await contrato.connect(lista_de_eleitores[0]).adicionaEleitor(lista_de_eleitores[2]);

      // verificando os elementos individuais do retorno
      x = await contrato.retornaEleitores();
      a = lista_de_eleitores[0].address;
      b = lista_de_eleitores[1].address;
      c = lista_de_eleitores[2].address;

      expect(x[0]).to.equal(a);
      expect(x[1]).to.equal(b);
      expect(x[2]).to.equal(c);
      
      // verificando quando o contrato está pausado
      await contrato.connect(lista_de_eleitores[0]).pause();
      await expect(contrato.connect(lista_de_eleitores[0]).retornaEleitores()).to.be.revertedWith("Contrato pausado.");      
    });
    it("Testando cadastro e status de votação", async function () {
      const { contrato, lista_de_eleitores } = await loadFixture(deploy);
      //console.log(1);
      await contrato.connect(lista_de_eleitores[0]).cadastrarVotacao("Votacao 1","Em andamento.","Teste de votacao.");
      await contrato.connect(lista_de_eleitores[0]).cadastrarVotacao("Votacao 2","Açaí.","Teste de votacao.");
      await contrato.connect(lista_de_eleitores[0]).cadastrarVotacao("Votacao 3","!@#$%¨&*()","Teste de votacao.");
      
      // verificando status de votação
      await expect(await contrato.connect(lista_de_eleitores[0]).statusDeVotacao("Votacao 1")).to.equal("Em andamento.");
      await expect(await contrato.connect(lista_de_eleitores[0]).statusDeVotacao("Votacao 2")).to.equal("Açaí.");
      await expect(await contrato.connect(lista_de_eleitores[0]).statusDeVotacao("Votacao 3")).to.equal("!@#$%¨&*()");

      // Deveria reverter alertando que a votação já foi cadastrada
      await expect(contrato.connect(lista_de_eleitores[0]).cadastrarVotacao("Votacao 1","Em andamento.","Teste de votacao.")).to.be.revertedWith("Votacao ja existe");

      // Deveria reverter alertando que a votação não pode ter 'status' vazio
      await expect(contrato.connect(lista_de_eleitores[0]).cadastrarVotacao("Votacao 4","","Teste de votacao.")).to.be.revertedWith("Status nao pode ser vazio");

      // Deveria reverter alertando que a votação não existe
      await expect(contrato.connect(lista_de_eleitores[0]).statusDeVotacao("Votacao 5")).to.be.revertedWith("Votacao nao existe");

      // Deveria reverter alertando que o contrato está pausado
      await contrato.connect(lista_de_eleitores[0]).pause();
      await expect(contrato.connect(lista_de_eleitores[0]).cadastrarVotacao("Votacao 5","Em andamento.","Teste de votacao.")).to.be.revertedWith("Contrato pausado.");
      await expect(contrato.connect(lista_de_eleitores[0]).statusDeVotacao("Votacao 5")).to.be.revertedWith("Contrato pausado.");
    });
    it("Testando ato de editar status e detalhes de votação", async function () {
      const { contrato, lista_de_eleitores } = await loadFixture(deploy);
      
      // Cadastrando votação para teste
      await contrato.connect(lista_de_eleitores[0]).cadastrarVotacao("Votacao 1","Em andamento.","Teste de votacao.");
      await expect(await contrato.connect(lista_de_eleitores[0]).statusDeVotacao("Votacao 1")).to.equal("Em andamento.");

      // Editando status da votação
      await contrato.connect(lista_de_eleitores[0]).editaStatusDeVotacao("Votacao 1","Concluída.");
      await expect(await contrato.connect(lista_de_eleitores[0]).statusDeVotacao("Votacao 1")).to.equal("Concluída.");

      // Editando detalhes da votação
      await contrato.editaDetalhesDeVotacao("Votacao 1","Outro teste de votacao.");
      await expect(await contrato.connect(lista_de_eleitores[0]).detalhesDeVotacao("Votacao 1")).to.equal("Outro teste de votacao.");

      // Deveria reverter alertando que a votação não existe
      await expect(contrato.connect(lista_de_eleitores[0]).editaDetalhesDeVotacao("Votacao 7","Concluída novamente.")).to.be.revertedWith("Votacao nao existe");
      await expect(contrato.connect(lista_de_eleitores[0]).detalhesDeVotacao("Votacao 7")).to.be.revertedWith("Votacao nao existe");
      await expect(contrato.connect(lista_de_eleitores[0]).editaStatusDeVotacao("Votacao 7","Concluída novamente.")).to.be.revertedWith("Votacao nao existe");

      // Deveria reverter alertando que o contrato está pausado
      await contrato.connect(lista_de_eleitores[0]).pause();
      await expect(contrato.connect(lista_de_eleitores[0]).editaDetalhesDeVotacao("Votacao 1","Concluída novamente.")).to.be.revertedWith("Contrato pausado.");
      await expect(contrato.connect(lista_de_eleitores[0]).editaStatusDeVotacao("Votacao 1","Teste")).to.be.revertedWith("Contrato pausado.");
      await expect(contrato.connect(lista_de_eleitores[0]).detalhesDeVotacao("Votacao 1")).to.be.revertedWith("Contrato pausado.");
      await expect(contrato.connect(lista_de_eleitores[0]).statusDeVotacao("Votacao 1")).to.be.revertedWith("Contrato pausado.");
    });
    it("Testando listagem de votações", async function () {
      const { contrato, lista_de_eleitores } = await loadFixture(deploy);

      // cadastrando votações
      await contrato.connect(lista_de_eleitores[0]).cadastrarVotacao("Votacao 1","Em andamento.","Teste de votacao 1.");
      await contrato.connect(lista_de_eleitores[0]).cadastrarVotacao("Votacao 2","Concluída.","Teste de votacao 2.");
      await contrato.connect(lista_de_eleitores[0]).cadastrarVotacao("Votacao 3","Em discussão.","Teste de votacao 3.");

      await expect(await contrato.connect(lista_de_eleitores[0]).retornaVotacoes()).to.equal("\n Votacao 1 - Teste de votacao 1.\n Votacao 2 - Teste de votacao 2.\n Votacao 3 - Teste de votacao 3.");

      // deveria reverter
      await contrato.connect(lista_de_eleitores[0]).pause();
      await expect(contrato.connect(lista_de_eleitores[0]).retornaVotacoes()).to.be.revertedWith("Contrato pausado.");
    });
  });
  describe("Testando funções de votação", function () {
    it("Testando função de registrar votos", async function () {
      const { contrato, lista_de_eleitores, nove_eleitores, dez_eleitores } = await loadFixture(deploy);

      // cadastrando votações
      await contrato.connect(lista_de_eleitores[0]).cadastrarVotacao("Votacao 1","Em andamento.","Teste de votacao 1.");

      // cadastrando eleitores
      let approveTx;
      let eleitor;
      for (eleitor of nove_eleitores) {
        approveTx = await contrato.adicionaEleitor(eleitor);
        approveTx.wait();
      }

      // Deveria reverter por votação não existir
      await expect(contrato.connect(lista_de_eleitores[0]).votar("Votacao 3",0)).to.be.revertedWith("Votacao nao existe");

      // Enviando alguns votos
      await contrato.connect(lista_de_eleitores[0]).votar("Votacao 1",0);
      await contrato.connect(lista_de_eleitores[1]).votar("Votacao 1",0);
      await contrato.connect(lista_de_eleitores[2]).votar("Votacao 1",1);

      // Verificando quem já votou
      quem_ja_votou = await contrato.connect(lista_de_eleitores[4]).quemJaVotou("Votacao 1");
      await expect(quem_ja_votou[0]).to.equal(lista_de_eleitores[0].address);
      await expect(quem_ja_votou[1]).to.equal(lista_de_eleitores[1].address);
      await expect(quem_ja_votou[2]).to.equal(lista_de_eleitores[2].address);

      // Deveria reverter por eleitor não ser cadastrado
      await expect(contrato.connect(dez_eleitores[0]).votar("Votacao 1",0)).to.be.revertedWith("Eleitor nao cadastrado.");

      // Deveria reverter pois o eleitor já votou antes
      await expect(contrato.connect(nove_eleitores[0]).votar("Votacao 1",0)).to.be.revertedWith("Eleitor ja votou.");

      // Deveria reverter pois o eleitor está enviando um valor errado para o voto (planejo adicionar mais opções no futuro)
      await expect(contrato.connect(lista_de_eleitores[3]).votar("Votacao 1",10)).to.be.revertedWith("Voto invalido.");

      // Número de votos atual
      const votos_atual = await contrato.connect(lista_de_eleitores[0]).votosAtual("Votacao 1");
      await expect(votos_atual[0]).to.equal(2);
      await expect(votos_atual[1]).to.equal(1);

      // Deveria reverter pois a votacao 2 não existe
      await expect(contrato.connect(lista_de_eleitores[0]).votosAtual("Votacao 2")).to.be.revertedWith("Votacao nao existe.");

      // Deveria reverter pois a conta não foi cadastrada
      await expect(contrato.connect(dez_eleitores[1]).votosAtual("Votacao 1")).to.be.revertedWith("Eleitor nao cadastrado.");

      // deveria reverter
      await contrato.connect(lista_de_eleitores[0]).pause();
      await expect(contrato.connect(lista_de_eleitores[0]).retornaVotacoes()).to.be.revertedWith("Contrato pausado.");
      await expect(contrato.connect(lista_de_eleitores[0]).quemJaVotou("Votacao 1")).to.be.revertedWith("Contrato pausado.");
      await expect(contrato.connect(lista_de_eleitores[0]).votar("Votacao 1",0)).to.be.revertedWith("Contrato pausado.");
      await expect(contrato.connect(lista_de_eleitores[0]).votosAtual("Votacao 1")).to.be.revertedWith("Contrato pausado.");
    });
    it("Simulando uma votação", async function () {
      const { contrato, lista_de_eleitores, nove_eleitores, dez_eleitores } = await loadFixture(deploy);

      // cadastrando votações
      await contrato.connect(lista_de_eleitores[0]).cadastrarVotacao("Votacao 1","Em andamento.","Teste de votacao 1.");

      // cadastrando eleitores
      let approveTx;
      let eleitor;
      for (eleitor of nove_eleitores) {
        approveTx = await contrato.adicionaEleitor(eleitor);
        approveTx.wait();
      }

      // enviando 9 votos
      for (eleitor of [0,1,2,3]) {
        approveTx = await contrato.connect(lista_de_eleitores[eleitor]).votar("Votacao 1",0);
        approveTx.wait();
      }

      // enviando outros 10 votos e encerrando a votação
      for (eleitor of [4,5,6,7,8]) {
        approveTx = await contrato.connect(lista_de_eleitores[eleitor]).votar("Votacao 1",1);
        approveTx.wait();
      }

      // deveria reverter, pois eleição já foi encerrada
      await expect(contrato.connect(lista_de_eleitores[9]).votar("Votacao 1",1)).to.be.revertedWith("Votacao encerrada, resultado: 'Sim'");
    });
  });
});
