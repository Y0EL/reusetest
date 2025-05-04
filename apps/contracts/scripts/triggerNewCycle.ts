import { ethers, network } from 'hardhat';
import { config } from '@repo/config-contract';

async function triggerNewCycle() {
    const deployer = (await ethers.getSigners())[0];
    console.log(`Starting new cycle on ${network.name} with wallet ${deployer.address}...`);

    // Get contract instance
    const ecoEarn = await ethers.getContractAt('EcoEarn', config.CONTRACT_ADDRESS);
    
    // Check current cycle
    const currentCycle = await ecoEarn.getCurrentCycle();
    console.log('Current Cycle:', currentCycle.toString());
    
    // Check if cycle is over
    const nextCycleBlock = await ecoEarn.getNextCycleBlock();
    const currentBlock = await ethers.provider.getBlockNumber();
    console.log('Current Block:', currentBlock);
    console.log('Next Cycle Block:', nextCycleBlock.toString());
    
    const isCycleOver = currentBlock >= nextCycleBlock;
    console.log('Is Cycle Over:', isCycleOver);
    
    if (isCycleOver) {
        console.log('Cycle is over. Triggering new cycle...');
        // Trigger new cycle
        const tx = await ecoEarn.triggerCycle();
        await tx.wait();
        console.log('New cycle started!');
        
        // Check new cycle info
        const newCurrentCycle = await ecoEarn.getCurrentCycle();
        console.log('New Current Cycle:', newCurrentCycle.toString());
        
        // Check if rewards are set for the new cycle
        const newCycleRewards = await ecoEarn.rewards(newCurrentCycle);
        console.log('New Cycle Rewards:', ethers.formatEther(newCycleRewards), 'B3TR');
        
        if (newCycleRewards == 0n) {
            console.log('WARNING: No rewards set for the new cycle!');
            console.log('Setting rewards for new cycle...');
            
            // Check available funds
            const rewardsPool = await ethers.getContractAt('IX2EarnRewardsPool', config.X2EARN_REWARDS_POOL);
            const availableFunds = await rewardsPool.availableFunds(config.APP_ID);
            console.log(`Available funds: ${ethers.formatEther(availableFunds)} B3TR`);
            
            if (availableFunds >= ethers.parseEther('100000')) {
                // Set rewards for new cycle (100,000 B3TR)
                const rewardsAmount = ethers.parseEther('100000');
                const rewardsAmountTx = await ecoEarn.setRewardsAmount(rewardsAmount);
                await rewardsAmountTx.wait();
                console.log('Rewards set to 100,000 B3TR for new cycle');
            } else {
                console.log('Not enough funds available to set rewards. Please fund the contract first.');
            }
        }
    } else {
        console.log('Cycle is not over yet. No need to trigger new cycle.');
    }
}

triggerNewCycle()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 