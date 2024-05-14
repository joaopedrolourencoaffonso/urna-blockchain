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
        votacoes[nomeDaVotacao] = status;
    }

    function statusDeVotacao(string memory nomeDaVotacao) public view returns (string memory) {
        return votacoes[nomeDaVotacao];
    }
}
