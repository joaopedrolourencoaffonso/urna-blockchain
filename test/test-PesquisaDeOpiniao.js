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
    const Contrato = await ethers.getContractFactory("PesquisaDeOpiniao");
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

    approveTx = await contrato.cadastrarVotacao("2 + 2 = ? ","A - 2\nB - 4\nC - 8",3);
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
  it("Cadastro de Votacao", async function () {
    const { contrato, lista_de_eleitores } = await loadFixture(votacaoCadastrada);

    approveTx = await contrato.getVotacao(1);
    //console.log(approveTx);
    expect(approveTx[0]).to.equal("2 + 2 = ? ");
    expect(approveTx[1]).to.equal("A - 2\nB - 4\nC - 8");
    expect(approveTx[2][0]).to.equal(0);
    expect(approveTx[3]).to.equal(true);
    expect(approveTx[4]).to.equal(lista_de_eleitores[0].address);

    approveTx = await contrato.encerraVotacao(1,"Teste");
    approveTx.wait();

    approveTx = await contrato.getVotacao(1);
    expect(approveTx[3]).to.equal(false);

    // Apenas eleitor cadastrado deveria ser capaz de cadastrar votacao
    await expect(contrato.connect(lista_de_eleitores[15]).cadastrarVotacao("3 + 3 = ? ","A - 3\nB - 6\nC - 12",3)).to.be.revertedWith("Eleitor nao cadastrado.");      

    // vendo se alguém além do criador da votacao ou o dono da votacao consegue encerrar votacao
    approveTx = await contrato.connect(lista_de_eleitores[1]).cadastrarVotacao("3 + 3 = ? ","A - 3\nB - 6\nC - 12",3);
    approveTx.wait();

    // editando nome da votacao
    approveTx = await contrato.editNome(1,"string2");
    approveTx.wait();
    approveTx = await contrato.editDescricao(1,"string2");
    approveTx.wait();

    approveTx = await contrato.getVotacao(1);
    expect(approveTx[0]).to.equal("string2");
    expect(approveTx[1]).to.equal("string2");

    // apenas o criador da votacao deveria ser capaz de editá-la
    await expect(contrato.connect(lista_de_eleitores[2]).editNome(1,"string3")).to.be.revertedWith('Apenas o criador pode editar uma votacao');
    await expect(contrato.connect(lista_de_eleitores[2]).editDescricao(1,"string3")).to.be.revertedWith('Apenas o criador pode editar uma votacao');

    // vendo se alguém mais além doo dono do contrato ou o criador da votacao pode encerrar a votacao
    await expect(contrato.connect(lista_de_eleitores[2]).encerraVotacao(2,"teste")).to.be.revertedWith("Apenas o criador da votacao ou o dono do contrato podem encerrar uma votacao");

    // dono do contrato deveria ser capaz de encerrar o contrato
    approveTx = await contrato.encerraVotacao(2,"Teste");
    approveTx.wait();

    approveTx = await contrato.getVotacao(2);
    expect(approveTx[3]).to.equal(false);
  });
  it("Cadastro de Voto", async function () {
    const { contrato, lista_de_eleitores } = await loadFixture(votacaoCadastrada);

    // cadastrando votos
    approveTx = await contrato.connect(lista_de_eleitores[0]).votar(1,0);
    approveTx.wait();
    approveTx = await contrato.connect(lista_de_eleitores[1]).votar(1,1);
    approveTx.wait();
    approveTx = await contrato.connect(lista_de_eleitores[2]).votar(1,2);
    approveTx.wait();

    // verificando número de votos
    approveTx = await contrato.getVotos(1);

    expect(approveTx[0]).to.equal(1);
    expect(approveTx[1]).to.equal(1);
    expect(approveTx[2]).to.equal(1);

    // verificando quem já votou
    approveTx = await contrato.quemJaVotou(1);
    expect(approveTx[0]).to.equal(lista_de_eleitores[0].address);
    expect(approveTx[1]).to.equal(lista_de_eleitores[1].address);
    expect(approveTx[2]).to.equal(lista_de_eleitores[2].address);

    // verificando se eleitor ja votou antes
    await expect(contrato.votar(1,0)).to.be.revertedWith("O eleitor ja votou nessa pesquisa");

    // apenas opcoes de voto valido
    await expect(contrato.connect(lista_de_eleitores[5]).votar(1,10)).to.be.revertedWith("Opcao de voto inexistente");
  });
  it("Ver votacoes", async function () {
    const { contrato, lista_de_eleitores } = await loadFixture(votacaoCadastrada);

    approveTx = await contrato.cadastrarVotacao("string","string",3);
    approveTx.wait();
    approveTx = await contrato.cadastrarVotacao("string","string",3);
    approveTx.wait();
    approveTx = await contrato.cadastrarVotacao("string","string",3);
    approveTx.wait();

    approveTx = await contrato.getVotacoes();
    expect(approveTx[0]).to.equal(1);
    expect(approveTx[1]).to.equal(2);
    expect(approveTx[2]).to.equal(3);
    expect(approveTx[3]).to.equal(4);

    //verificando se as votacoes foram cadastradas corretamente
    for (let i = 2; i <= 4; i++) {
      approveTx = await contrato.getVotacao(i);
      expect(approveTx[0]).to.equal("string");
      expect(approveTx[1]).to.equal("string");
      expect(approveTx[2][0]).to.equal(0);
      expect(approveTx[3]).to.equal(true);
      expect(approveTx[4]).to.equal(lista_de_eleitores[0].address);
    }
  });
  it("Verificando se só funciona quando não está pausado", async function () {
    const { contrato, lista_de_eleitores } = await loadFixture(votacaoCadastrada);

    //pausando o contrato
    approveTx = await contrato.pause();
    approveTx.wait();

    await expect(contrato.excluiEleitor(lista_de_eleitores[2])).to.be.revertedWith("Contrato pausado.");
    await expect(contrato.cadastrarVotacao("string","string",3)).to.be.revertedWith("Contrato pausado.");
    await expect(contrato.getVotacao(1)).to.be.revertedWith("Contrato pausado.");
    await expect(contrato.encerraVotacao(1,"teste")).to.be.revertedWith("Contrato pausado.");
    await expect(contrato.quemJaVotou(1)).to.be.revertedWith("Contrato pausado.");
    await expect(contrato.getVotacoes()).to.be.revertedWith("Contrato pausado.");
    await expect(contrato.votar(1,0)).to.be.revertedWith("Contrato pausado.");
    await expect(contrato.getVotos(1)).to.be.revertedWith("Contrato pausado.");
    await expect(contrato.editNome(1,"string2")).to.be.revertedWith("Contrato pausado.");
    await expect(contrato.editDescricao(1,"string2")).to.be.revertedWith("Contrato pausado.");
  });
  it("Verificando se usuário é eleitor ou não", async function () {
    const { contrato, lista_de_eleitores } = await loadFixture(votacaoCadastrada);

    await expect(contrato.connect(lista_de_eleitores[15]).getVotacao(1)).to.be.revertedWith("Eleitor nao cadastrado.");
    await expect(contrato.connect(lista_de_eleitores[15]).getVotacoes()).to.be.revertedWith("Eleitor nao cadastrado.");
    await expect(contrato.connect(lista_de_eleitores[15]).votar(1,0)).to.be.revertedWith("Eleitor nao cadastrado.");
    await expect(contrato.connect(lista_de_eleitores[15]).quemJaVotou(1)).to.be.revertedWith("Eleitor nao cadastrado.");
    await expect(contrato.connect(lista_de_eleitores[15]).getVotos(1)).to.be.revertedWith("Eleitor nao cadastrado.");
  });
}); 
});