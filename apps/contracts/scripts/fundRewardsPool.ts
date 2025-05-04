import { ethers, network } from 'hardhat';
import { config } from '@repo/config-contract';

async function fundRewardsPool() {
    const deployer = (await ethers.getSigners())[0];
    console.log(`Funding rewards pool on ${network.name} with wallet ${deployer.address}...`);

    // Get the relevant contracts
    const b3trToken = await ethers.getContractAt('IERC20', config.TOKEN_ADDRESS);
    const rewardsPool = await ethers.getContractAt('IX2EarnRewardsPool', config.X2EARN_REWARDS_POOL);
    
    // Check initial balances
    const deployerBalance = await b3trToken.balanceOf(deployer.address);
    console.log(`Deployer B3TR Balance: ${ethers.formatEther(deployerBalance)} B3TR`);
    
    // Check available funds in the pool
    try {
        const availableFunds = await rewardsPool.availableFunds(config.APP_ID);
        console.log(`Available funds for APP_ID ${config.APP_ID}: ${ethers.formatEther(availableFunds)} tokens`);
    } catch (error) {
        console.error('Error checking available funds:', error);
    }
    
    // Define the amount to fund (100,000 B3TR)
    const fundAmount = ethers.parseEther('100000');
    console.log(`Funding amount: ${ethers.formatEther(fundAmount)} B3TR`);
    
    try {
        // Approve the rewards pool to spend tokens
        console.log('Approving tokens...');
        const approveTx = await b3trToken.approve(config.X2EARN_REWARDS_POOL, fundAmount);
        await approveTx.wait();
        console.log('Tokens approved');
        
        // Deposit tokens to the rewards pool
        console.log('Depositing tokens to rewards pool...');
        const depositTx = await rewardsPool.deposit(fundAmount, config.APP_ID);
        await depositTx.wait();
        console.log('Tokens deposited successfully');
        
        // Check final balances
        const finalAvailableFunds = await rewardsPool.availableFunds(config.APP_ID);
        console.log(`Updated available funds: ${ethers.formatEther(finalAvailableFunds)} B3TR`);
        
        const finalDeployerBalance = await b3trToken.balanceOf(deployer.address);
        console.log(`Updated deployer B3TR Balance: ${ethers.formatEther(finalDeployerBalance)} B3TR`);
    } catch (error) {
        console.error('Error funding rewards pool:', error);
    }
}

fundRewardsPool()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 