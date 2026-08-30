import { render, screen } from '@testing-library/react';
import App from './App';
import mongoose from 'mongoose';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

afterAll(async () => {
  await mongoose.connection.close();
  console.log("DB Closed ✅");
});
