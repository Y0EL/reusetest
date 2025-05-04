import { ethers, network } from 'hardhat';
import { config } from '@repo/config-contract';

async function addDistributorRole() {
    const deployer = (await ethers.getSigners())[0];
    console.log(`Adding distributor role on ${network.name} with wallet ${deployer.address}...`);

    // Get X2EarnRewardsPool instance
    console.log('X2EarnRewardsPool Address:', config.X2EARN_REWARDS_POOL);
    const rewardsPool = await ethers.getContractAt('IX2EarnRewardsPool', config.X2EARN_REWARDS_POOL);
    
    // Get X2EarnApps instance
    console.log('X2EarnApps Address:', config.X2EARN_APPS);
    const x2EarnApps = await ethers.getContractAt('IX2EarnApps', config.X2EARN_APPS);
    
    // Contract details
    console.log('ReUse Contract Address:', config.CONTRACT_ADDRESS);
    console.log('App ID:', config.APP_ID);
    
    try {
        // Check if already distributor
        const DISTRIBUTOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("DISTRIBUTOR_ROLE"));
        const hasRole = await rewardsPool.hasRole(DISTRIBUTOR_ROLE, config.CONTRACT_ADDRESS);
        console.log('Contract already has distributor role:', hasRole);
        
        if (!hasRole) {
            console.log('Adding contract as reward distributor in X2EarnApps...');
            const addDistributorTx = await x2EarnApps.addRewardDistributor(
                config.APP_ID, 
                config.CONTRACT_ADDRESS
            );
            await addDistributorTx.wait();
            console.log('Successfully added as reward distributor!');
            
            // Verify again
            const newHasRole = await rewardsPool.hasRole(DISTRIBUTOR_ROLE, config.CONTRACT_ADDRESS);
            console.log('Contract now has distributor role:', newHasRole);
            
            if (newHasRole) {
                console.log('\n✅ SUCCESS: ReUse contract is now a reward distributor!');
                console.log('Users can now receive rewards from submissions.');
            } else {
                console.log('\n❌ ERROR: Failed to add as reward distributor.');
            }
        } else {
            console.log('\n✅ Contract already has distributor role, no action needed!');
        }
    } catch (error) {
        console.error('Error adding distributor role:', error);
    }
}

addDistributorRole()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 