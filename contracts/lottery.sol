// SPDX-License-Identifier: MIT
import "hardhat/console.sol";
pragma solidity ^0.8.0;

contract Lottery {

    address public manager;
    uint playerCount = 0;
    mapping (uint => address) players;
    uint public winnerIndex;
    uint public startTime;
    uint public coolingPeriod = 1 minutes;
    // bool isStarted;

    constructor () {
        manager = msg.sender;
        startTime = block.timestamp + coolingPeriod;
        // isStarted = false;
    }


    modifier adminOnly () {
        require(msg.sender == manager, "Winner can only be chosen by the Lottery Manager");
        _;
    }

    function enter () public payable {
        require(block.timestamp > startTime, "block.timestamp !> startTime");
        require(msg.value > 0.001 ether, "Amount cannot be less than 0.001 ether");
        players[playerCount]=msg.sender;
        playerCount+=1;
        // if(isStarted==false){
        //     isStarted=true;
        // }
    }
  
    function pickWinner () public adminOnly returns (uint256) {
        require(playerCount != 0, "No players in the lottery yet");
        winnerIndex = randomIndex() % playerCount;
        // console.log("winner index", winnerIndex);

        payable(players[winnerIndex]).transfer(address(this).balance);

        // players = new address[](0);
        playerCount = 0;
        return winnerIndex;
    }


    function randomIndex () private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.timestamp))); 
    }

    // function getPlayers() public view returns (address[] memory) {
    //     return players;
    // }

}