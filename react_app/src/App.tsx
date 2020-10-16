import React, { FC } from 'react';
import { Layout, Image } from 'antd';
import './App.css';
import { useSearch } from './hooks/useSearches';
import { SearchResults } from './components/SearchResults';
import { SearchForm } from './components/SearchForm';
import logo from './img/kbase_logo.png';

const { Header, Content, Footer } = Layout;

const App: FC = () => {
  const { searches, newSearch, addSearchById, clearSearches } = useSearch();

  return (
    <Layout className="App__layout">
      <Header className="App__header">
        <Image src={logo} />
      </Header>
      <Content className="App__content">
        <SearchForm onSubmit={newSearch} />
        <SearchResults searches={searches} addSearchById={addSearchById} clearSearches={clearSearches}></SearchResults>
      </Content>
      <Footer />
    </Layout>
  );
};

export default App;