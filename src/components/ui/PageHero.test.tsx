import { screen } from '@testing-library/react';
import { renderPage } from '@/test/render';
import { PageHero } from './PageHero';

describe('PageHero', () => {
  it('renders eyebrow, title, lead, actions and stats', () => {
    renderPage(
      <PageHero
        eyebrow="Career Bridge"
        title="Opportunities"
        lead="Jobs for Rotaractors"
        primary={{ label: 'Post an opening', to: '/post' }}
        secondary={{ label: 'Portal', href: '/portal/login' }}
        stats={[{ value: '4', label: 'Zones', rule: 'navy' }]}
      />,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Opportunities' })).toBeInTheDocument();
    expect(screen.getByText('Career Bridge').className).toMatch(/eyebrow-pill/);
    expect(screen.getByRole('link', { name: 'Post an opening' })).toHaveAttribute('href', '/post');
    expect(screen.getByRole('link', { name: 'Portal' })).toHaveAttribute('href', '/portal/login');
    expect(screen.getByText('Zones')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Post an opening' }).querySelector('button')).toBeNull();
  });
  it('renders onClick actions as buttons', () => {
    const onClick = vi.fn();
    renderPage(<PageHero eyebrow="E" title="T" primary={{ label: 'Do it', onClick }} />);
    screen.getByRole('button', { name: 'Do it' }).click();
    expect(onClick).toHaveBeenCalled();
  });
});
