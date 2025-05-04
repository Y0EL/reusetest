import { ethers, network } from 'hardhat';
import { config } from '@repo/config-contract';

async function initializeContract() {
    const deployer = (await ethers.getSigners())[0];
    console.log(`Initializing contract on ${network.name} with wallet ${deployer.address}...`);

    // Get contract instance
    const ecoEarn = await ethers.getContractAt('EcoEarn', config.CONTRACT_ADDRESS);
    console.log('Contract Address:', config.CONTRACT_ADDRESS);
    
    // Check app ID
    const appId = await ecoEarn.appId();
    console.log('App ID:', appId);
    
    // Check current cycle
    const currentCycleBefore = await ecoEarn.getCurrentCycle();
    console.log('Current Cycle before:', currentCycleBefore.toString());

    // Check available funds
    const rewardsPool = await ethers.getContractAt('IX2EarnRewardsPool', config.X2EARN_REWARDS_POOL);
    const availableFunds = await rewardsPool.availableFunds(config.APP_ID);
    console.log(`Available funds: ${ethers.formatEther(availableFunds)} B3TR`);
    
    if (availableFunds < ethers.parseEther('100000')) {
        console.warn('WARNING: Not enough funds available. Need at least 100,000 B3TR');
        return;
    }
    
    // Set rewards amount (100,000 B3TR)
    console.log('Setting rewards amount...');
    const rewardsAmount = ethers.parseEther('100000');
    const rewardsAmountResult = await (await ecoEarn.setRewardsAmount(rewardsAmount)).wait();
    
    if (rewardsAmountResult == null || rewardsAmountResult.status !== 1) {
        throw new Error('Failed to set rewards amount');
    }
    console.log('Rewards set to 100,000 B3TR');

    // Set next cycle
    console.log('Setting next cycle...');
    const nextCycleResult = await (await ecoEarn.setNextCycle(2n)).wait();

    if (nextCycleResult == null || nextCycleResult.status !== 1) {
        throw new Error('Failed to set next cycle');
    }
    console.log('Switched to next cycle');
    
    // Check updated cycle
    const currentCycleAfter = await ecoEarn.getCurrentCycle();
    console.log('Current Cycle after:', currentCycleAfter.toString());
    
    // Check rewards for current cycle
    const rewards = await ecoEarn.rewards(currentCycleAfter);
    console.log('Current Cycle Rewards:', ethers.formatEther(rewards), 'B3TR');
    
    // Check rewards left for current cycle
    const rewardsLeft = await ecoEarn.rewardsLeft(currentCycleAfter);
    console.log('Current Cycle Rewards Left:', ethers.formatEther(rewardsLeft), 'B3TR');
    
    console.log('Contract successfully initialized with rewards!');
}

initializeContract()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 