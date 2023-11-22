// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;
import "../contracts/safeMath.sol";

contract Lottery {
    using  SafeMath for uint;
    address public Owner;

    uint public LotteryAmount;

    address[] public Players;

    mapping (address=>uint)  public PlayersToAmount;

    constructor() payable{
        Owner = msg.sender;
    }

    modifier isOwner{
        require(msg.sender==Owner, "Only Owner Can Hit Draw");
        _;
    }
     modifier notOwner{
        require(msg.sender!=Owner, "Owner Cannot Join Lottery");
        _;
    }

    modifier hasJoined(address _addr){
        require(checkJoined(_addr)==false,"You Have Already Joined the Lottery");
        _;
    }

        receive() external payable {
    }

    function joinInLottery() payable public notOwner hasJoined(msg.sender) {
        require(msg.value>= 2000000000000000000,"Minimum Required Ether To Join The Lottery Is 2 Ether");
        Players.push(msg.sender);
        PlayersToAmount[msg.sender]=msg.value;
        payable(address(this)).transfer(msg.value);
        LotteryAmount+=(msg.value);
    }

    function draw() payable public  isOwner returns (string memory) {

        string memory result = "";
        // Sending Back To All Ether  To Their Owners
        if (Players.length<5) {
   
            // If No Player Joins
            if(Players.length==0){
                result = "No players Joined the Lottery";
                return result;
            }
            // If Only 1 Player Joins
            else{
                if(Players.length ==1){
                payable (Players[0]).transfer(PlayersToAmount[Players[0]]);
                delete PlayersToAmount[Players[0]];
            // Restting The Array And Lottery Amount;
                Players = new address[](0);
                LotteryAmount=0;

                result = "Requirement Of Minimum 5 Players Didn't Meet Lottry Canceled";
                return result;
            }
            // If More Than 1 Player But Less Than 5 Players

            else{
                    for (uint i =0 ; i<Players.length; i++) {
                    payable (Players[i]).transfer(PlayersToAmount[Players[i]]);
                    delete PlayersToAmount[Players[i]];
                }
            // Restting The Array And Lottery Amount;
            Players = new address[](0);
            LotteryAmount=0;
            result = "Requirement Of Minimum 5 Players Didn't Meet Lottry Canceled";
            return result;

            }
        }

        }
            
        else if(LotteryAmount>11000000000000000000 ){
            // Sending Back To All the To their Owners
            for (uint i =0 ; i<Players.length; i++) {
                payable (Players[i]).transfer(PlayersToAmount[Players[i]]);
                delete PlayersToAmount[Players[i]];
            }
            // Restting The Array And Lottery Amount;
            Players = new address[](0);
            LotteryAmount=0;
            result = "Requirement Of Minimum 12 Eth Total To Draw Didn't Meet Lottry Canceled";
            return result;
        }
        else{
            uint randomWinner = generateRandomnum(Players) % Players.length;
            uint contarctComission = (LotteryAmount * 5) /100;
            uint winnerAmount =  (LotteryAmount - contarctComission) * (10**18);
            payable (Players[randomWinner]).transfer(winnerAmount);
            payable(Owner).transfer(contarctComission);
            // removing The Joind Person From the Mapping
            for (uint i =0 ; i<Players.length; i++) {
                delete PlayersToAmount[Players[i]];
            }
            // Restting The Array And Lottery Amount;
            LotteryAmount=0;
            Players = new address[](0);
            result = "Draw Was Successfull";
            return result;
        }
        

    }


    //Helper Functions

    function checkJoined(address _addr) view internal returns (bool){

        bool isIn = false;

        for (uint i = 0; i<Players.length; i++) {
            
            if (Players[i]==_addr) {
                isIn = true;
                break;
            }
        }
        return isIn;
    }

    function generateRandomnum(address[] memory _players) view internal returns (uint) {
        
        uint randomnum = uint(keccak256(
            abi.encodePacked(
                blockhash(block.number-1),
                blockhash(block.timestamp-30),
                _players
            )

        ));

        return randomnum;
    }

 


}