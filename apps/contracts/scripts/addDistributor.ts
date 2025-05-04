import { ethers, network } from 'hardhat';
import { config } from '@repo/config-contract';

async function addDistributor() {
    const deployer = (await ethers.getSigners())[0];
    console.log(`Adding distributor on ${network.name} with wallet ${deployer.address}...`);

    // Get X2EarnApps instance
    const x2EarnApps = await ethers.getContractAt('IX2EarnAppsMock', config.X2EARN_APPS);
    
    // Add contract as reward distributor
    console.log('Adding contract as reward distributor...');
    const tx = await x2EarnApps.addRewardDistributor(config.APP_ID, config.CONTRACT_ADDRESS);
    await tx.wait();
    console.log('Contract added as reward distributor!');

    // Verify distributor status
    const isDistributor = await x2EarnApps.isRewardDistributor(config.APP_ID, config.CONTRACT_ADDRESS);
    console.log('Contract is reward distributor:', isDistributor);
}

addDistributor()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 