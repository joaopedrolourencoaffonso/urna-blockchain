# Urna blockchain

Um pequeno projeto para praticar conhecimentos em solidity.

## Como usar

1. Crie um projeto Hardhat normalmente
2. Salve o [`voting.sol`](./voting.sol) na sua pasta `contracts`.
3. Salve o [`interact-voting.js`](./interact-voting.js) na sua pasta `scripts`.
4. Execute: `npx hardhat run .\scripts\interact-voting.js`, o resultado deveria ser similar ao abaixo:

```bash
> npx hardhat run .\scripts\interact-voting.js
Lista de eleitores:  Result(7) [
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
  '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
  '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
  '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
  '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199'
]
-----
Lista de eleitores:  Result(6) [
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
  '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
  '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
  '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc'
]
O endereço  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 :  true
O número atual de eleitores é:  6n
O status da votação é:  Em Andamento
```
