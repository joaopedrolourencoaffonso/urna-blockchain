// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable {
    constructor(address initialOwner)
        Ownable(initialOwner)
    {}

    address[] internal eleitores;
    bool internal paused = false;
    mapping(string => string) public votacoes;
    mapping(string => uint256[]) public votos;

    function pause() public onlyOwner {
        paused = true;
    }

    function unpause() public onlyOwner {
        paused = false;
    }

    function adicionaEleitor(address eleitor) external onlyOwner {
        require(!paused, "Contrato pausado.");
        bool x = isEleitor(eleitor);
        require(!x, "Eleitor ja cadastrado.");
        eleitores.push(eleitor);
    }

    function excluiEleitor(address eleitor) external onlyOwner {
        require(!paused, "Contrato pausado.");
        
        for (uint256 i = 0; i < eleitores.length - 1; i++) {
            if (eleitores[i] == eleitor) {
                eleitores[i] = eleitores[eleitores.length - 1];
                break;
            }
        }
        eleitores.pop();
    }

    function retornaEleitores() public view returns (address[] memory) {
        require(!paused, "Contrato pausado.");
        return eleitores;
    }

    function numeroDeEleitores() public view returns (uint256) {
        require(!paused, "Contrato pausado.");
        return eleitores.length;
    }

    function isEleitor(address eleitor) public view returns (bool) {
        require(!paused, "Contrato pausado.");
        if (eleitores.length == 0) {
            return false;
        }
        for (uint256 i = 0; i < eleitores.length - 1; i++) {
            if (eleitores[i] == eleitor) {
                return true;
            }
        }
        return false;
    }

    function cadastrarVotacao(string memory nomeDaVotacao, string memory status) external onlyOwner {
        require(!paused, "Contrato pausado.");
        require(bytes(votacoes[nomeDaVotacao]).length == 0, "Votacao ja existe");
        votacoes[nomeDaVotacao] = status;
        votos[nomeDaVotacao].push(0);
        votos[nomeDaVotacao].push(0);
    }

    function statusDeVotacao(string memory nomeDaVotacao) public view returns (string memory) {
        require(!paused, "Contrato pausado.");
        return votacoes[nomeDaVotacao];
    }

    function votosAtual(string memory nomeDaVotacao) public view returns (uint256[2] memory) {
        require(!paused, "Contrato pausado.");
        require(bytes(votacoes[nomeDaVotacao]).length > 0, "Votacao nao existe");
        require(isEleitor(msg.sender),"Eleitor nao cadastrado.");

        uint256[2] memory resultado_votacao = [votos[nomeDaVotacao][0], votos[nomeDaVotacao][1]];

        return resultado_votacao;
    }

    function votar(string memory nomeDaVotacao, uint256 voto) public {
        require(!paused, "Contrato pausado.");
        require(bytes(votacoes[nomeDaVotacao]).length > 0, "Votacao nao existe");
        require(isEleitor(msg.sender),"Eleitor nao cadastrado.");
        require(voto == 1 || voto == 0, "Voto invalido.");
        
        //0 para NÃO e 1 para SIM
        if (voto == 0) {
            votos[nomeDaVotacao][0] += 1;
        } else if (voto == 1) {
            votos[nomeDaVotacao][1] += 1;
        }     
    }
}
