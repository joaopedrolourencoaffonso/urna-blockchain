// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "hardhat/console.sol";

contract Voting is Ownable {
    constructor(address initialOwner)
        Ownable(initialOwner)
    {}

    // Variaveis e eventos
    address[] internal eleitores;
    bool internal isPaused = false;
    mapping(string => string) public votacoes;
    mapping(string => bool) public votacoesExist;
    mapping(string => string) public listaDeVotacoes;
    string[] internal listaDeNomesDeVotacoes;
    mapping(string => uint256[]) public votos;
    event fimDeVotacao(string indexed nomeDaVotacao, string resultado);
    mapping(string => address[]) public jaVotou;

    function pause() public onlyOwner {
        isPaused = true;
    }

    function unpause() public onlyOwner {
        isPaused = false;
    }

    function paused() public view returns (bool) {
        return isPaused;
    }

    function adicionaEleitor(address eleitor) external onlyOwner {
        require(!isPaused, "Contrato pausado.");
        require(!isEleitor(eleitor), "Eleitor ja cadastrado.");
        eleitores.push(eleitor);
    }

    function excluiEleitor(address eleitor) external onlyOwner {
        require(!isPaused, "Contrato pausado.");
        require(isEleitor(eleitor), "Eleitor nao cadastrado.");
        
        for (uint256 i = 0; i < eleitores.length - 1; i++) {
            if (eleitores[i] == eleitor) {
                eleitores[i] = eleitores[eleitores.length - 1];
                break;
            }
        }
        eleitores.pop();
    }

    function retornaEleitores() public view returns (address[] memory) {
        require(!isPaused, "Contrato pausado.");
        return eleitores;
    }

    function numeroDeEleitores() public view returns (uint256) {
        require(!isPaused, "Contrato pausado.");
        return eleitores.length;
    }

    function isEleitor(address eleitor) public view returns (bool) {
        require(!isPaused, "Contrato pausado.");
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

    function cadastrarVotacao(string memory nomeDaVotacao, string memory status, string memory detalhes) external onlyOwner {
        require(!isPaused, "Contrato pausado.");
        require(bytes(votacoes[nomeDaVotacao]).length == 0, "Votacao ja existe");
        require(bytes(status).length != 0, "Status nao pode ser vazio");
        
        votacoes[nomeDaVotacao] = status;
        listaDeVotacoes[nomeDaVotacao] = detalhes;
        listaDeNomesDeVotacoes.push(nomeDaVotacao);

        votos[nomeDaVotacao] = [0,0];
    }

    function editaStatusDeVotacao (string memory nomeDaVotacao, string memory status) external onlyOwner {
        require(!isPaused, "Contrato pausado.");
        require(bytes(votacoes[nomeDaVotacao]).length != 0, "Votacao nao existe");
        votacoes[nomeDaVotacao] = status;
    }

    function editaDetalhesDeVotacao (string memory nomeDaVotacao, string memory detalhes) external onlyOwner {
        require(!isPaused, "Contrato pausado.");
        require(bytes(votacoes[nomeDaVotacao]).length != 0, "Votacao nao existe");
        listaDeVotacoes[nomeDaVotacao] = detalhes;
    }

    function statusDeVotacao(string memory nomeDaVotacao) public view returns (string memory) {
        require(!isPaused, "Contrato pausado.");
        require(bytes(votacoes[nomeDaVotacao]).length != 0, "Votacao nao existe");
        
        return votacoes[nomeDaVotacao];
    }

    function detalhesDeVotacao(string memory nomeDaVotacao) public view returns (string memory) {
        require(!isPaused, "Contrato pausado.");
        require(bytes(votacoes[nomeDaVotacao]).length != 0, "Votacao nao existe");
        
        return listaDeVotacoes[nomeDaVotacao];
    }

    function retornaVotacoes() public view returns (string memory) {
        require(!isPaused, "Contrato pausado.");
        string memory stringListaDeVotacoes = "";

        for (uint256 i = 0; i <= listaDeNomesDeVotacoes.length - 1; i++) {
            stringListaDeVotacoes = string.concat(stringListaDeVotacoes, "\n ", listaDeNomesDeVotacoes[i]," - " , listaDeVotacoes[listaDeNomesDeVotacoes[i]]);
        }
        
        return stringListaDeVotacoes;
    }
    
    function votar(string memory nomeDaVotacao, uint256 voto) public {
        require(!isPaused, "Contrato pausado.");
        require(bytes(votacoes[nomeDaVotacao]).length > 0, "Votacao nao existe");
        require(isEleitor(msg.sender),"Eleitor nao cadastrado.");
        require(!isVotoRepetido(nomeDaVotacao, msg.sender), "Eleitor ja votou.");
        require(voto == 1 || voto == 0, "Voto invalido.");
        require(votacoes[nomeDaVotacao] != "1", votacoes[nomeDaVotacao]);
        require(votacoes[nomeDaVotacao] != "0", votacoes[nomeDaVotacao]);
        
        //0 para NÃO e 1 para SIM
        if (voto == 0) {
            votos[nomeDaVotacao][0] += 1;
        } else if (voto == 1) {
            votos[nomeDaVotacao][1] += 1;
        }

        if (2 * votos[nomeDaVotacao][0] >= eleitores.length ) {
            emit fimDeVotacao(nomeDaVotacao, "Nao");
            votacoes[nomeDaVotacao] = "Votacao encerrada, resultado: 'Nao'";
        } else if (2 * votos[nomeDaVotacao][1] >= eleitores.length ) {
            emit fimDeVotacao(nomeDaVotacao, "Sim");
            votacoes[nomeDaVotacao] = "Votacao encerrada, resultado: 'Sim'";
        }

        jaVotou[nomeDaVotacao].push(msg.sender); 
    }

    function votosAtual(string memory nomeDaVotacao) public view returns (uint256[2] memory) {
        require(!isPaused, "Contrato pausado.");
        require(bytes(votacoes[nomeDaVotacao]).length > 0, "Votacao nao existe.");
        require(isEleitor(msg.sender),"Eleitor nao cadastrado.");

        uint256[2] memory resultado_votacao = [votos[nomeDaVotacao][0], votos[nomeDaVotacao][1]];

        return resultado_votacao;
    }

    function isVotoRepetido (string memory nomeDaVotacao, address eleitor) internal returns (bool) {
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

    function quemJaVotou(string memory nomeDaVotacao) public view returns (address[] memory) {
        require(!isPaused, "Contrato pausado.");
        return jaVotou[nomeDaVotacao];
    }
}
