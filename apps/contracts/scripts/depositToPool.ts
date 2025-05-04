import { ethers, network } from 'hardhat';
import { config } from '@repo/config-contract';

async function depositToPool() {
    const deployer = (await ethers.getSigners())[0];
    console.log(`\nDepositing tokens to rewards pool on ${network.name}...\n`);

    // Get contract instances
    const x2EarnRewardsPool = await ethers.getContractAt('IX2EarnRewardsPool', config.X2EARN_REWARDS_POOL);
    const b3trToken = await ethers.getContractAt('IERC20', config.TOKEN_ADDRESS);
    
    // Check balances before deposit
    const deployerBalance = await b3trToken.balanceOf(deployer.address);
    const availableFundsBefore = await x2EarnRewardsPool.availableFunds(config.APP_ID);
    
    console.log('Initial balances:');
    console.log('Deployer B3TR Balance:', ethers.formatEther(deployerBalance), 'B3TR');
    console.log('Available Funds in Pool:', ethers.formatEther(availableFundsBefore), 'B3TR');
    
    // Amount to deposit - 1000 tokens
    const depositAmount = ethers.parseEther("1000");
    
    try {
        // First approve the rewards pool to spend tokens
        console.log(`Approving ${ethers.formatEther(depositAmount)} B3TR for rewards pool...`);
        const approveTx = await b3trToken.approve(config.X2EARN_REWARDS_POOL, depositAmount);
        await approveTx.wait();
        console.log('Approval successful');
        
        // Then deposit tokens
        console.log(`Depositing ${ethers.formatEther(depositAmount)} B3TR to rewards pool...`);
        const depositTx = await x2EarnRewardsPool.deposit(depositAmount, config.APP_ID);
        await depositTx.wait();
        console.log('Deposit successful');
        
        // Check updated balances
        const availableFundsAfter = await x2EarnRewardsPool.availableFunds(config.APP_ID);
        console.log('\nUpdated balances:');
        console.log('Available Funds in Pool:', ethers.formatEther(availableFundsAfter), 'B3TR');
        
        if (availableFundsAfter > availableFundsBefore) {
            console.log('\nDeposit confirmed! You can now set rewards for the next cycle.');
        } else {
            console.log('\nWarning: Available funds did not increase as expected. Please check contract permissions.');
        }
    } catch (error: any) {
        console.error('Error during deposit:', error.message);
    }
}

depositToPool()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 