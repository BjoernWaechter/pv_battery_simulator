'use client'

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import ImportRawData from './tabs/page'



function changeTab(idx: number)
{
  if (idx == 0)
  {
    // fn_update_raw(new_raw);
    // fn_update_agg(daily_agg);
  }
}

const MyTabs = () => (
  <Tabs onSelect={(selectedIndex) => changeTab(selectedIndex)}>
    <TabList>
      <Tab>Import Raw Data</Tab>
    </TabList>

    <TabPanel>
      <h2><ImportRawData /></h2>
    </TabPanel>
  </Tabs>
);

MyTabs.displayName = 'MyTabs';

export default MyTabs;