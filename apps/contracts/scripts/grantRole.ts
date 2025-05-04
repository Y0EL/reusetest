import { ethers, network } from 'hardhat';
import { config } from '@repo/config-contract';

async function grantRole() {
    const deployer = (await ethers.getSigners())[0];
    console.log(`Granting role on ${network.name} with wallet ${deployer.address}...`);

    // Get X2EarnRewardsPool instance
    const x2EarnRewardsPool = await ethers.getContractAt('IX2EarnRewardsPool', config.X2EARN_REWARDS_POOL);
    
    // DISTRIBUTOR_ROLE is a keccak256 hash of "DISTRIBUTOR_ROLE"
    const distributorRole = ethers.keccak256(ethers.toUtf8Bytes("DISTRIBUTOR_ROLE"));
    
    // Grant role to contract
    console.log('Granting DISTRIBUTOR role to contract...');
    const tx = await x2EarnRewardsPool.grantRole(distributorRole, config.CONTRACT_ADDRESS);
    await tx.wait();
    console.log('Role granted successfully!');

    // Verify role
    const hasRole = await x2EarnRewardsPool.hasRole(distributorRole, config.CONTRACT_ADDRESS);
    console.log('Contract has DISTRIBUTOR role:', hasRole);
}

grantRole()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 