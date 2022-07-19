import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {
  Lottery__factory,
  Lottery
} from "../typechain-types";
import { expandTo18Decimals } from "./utilities";


describe("Lottery", function () {

  let owner: SignerWithAddress;
  let signers: SignerWithAddress[];
  let lottery: Lottery;
  let contractBalance = 0;

  beforeEach(async function() {

    signers = await ethers.getSigners();
    owner = await signers[0];
    lottery = await new Lottery__factory(owner).deploy();
    contractBalance=0;
  });

  it("Should throw an error if time < startTime", async function() {
    await expect(lottery.connect(signers[1]).enter({value: expandTo18Decimals(Number(2))})).to.be.revertedWith("block.timestamp !> startTime");
  });

  it("Should throw an error if msg.value is less than 0.001 ether", async function() {
    await ethers.provider.send('evm_increaseTime', [120]);
    await expect(lottery.connect(signers[1]).enter({value: 20000000})).to.be.revertedWith("Amount cannot be less than 0.001 ether");
  });

  it("Should add funds to the contract", async function() {

    await ethers.provider.send('evm_increaseTime', [120]);
    const msgValue: number = 1;
    await lottery.connect(signers[1]).enter({value: expandTo18Decimals(msgValue)});
    contractBalance+=msgValue;
    await lottery.connect(signers[2]).enter({value: expandTo18Decimals(msgValue)});
    contractBalance+=msgValue;
    await lottery.connect(signers[3]).enter({value: expandTo18Decimals(msgValue)});
    contractBalance+=msgValue;
    
    expect(await ethers.provider.getBalance(lottery.address)).to.equal(expandTo18Decimals(contractBalance));

  });

  it("Should return error when connected with wallet != owner", async function() {

    await expect((lottery.connect(signers[1]).pickWinner())).to.be.revertedWith("Winner can only be chosen by the Lottery Manager");

  });

  it("Should check if the lottary money is sent correctly", async function() {

    await ethers.provider.send('evm_increaseTime', [120]);
    const msgValue: number = 2;
    let balances:any= [];

    await lottery.connect(signers[1]).enter({value: expandTo18Decimals(msgValue)});
    contractBalance+=msgValue;
    balances.push(await ethers.provider.getBalance(signers[1].address));

    await lottery.connect(signers[2]).enter({value: expandTo18Decimals(msgValue)});
    contractBalance+=msgValue;
    balances.push(await ethers.provider.getBalance(signers[2].address));

    await lottery.connect(signers[3]).enter({value: expandTo18Decimals(msgValue)});
    contractBalance+=msgValue;
    balances.push(await ethers.provider.getBalance(signers[3].address));

    await lottery.pickWinner();

    let winnerIndex = (await lottery.winnerIndex()).toNumber();
 
    winnerIndex+=1;
    const winnerBalance = balances[winnerIndex-1]
    console.log("locally stored balance: ", winnerBalance);
    let temp: any = await ethers.provider.getBalance(signers[winnerIndex].address);
    let flag: any = (temp-winnerBalance)
;    console.log("on chain balance", await ethers.provider.getBalance(signers[winnerIndex].address));
    console.log("difference", flag);
    
    // expect (await ethers.provider.getBalance(signers[winnerIndex].address)).to.equal(winnerBalance);

  });

  it("Should return error when picking winner with no players in the lottery", async function() {

    await expect((lottery.pickWinner())).to.be.revertedWith("No players in the lottery yet");

  });

});