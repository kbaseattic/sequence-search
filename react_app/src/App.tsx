import React, { FC, useEffect, useState } from 'react';
import { Layout, Spin, Form, Image, Input, Select, InputNumber, Button, PageHeader } from 'antd';
import './App.css';
const { Header, Content, Footer } = Layout;

interface Namespace {
  database: string
  datasource: string
  desc: string
  id: string
  lastmod: number
  seqcount: number
}

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

const AppForm: FC = () => {
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [namespaceLoaded, setNamespaceLoaded] = useState(false);
  useEffect(() => {
    (async () => {
      if (!namespaceLoaded) {
        const response = await fetch("/api/namespace");
        setNamespaces(await response.json())
        setNamespaceLoaded(true)
      }
    })();
  }, [namespaceLoaded]);

  const loaded = namespaceLoaded;

  return (
    <Spin spinning={!loaded}>
      <PageHeader title='Sequence Search' />
      <Form onFinish={(...args) => console.log(args)} {...formItemLayout}>
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

const App: FC = () => {
  return (
    <Layout className="layout" style={{ minHeight: "100vh" }}>
      <Header style={{ background: '#ffffff', borderBottom: "5px solid #E0E0E0", height: "70px" }}>
        <Image src='/img/kbase_logo.png' />
      </Header>
      <Content className="page-content">
        <AppForm />
      </Content>
      <Footer />
    </Layout>
  );
};

export default App;