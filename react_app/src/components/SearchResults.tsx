import React, { FC } from 'react';
import { Spin, List, Table, Avatar, PageHeader, Card, Tabs, Button, Popconfirm, Input } from 'antd';
import { Search } from '../types/Search';

const ResultContent: FC<{ search: Search }> = ({ search }) => {
  if (search.status !== "completed") return <React.Fragment />;
  return (
    <Spin spinning={search.result === undefined}>
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Table" key="1">
          <Table
            tableLayout="fixed"
            dataSource={search.result?.alignments || []}
            rowKey={record => JSON.stringify(record)}
            columns={[
              { title: "E-value", dataIndex: "evalue", sorter: true },
              { title: "Bit-score", dataIndex: "bitscore", sorter: true },
              { title: "Query", dataIndex: "queryid", sorter: true },
              { title: "Target", dataIndex: "targetid", sorter: true },
            ]}
            expandable={{
              expandedRowRender: record => (
                <Card style={{ width: "100%" }}>
                  <pre>
                    {`Query  ${record.queryalignstart} ${record.queryalignseq}\nTarget ${record.targetalignstart} ${record.targetalignseq}`}
                  </pre>
                </Card>
              ),
            }}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Raw JSON" key="2">
          <pre>
            {JSON.stringify(search.result, null, 2)}
          </pre>
        </Tabs.TabPane>
      </Tabs>
    </Spin >
  );
};

interface SearchResultsProps {
  searches: Search[],
  addSearchById: (_: string) => void,
  clearSearches: () => void
};

export const SearchResults: FC<SearchResultsProps> = ({ searches, addSearchById, clearSearches }) => {
  return (
    <div>
      <PageHeader
        title='Search Results'
        extra={[
          <Input.Search
            placeholder="Find result by ID"
            onSearch={value => addSearchById(value)}
            style={{ width: 200 }}
          />,
          <Popconfirm
            title="Are you sure? This will clear all results."
            onConfirm={clearSearches}
            okText="Yes"
            cancelText="No"
          ><Button danger>Clear</Button></Popconfirm>
        ]}
      />
      <List
        dataSource={searches}
        itemLayout="vertical"
        renderItem={search => (
          <List.Item>
            <List.Item.Meta
              avatar={(
                <Spin spinning={search.status !== "completed"}>
                  <Avatar>{search.ticketId}</Avatar>
                </Spin>
              )}
              title={`Search ID #${search.ticketId}`}
              description={`Status: ${search.status}`} />
            <ResultContent search={search} />
          </List.Item>
        )} />
    </div>
  );
};
