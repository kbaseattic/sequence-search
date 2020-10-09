import React, { FC } from 'react';
import { Spin, List, Avatar, PageHeader, Card } from 'antd';
import { Search } from '../types/Search';

const ResultContent: FC<{ search: Search }> = ({ search }) => {
  if (search.status !== "completed") return <React.Fragment />;
  return (
    <Card>
      <Spin spinning={search.result === undefined}>
        <pre>
          {JSON.stringify(search.result, null, 2)}
        </pre>
      </Spin>
    </Card>
  );
};

export const SearchResults: FC<{ searches: Search[]; }> = ({ searches }) => {
  return (
    <div>
      <PageHeader title='Search Results' />
      <List
        dataSource={searches}
        itemLayout="vertical"
        renderItem={search => (
          <List.Item>
            <List.Item.Meta
              avatar={<Spin spinning={search.status != "completed"}>
                <Avatar>{search.ticketId}</Avatar>
              </Spin>}
              title={`Search #${search.ticketId}`}
              description={`Status: ${search.status}`} />
            <ResultContent search={search} />
          </List.Item>
        )} />
    </div>
  );
};
