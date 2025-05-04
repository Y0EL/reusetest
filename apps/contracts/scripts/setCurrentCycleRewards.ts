import { ethers, network } from 'hardhat';
import { config } from '@repo/config-contract';

async function setCurrentCycleRewards() {
    const deployer = (await ethers.getSigners())[0];
    console.log(`Setting rewards on ${network.name} with wallet ${deployer.address}...`);

    // Get contract instance
    const ecoEarn = await ethers.getContractAt('EcoEarn', config.CONTRACT_ADDRESS);
    
    // Check current cycle
    const currentCycle = await ecoEarn.getCurrentCycle();
    console.log('Current Cycle:', currentCycle.toString());
    
    // Check current rewards
    const currentRewards = await ecoEarn.rewards(currentCycle);
    console.log('Current Cycle Rewards:', ethers.formatEther(currentRewards), 'B3TR');
    
    const currentRewardsLeft = await ecoEarn.rewardsLeft(currentCycle);
    console.log('Current Cycle Rewards Left:', ethers.formatEther(currentRewardsLeft), 'B3TR');

    // Check available funds
    const rewardsPool = await ethers.getContractAt('IX2EarnRewardsPool', config.X2EARN_REWARDS_POOL);
    const availableFunds = await rewardsPool.availableFunds(config.APP_ID);
    console.log(`Available funds: ${ethers.formatEther(availableFunds)} B3TR`);
    
    if (availableFunds >= ethers.parseEther('100000')) {
        if (currentRewards == 0n) {
            console.log('Setting rewards amount...');
            // Directly set current cycle rewards using nextCycle
            const nextCycle = await ecoEarn.nextCycle();
            console.log('nextCycle value:', nextCycle.toString());
            
            // Temporarily set nextCycle to current+1 to set rewards
            const setNextCycleTx = await ecoEarn.setNextCycle(currentCycle + 1n);
            await setNextCycleTx.wait();
            console.log('Temporarily set nextCycle to', (currentCycle + 1n).toString());
            
            // Now set rewards amount
            const rewardsAmount = ethers.parseEther('100000');
            const rewardsAmountTx = await ecoEarn.setRewardsAmount(rewardsAmount);
            await rewardsAmountTx.wait();
            console.log('Rewards set to 100,000 B3TR');
            
            // Restore nextCycle value
            const restoreNextCycleTx = await ecoEarn.setNextCycle(nextCycle);
            await restoreNextCycleTx.wait();
            console.log('Restored nextCycle to', nextCycle.toString());
            
            // Check updated rewards
            const updatedRewards = await ecoEarn.rewards(currentCycle);
            console.log('Updated Current Cycle Rewards:', ethers.formatEther(updatedRewards), 'B3TR');
            
            const updatedRewardsLeft = await ecoEarn.rewardsLeft(currentCycle);
            console.log('Updated Current Cycle Rewards Left:', ethers.formatEther(updatedRewardsLeft), 'B3TR');
        } else {
            console.log('Rewards already set for current cycle');
        }
    } else {
        console.log('Not enough funds available to set rewards. Please fund the contract first.');
    }
}

setCurrentCycleRewards()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 