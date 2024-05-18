// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract SimNaoVotos is Ownable {
    constructor(address initialOwner)
        Ownable(initialOwner)
    {}

    // Variaveis e eventos
    address[] internal eleitores;
    bool internal isPaused = false;
    string[] internal listaDeNomesDeVotacoes;
    mapping(string => string) public votacoes;
    mapping(string => string) public listaDeVotacoes;
    mapping(string => uint256[]) public votos;
    mapping(string => address[]) public jaVotou;
    event fimDeVotacao(string indexed nomeDaVotacao, string resultado);

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

    modifier votacaoNaoExiste(string calldata nomeDaVotacao) {
        require(bytes(votacoes[nomeDaVotacao]).length != 0, "Votacao nao existe");
        _;
    }

    function adicionaEleitor(address eleitor) notPaused external onlyOwner {
        require(!isEleitor(eleitor), "Eleitor ja cadastrado.");
        eleitores.push(eleitor);
    }

    function excluiEleitor(address eleitor) notPaused external onlyOwner {
        require(isEleitor(eleitor), "Eleitor nao cadastrado.");
        
        for (uint256 i = 0; i < eleitores.length - 1; i++) {
            if (eleitores[i] == eleitor) {
                eleitores[i] = eleitores[eleitores.length - 1];
                break;
            }
        }
        eleitores.pop();
    }

    function retornaEleitores() notPaused public view returns (address[] memory) {
        return eleitores;
    }

    function numeroDeEleitores() notPaused public view returns (uint256) {
        return eleitores.length;
    }

    function isEleitor(address eleitor) notPaused public view returns (bool) {
        if (eleitores.length == 0) {
            return false;
        }
        for (uint256 i = 0; i <= eleitores.length - 1; i++) {
            if (eleitores[i] == eleitor) {
                return true;
            }
        }
        return false;
    }

    function cadastrarVotacao(string calldata nomeDaVotacao, string calldata status, string calldata detalhes) notPaused external onlyOwner {
        require(bytes(votacoes[nomeDaVotacao]).length == 0, "Votacao ja existe");
        require(bytes(status).length != 0, "Status nao pode ser vazio");
        
        votacoes[nomeDaVotacao] = status;
        listaDeVotacoes[nomeDaVotacao] = detalhes;
        listaDeNomesDeVotacoes.push(nomeDaVotacao);

        votos[nomeDaVotacao] = [0,0];
    }

    function editaStatusDeVotacao (string calldata nomeDaVotacao, string calldata status) notPaused votacaoNaoExiste(nomeDaVotacao) external onlyOwner {
        votacoes[nomeDaVotacao] = status;
    }

    function editaDetalhesDeVotacao (string calldata nomeDaVotacao, string calldata detalhes) notPaused votacaoNaoExiste(nomeDaVotacao) external onlyOwner {
        listaDeVotacoes[nomeDaVotacao] = detalhes;
    }

    function statusDeVotacao(string calldata nomeDaVotacao) notPaused votacaoNaoExiste(nomeDaVotacao) public view returns (string memory) {
        return votacoes[nomeDaVotacao];
    }

    function detalhesDeVotacao(string calldata nomeDaVotacao) notPaused votacaoNaoExiste(nomeDaVotacao) public view returns (string memory) {
        return listaDeVotacoes[nomeDaVotacao];
    }

    function retornaVotacoes() notPaused public view returns (string memory) {
        string memory stringListaDeVotacoes = "";

        for (uint256 i = 0; i <= listaDeNomesDeVotacoes.length - 1; i++) {
            stringListaDeVotacoes = string.concat(stringListaDeVotacoes, "\n ", listaDeNomesDeVotacoes[i]," - " , listaDeVotacoes[listaDeNomesDeVotacoes[i]]);
        }
        
        return stringListaDeVotacoes;
    }
    
    function votar(string calldata nomeDaVotacao, uint256 voto) notPaused votacaoNaoExiste(nomeDaVotacao) public {
        require(isEleitor(msg.sender),"Eleitor nao cadastrado.");
        require(!isVotoRepetido(nomeDaVotacao, msg.sender), "Eleitor ja votou.");
        require(voto == 1 || voto == 0, "Voto invalido.");
        require(keccak256(bytes(votacoes[nomeDaVotacao])) != keccak256(bytes("0")), "Votacao encerrada, usa a funcao 'votosAtual' para checar o resultado");

        //0 para NÃO e 1 para SIM
        if (voto == 0) {
            votos[nomeDaVotacao][0] += 1;
        } else if (voto == 1) {
            votos[nomeDaVotacao][1] += 1;
        }

        if (2 * votos[nomeDaVotacao][0] > eleitores.length ) {
            emit fimDeVotacao(nomeDaVotacao, "Nao");
            votacoes[nomeDaVotacao] = "0";
        } else if (2 * votos[nomeDaVotacao][1] > eleitores.length ) {
            emit fimDeVotacao(nomeDaVotacao, "Sim");
            votacoes[nomeDaVotacao] = "0";
        }

        jaVotou[nomeDaVotacao].push(msg.sender); 
    }

    function votosAtual(string calldata nomeDaVotacao) notPaused votacaoNaoExiste(nomeDaVotacao) public view returns (uint256[2] memory) {
        require(isEleitor(msg.sender),"Eleitor nao cadastrado.");

        uint256[2] memory resultado_votacao = [votos[nomeDaVotacao][0], votos[nomeDaVotacao][1]];

        return resultado_votacao;
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

    function quemJaVotou(string calldata nomeDaVotacao) notPaused public view returns (address[] memory) {
        return jaVotou[nomeDaVotacao];
    }
}
