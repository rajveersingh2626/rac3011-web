import { screen } from '@testing-library/react';
import { renderPage } from '@/test/render';
import { DistrictFrame } from './DistrictFrame';

describe('DistrictFrame', () => {
  it('renders nav, main content and the district footer', () => {
    renderPage(
      <DistrictFrame nav={{ links: [{ label: 'Standings', to: '/standings' }], homeHref: 'https://rotaract3011.org/', title: 'RCL' }}>
        <p>Page body</p>
      </DistrictFrame>,
    );
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveTextContent('Page body');
    expect(screen.getByText(/All Rights Reserved/i)).toBeInTheDocument();
  });
});
