import { ethers, network } from 'hardhat';
import { config } from '@repo/config-contract';

async function getRewardsStatus() {
    const deployer = (await ethers.getSigners())[0];
    console.log(`\nChecking rewards status on ${network.name} with wallet ${deployer.address}...\n`);

    // Display configuration
    console.log('Current configuration:');
    console.log('Contract Address:', config.CONTRACT_ADDRESS);
    console.log('APP_ID:', config.APP_ID);
    console.log('X2EarnRewardsPool Address:', config.X2EARN_REWARDS_POOL);

    try {
        // Get instance of EcoEarn contract
        console.log('\nConnecting to EcoEarn contract...');
        const ecoEarn = await ethers.getContractAt('EcoEarn', config.CONTRACT_ADDRESS);
        
        // Check the current cycle
        console.log('\nChecking current cycle...');
        const currentCycle = await ecoEarn.getCurrentCycle();
        console.log('Current cycle:', currentCycle.toString());
        const nextCycle = await ecoEarn.nextCycle();
        console.log('Next cycle:', nextCycle.toString());
        
        // Check rewards for current cycle
        console.log('\nChecking rewards for current cycle...');
        const rewardsForCurrentCycle = await ecoEarn.rewards(currentCycle);
        console.log('Total rewards for current cycle:', ethers.formatEther(rewardsForCurrentCycle), 'B3TR');
        
        const rewardsLeftForCurrentCycle = await ecoEarn.rewardsLeft(currentCycle);
        console.log('Rewards left for current cycle:', ethers.formatEther(rewardsLeftForCurrentCycle), 'B3TR');
        
        // Check available funds in pool for this APP_ID
        console.log('\nChecking available funds in X2EarnRewardsPool...');
        const x2EarnRewardsPool = await ethers.getContractAt('IX2EarnRewardsPool', config.X2EARN_REWARDS_POOL);
        const availableFunds = await x2EarnRewardsPool.availableFunds(config.APP_ID);
        console.log('Available funds in reward pool:', ethers.formatEther(availableFunds), 'B3TR');
        
        // Check max submissions per cycle
        console.log('\nChecking max submissions per cycle...');
        const maxSubmissionsPerCycle = await ecoEarn.maxSubmissionsPerCycle();
        console.log('Max submissions per cycle:', maxSubmissionsPerCycle.toString());
        
        // Check cycle duration
        console.log('\nChecking cycle duration...');
        const cycleDuration = await ecoEarn.cycleDuration();
        console.log('Cycle duration (in blocks):', cycleDuration.toString());
        
        // Check if contract is registered as distributor
        console.log('\nChecking if contract is registered as distributor...');
        const x2EarnApps = await ethers.getContractAt('IX2EarnAppsMock', config.X2EARN_APPS);
        const isDistributor = await x2EarnApps.isRewardDistributor(config.APP_ID, config.CONTRACT_ADDRESS);
        console.log('Is distributor:', isDistributor);
        
        console.log('\nRewards Status Summary:');
        console.log('------------------------');
        console.log('Current Cycle:', currentCycle.toString());
        console.log('Total Rewards for Current Cycle:', ethers.formatEther(rewardsForCurrentCycle), 'B3TR');
        console.log('Rewards Left for Current Cycle:', ethers.formatEther(rewardsLeftForCurrentCycle), 'B3TR');
        console.log('Available Funds in Pool:', ethers.formatEther(availableFunds), 'B3TR');
        console.log('Max Submissions Per Cycle:', maxSubmissionsPerCycle.toString());
        console.log('Contract Registered as Distributor:', isDistributor);
        
        if (rewardsLeftForCurrentCycle < ethers.parseEther("100")) {
            console.log('\n⚠️ WARNING: Rewards left for current cycle is low or zero!');
            console.log('Users may not be able to receive rewards for their submissions.');
            console.log('Please set rewards amount for the current cycle using the setRewardsAmount function.');
        }
        
    } catch (error: any) {
        console.error('\nError:', error.message);
    }
}

// Execute the script
if (require.main === module) {
    getRewardsStatus()
        .then(() => {
            console.log('\nRewards status check completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\nScript failed:', error);
            process.exit(1);
        });
} 