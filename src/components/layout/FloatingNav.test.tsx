import { screen, fireEvent } from '@testing-library/react';
import { renderPage } from '@/test/render';
import { FloatingNav } from './FloatingNav';

const links = [
  { label: 'Opportunities', to: '/opportunities', icon: <span data-testid="ico">icon</span> },
  { label: 'Post an opening', to: '/post' },
];

describe('FloatingNav', () => {
  it('renders the home link and a closed menu', () => {
    renderPage(<FloatingNav links={links} homeHref="https://rotaract3011.org/" title="Career Bridge" />);
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', 'https://rotaract3011.org/');
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: 'Opportunities' })).not.toBeInTheDocument();
  });

  it('opens the panel with surface links, site links, icons and the portal CTA; closes via Close button', () => {
    renderPage(<FloatingNav links={links} homeHref="https://rotaract3011.org/" title="Career Bridge" />);
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    // Single copy of each link (no Drawer duplicate).
    expect(screen.getAllByRole('link', { name: /Opportunities/ })).toHaveLength(1);
    expect(screen.getByTestId('ico')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /District Website/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Login to District Portal/ })).toHaveAttribute('href', '/portal/login');

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on Escape', () => {
    renderPage(<FloatingNav links={links} homeHref="https://rotaract3011.org/" title="Career Bridge" />);
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument();
  });

  it('renders header, CTA and footer only when there are no links', () => {
    renderPage(<FloatingNav links={[]} homeHref="https://rotaract3011.org/" title="District Portal" />);
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(screen.getByRole('link', { name: /Login to District Portal/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /District Website/ })).toBeInTheDocument();
    expect(screen.queryByText('District Portal')).not.toBeInTheDocument();
  });
});
