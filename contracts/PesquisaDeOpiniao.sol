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
    }

    // variaveis
    Votacao[] internal votacoes;
    uint256 internal _id = 0;
    bool internal isPaused = false;
    address[] internal eleitores;
    mapping(address => bool) public mappingEleitores;
    mapping(uint256 => Votacao) public mappingVotacoes;
    event VotacaoCadastrada(string nomeDaVotacao);
    event VotacaoEncerrada(string nomeDaVotacao, string motivo);
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
            opcoes: new uint256[](numeroDeOpcoes)
        });

        votacoes.push(novaVotacao);
        mappingVotacoes[_id] = novaVotacao;

        return "Votacao cadastrada com sucesso";
    }

    function getVotacao(uint256 idDaVotacao) external view notPaused isEleitor(msg.sender) returns (string memory nome, string memory descricao, uint256[] memory opcoes) {
        return (
            mappingVotacoes[idDaVotacao].nome, 
            mappingVotacoes[idDaVotacao].descricao, 
            mappingVotacoes[idDaVotacao].opcoes
        );
    }
}