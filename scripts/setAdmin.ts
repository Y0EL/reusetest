import { ethers, network } from 'hardhat';
import { config } from '@repo/config-contract';

async function setAdmin() {
    const deployer = (await ethers.getSigners())[0];
    console.log(`Setting admin on ${network.name} with wallet ${deployer.address}...`);

    // Get the deployed contract instance
    const ecoEarn = await ethers.getContractAt('EcoEarn', config.CONTRACT_ADDRESS);
    
    // The DEFAULT_ADMIN_ROLE from AccessControl
    const DEFAULT_ADMIN_ROLE = await ecoEarn.DEFAULT_ADMIN_ROLE();
    
    // You can specify any wallet address here to grant admin role
    // For now using the current deployer wallet
    const adminAddress = deployer.address;
    // If you have a specific admin address, replace the line above with:
    // const adminAddress = "0xYourAdminWalletAddressHere";
    
    console.log(`Granting DEFAULT_ADMIN_ROLE to ${adminAddress}...`);
    
    try {
        // Grant admin role to the specified address
        const tx = await ecoEarn.grantRole(DEFAULT_ADMIN_ROLE, adminAddress);
        await tx.wait();
        console.log('Admin role granted successfully!');
        
        // Verify the role was granted
        const hasRole = await ecoEarn.hasRole(DEFAULT_ADMIN_ROLE, adminAddress);
        console.log(`Address ${adminAddress} has admin role: ${hasRole}`);
    } catch (error) {
        console.error('Error granting admin role:', error);
    }
}

setAdmin()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 