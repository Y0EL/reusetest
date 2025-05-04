import { ethers, network } from 'hardhat';
import { config } from '@repo/config-contract';

async function checkCycle() {
    const deployer = (await ethers.getSigners())[0];
    console.log(`\nChecking cycle status on ${network.name}...\n`);

    // Get contract instance
    const ecoEarn = await ethers.getContractAt('EcoEarn', config.CONTRACT_ADDRESS);
    
    // Get cycle info
    const currentBlock = await ethers.provider.getBlockNumber();
    const lastCycleStartBlock = await ecoEarn.lastCycleStartBlock();
    const nextCycleBlock = await ecoEarn.getNextCycleBlock();
    const cycleDuration = await ecoEarn.cycleDuration();
    
    console.log('Current Block:', currentBlock);
    console.log('Last Cycle Start Block:', lastCycleStartBlock.toString());
    console.log('Next Cycle Block:', nextCycleBlock.toString());
    console.log('Cycle Duration:', cycleDuration.toString());
    console.log('\nBlocks until next cycle:', Number(nextCycleBlock) - currentBlock);
    console.log('Is cycle over:', currentBlock >= Number(nextCycleBlock));
}

checkCycle()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 