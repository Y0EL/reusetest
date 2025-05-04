import { ADMIN_PRIVATE_KEY, NETWORK_URL } from '../config';
import { HttpClient, ThorClient, VeChainPrivateKeySigner, VeChainProvider } from '@vechain/sdk-network';
import { EcoEarnABI } from '@utils/const';
import { ECO_SOL_ABI, config } from '@repo/config-contract';
import { coder } from '@vechain/sdk-core';

// Inisialisasi koneksi ke blockchain VeChain
export const thor = new ThorClient(new HttpClient(NETWORK_URL), {
  isPollingEnabled: false,
});

// Load contract dengan konfigurasi yang ada
export const ecoEarnContract = thor.contracts.load(
  config.CONTRACT_ADDRESS,
  ECO_SOL_ABI,
  new VeChainPrivateKeySigner(Buffer.from(ADMIN_PRIVATE_KEY), new VeChainProvider(thor)),
);

// Fungsi untuk decode error revert reason
export async function decodeRevertReason(txId: string): Promise<string> {
  try {
    // Ambil transaksi
    const transaction = await thor.transactions.getTransaction(txId);
    
    // Simulasikan transaksi untuk mendapatkan revert reason
    const simulation = await thor.transactions.simulateTransaction(
      transaction.clauses,
      {
        revision: transaction.meta.blockID,
        gas: transaction.gas,
        caller: transaction.origin,
        gasPayer: transaction.delegator ?? transaction.origin,
        expiration: transaction.expiration,
        blockRef: transaction.blockRef,
      }
    );
    
    // Error interface untuk decode revert reason 
    const contractInterface = coder.createInterface(['Error(string)']);
    
    // Loop melalui hasil simulasi untuk menemukan clause yang revert
    for (let i = 0; i < simulation.length; i++) {
      const clause = simulation[i];
      if (clause.reverted) {
        try {
          const revertReason = contractInterface.parseError(clause.data);
          return `Revert pada clause #${i}: ${revertReason.args[0]}`;
        } catch (error) {
          return `Revert pada clause #${i}: ${clause.vmError}`;
        }
      }
    }
    
    return 'Tidak ada revert reason yang ditemukan.';
  } catch (error) {
    console.error('Error mendecode revert reason:', error);
    return 'Tidak dapat mendecode revert reason.';
  }
}
