import { ethers, network } from 'hardhat';
import { config } from '@repo/config-contract';

async function checkStatus() {
    const deployer = (await ethers.getSigners())[0];
    console.log(`Checking status on ${network.name} with wallet ${deployer.address}...`);

    // Get contract instance
    const ecoEarn = await ethers.getContractAt('EcoEarn', config.CONTRACT_ADDRESS);
    
    // Check current cycle
    const currentCycle = await ecoEarn.getCurrentCycle();
    console.log('Current Cycle:', currentCycle.toString());

    // Check rewards amount
    const rewards = await ecoEarn.rewards(currentCycle);
    console.log('Current Cycle Rewards:', ethers.formatEther(rewards), 'B3TR');

    // Check next cycle block
    const nextCycleBlock = await ecoEarn.getNextCycleBlock();
    console.log('Next Cycle Block:', nextCycleBlock.toString());

    // Check if contract has role in X2EarnRewardsPool
    const x2EarnRewardsPool = await ethers.getContractAt('IX2EarnRewardsPool', config.X2EARN_REWARDS_POOL);
    // DISTRIBUTOR_ROLE is a keccak256 hash of "DISTRIBUTOR_ROLE"
    const distributorRole = ethers.keccak256(ethers.toUtf8Bytes("DISTRIBUTOR_ROLE"));
    const hasRole = await x2EarnRewardsPool.hasRole(distributorRole, config.CONTRACT_ADDRESS);
    console.log('Has Distributor Role:', hasRole);

    // Check contract's B3TR balance
    const b3trToken = await ethers.getContractAt('IERC20', config.TOKEN_ADDRESS);
    const balance = await b3trToken.balanceOf(config.CONTRACT_ADDRESS);
    console.log('Contract B3TR Balance:', ethers.formatEther(balance), 'B3TR');
}

checkStatus()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 