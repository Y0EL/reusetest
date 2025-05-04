import { ethers, network } from 'hardhat';
import { updateConfig, config } from '@repo/config-contract';
import { getABI } from '../utils/abi';

export async function deploy() {
    const deployer = (await ethers.getSigners())[0];
    console.log(`Deploying on ${network.name} with wallet ${deployer.address}...`);

    let REWARD_TOKEN_ADDRESS = config.TOKEN_ADDRESS;
    let X2EARN_REWARDS_POOL = config.X2EARN_REWARDS_POOL;
    let X2EARN_APPS = config.X2EARN_APPS;
    let APP_ID = config.APP_ID;

    // If we are running on the solo network, we need to deploy the mock contracts
    // and generate the appID
    if (network.name === 'vechain_solo') {
        console.log(`Deploying mock RewardToken...`);
        const RewardTokenContract = await ethers.getContractFactory('B3TR_Mock');
        const rewardToken = await RewardTokenContract.deploy();
        await rewardToken.waitForDeployment();
        REWARD_TOKEN_ADDRESS = await rewardToken.getAddress();
        console.log(`RewardToken deployed to ${REWARD_TOKEN_ADDRESS}`);

        console.log('Deploying X2EarnApps mock contract...');
        const X2EarnAppsContract = await ethers.getContractFactory('X2EarnAppsMock');
        const x2EarnApps = await X2EarnAppsContract.deploy();
        await x2EarnApps.waitForDeployment();
        X2EARN_APPS = await x2EarnApps.getAddress();
        console.log(`X2EarnApps deployed to ${await x2EarnApps.getAddress()}`);

        console.log('Deploying X2EarnRewardsPool mock contract...');
        const X2EarnRewardsPoolContract = await ethers.getContractFactory('X2EarnRewardsPoolMock');
        const x2EarnRewardsPool = await X2EarnRewardsPoolContract.deploy(deployer.address, REWARD_TOKEN_ADDRESS, await x2EarnApps.getAddress());
        await x2EarnRewardsPool.waitForDeployment();
        X2EARN_REWARDS_POOL = await x2EarnRewardsPool.getAddress();
        console.log(`X2EarnRewardsPool deployed to ${await x2EarnRewardsPool.getAddress()}`);

        console.log('Adding app in X2EarnApps...');
        await x2EarnApps.addApp(deployer.address, deployer.address, 'ReUse');
        const appID = await x2EarnApps.hashAppName('ReUse');
        APP_ID = appID;
        console.log(`AppID: ${appID}`);

        console.log(`Funding contract...`);
        await rewardToken.approve(await x2EarnRewardsPool.getAddress(), ethers.parseEther('10000'));
        await x2EarnRewardsPool.deposit(ethers.parseEther('2000'), appID);
        console.log('Funded');
    }

    console.log('Deploying ReUse contract...');
    const ecoEarn = await ethers.getContractFactory('EcoEarn');

    const ecoEarnInstance = await ecoEarn.deploy(
        deployer.address,
        X2EARN_REWARDS_POOL, // mock in solo, from config in testnet/mainnet
        config.CYCLE_DURATION,
        config.MAX_SUBMISSIONS_PER_CYCLE,
        APP_ID, // mock in solo, from config in testnet/mainnet
    );
    await ecoEarnInstance.waitForDeployment();

    const ecoEarnAddress = await ecoEarnInstance.getAddress();
    console.log(`ReUse deployed to: ${ecoEarnAddress}`);

    // Update the configuration with the new contract address before proceeding
    const ecoSolAbi = await getABI('EcoEarn');
    updateConfig(
        {
            ...config,
            CONTRACT_ADDRESS: ecoEarnAddress,
            TOKEN_ADDRESS: REWARD_TOKEN_ADDRESS,
        },
        ecoSolAbi,
    );
    
    console.log('Contract deployed successfully and configuration updated');
    
    // Check if we need to proceed with initialization
    const shouldInitialize = process.env.INITIALIZE_CONTRACT === 'true';
    if (!shouldInitialize) {
        console.log('Skipping contract initialization. Contract is deployed but not initialized.');
        console.log('To initialize the contract later, set the INITIALIZE_CONTRACT environment variable to "true" and run this script again.');
        console.log(`Done`);
        return;
    }

    console.log('Initializing contract with rewards amount and next cycle');
    
    try {
        // Check available funds in the pool if not in solo network
        if (network.name !== 'vechain_solo') {
            console.log('Checking available funds in X2EarnRewardsPool...');
            const rewardsPool = await ethers.getContractAt('IX2EarnRewardsPool', X2EARN_REWARDS_POOL);
            const availableFunds = await rewardsPool.availableFunds(APP_ID);
            console.log(`Available funds for APP_ID ${APP_ID}: ${ethers.formatEther(availableFunds)} tokens`);
            
            if (availableFunds < 100000000000000000000000n) {
                console.warn(`WARNING: Not enough funds available in the pool. Available: ${ethers.formatEther(availableFunds)}, Required: 100000`);
                console.log('Skipping rewards setup. Please fund the pool for this app ID and run this script with INITIALIZE_CONTRACT=true later.');
                console.log(`Done`);
                return;
            }
        }
        
        console.log('Setting rewards amount...');
        const rewardsAmountResult = await (await ecoEarnInstance.setRewardsAmount(100000000000000000000000n)).wait();
        console.log('Rewards set reward amount to 100000');

        if (rewardsAmountResult == null || rewardsAmountResult.status !== 1) {
            throw new Error('Failed to set rewards amount');
        }

        console.log('Setting next cycle...');
        const nextCycleResult = await (await ecoEarnInstance.setNextCycle(2n)).wait();

        if (nextCycleResult == null || nextCycleResult.status !== 1) {
            throw new Error('Failed to set next cycle');
        }

        console.log('Switched to next cycle');

        // In solo network, we need to add the EcoEarn contract as a distributor
        if (network.name === 'vechain_solo') {
            console.log('Add ReUse contracts as distributor...');
            const x2EarnApps = await ethers.getContractAt('X2EarnAppsMock', X2EARN_APPS);
            await x2EarnApps.addRewardDistributor(APP_ID, ecoEarnAddress);
            console.log('Added');
        }
        
        console.log('Contract successfully initialized');
    } catch (error) {
        console.error('Error during contract initialization:', error);
        console.log('Contract was deployed but initialization failed. You can try initializing it later with INITIALIZE_CONTRACT=true');
    }

    console.log(`Done`);
}
