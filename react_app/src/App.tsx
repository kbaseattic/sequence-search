import React, { FC } from 'react';
import { Layout, Image } from 'antd';
import './App.css';
import { useSearch } from './hooks/searches';
import { SearchResults } from './components/SearchResults';
import { SearchForm } from './components/SearchForm';

const { Header, Content, Footer } = Layout;

const App: FC = () => {
  const { searches, newSearch } = useSearch();

  return (
    <Layout className="App__layout">
      <Header className="App__header">
        <Image src='/img/kbase_logo.png' />
      </Header>
      <Content className="App__content">
        <SearchForm onSubmit={newSearch} />
        <SearchResults searches={searches}></SearchResults>
      </Content>
      <Footer />
    </Layout>
  );
};

export default App;