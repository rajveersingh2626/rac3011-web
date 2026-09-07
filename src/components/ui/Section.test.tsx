import { render, screen } from '@testing-library/react';
import { Section } from './Section';

describe('Section', () => {
  it('renders eyebrow, title as h2 by default, description and action', () => {
    render(
      <Section eyebrow="Scoring" title="Monthly reports" description="What the secretariat sees." action={<button type="button">New</button>}>
        <p>content</p>
      </Section>,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Monthly reports' })).toBeInTheDocument();
    expect(screen.getByText('Scoring').className).toMatch(/text-accent/);
    expect(screen.getByText('What the secretariat sees.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument();
    expect(screen.getByText('content')).toBeInTheDocument();
  });
  it('honours headingLevel', () => {
    render(<Section title="Sub" headingLevel={4} />);
    expect(screen.getByRole('heading', { level: 4, name: 'Sub' })).toBeInTheDocument();
  });
  it('omits the header block when no header props are given', () => {
    render(<Section><span>bare</span></Section>);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.getByText('bare')).toBeInTheDocument();
  });
  it('renders in dark theme', () => {
    const { container } = render(
      <div data-theme="dark">
        <Section title="Dark" />
      </div>,
    );
    expect(container.querySelector('[data-theme="dark"] h2')).toHaveTextContent('Dark');
  });
  it('center mode renders pill eyebrow, display heading and lead', () => {
    render(
      <Section align="center" eyebrow="Career Bridge" title="Opportunities" description="Lead text" icon={<span data-testid="ico" />}>
        body
      </Section>,
    );
    expect(screen.getByText('Career Bridge').className).toMatch(/eyebrow-pill/);
    expect(screen.getByRole('heading', { name: 'Opportunities' }).className).toMatch(/heading-display/);
    expect(screen.getByText('Lead text').className).toMatch(/\blead\b/);
    expect(screen.getByTestId('ico')).toBeInTheDocument();
  });
  it('start mode is unchanged', () => {
    render(<Section eyebrow="E" title="T">body</Section>);
    expect(screen.getByText('E').className).not.toMatch(/eyebrow-pill/);
  });
});
