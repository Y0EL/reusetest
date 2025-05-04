import { ethers, network } from 'hardhat';
import { config } from '@repo/config-contract';

async function resetCycleAndSetRewards() {
    const deployer = (await ethers.getSigners())[0];
    console.log(`\nResetting cycle and setting new rewards on ${network.name}...\n`);

    // Get contract instance
    const ecoEarn = await ethers.getContractAt('EcoEarn', config.CONTRACT_ADDRESS);
    
    // Set rewards amount for the next cycle (1000 tokens - adjust as needed)
    console.log('Setting rewards amount...');
    try {
        const rewardsAmount = ethers.parseEther("1000"); // 1000 tokens
        const tx1 = await ecoEarn.setRewardsAmount(rewardsAmount);
        await tx1.wait();
        console.log('Rewards set to 1000 tokens');
    } catch (error: any) {
        console.error('Failed to set rewards amount:', error.message);
        return;
    }
    
    // Set next cycle to 2
    console.log('Setting next cycle...');
    try {
        const tx2 = await ecoEarn.setNextCycle(2);
        await tx2.wait();
        console.log('Next cycle set to 2');
    } catch (error: any) {
        console.error('Failed to set next cycle:', error.message);
        return;
    }
    
    // Trigger new cycle
    console.log('Triggering new cycle...');
    try {
        const tx3 = await ecoEarn.triggerCycle();
        await tx3.wait();
        console.log('New cycle triggered');
    } catch (error: any) {
        console.error('Failed to trigger new cycle:', error.message);
        return;
    }
    
    // Verify cycle status
    const currentBlock = await ethers.provider.getBlockNumber();
    const lastCycleStartBlock = await ecoEarn.lastCycleStartBlock();
    const nextCycleBlock = await ecoEarn.getNextCycleBlock();
    const currentCycle = await ecoEarn.getCurrentCycle();
    const rewardsLeft = await ecoEarn.rewardsLeft(currentCycle);
    
    console.log('\nNew cycle status:');
    console.log('Current Cycle:', currentCycle.toString());
    console.log('Current Block:', currentBlock);
    console.log('Last Cycle Start Block:', lastCycleStartBlock.toString());
    console.log('Next Cycle Block:', nextCycleBlock.toString());
    console.log('Blocks until next cycle:', Number(nextCycleBlock) - currentBlock);
    console.log('Rewards Left:', ethers.formatEther(rewardsLeft), 'B3TR');
}

resetCycleAndSetRewards()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 