# Urna blockchain

Um pequeno projeto para praticar conhecimentos de blockchain, smart contracts e web3.

O foco é a criação de um contrato para realizar votações em uma rede baseada no ethereum com as seguintes características

- [X] Pausável
- [X] Cadastrar eleitores
- [X] Autenticar eleitor
- [X] Cadastrar votações com múltiplas opções
- [X] Votar
- [X] Verificar se voto é repetido
- [X] Retornar detalhes de votação, incluindo número de votos, quem votou e status.
- [X] Retornar lista de votações
- [X] Editar status e detalhes de uma certa votação
- [X] Testar 100% do contrato
- [X] Uso de gas otimizado diante das condições acima

## Como usar

1. Clone o presente repositório:

```bash
$ git clone https://github.com/joaopedrolourencoaffonso/urna-blockchain.git
```
2. Instale as dependências:

```bash
$ npm install
```

3. Na pasta scripts você irá encontrar:

 - [`deploy-PesquisaDeOpiniao.js`](./scripts/deploy-PesquisaDeOpiniao.js): Script que realiza o deploy do contrato [`PesquisaDeOpiniao`](./contracts/PesquisaDeOpiniao.sol).
 - [`provoca-eventos.js`](./scripts/provoca-eventos.js): Um exemplo de script capaz de provocar a emissão de eventos.
 - [`get-eventos.js`](./scripts/get-eventos.js): Um exemplo de script capaz de retornar os eventos recebidos

Os testes foram realizados com [`test-PesquisaDeOpiniao.js`](./test/test-PesquisaDeOpiniao.js), com cobertura de 100%. Para verificar, basta executar:

```bash
$ npx hardhat coverage
```

### Preço da execução

Usando o [hardhat-gas-reporter](https://www.npmjs.com/package/hardhat-gas-reporter), temos os seguintes preços de execução. 

```bash
··············································································································
|  Solidity and Network Configuration                                                                        │      
·························|·················|···············|·················|································      
|  Solidity: 0.8.24      ·  Optim: false   ·  Runs: 200    ·  viaIR: false   ·     Block: 30,000,000 gas     │      
·························|·················|···············|·················|································      
|  Methods                                                                                                   │      
·························|·················|···············|·················|················|···············      
|  Contracts / Methods   ·  Min            ·  Max          ·  Avg            ·  # calls       ·  usd (avg)   │      
·························|·················|···············|·················|················|···············      
|  PesquisaDeOpiniao     ·                                                                                   │      
·························|·················|···············|·················|················|···············      
|      adicionaEleitor   ·         76,100  ·       93,212  ·         78,810  ·            19  ·           -  │      
·························|·················|···············|·················|················|···············      
|      cadastrarVotacao  ·        185,806  ·      220,210  ·        191,588  ·            12  ·           -  │      
·························|·················|···············|·················|················|···············      
|      editDescricao     ·              -  ·            -  ·         32,639  ·             2  ·           -  │      
·························|·················|···············|·················|················|···············      
|      editNome          ·              -  ·            -  ·         32,573  ·             2  ·           -  │      
·························|·················|···············|·················|················|···············      
|      emitAnuncio       ·              -  ·            -  ·         29,877  ·             2  ·           -  │      
·························|·················|···············|·················|················|···············      
|      encerraVotacao    ·         32,349  ·       34,542  ·         33,080  ·             6  ·           -  │      
·························|·················|···············|·················|················|···············      
|      excluiEleitor     ·              -  ·            -  ·         41,721  ·             2  ·           -  │      
·························|·················|···············|·················|················|···············      
|      pause             ·              -  ·            -  ·         45,728  ·             4  ·           -  │      
·························|·················|···············|·················|················|···············      
|      unpause           ·              -  ·            -  ·         23,807  ·             1  ·           -  │      
·························|·················|···············|·················|················|···············      
|      votar             ·        101,229  ·      118,317  ·        106,925  ·             6  ·           -  │      
·························|·················|···············|·················|················|···············      
|  Deployments                             ·                                 ·  % of limit    ·              │      
·························|·················|···············|·················|················|···············      
|  PesquisaDeOpiniao     ·              -  ·            -  ·      2,948,002  ·         9.8 %  ·           -  │      
·························|·················|···············|·················|················|···············      
|  Key                                                                                                       │      
··············································································································      
|  ◯  Execution gas for this method does not include intrinsic gas overhead                                  │      
··············································································································      
|  △  Cost was non-zero but below the precision setting for the currency display (see options)               │      
··············································································································      
|  Toolchain:  hardhat                                                                                       │      
·············································································································· 
```

Por comparação, na rede **Ethereum**, com o preço atual (12/06/2024) de [19,289 reais](https://www.google.com/search?client=firefox-b-d&q=ether+price) por ether e de [6 gwei](https://etherscan.io/gastracker) por gas, custaria em torno de 22,16 reais para executar a função `cadastrarVotacao` e  341,18 reais para implementar na rede Ethereum. A função `votar`, que deveria ser a mais utilizada, deveria custar em torno R$ 12,37 reais.

## Interface Web 

Em desenvolvimento

- [ ] Eventos emitidos devem ficar disponíveis para qualquer usuário que acesse a página
- [ ] Eleitor deve ser capaz de conectar a carteira e cadastrar uma votação
- [ ] Eleitor deve ser capaz de conectar a carteira e visualizar votações ativas e inativas
- [ ] Eleitor deve ser capaz de conectar a carteira e realizar o voto

