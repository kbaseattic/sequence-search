import React, { FC } from 'react';
import { Spin, Form, Input, Select, Button, PageHeader, Alert } from 'antd';
import { useNamespaces } from '../hooks/useNamespaces';
import { validateFASTA } from '../utils/handleFASTA';

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

interface FormItems {
  namespace: string;
  fasta: string;
  eVal: string;
}

interface SearchFormProps {
  onSubmit: (namespace: string, fasta: string, eVal: number) => any;
};

export const SearchForm: FC<SearchFormProps> = ({ onSubmit }) => {
  const { namespaces, namespaceLoaded, namespaceError } = useNamespaces();

  const onFinish = ({ namespace, fasta, eVal }: FormItems) => {
    onSubmit(namespace, fasta, parseFloat(eVal));
  }

  return (
    <Spin spinning={!namespaceLoaded}>
      <PageHeader title='Sequence Search' />
      {namespaceError ?
        <Alert
          message="Failed to load namespaces"
          description={namespaceError.message}
          type="error"
          showIcon
        />
        :
        <Form onFinish={onFinish} {...formItemLayout} initialValues={{ eVal: 1e-10 }}>
          <Form.Item
            label="Namespace"
            name="namespace"
            rules={[{ required: true, message: 'Please select a Namespace!' }]}
          >
            <Select>
              {namespaces.map((item) => {
                return <Select.Option key={item.id} value={item.id}>{item.description}</Select.Option>;
              })}
            </Select>
          </Form.Item>
          <Form.Item
            label="E-Value Threshold"
            name="eVal"
            rules={[
              { required: true, message: 'Please input an E-Value!' },
              () => ({
                async validator(_rule, value) {
                  if (isNaN(value)) throw new Error("Not a Number")
                },
              }),
            ]}
          >
            <Input placeholder={"e.g. 1e-10"} />
          </Form.Item>
          <Form.Item
            label="FASTA Sequence(s)"
            name="fasta"
            rules={[
              { required: true, message: 'Please input a sequence!' },
              () => ({
                validator(_rule, value) {
                  return validateFASTA(value);
                },
              }),
            ]}
          >
            <Input.TextArea rows={5} />
          </Form.Item>
          <Form.Item wrapperCol={{ xs: { span: 19, offset: 5 } }}>
            <Button type="primary" htmlType="submit">
              Submit
              </Button>
          </Form.Item>
        </Form>
      }
    </Spin>
  );
};
