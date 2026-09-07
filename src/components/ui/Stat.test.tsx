import { render, screen } from '@testing-library/react';
import { Stat } from './Stat';

describe('Stat', () => {
  it('renders label, value and hint', () => {
    render(<Stat label="Units" value="1,204" hint="of 3,011" />);
    expect(screen.getByText('Units')).toBeInTheDocument();
    expect(screen.getByText('1,204').className).toMatch(/text-\[30px\]/);
    expect(screen.getByText('of 3,011')).toBeInTheDocument();
  });
  it.each(['up', 'down', 'neutral'] as const)('renders %s delta tone', (tone) => {
    render(<Stat label="L" value="1" delta={{ text: '+4', tone }} />);
    expect(screen.getByText('+4')).toHaveAttribute('data-tone', tone);
  });
  it('renders in dark theme container', () => {
    const { container } = render(
      <div data-theme="dark">
        <Stat label="L" value="9" />
      </div>,
    );
    expect(container.querySelector('[data-theme="dark"]')).toHaveTextContent('9');
  });
  it('renders as a ruled card when card is set', () => {
    const { container } = render(<Stat card rule="navy" label="Zones" value="4" />);
    expect(container.firstElementChild).toHaveAttribute('data-rule', 'navy');
    expect(screen.getByText('4').className).toMatch(/text-accent/);
  });
  it('plain rendering is unchanged', () => {
    const { container } = render(<Stat label="Zones" value="4" />);
    expect(container.firstElementChild).not.toHaveAttribute('data-rule');
  });
  it('card mode stacks value over label in a flex-column container', () => {
    render(<Stat card label="Zones" value="4" />);
    const inner = screen.getByText('4').parentElement;
    expect(inner?.className).toMatch(/flex-col/);
    expect(inner).toHaveTextContent('Zones');
  });
});
