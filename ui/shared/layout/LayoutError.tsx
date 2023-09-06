import React from 'react';

import type { Props } from './types';

import IndexingAlertBlocks from 'ui/home/IndexingAlertBlocks';
import AppErrorBoundary from 'ui/shared/AppError/AppErrorBoundary';
import Header from 'ui/snippets/header/Header';

import * as Layout from './components';
import config from '../../../configs/app';

const LayoutError = ({ children }: Props) => {
  return (
    <Layout.Container>
      <Layout.MainArea>
        <Layout.SideBar/>
        <Layout.MainColumn>
          {!config.UI.indexingAlert.isHidden && <IndexingAlertBlocks/>}
          <Header/>
          <AppErrorBoundary>
            <main>
              { children }
            </main>
          </AppErrorBoundary>
        </Layout.MainColumn>
      </Layout.MainArea>
      <Layout.Footer/>
    </Layout.Container>
  );
};

export default LayoutError;
