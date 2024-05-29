// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract MultiplaEscolha is Ownable {
    constructor(address initialowner)
        Ownable(initialowner)
    {}

    // variaveis
    address[] internal eleitores;
    bool internal isPaused = false;
    string[] internal listaDeNomesDeVotacoesAtivas;
    string[] internal listaDeNomesDeVotacoesInativas;
    mapping(string => uint256[]) public numeroDeVotosPorVotacao;
    mapping(string => string) public infoVotacoes;
    mapping(string => address) public donoDaVotacao;
    mapping(address => string[]) public votacoesIniciadasPorEleitor;
    mapping(address => bool) public mappingEleitores;
    mapping(string => bool) public statusDaVotacao;
    event fimDeVotacao(string indexed nomeDaVotacao, string resultado);
    event VotacaoCadastrada(string message);

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

    modifier notPaused {
        require(!isPaused, "Contrato pausado.");
        _;
    }

    // funcoes e modificadores relativas a eleitores
    function isEleitor(address eleitor) notPaused public view returns (bool) {
        return mappingEleitores[eleitor];
    }

    modifier isEleitorModifier(address eleitor) {
        require(mappingEleitores[eleitor], "Eleitor nao cadastrado.");
        _;
    }

    function adicionaEleitor(address eleitor) notPaused external onlyOwner {
        require(!isEleitor(eleitor), "Eleitor ja cadastrado.");
        mappingEleitores[eleitor] = true;
        eleitores.push(eleitor);
    }

    function excluiEleitor(address eleitor) notPaused isEleitorModifier(eleitor) external onlyOwner {
        
        for (uint256 i = 0; i < eleitores.length - 1; i++) {
            if (eleitores[i] == eleitor) {
                eleitores[i] = eleitores[eleitores.length - 1];
                break;
            }
        }
        eleitores.pop();
        mappingEleitores[eleitor] = false;
    }

    function retornaEleitores() notPaused isEleitorModifier(msg.sender) public view returns (address[] memory) {
        return eleitores;
    }

    // funcoes relativas a votacao
    function cadastrarVotacao(string calldata nomeDaVotacao, string calldata info, uint256 numeroDeOpcoes) notPaused() isEleitorModifier(msg.sender) public returns (string memory) {

        listaDeNomesDeVotacoesAtivas.push(nomeDaVotacao);
        votacoesIniciadasPorEleitor[msg.sender].push(nomeDaVotacao);
        infoVotacoes[nomeDaVotacao] = info;
        donoDaVotacao[nomeDaVotacao] = msg.sender;
        statusDaVotacao[nomeDaVotacao] = true;
        
        for (uint256 i = 0; i < numeroDeOpcoes; i++) {
            numeroDeVotosPorVotacao[nomeDaVotacao].push(0);
        }

        string memory result =  string.concat("Votacao '", nomeDaVotacao, "' cadastrada com sucesso.");

        emit VotacaoCadastrada(result);
    }

    // funcoes que retornam informacoes sobre votacao especifica ou votacoes como um todo
    function _listaDeNomesDeVotacoesAtivas() public view notPaused isEleitorModifier(msg.sender) returns (string[] memory) {
        return listaDeNomesDeVotacoesAtivas;
    }

    function _listaDeNomesDeVotacoesInativas() public view notPaused isEleitorModifier(msg.sender) returns (string[] memory) {
        return listaDeNomesDeVotacoesInativas;
    }

    function _votacoesIniciadasPorEleitor(address eleitor) public view notPaused() isEleitorModifier(msg.sender) returns (string[] memory) {
        return votacoesIniciadasPorEleitor[eleitor];
    }

    function _donoDaVotacao(string calldata nomeDaVotacao) public view notPaused() isEleitorModifier(msg.sender) returns (address) {
        return donoDaVotacao[nomeDaVotacao];
    }

    function _info(string calldata nomeDaVotacao) public view notPaused isEleitorModifier(msg.sender) returns (string memory) {
        return infoVotacoes[nomeDaVotacao];
    }

    function _numeroDeVotosPorVotacao(string calldata nomeDaVotacao) public view notPaused isEleitorModifier(msg.sender) returns (uint256[] memory) {
        return numeroDeVotosPorVotacao[nomeDaVotacao];
    }

    function _statusDaVotacao(string calldata nomeDaVotacao) public view notPaused isEleitorModifier(msg.sender) returns (bool) {
        return statusDaVotacao[nomeDaVotacao];
    }

    // funcoes que editam as votacoes
    function encerraVotacao(string calldata nomeDaVotacao) external notPaused {
        require(donoDaVotacao[nomeDaVotacao] == msg.sender || msg.sender == owner(), "{'error':'Somente o eleitor que criou a votacao ou dono do contrato podem encerrar votacao.'}");
        statusDaVotacao[nomeDaVotacao] = false;
    }

    // funcoes relativas a votar
    //function votar() returns (string memory) {
    //
    //}
}
