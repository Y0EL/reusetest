import { ethers, network } from 'hardhat';
import { config } from '@repo/config-contract';

async function addAsRewardDistributor() {
    const deployer = (await ethers.getSigners())[0];
    console.log(`Adding ReUse as reward distributor on ${network.name} with wallet ${deployer.address}...`);
    
    // Contract details
    console.log('ReUse Contract Address:', config.CONTRACT_ADDRESS);
    console.log('App ID:', config.APP_ID);
    
    try {
        // Deploy X2EarnAppsMock to interact with the testnet contract
        console.log('Deploying temporary X2EarnAppsMock for interaction...');
        const X2EarnAppsMockFactory = await ethers.getContractFactory('X2EarnAppsMock');
        
        // Connect to the existing X2EarnApps contract
        const x2EarnAppsMock = X2EarnAppsMockFactory.attach(config.X2EARN_APPS);
        console.log('Connected to X2EarnApps at:', config.X2EARN_APPS);
        
        // Add ReUse contract as a reward distributor
        console.log('Adding ReUse contract as reward distributor...');
        const tx = await x2EarnAppsMock.addRewardDistributor(config.APP_ID, config.CONTRACT_ADDRESS);
        await tx.wait();
        console.log('Successfully added ReUse as reward distributor!');
        
        // We can't directly check if it worked, but we'll log completion
        console.log('\n✅ SUCCESS: Transaction completed. ReUse contract should now have distributor rights.');
        console.log('Test by submitting through the application.');
        
    } catch (error) {
        console.error('Error adding as reward distributor:', error);
    }
}

addAsRewardDistributor()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 