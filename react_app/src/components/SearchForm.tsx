import React, { FC } from 'react';
import { Spin, Form, Input, Select, InputNumber, Button, PageHeader } from 'antd';
import { useNamespaces } from '../hooks/namespaces';

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
type SearchFormProps = { onSubmit: (namespace: string, sequence: string, eVal: number) => any; };
export const SearchForm: FC<SearchFormProps> = ({ onSubmit }) => {
  const { namespaces, namespaceLoaded } = useNamespaces();

  const loaded = namespaceLoaded;
  const onFinish = ({ namespace, sequence, eVal }: { namespace: string; sequence: string; eVal: number; }) => onSubmit(namespace, sequence, eVal);

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
              return <Select.Option value={item.id}>{item.desc}</Select.Option>;
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
        <Form.Item wrapperCol={{ xs: { span: 19, offset: 5 } }}>
          <Button type="primary" htmlType="submit">
            Submit
        </Button>
        </Form.Item>
      </Form>
    </Spin>
  );
};
