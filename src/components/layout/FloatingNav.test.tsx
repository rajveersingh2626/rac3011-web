import { screen, fireEvent } from '@testing-library/react';
import { renderPage } from '@/test/render';
import { FloatingNav } from './FloatingNav';

const links = [
  { label: 'Opportunities', to: '/opportunities' },
  { label: 'Post an opening', to: '/post' },
];

describe('FloatingNav', () => {
  it('renders the home link and a closed menu', () => {
    renderPage(<FloatingNav links={links} homeHref="https://rotaract3011.org/" title="Career Bridge" />);
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', 'https://rotaract3011.org/');
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: 'Opportunities' })).not.toBeInTheDocument();
  });
  it('opens the panel with surface links and site links, closes on Escape', () => {
    renderPage(<FloatingNav links={links} homeHref="https://rotaract3011.org/" title="Career Bridge" />);
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true');
    // Both the desktop panel and the mobile drawer render; CSS hides one. Two copies of each link exist.
    expect(screen.getAllByRole('link', { name: 'Opportunities' })).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: 'District Website' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'Portal' }).length).toBeGreaterThan(0);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument();
  });
});
