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
    mapping(string => address[]) public jaVotou;
    mapping(address => bool) public mappingEleitores;
    mapping(string => bool) public statusDaVotacao;
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

    modifier isVotacao(string calldata nomeDaVotacao) {
        require(statusDaVotacao[nomeDaVotacao], "Votacao nao existe.");
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
        
        for (uint256 i = 0; i < eleitores.length - 1; i++) {
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

    // funcoes relativas a votacao
    function cadastrarVotacao(string calldata nomeDaVotacao, string calldata info, uint256 numeroDeOpcoes) notPaused() isEleitor(msg.sender) public returns (string memory) {

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
    function getListaDeNomesDeVotacoesAtivas() public view isEleitor(msg.sender) returns (string[] memory) {
        return listaDeNomesDeVotacoesAtivas;
    }

    function getListaDeNomesDeVotacoesInativas() public view isEleitor(msg.sender) returns (string[] memory) {
        return listaDeNomesDeVotacoesInativas;
    }

    function getVotacoesIniciadasPorEleitor(address eleitor) public view isEleitor(msg.sender) returns (string[] memory) {
        return votacoesIniciadasPorEleitor[eleitor];
    }

    function getDonoDaVotacao(string calldata nomeDaVotacao) public view isEleitor(msg.sender) isVotacao(nomeDaVotacao) returns (address) {
        return donoDaVotacao[nomeDaVotacao];
    }

    function getInfo(string calldata nomeDaVotacao) public view isEleitor(msg.sender) isVotacao(nomeDaVotacao) returns (string memory) {
        return infoVotacoes[nomeDaVotacao];
    }

    function getNumeroDeVotosPorVotacao(string calldata nomeDaVotacao) public view isEleitor(msg.sender) isVotacao(nomeDaVotacao) returns (uint256[] memory) {
        return numeroDeVotosPorVotacao[nomeDaVotacao];
    }

    function getStatusDaVotacao(string calldata nomeDaVotacao) public view isEleitor(msg.sender) isVotacao(nomeDaVotacao) returns (bool) {
        return statusDaVotacao[nomeDaVotacao];
    }

    // funcoes que editam as votacoes
    function encerraVotacao(string calldata nomeDaVotacao, string calldata motivo) external notPaused isVotacao(nomeDaVotacao) {
        require(donoDaVotacao[nomeDaVotacao] == msg.sender || msg.sender == owner(), "Somente o eleitor que criou a votacao ou dono do contrato podem encerrar votacao.");
        statusDaVotacao[nomeDaVotacao] = false;

        listaDeNomesDeVotacoesInativas.push(nomeDaVotacao);

        for (uint256 i = 0; i < listaDeNomesDeVotacoesAtivas.length - 1; i++) {
            if (keccak256(abi.encodePacked(listaDeNomesDeVotacoesAtivas[i])) == keccak256(abi.encodePacked(nomeDaVotacao))) {
                listaDeNomesDeVotacoesAtivas[i] = listaDeNomesDeVotacoesAtivas[listaDeNomesDeVotacoesAtivas.length - 1];
                break;
            }
        }
        listaDeNomesDeVotacoesAtivas.pop();

        emit VotacaoEncerrada(nomeDaVotacao, motivo);
    }

    function editInfo(string calldata nomeDaVotacao, string calldata info) external notPaused isVotacao(nomeDaVotacao) {
        require(donoDaVotacao[nomeDaVotacao] == msg.sender, "{'error':'Somente o eleitor que criou a votacao podem editar a info da votacao.'}");
        infoVotacoes[nomeDaVotacao] = info;
    }

    // funcoes relativas a votar
    function votar(string calldata nomeDaVotacao, uint256 opcao) external notPaused isEleitor(msg.sender) isVotacao(nomeDaVotacao) {
        require(!isVotoRepetido(nomeDaVotacao, msg.sender),"Eleitor ja realizou o voto");
        require(statusDaVotacao[nomeDaVotacao],"Votacao ja encerrou");
        require(opcao < numeroDeVotosPorVotacao[nomeDaVotacao].length,"Opcao de voto nao existente");
        
        numeroDeVotosPorVotacao[nomeDaVotacao][opcao] += 1;
        jaVotou[nomeDaVotacao].push(msg.sender);

        if (jaVotou[nomeDaVotacao].length == eleitores.length) {
            statusDaVotacao[nomeDaVotacao] = false;
            emit VotacaoEncerrada(nomeDaVotacao, "Todos os eleitores votaram");
        }
    }

    function isVotoRepetido (string calldata nomeDaVotacao, address eleitor) internal returns (bool) {
        if (jaVotou[nomeDaVotacao].length == 0) {
            return false;
        }
        for (uint256 i = 0; i <= jaVotou[nomeDaVotacao].length - 1; i++) {
            if (jaVotou[nomeDaVotacao][i] == eleitor) {
                return true;
            }
        }
        return false;
    }

    // retorna quem ja votou em certa votacao
    function quemJaVotou(string calldata nomeDaVotacao) external notPaused isEleitor(msg.sender) isVotacao(nomeDaVotacao) returns (address[] memory) {
        return jaVotou[nomeDaVotacao];
    }

    // emite anuncios
    function anuncios(string calldata titulo, string calldata info) external notPaused isEleitor(msg.sender) {
        emit anuncio(titulo, info);
    }
}