# Urna blockchain

Um pequeno projeto para praticar conhecimentos de blockchain, smart contracts e web3.

## [SimNaoVotos.sol](./SimNaoVotos.sol)
- [X] Pausável
- [X] Cadastrar eleitores
- [X] Autenticar eleitor
- [X] Cadastrar votações de "sim" ou "não"
- [X] Votar nas votações de "sim" ou "não"
- [X] Verificar se voto é repetido
- [X] Retornar resultado de votação
- [X] Retornar lista de votações
- [X] Retornar lista de eleitores que votaram em certa votação
- [X] Retornar status e detalhes de uma certa votação
- [X] Editar status e detalhes de uma certa votação
- [X] Contrato encerra votação automáticamente quando mais de 50% dos eleitores já votaram
- [X] Testar 100% do contrato
- [X] Otimizar uso de gas

## Como usar

1. Crie um projeto Hardhat normalmente
2. Salve o [`SimNaoVotos.sol`](./SimNaoVotos.sol) na sua pasta `contracts`.
3. Salve o [`interact-voting.js`](./interact-voting.js) na sua pasta `scripts`.
4. Salve o [`test-SimNaoVotos.js`](./test-SimNaoVotos.js) na sua pasta `test`.

Pronto, basta usar os comandos `npx hardhat coverage` para executar os testes e observar a cobertura.

### Preço da execução

Usando o [hardhat-gas-reporter](https://www.npmjs.com/package/hardhat-gas-reporter), temos os seguintes preços de execução. 

```bash
····················································································································
|  Solidity and Network Configuration                                                                              │
·······························|·················|···············|·················|································
|  Solidity: 0.8.24            ·  Optim: false   ·  Runs: 200    ·  viaIR: false   ·     Block: 30,000,000 gas     │
·······························|·················|···············|·················|································
|  Methods                                                                                                         │
·······························|·················|···············|·················|················|···············
|  Contracts / Methods         ·  Min            ·  Max          ·  Avg            ·  # calls       ·  usd (avg)   │
·······························|·················|···············|·················|················|···············
|  SimNaoVotos                 ·                                                                                   │
·······························|·················|···············|·················|················|···············
|      adicionaEleitor         ·         76,387  ·       93,499  ·         79,578  ·            43  ·           -  │
·······························|·················|···············|·················|················|···············
|      cadastrarVotacao        ·        130,030  ·      147,226  ·        139,433  ·            11  ·           -  │
·······························|·················|···············|·················|················|···············
|      editaDetalhesDeVotacao  ·              -  ·            -  ·         36,033  ·             1  ·           -  │
·······························|·················|···············|·················|················|···············
|      editaStatusDeVotacao    ·              -  ·            -  ·         33,846  ·             1  ·           -  │
·······························|·················|···············|·················|················|···············
|      excluiEleitor           ·              -  ·            -  ·         41,801  ·             1  ·           -  │
·······························|·················|···············|·················|················|···············
|      pause                   ·              -  ·            -  ·         45,772  ·             9  ·           -  │
·······························|·················|···············|·················|················|···············
|      unpause                 ·              -  ·            -  ·         23,762  ·             1  ·           -  │
·······························|·················|···············|·················|················|···············
|      votar                   ·         76,770  ·      106,844  ·         88,717  ·            23  ·           -  │
·······························|·················|···············|·················|················|···············
|  Deployments                                   ·                                 ·  % of limit    ·              │
·······························|·················|···············|·················|················|···············
|  SimNaoVotos                 ·              -  ·            -  ·      3,058,502  ·        10.2 %  ·           -  │
·······························|·················|···············|·················|················|···············
|  Key                                                                                                             │
····················································································································
|  ◯  Execution gas for this method does not include intrinsic gas overhead                                        │
····················································································································
|  △  Cost was non-zero but below the precision setting for the currency display (see options)                     │
····················································································································
|  Toolchain:  hardhat                                                                                             │
····················································································································
```

Por comparação, na rede **Ethereum**, com o preço atual (18/05/2024) de [15,878 reais](https://www.google.com/search?client=firefox-b-d&q=ether+price) por ether e de [6 gwei](https://etherscan.io/gastracker) por gas, custaria em torno de 13 reais para executar a função `cadastrarVotacao` e  291,35 reais para implementar na rede Ethereum. A função `votar`, que deveria ser a mais utilizada, deveria custar em torno R$ 8,45 reais.


## [MultiplaEscolha.sol](MultiplaEscolha.sol)
- [ ] Cadastrar votações com múltiplas opções (além do "sim" ou "não")
- [ ] Votar nas votações com múltiplas opções
- [ ] Verificar se voto é repetido
- [ ] Retornar resultado de votação
- [ ] Retornar lista de votações
- [ ] Retornar lista de eleitores que votaram em certa votação
- [ ] Retornar status e detalhes de uma certa votação
- [ ] Editar status e detalhes de uma certa votação
- [ ] Contrato encerra votação automáticamente quando mais de 50% dos eleitores já votaram
- [ ] Testar 100% do contrato
- [ ] Otimizar uso de gas

## Interface Web

Futuro Desenvolvimento.

