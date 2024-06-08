// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract PesquisaDeOpiniao is Ownable {
    constructor(address initialowner)
        Ownable(initialowner)
    {}

    // definindo struct de votacao
    struct Votacao {
        uint256 id;
        string nome;
        string descricao;
        uint256[] opcoes;
        address[] jaVotou;
        bool status;
        address criador;
    }

    // variaveis
    uint256[] internal votacoes;
    uint256 internal _id = 0;
    bool internal isPaused = false;
    address[] internal eleitores;
    mapping(address => bool) public mappingEleitores;
    mapping(uint256 => Votacao) public mappingVotacoes;
    //mapping(bytes32 => bool) public mappingJaVotou;
    mapping(uint256 => mapping(address => bool)) public mappingJaVotou;
    event VotacaoCadastrada(string nomeDaVotacao);
    event VotacaoEncerrada(uint256 idDaVotacao, string motivo);
    event anuncio(string indexed titulo, string info);

    // modificadores
    modifier notPaused {
        require(!isPaused, "Contrato pausado.");
        _;
    }
 
    modifier isEleitor(address eleitor) {
        require(mappingEleitores[eleitor], "Eleitor nao cadastrado.");
        _;
    }

    // funcoes e modificadores referentes ao pausamento do contrato
    function pause() public onlyOwner {
        isPaused = true;
    }

    function unpause() public onlyOwner {
        isPaused = false;
    }

    function paused() public view returns (bool) {
        return isPaused;
    }

    // funcoes relativas a eleitores
    function adicionaEleitor(address eleitor) notPaused external onlyOwner {
        require(!mappingEleitores[eleitor], "Eleitor ja cadastrado.");
        mappingEleitores[eleitor] = true;
        eleitores.push(eleitor);
    }
 
    function excluiEleitor(address eleitor) notPaused isEleitor(eleitor) external onlyOwner {
        for (uint256 i = 0; i <= eleitores.length - 1; i++) {
            if (eleitores[i] == eleitor) {
                eleitores[i] = eleitores[eleitores.length - 1];
                break;
            }
        }
        eleitores.pop();
        mappingEleitores[eleitor] = false;
    }
 
    function retornaEleitores() notPaused isEleitor(msg.sender) public view returns (address[] memory) {
        return eleitores;
    }
 
    function eleitorCadastrado(address eleitor) notPaused isEleitor(msg.sender) external view returns (bool) {
        return mappingEleitores[eleitor];
    }

    // Funcoes para cadastrar votacao
    function cadastrarVotacao(string calldata _nome, string calldata _descricao, uint256 numeroDeOpcoes) notPaused() isEleitor(msg.sender) public returns (string memory) {
        // Definindo id
        _id += 1;
        
        Votacao memory novaVotacao = Votacao({
            id: _id,
            nome: _nome,
            descricao: _descricao,
            opcoes: new uint256[](numeroDeOpcoes),
            jaVotou: new address[](0),
            status: true,
            criador: msg.sender
        });

        votacoes.push(_id);
        mappingVotacoes[_id] = novaVotacao;

        return "Votacao cadastrada com sucesso";
    }

    function getVotacao(uint256 idDaVotacao) external view notPaused isEleitor(msg.sender) returns (string memory nome, string memory descricao, uint256[] memory opcoes, bool status, address criador) {
        return (
            mappingVotacoes[idDaVotacao].nome, 
            mappingVotacoes[idDaVotacao].descricao, 
            mappingVotacoes[idDaVotacao].opcoes,
            mappingVotacoes[idDaVotacao].status,
            mappingVotacoes[idDaVotacao].criador
        );
    }

    function editNome(uint256 idDaVotacao, string calldata novoNome) external notPaused {
        require(msg.sender == mappingVotacoes[idDaVotacao].criador,"Apenas o criador pode editar uma votacao");
        mappingVotacoes[idDaVotacao].nome = novoNome;
    }

    function editDescricao(uint256 idDaVotacao, string calldata novaDescricao) external notPaused {
        require(msg.sender == mappingVotacoes[idDaVotacao].criador,"Apenas o criador pode editar uma votacao");
        mappingVotacoes[idDaVotacao].descricao = novaDescricao;
    }

    function encerraVotacao(uint256 idDaVotacao, string calldata motivo) external notPaused() {
        require(msg.sender == mappingVotacoes[idDaVotacao].criador || msg.sender == owner(),"Apenas o criador da votacao ou o dono do contrato podem encerrar uma votacao");
        mappingVotacoes[idDaVotacao].status = false;
        emit VotacaoEncerrada(idDaVotacao, motivo);
    }

    function quemJaVotou(uint256 idDaVotacao) external view notPaused() isEleitor(msg.sender) returns (address[] memory) {
        return mappingVotacoes[idDaVotacao].jaVotou;
    }

    function getVotacoes() external view notPaused() isEleitor(msg.sender) returns (uint256[] memory) {
        return votacoes;
    }

    function votar(uint256 idDaVotacao, uint256 opcaoDeVoto) external notPaused() isEleitor(msg.sender) {
        require(!mappingJaVotou[idDaVotacao][msg.sender],"O eleitor ja votou nessa pesquisa");
        require(mappingVotacoes[idDaVotacao].opcoes.length > opcaoDeVoto, "Opcao de voto inexistente");

        mappingVotacoes[idDaVotacao].opcoes[opcaoDeVoto] += 1;
        mappingVotacoes[idDaVotacao].jaVotou.push(msg.sender);
        mappingJaVotou[idDaVotacao][msg.sender] = true;
    }

    function getVotos(uint256 idDaVotacao) notPaused() isEleitor(msg.sender) external view returns (uint256[] memory) {
        return mappingVotacoes[idDaVotacao].opcoes;
    }
}