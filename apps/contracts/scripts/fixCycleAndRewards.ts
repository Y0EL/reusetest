import { ethers, network } from 'hardhat';
import { config } from '@repo/config-contract';

async function fixCycleAndRewards() {
    const deployer = (await ethers.getSigners())[0];
    console.log(`Fixing cycle and rewards on ${network.name} with wallet ${deployer.address}...`);

    // Get contract instance
    const ecoEarn = await ethers.getContractAt('EcoEarn', config.CONTRACT_ADDRESS);
    
    // Check current cycle and block
    const currentCycle = await ecoEarn.getCurrentCycle();
    console.log('Current Cycle:', currentCycle.toString());
    
    const currentBlock = await ethers.provider.getBlockNumber();
    console.log('Current Block:', currentBlock);
    
    const nextCycleBlock = await ecoEarn.getNextCycleBlock();
    console.log('Next Cycle Block:', nextCycleBlock.toString());
    
    const lastCycleStartBlock = await ecoEarn.lastCycleStartBlock();
    console.log('Last Cycle Start Block:', lastCycleStartBlock.toString());
    
    const cycleDuration = await ecoEarn.cycleDuration();
    console.log('Cycle Duration:', cycleDuration.toString());
    
    // Calculate what cycle we should be in
    console.log('\nUpdating cycle information to match current state...');
    
    // 1. Start by triggering a new cycle
    console.log('Triggering new cycle...');
    const triggerTx = await ecoEarn.triggerCycle();
    await triggerTx.wait();
    
    // 2. Update the cycle to 2 (we want to start from 2)
    const updatedCycle = await ecoEarn.getCurrentCycle();
    console.log('New Current Cycle:', updatedCycle.toString());
    
    // 3. Set rewards for cycle 2
    console.log('\nSetting rewards for cycle', updatedCycle.toString());
    
    // Check available funds
    const rewardsPool = await ethers.getContractAt('IX2EarnRewardsPool', config.X2EARN_REWARDS_POOL);
    const availableFunds = await rewardsPool.availableFunds(config.APP_ID);
    console.log(`Available funds: ${ethers.formatEther(availableFunds)} B3TR`);
    
    if (availableFunds >= ethers.parseEther('100000')) {
        const rewardsAmount = ethers.parseEther('100000');
        const rewardsAmountTx = await ecoEarn.setRewardsAmount(rewardsAmount);
        await rewardsAmountTx.wait();
        console.log('Rewards set to 100,000 B3TR for cycle', updatedCycle.toString());
        
        // 4. Check if rewards were set correctly
        const rewards = await ecoEarn.rewards(updatedCycle);
        console.log('Cycle Rewards:', ethers.formatEther(rewards), 'B3TR');
        
        const rewardsLeft = await ecoEarn.rewardsLeft(updatedCycle);
        console.log('Cycle Rewards Left:', ethers.formatEther(rewardsLeft), 'B3TR');
        
        if (rewards > 0n && rewardsLeft > 0n) {
            console.log('\n✅ SUCCESS: Cycle fixed and rewards set correctly!');
            console.log('Contract is now ready to accept submissions.');
        } else {
            console.log('\n❌ ERROR: Failed to set rewards correctly.');
        }
    } else {
        console.log('\n❌ ERROR: Not enough funds available to set rewards.');
        console.log('Available:', ethers.formatEther(availableFunds), 'B3TR');
        console.log('Required: 100,000 B3TR');
    }
}

fixCycleAndRewards()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 