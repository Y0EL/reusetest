import { ethers, network } from 'hardhat';
import { config } from '@repo/config-contract';

async function startNewCycle() {
    const deployer = (await ethers.getSigners())[0];
    console.log(`\nStarting a new cycle on ${network.name}...\n`);

    // Get contract instance
    const ecoEarn = await ethers.getContractAt('EcoEarn', config.CONTRACT_ADDRESS);
    
    // Check current cycle info
    const currentCycle = await ecoEarn.getCurrentCycle();
    const rewardsLeft = await ecoEarn.rewardsLeft(currentCycle);
    
    console.log('Current cycle info:');
    console.log('Current Cycle:', currentCycle.toString());
    console.log('Rewards Left:', ethers.formatEther(rewardsLeft), 'B3TR');
    
    // Move the remaining rewards to the new cycle
    console.log('\nStarting new cycle...');
    
    try {
        // Trigger new cycle
        const tx = await ecoEarn.triggerCycle();
        await tx.wait();
        console.log('New cycle triggered');
        
        // Get new cycle number
        const newCycle = await ecoEarn.getCurrentCycle();
        
        // Set rewards for new cycle (use the same amount as rewards left in old cycle)
        console.log(`Setting ${ethers.formatEther(rewardsLeft)} B3TR as rewards for cycle ${newCycle}...`);
        const tx2 = await ecoEarn.setRewardsAmount(rewardsLeft);
        await tx2.wait();
        
        // Verify cycle status
        const updatedRewardsLeft = await ecoEarn.rewardsLeft(newCycle);
        
        console.log('\nNew cycle status:');
        console.log('Current Cycle:', newCycle.toString());
        console.log('Rewards Left:', ethers.formatEther(updatedRewardsLeft), 'B3TR');
    } catch (error: any) {
        console.error('Error starting new cycle:', error.message);
    }
}

startNewCycle()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 