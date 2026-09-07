import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders eyebrow, title, children and footer', () => {
    render(
      <Card eyebrow="This month" title="August report" footer={<span>Footer</span>}>
        Body
      </Card>,
    );
    expect(screen.getByText('This month')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'August report' })).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });
  it.each(['plain', 'action', 'dashed'] as const)('renders %s tone', (tone) => {
    const { container } = render(<Card tone={tone}>x</Card>);
    expect(container.firstElementChild).toHaveAttribute('data-tone', tone);
  });
  it('action tone has accent border and no shadow', () => {
    const { container } = render(<Card tone="action">x</Card>);
    const cls = container.firstElementChild?.className ?? '';
    expect(cls).toMatch(/border-accent/);
    expect(cls).not.toMatch(/shadow-raised/);
  });
  it('renders as a section', () => {
    const { container } = render(<Card as="section">x</Card>);
    expect(container.firstElementChild?.tagName).toBe('SECTION');
  });
  it('renders in dark theme container', () => {
    const { container } = render(
      <div data-theme="dark">
        <Card>Dark</Card>
      </div>,
    );
    expect(container.querySelector('[data-theme="dark"] [data-tone]')).toBeInTheDocument();
  });
  it('has no rule by default', () => {
    const { container } = render(<Card>x</Card>);
    expect(container.firstElementChild).toHaveAttribute('data-rule', 'none');
    expect(container.firstElementChild?.className ?? '').not.toMatch(/border-t-4/);
  });
  it.each(['pink', 'navy', 'cranberry', 'accent'] as const)('renders %s top rule', (rule) => {
    const { container } = render(<Card rule={rule}>x</Card>);
    const el = container.firstElementChild;
    expect(el).toHaveAttribute('data-rule', rule);
    expect(el?.className ?? '').toMatch(/border-t-4/);
    expect(el?.className ?? '').toMatch(/shadow-lift/);
  });
  it('ruled link card lifts on hover', () => {
    const { container } = render(<Card as="a" href="/x" rule="accent">x</Card>);
    expect(container.firstElementChild?.className ?? '').toMatch(/hover:-translate-y-1/);
  });
  it('compact padding renders p-0 and sm:p-2, not p-5', () => {
    const { container } = render(<Card padding="compact">x</Card>);
    const el = container.firstElementChild;
    expect(el).toHaveAttribute('data-padding', 'compact');
    expect(el?.className ?? '').toMatch(/p-0/);
    expect(el?.className ?? '').toMatch(/sm:p-2/);
    expect(el?.className ?? '').not.toMatch(/p-5/);
  });
  it('default padding renders p-5', () => {
    const { container } = render(<Card>x</Card>);
    expect(container.firstElementChild).toHaveAttribute('data-padding', 'normal');
    expect(container.firstElementChild?.className ?? '').toMatch(/p-5/);
  });
});
