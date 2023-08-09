import { Box, Center, useColorMode } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { route } from 'nextjs-routes';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import type { MarketplaceAppOverview } from 'types/client/marketplace';

import config from 'configs/app';
import type { ResourceError } from 'lib/api/resources';
import useApiFetch from 'lib/hooks/useFetch';
import * as metadata from 'lib/metadata';
import getQueryParamString from 'lib/router/getQueryParamString';
import ContentLoader from 'ui/shared/ContentLoader';

const IFRAME_SANDBOX_ATTRIBUTE = 'allow-forms allow-orientation-lock ' +
'allow-pointer-lock allow-popups-to-escape-sandbox ' +
'allow-same-origin allow-scripts ' +
'allow-top-navigation-by-user-activation allow-popups';

const IFRAME_ALLOW_ATTRIBUTE = 'clipboard-read; clipboard-write;';

const MarketplaceApp = () => {
  const ref = useRef<HTMLIFrameElement>(null);

  const apiFetch = useApiFetch();
  const router = useRouter();
  const id = getQueryParamString(router.query.id);

  const { isLoading, isError, error, data } = useQuery<unknown, ResourceError<unknown>, MarketplaceAppOverview>(
    [ 'marketplace-apps', id ],
    async() => {
      const result = await apiFetch<Array<MarketplaceAppOverview>, unknown>(config.features.marketplace.configUrl);
      if (!Array.isArray(result)) {
        throw result;
      }

      const item = result.find((app: MarketplaceAppOverview) => app.id === id);
      if (!item) {
        throw { status: 404 };
      }

      return item;
    },
  );

  const [ isFrameLoading, setIsFrameLoading ] = useState(isLoading);
  const { colorMode } = useColorMode();

  const handleIframeLoad = useCallback(() => {
    setIsFrameLoading(false);
  }, []);

  useEffect(() => {
    if (data && !isFrameLoading) {
      const message = {
        blockscoutColorMode: colorMode,
        blockscoutRootUrl: config.app.baseUrl + route({ pathname: '/' }),
        blockscoutAddressExplorerUrl: config.app.baseUrl + route({ pathname: '/address/[hash]', query: { hash: '' } }),
        blockscoutTransactionExplorerUrl: config.app.baseUrl + route({ pathname: '/tx/[hash]', query: { hash: '' } }),
        blockscoutNetworkName: config.chain.name,
        blockscoutNetworkId: Number(config.chain.id),
        blockscoutNetworkCurrency: config.chain.currency,
        blockscoutNetworkRpc: config.chain.rpcUrl,
      };

      ref?.current?.contentWindow?.postMessage(message, data.url);
    }
  }, [ isFrameLoading, data, colorMode, ref ]);

  useEffect(() => {
    if (data) {
      metadata.update(
        { pathname: '/apps/[id]', query: { id: data.id } },
        { app_name: data.title },
      );
    }
  }, [ data ]);

  if (isError) {
    throw new Error('Unable to load app', { cause: error });
  }

  return (
    <Center
      as="main"
      h="100vh"
      pt={{ base: '138px', lg: 0 }}
      pb={{ base: 0, lg: 10 }}
    >
      { (isFrameLoading) && (
        <ContentLoader/>
      ) }

      { data && (
        <Box
          allow={ IFRAME_ALLOW_ATTRIBUTE }
          ref={ ref }
          sandbox={ IFRAME_SANDBOX_ATTRIBUTE }
          as="iframe"
          h="100%"
          w="100%"
          display={ isFrameLoading ? 'none' : 'block' }
          src={ data.url }
          title={ data.title }
          onLoad={ handleIframeLoad }
        />
      ) }
    </Center>
  );
};

export default MarketplaceApp;
