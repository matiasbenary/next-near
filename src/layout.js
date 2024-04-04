"use client";
import "@near-wallet-selector/modal-ui/styles.css";

import { Navigation } from "@/components/navigation";
import { Wallet } from "@/wallets/near-wallet";
import { NetworkId, HelloNearContract } from "@/config";
import { useEffect } from "react";

import { create as createStore } from 'zustand';
import { distinctUntilChanged, map } from 'rxjs';

const wallet = new Wallet({ createAccessKeyFor: HelloNearContract[NetworkId], networkId: NetworkId })

export const useStore = createStore((set) => ({
  wallet: wallet,
  signedAccountId: '',
  setSignedAccountId: (signedAccountId) => set({ signedAccountId }),
}))

export default function RootLayout({ children }) {

  const { setSignedAccountId } = useStore();

  useEffect(() => {
    wallet.startUp();

    wallet.selector.then(
      walletSelector => {
        walletSelector.store.observable
          .pipe(
            map((state) => state.accounts),
            distinctUntilChanged()
          )
          .subscribe((accounts) => {
            const signedAccountId = accounts.find((account) => account.active)?.accountId || '';
            setSignedAccountId(signedAccountId);
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
