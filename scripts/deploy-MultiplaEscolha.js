// scripts/deploy-banner.js

const { ethers } = require("hardhat");

async function main() {
  const Contrato = await ethers.getContractFactory("MultiplaEscolha");
  const contrato = await Contrato.deploy("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");

  console.log("'MultiplaEscolha' deployado em:", contrato.target);
}

main().then(() => process.exit(0)).catch(error => {
  console.error(error);
  process.exit(1);
});