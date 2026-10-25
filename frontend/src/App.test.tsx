import { render, screen } from '@testing-library/react';
import App from './App';

describe('App scaffold', () => {
  it('renders the application heading', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { name: /sezzle calculator/i }),
    ).toBeInTheDocument();
  });
});
