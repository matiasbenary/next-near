'use client';
import { useEffect } from 'react';
import { useInitNear, Widget, EthersProviderContext } from 'near-social-vm';

import { useEthersProviderContext } from '@/wallets/web3-wallet';
import { NetworkId } from '@/config';
import { useStore } from '@/layout';

export default function Component({ src }) {
  const ethersContext = useEthersProviderContext();
  const { wallet } = useStore();
  const { initNear } = useInitNear();

  useEffect(() => {
    initNear && wallet.selector && initNear({ networkId: NetworkId, selector: wallet.selector });
  }, [initNear, wallet]);

  return (
    <div>
      <EthersProviderContext.Provider value={ethersContext}>
        <Widget src={src} />
      </EthersProviderContext.Provider>
      <p className="mt-4 small"> <span className="text-secondary">Source:</span> <a href={`https://near.social/mob.near/widget/WidgetSource?src=${src}`}> {src} </a> </p>
    </div>
  );
}
