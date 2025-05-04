import { ethers, network } from 'hardhat';
import { config } from '@repo/config-contract';

async function resetCycle() {
    const deployer = (await ethers.getSigners())[0];
    console.log(`\nResetting cycle on ${network.name}...\n`);

    // Get contract instance
    const ecoEarn = await ethers.getContractAt('EcoEarn', config.CONTRACT_ADDRESS);
    
    // Set cycle duration to 1 week (about 60480 blocks)
    console.log('Setting cycle duration...');
    const tx1 = await ecoEarn.setNextCycle(1);
    await tx1.wait();
    
    // Trigger new cycle
    console.log('Triggering new cycle...');
    const tx2 = await ecoEarn.triggerCycle();
    await tx2.wait();
    
    // Verify cycle status
    const currentBlock = await ethers.provider.getBlockNumber();
    const lastCycleStartBlock = await ecoEarn.lastCycleStartBlock();
    const nextCycleBlock = await ecoEarn.getNextCycleBlock();
    
    console.log('\nNew cycle status:');
    console.log('Current Block:', currentBlock);
    console.log('Last Cycle Start Block:', lastCycleStartBlock.toString());
    console.log('Next Cycle Block:', nextCycleBlock.toString());
    console.log('Blocks until next cycle:', Number(nextCycleBlock) - currentBlock);
    console.log('Is cycle over:', currentBlock >= Number(nextCycleBlock));
}

resetCycle()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 