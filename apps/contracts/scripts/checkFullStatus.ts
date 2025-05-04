import { ethers, network } from 'hardhat';
import { config } from '@repo/config-contract';

async function checkFullStatus() {
    const deployer = (await ethers.getSigners())[0];
    console.log(`\nChecking status on ${network.name} with wallet ${deployer.address}...\n`);

    // Get contract instances
    const ecoEarn = await ethers.getContractAt('EcoEarn', config.CONTRACT_ADDRESS);
    const x2EarnApps = await ethers.getContractAt('IX2EarnAppsMock', config.X2EARN_APPS);
    const x2EarnRewardsPool = await ethers.getContractAt('IX2EarnRewardsPool', config.X2EARN_REWARDS_POOL);
    const b3trToken = await ethers.getContractAt('IERC20', config.TOKEN_ADDRESS);
    
    console.log('1. Basic Contract Info:');
    console.log('----------------------');
    console.log('Contract Address:', config.CONTRACT_ADDRESS);
    console.log('APP_ID:', config.APP_ID);
    
    // Check if app exists and admin
    const isAdmin = await x2EarnApps.isAppAdmin(config.APP_ID, deployer.address);
    console.log('\n2. X2EarnApps Status:');
    console.log('--------------------');
    console.log('Is Admin:', isAdmin);
    
    // Check if contract is reward distributor
    const isDistributor = await x2EarnApps.isRewardDistributor(config.APP_ID, config.CONTRACT_ADDRESS);
    console.log('Is Reward Distributor:', isDistributor);
    
    // Check cycle info
    const currentCycle = await ecoEarn.getCurrentCycle();
    const rewards = await ecoEarn.rewards(currentCycle);
    const rewardsLeft = await ecoEarn.rewardsLeft(currentCycle);
    console.log('\n3. Cycle Information:');
    console.log('-------------------');
    console.log('Current Cycle:', currentCycle.toString());
    console.log('Cycle Rewards:', ethers.formatEther(rewards), 'B3TR');
    console.log('Rewards Left:', ethers.formatEther(rewardsLeft), 'B3TR');
    
    // Check balances
    const contractB3TRBalance = await b3trToken.balanceOf(config.CONTRACT_ADDRESS);
    const poolB3TRBalance = await b3trToken.balanceOf(config.X2EARN_REWARDS_POOL);
    const availableFunds = await x2EarnRewardsPool.availableFunds(config.APP_ID);
    console.log('\n4. Token Balances:');
    console.log('----------------');
    console.log('Contract B3TR Balance:', ethers.formatEther(contractB3TRBalance), 'B3TR');
    console.log('Pool B3TR Balance:', ethers.formatEther(poolB3TRBalance), 'B3TR');
    console.log('Available Funds in Pool:', ethers.formatEther(availableFunds), 'B3TR');

    // Check max submissions
    const maxSubmissions = await ecoEarn.maxSubmissionsPerCycle();
    const totalSubmissions = await ecoEarn.totalSubmissions(currentCycle);
    console.log('\n5. Submissions Info:');
    console.log('------------------');
    console.log('Max Submissions per Cycle:', maxSubmissions.toString());
    console.log('Total Submissions this Cycle:', totalSubmissions.toString());
}

checkFullStatus()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 