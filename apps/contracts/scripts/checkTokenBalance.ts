import { ethers, network } from 'hardhat';
import { config } from '@repo/config-contract';

async function checkTokenBalance() {
    const deployer = (await ethers.getSigners())[0];
    console.log(`Checking token balance on ${network.name} with wallet ${deployer.address}...`);

    // Get contract instance
    const ecoEarn = await ethers.getContractAt('EcoEarn', config.CONTRACT_ADDRESS);
    console.log('Contract Address:', config.CONTRACT_ADDRESS);
    
    // Check current cycle
    const currentCycle = await ecoEarn.getCurrentCycle();
    console.log('Current Cycle:', currentCycle.toString());

    // Check rewards amount for current cycle
    const rewards = await ecoEarn.rewards(currentCycle);
    console.log('Current Cycle Rewards:', ethers.formatEther(rewards), 'B3TR');
    
    // Check rewards left for current cycle
    const rewardsLeft = await ecoEarn.rewardsLeft(currentCycle);
    console.log('Current Cycle Rewards Left:', ethers.formatEther(rewardsLeft), 'B3TR');

    // Check app ID
    const appId = await ecoEarn.appId();
    console.log('App ID:', appId);

    // Check B3TR token info
    const tokenAddress = config.TOKEN_ADDRESS;
    console.log('B3TR Token Address:', tokenAddress);
    
    try {
        // Check contract's B3TR balance
        const b3trToken = await ethers.getContractAt('IERC20', tokenAddress);
        const contractBalance = await b3trToken.balanceOf(config.CONTRACT_ADDRESS);
        console.log('Contract B3TR Balance:', ethers.formatEther(contractBalance), 'B3TR');
        
        // Check deployer's B3TR balance
        const deployerBalance = await b3trToken.balanceOf(deployer.address);
        console.log('Deployer B3TR Balance:', ethers.formatEther(deployerBalance), 'B3TR');
    } catch (error) {
        console.error('Error checking token balances:', error);
    }
    
    // Check admin role
    try {
        const DEFAULT_ADMIN_ROLE = await ecoEarn.DEFAULT_ADMIN_ROLE();
        const hasAdminRole = await ecoEarn.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
        console.log('Deployer has Admin Role:', hasAdminRole);
    } catch (error) {
        console.error('Error checking admin role:', error);
    }
}

checkTokenBalance()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 