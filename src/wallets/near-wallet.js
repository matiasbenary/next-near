/* A helper file that simplifies using the wallet selector */

// near api js
import { providers } from 'near-api-js';

// wallet selector
import '@near-wallet-selector/modal-ui/styles.css';
import { setupModal } from '@near-wallet-selector/modal-ui';
import { setupWalletSelector } from '@near-wallet-selector/core';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';

import { setupHereWallet } from '@near-wallet-selector/here-wallet';

const THIRTY_TGAS = '30000000000000';
const NO_DEPOSIT = '0';

// Wallet that simplifies using the wallet selector
export class Wallet {
  selector;
  selectedWallet;
  network;
  createAccessKeyFor;

  constructor({ createAccessKeyFor = undefined, networkId = 'testnet' }) {
    // Login to a wallet passing a contractId will create a local
    // key, so the user skips signing non-payable transactions.
    // Omitting the accountId will result in the user being
    // asked to sign all transactions.
    this.accountId = '';
    this.createAccessKeyFor = createAccessKeyFor;
    this.selector = setupWalletSelector({
      network: networkId,
      modules: [setupMyNearWallet(), setupHereWallet()],
    });
  }

  // To be called when the website loads
  startUp = async () => {
    const walletSelector = await this.selector;
    const isSignedIn = walletSelector.isSignedIn();
  
    if (isSignedIn) {
      this.accountId = walletSelector.store.getState().accounts[0].accountId;
      this.selectedWallet = await walletSelector.wallet();
    }

    return this.accountId;
  }

  // Sign-in method
  signIn = async () => {
    const description = 'Please select a wallet to sign in.';
    const modal = setupModal(await this.selector, { contractId: this.createAccessKeyFor, description });
    modal.show();
  }

  // Sign-out method
  signOut = async () => {
    await this.selectedWallet.signOut();
    this.selectedWallet = this.accountId = this.createAccessKeyFor = null;
  }

  // Make a read-only call to retrieve information from the network
  viewMethod = async ({ contractId, method, args = {} }) => {
    const walletSelector = await this.selector;
    const { network } = walletSelector.options;
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

    let res = await provider.query({
      request_type: 'call_function',
      account_id: contractId,
      method_name: method,
      args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
      finality: 'optimistic',
    });
    return JSON.parse(Buffer.from(res.result).toString());
  }

  // Call a method that changes the contract's state
  callMethod = async ({ contractId, method, args = {}, gas = THIRTY_TGAS, deposit = NO_DEPOSIT }) => {
    // Sign a transaction with the "FunctionCall" action
    return await this.selectedWallet.signAndSendTransaction({
      signerId: this.accountId,
      receiverId: contractId,
      actions: [
        {
          type: 'FunctionCall',
          params: {
            methodName: method,
            args,
            gas,
            deposit,
          },
        },
      ],
    });
  }

  // Get transaction result from the network
  getTransactionResult = async (txhash) => {
    const walletSelector = await this.selector;
    const { network } = walletSelector.options;
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

    // Retrieve transaction result from the network
    const transaction = await provider.txStatus(txhash, 'unnused');
    return providers.getTransactionLastResult(transaction);
  }
}