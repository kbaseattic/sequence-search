import React, { FC } from 'react';
import { Layout, Spin, Form, Image, Input, Select, List, Avatar, InputNumber, Button, PageHeader } from 'antd';
import './App.css';
import { Search, useSearch } from './hooks/searches';
import { useNamespaces } from './hooks/namespaces';

const { Header, Content, Footer } = Layout;

const formItemLayout = {
  labelCol: {
    sm: { span: 24 },
    md: { span: 5 },
  },
  wrapperCol: {
    sm: { span: 24 },
    md: { span: 12 },
  },
};

type AppFormProps = { onSubmit: (namespace: string, sequence: string, eVal: number) => any };
const AppForm: FC<AppFormProps> = ({ onSubmit }) => {
  const { namespaces, namespaceLoaded } = useNamespaces();

  const loaded = namespaceLoaded;
  const onFinish = ({ namespace, sequence, eVal }: { namespace: string, sequence: string, eVal: number }) => onSubmit(namespace, sequence, eVal);

  return (
    <Spin spinning={!loaded}>
      <PageHeader title='Sequence Search' />
      <Form onFinish={onFinish} {...formItemLayout}>
        <Form.Item
          label="Namespace"
          name="namespace"
          rules={[{ required: true }]}
        >
          <Select>
            {namespaces.map((item) => {
              return <Select.Option value={item.id}>{item.desc}</Select.Option>
            })}
          </Select>
        </Form.Item>
        <Form.Item
          label="E-Value Threshold"
          name="eVal"
        >
          <InputNumber defaultValue={0} max={1} min={0}></InputNumber>
        </Form.Item>
        <Form.Item
          label="Sequence"
          name="sequence"
          rules={[{ required: true, message: 'Please input a sequence!' }]}
        >
          <Input.TextArea rows={5} />
        </Form.Item>
        <Form.Item
          wrapperCol={{ xs: { span: 19, offset: 5 } }}
        >
          <Button type="primary" htmlType="submit">
            Submit
        </Button>
        </Form.Item>
      </Form>
    </Spin>
  )
}

type AppResultsProps = { searches: Search[] };
const AppResults: FC<AppResultsProps> = ({ searches }) => {
  return (
    <div>
      <PageHeader title='Results' />
      <List
        dataSource={searches}
        itemLayout="vertical"
        renderItem={search => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Spin spinning={search.status != "completed"}>
                  <Avatar>{search.ticketId}</Avatar>
                </Spin>
              }
              title={`Search #${search.ticketId}`}
              description={`Status: ${search.status}`}
            />
            <pre>{JSON.stringify(search.result, null, 2)}</pre>
          </List.Item>
        )}
      />
    </div>
  )
}

const App: FC = () => {
  const { searches, newSearch } = useSearch();

  return (
    <Layout className="layout" style={{ minHeight: "100vh" }}>
      <Header style={{ background: '#ffffff', borderBottom: "5px solid #E0E0E0", height: "70px" }}>
        <Image src='/img/kbase_logo.png' />
      </Header>
      <Content className="page-content">
        <AppForm onSubmit={newSearch} />
        <AppResults searches={searches}></AppResults>
      </Content>
      <Footer />
    </Layout>
  );
};

export default App;