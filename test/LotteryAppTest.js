/*
    At Time of  Depolyment IniialValue Is Added Here 
    Only For  Testing Purpuose
    In The Main Deploy No Value Will Be Passed 
    At Time Of Contract Main Deployment Contract Balance will be Empty
    Contarct Will Only Store And Receive Players Balance; 
*/

const {expect} = require('chai');
const {loadFixture}= require("ethereum-waffle");
const { providers, BigNumber } = require('ethers');
const { ethers } = require('hardhat');
describe("LotteryAppTesting", async ()=>{

    async function deployAndSetVaribales(params) {
    const ContractToDeploy = await ethers.getContractFactory('Lottery');
    const InitialValue =  ethers.utils.parseEther('15');
    const deployedApp = await ContractToDeploy.deploy({value:InitialValue});

    const [owner,player1,player2,player3,player4,player5,player6] = await ethers.getSigners();

    return {deployedApp,owner,player1,player2,player3,player4,player5,player6,InitialValue}
    }

    it("Sholud Deploy And Set Owner", async ()=>{
        const{deployedApp,owner} = await loadFixture(deployAndSetVaribales);

        const contractaddress = await deployedApp.Owner();

        expect(await contractaddress).to.be.equal(owner.address)
    });

    it("Should Deploy with An Amount Of 15 Ether", async ()=>{
        const{deployedApp,InitialValue} = await loadFixture(deployAndSetVaribales);
        const LottteryAmount = await deployedApp.provider.getBalance(deployedApp.address)

        expect(LottteryAmount).to.be.equal(InitialValue);
        
    })

    it("Owner Sholud not Join Lottery ", async ()=>{
        const {deployedApp,owner} = await loadFixture(deployAndSetVaribales)
        try {
            await deployedApp.connect(owner).joinInLottery({vale:ethers.utils.parseEther('2')})
           
        } catch (error) {
            expect(error)
        }
    })

    it("Player Must Pay minimum 2 or more Ether to join Lottry", async ()=>{

        const {deployedApp,owner,player1} = await loadFixture(deployAndSetVaribales)

        // Trying Agisn With Owner For Sure Again
        try {
            await deployedApp.connect(owner).joinInLottery({vale:ethers.utils.parseEther('2')})
           
        } catch (error) {
            expect(error)
        }
        expect(await deployedApp.connect(player1).joinInLottery({value:ethers.utils.parseEther('2')})).to.be.not.reverted;
      
    })

    it("Player Cannot Join With Less Than 2  Ether ", async ()=>{

        const {deployedApp,player1} = await loadFixture(deployAndSetVaribales)

        // Trying Asign With Owner For Sure Again

        try {
            await deployedApp.connect(owner).joinInLottery({vale:ethers.utils.parseEther('2')})
           
        } catch (error) {
            expect(error)
        }
        // Trying Asign With Palyer  Less Than 2 Ether Sure Again
        try {
            await deployedApp.connect(player1).joinInLottery({vale:ethers.utils.parseEther('1.99')})
           
        } catch (error) {
            expect(error)
        }
      
        
    })
    it("Same Player Cannot Join Again The Lottery And New Player Should Not be Added to The Array ", async ()=>{ 
        const {deployedApp,player1,player2} = await loadFixture(deployAndSetVaribales);

      
        // Players 1 again 
        try {
            await deployedApp.connect(player1).joinInLottery({vale:ethers.utils.parseEther('2.1')})
            
        } catch (error) {
            expect(error);
        }

        // New Players 2 Add 

        try {
            expect(await deployedApp.connect(player2).joinInLottery({value:ethers.utils.parseEther('2')}))

        } catch (error) {
            console.log(error);
        }
        // As Two Players Have Joind With 2 ether Nad Contract Has IniTial 15 Ether
        expect(await deployedApp.provider.getBalance(deployedApp.address)).to.be.equal(ethers.utils.parseEther('19'))
       
    })

    it("Contract Should received Players Amount And Add It To The LotteryAmount State", async()=>{
        const {deployedApp,player3,InitialValue} = await loadFixture(deployAndSetVaribales);
        const balancebeforePlayerJoin = await deployedApp.provider.getBalance(deployedApp.address)
        const BeforeLotteryAmount = await deployedApp.LotteryAmount();
        
        // Assign A New Player  With 2 Ether 
        try {
            await deployedApp.connect(player3).joinInLottery({value:ethers.utils.parseEther('2')});
        } catch (error) {
            
        }

        const AfterJoinLotteryAmount = await deployedApp.LotteryAmount();

        expect(BeforeLotteryAmount).to.be.not.equal(AfterJoinLotteryAmount);
    });


    it("Only Owner Can Call The Draw", async ()=>{

        const {deployedApp,player1} = await loadFixture(deployAndSetVaribales);

        try {
            await deployedApp.connect(player1).draw();
        } catch (error) {
            expect(error);
        }
    })

    it("Minimum 11 Or More Ether Need To Draw And 5 Players Need to Draw" , async ()=>{
        const {deployedApp,owner,player4,player5,player6} = await loadFixture(deployAndSetVaribales);

        // Currently  We Have 3 Players Joined And 6 Ethers On the Lottry Amount
        // try A draw And And Expect Error(Revert)
        
        try {
            await deployedApp.connect(owner).draw();
        } catch (error) {
            expect(error);
        }

        // Let Add add two more Player And Try To Draw With Less 12 Ether
        await deployedApp.connect(player4).joinInLottery({value:ethers.utils.parseEther('2')});
        await deployedApp.connect(player5).joinInLottery({value:ethers.utils.parseEther('2')});

        // If Try Again Now For We Will Expect Error(revert) Again
        // Because Now We Have 10 Ether in Lottery Amount 
        // And to Draw We Need More Than 11 Ether 

        try {
            await deployedApp.connect(owner).draw();
        } catch (error) {
            expect(error);
        }

        // Now Lets Add one More Players Add Increase The Lottery Amount
        await deployedApp.connect(player6).joinInLottery({value:ethers.utils.parseEther('2')});

        // After SuccessFull Draw Lottry Amount Should Be Zero 

        try {
            await deployedApp.connect(owner).draw();
        } catch (error) {
            
        }

        const lotteryAmountAfterDraw = await deployedApp.LotteryAmount();

        expect(lotteryAmountAfterDraw).to.be.equal(0);

    })

    it("Minimum 5 Players Must Be Join To Draw If A Single Player Join With More Than 11 Ether Then Draw Must Be Reverted",async()=>{

        const{deployedApp,player1,owner} = await loadFixture(deployAndSetVaribales);

        await deployedApp.connect(player1).joinInLottery({value:ethers.utils.parseEther('12')});

        try {
            await deployedApp.connect(owner).draw();
        } catch (err) {
            expect(err);
        }

    });
    it("If Draw Fails Ethers Should Be Returned To Their Address" ,async()=>{
        const{deployedApp,player1,owner} = await loadFixture(deployAndSetVaribales);
        try {
            await deployedApp.connect(player1).joinInLottery({value:ethers.utils.parseEther('6')});
        } catch (error) {
            console.log(error);    
        }
        const player1balnceInContract = await deployedApp.PlayersToAmount(player1.address);

        // Try Draw

        try {
            await deployedApp.connect(owner).draw();
        } catch (error) {
            expect(err);
        }
        const player1balnceInontractafterDraw = await deployedApp.PlayersToAmount(player1.address);

        expect(player1balnceInContract).to.be.not.equal(player1balnceInontractafterDraw);

    });

    it('Contract Should Get 5% Commission After SuccessFull Draw And lotteryAmount Should Be Set To 0', async()=>{

        const {deployedApp,owner,player1,player2,player3,player4,player5} = await loadFixture(deployAndSetVaribales);
        const OwnerBalancebeforedraw = await ethers.provider.getBalance(owner.address);
        // Joinig Players 
        await deployedApp.connect(player1).joinInLottery({value:ethers.utils.parseEther('2')})
        await deployedApp.connect(player2).joinInLottery({value:ethers.utils.parseEther('2')})
        await deployedApp.connect(player3).joinInLottery({value:ethers.utils.parseEther('3')})
        await deployedApp.connect(player4).joinInLottery({value:ethers.utils.parseEther('2')})
        await deployedApp.connect(player5).joinInLottery({value:ethers.utils.parseEther('3')})


        
        // Make Draw 

        try {
            await deployedApp.connect(owner).draw();
        } catch (error) {
            
            console.log(error);
        }
        const OwnerBalanceAfterdraw = await ethers.provider.getBalance(owner.address);
   
        expect(OwnerBalanceAfterdraw).to.be.lt(OwnerBalancebeforedraw)

    })

})