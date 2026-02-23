import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders SST Open House heading', () => {
  render(<App />);
  const headingElements = screen.getAllByText(/Open House '26/i);
  expect(headingElements.length).toBeGreaterThan(0);
});

