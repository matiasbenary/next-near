import '@near-wallet-selector/modal-ui/styles.css';
import { create as createStore } from 'zustand';
import { distinctUntilChanged, map } from 'rxjs';


import { useEffect, useState } from 'react';
import { Wallet } from './near-wallet';

export const useWallet = createStore(set => ({
  signedAccountId: '',
  logOut: undefined,
  logIn: undefined,
  selector: undefined,
  viewMethod: undefined,
  callMethod: undefined,
  setLogActions: ({ logOut, logIn }) => set({ logOut, logIn }),
  setAuth: ({ signedAccountId }) => set({ signedAccountId }),
  setMethods: ({ viewMethod, callMethod }) => set({ viewMethod, callMethod }),
  setStoreSelector: ({ selector }) => set({ selector }),
 
}));

export function useInitWallet({ createAccessKeyFor, networkId }) {
    const setAuth = useWallet(store => store.setAuth);
    const setLogActions = useWallet(store => store.setLogActions);
    const setMethods = useWallet(store => store.setMethods);
    const setStoreSelector = useWallet(store => store.setStoreSelector);
    const [wallet,setWallet] = useState(undefined);


    useEffect(() => {
        const wallet =  new Wallet({ createAccessKeyFor, networkId})
        
        setWallet(wallet);
     
        setStoreSelector({ selector: wallet.selector });
      }, [networkId, setStoreSelector,createAccessKeyFor]);

      useEffect(() => {
        if (!wallet || !wallet.selector) return;
    
        wallet.selector.then(walletSelector => {
          const accounts = walletSelector.store.getState().accounts;
          const signedAccountId = accounts.find((account) => account.active)?.accountId || '';
          setAuth({ signedAccountId });
    
          walletSelector.store.observable
            .pipe(
              map((state) => state.accounts),
              distinctUntilChanged()
            )
            .subscribe((accounts) => {
              const signedAccountId = accounts.find((account) => account.active)?.accountId || '';
              setAuth({ signedAccountId });
            });
        });
      }, [wallet, setAuth]);  

      useEffect(() => {
        if (!wallet || !wallet.selector) return;
    
        
        const logOut = async () => {
          
          await wallet.signOut();
          setAuth({ signedAccountId: '' });
        };
    
        const logIn = async () => {
          wallet.signIn();
        };
    
        setLogActions({ logOut, logIn });
      }, [createAccessKeyFor, wallet, setAuth, setLogActions]);
    
      useEffect(() => {
        if (!wallet || !wallet.selector) return;
        console.log(wallet)
        console.log(wallet.selector)
        setMethods({ viewMethod:wallet.viewMethod, callMethod:wallet.callMethod });
    
      }, [wallet, setMethods]);
}