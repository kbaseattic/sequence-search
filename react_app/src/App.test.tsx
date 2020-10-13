import React from 'react';
import { shallow } from 'enzyme';
import App from './App';

test('shallow mounts', () => {
  expect(() => {
    shallow(<App />)
  }).not.toThrow();
});
