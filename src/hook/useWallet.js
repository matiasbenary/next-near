import React, { useState, useEffect } from 'react';
import { Wallet } from './Wallet'; // Importa la clase Wallet

const useWallet = () => {
  const [wallet, setWallet] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const initializeWallet = async () => {
      const myWallet = new Wallet({ network: 'mainnet' }); // Inicializa la billetera con la red 'mainnet'
      await myWallet.startUp(); // Inicia la billetera al cargar el componente
      setWallet(myWallet);
      setIsSignedIn(myWallet.wallet !== null); // Verifica si el usuario está autenticado
    };

    initializeWallet();

    return () => {
      // Limpia el estado al desmontar el componente
      setWallet(null);
      setIsSignedIn(false);
    };
  }, []);

  const signIn = async () => {
    if (wallet) {
      await wallet.signIn(); // Llama al método signIn de la clase Wallet
      setIsSignedIn(true);
    }
  };

  const signOut = async () => {
    if (wallet) {
      await wallet.signOut(); // Llama al método signOut de la clase Wallet
      setIsSignedIn(false);
    }
  };

  const viewMethod = async (params) => {
    if (wallet) {
      return await wallet.viewMethod(params); // Llama al método viewMethod de la clase Wallet
    }
    return null;
  };

  const callMethod = async (params) => {
    if (wallet) {
      return await wallet.callMethod(params); // Llama al método callMethod de la clase Wallet
    }
    return null;
  };

  const getTransactionResult = async (txhash) => {
    if (wallet) {
      return await wallet.getTransactionResult(txhash); // Llama al método getTransactionResult de la clase Wallet
    }
    return null;
  };

  return {
    wallet,
    isSignedIn,
    signIn,
    signOut,
    viewMethod,
    callMethod,
    getTransactionResult,
  };
};

export default useWallet;