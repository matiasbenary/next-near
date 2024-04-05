import { useEffect } from "react";
import { create as createStore } from 'zustand';
import { distinctUntilChanged, map } from 'rxjs';

import { Wallet } from "@/wallets/near-wallet";
import { Navigation } from "@/components/navigation";
import { NetworkId, HelloNearContract } from "@/config";

// Store to share wallet and signed account
export const useStore = createStore((set) => ({
  wallet: undefined,
  signedAccountId: '',
  setWallet: (wallet) => set({ wallet }),
  setSignedAccountId: (signedAccountId) => set({ signedAccountId }),
}))

export default function RootLayout({ children }) {

  const { setSignedAccountId, setWallet } = useStore();

  useEffect(() => {
    // create wallet instance
    const wallet = new Wallet({ createAccessKeyFor: HelloNearContract[NetworkId], networkId: NetworkId })
    wallet.startUp();

    setWallet(wallet);

    // subscribe to account changes (sign-in, sign-out)
    wallet.selector.then(
      selector => {
        selector.store.observable
          .pipe(
            map(state => state.accounts),
            distinctUntilChanged()
          )
          .subscribe(accounts => {
            setSignedAccountId(accounts.find(account => account.active)?.accountId || '');
          });
      });
  }, [])

  return (
    <>
      <Navigation />
      {children}
    </>
  );
}
