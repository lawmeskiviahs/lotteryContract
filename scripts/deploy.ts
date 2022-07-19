import { ethers } from "hardhat";

async function main() {

  const Lottery = await ethers.getContractFactory("lottery");
  const lottery = await Lottery.deploy();

  await lottery.deployed();

  console.log("Lock with 1 ETH deployed to:", lottery.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
