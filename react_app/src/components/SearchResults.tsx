import React, { FC } from 'react';
import { Spin, List, Table, Avatar, PageHeader, Tabs, Button, Popconfirm, Input, Typography } from 'antd';
import { Search } from '../types/Search';
import { Alignment } from './Alignment';

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
              { title: "E-value", dataIndex: "eValue" },
              { title: "Bit-score", dataIndex: "bitScore" },
              { title: "Query Seq", dataIndex: ["queryAlignment", "sequenceId"] },
              { title: "Target Seq", dataIndex: ["targetAlignment", "sequenceId"] },
            ]}
            expandable={{
              expandedRowRender: record => (
                <Alignment
                  querySeq={record.queryAlignment.data}
                  queryStart={record.queryAlignment.start}
                  targetSeq={record.targetAlignment.data}
                  targetStart={record.targetAlignment.start}
                />
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
            key="1"
            placeholder="Find result by ID"
            onSearch={value => addSearchById(value)}
            style={{ width: 200 }}
          />,
          <Popconfirm
            key="2"
            title="Are you sure? This will clear all results."
            onConfirm={clearSearches}
            okText="Yes"
            cancelText="No"
          ><Button danger>Clear</Button></Popconfirm>
        ]}
      />
      <Typography.Paragraph>
        <List
          dataSource={searches}
          itemLayout="vertical"
          renderItem={search => (
            <List.Item>
              <br />
              <List.Item.Meta
                avatar={(
                  <Spin spinning={search.status !== "completed"}>
                    <Avatar>{search.status === "completed" ? '\u2714' : ''}</Avatar>
                  </Spin>
                )}
                title={<span>Search ID: <Typography.Text code>{search.id}</Typography.Text></span>}
                description={<span>Status: {search.status ?? 'unknown'}</span>} />
              <ResultContent search={search} />
            </List.Item>
          )} />
      </Typography.Paragraph>
    </div>
  );
};
