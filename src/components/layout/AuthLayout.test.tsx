import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { Providers, createQueryClient } from '@/app/providers';
import { AuthLayout } from './AuthLayout';

describe('AuthLayout', () => {
  it('wraps the child route in a glass card with the district logo', () => {
    render(
      <Providers queryClient={createQueryClient()}>
        <MemoryRouter initialEntries={['/portal/login']}>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/portal/login" element={<p>Sign in form</p>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </Providers>,
    );
    expect(screen.getByText('Sign in form')).toBeInTheDocument();
    expect(screen.getByAltText('Rotaract District Organization 3011')).toBeInTheDocument();
    expect(screen.getByTestId('auth-card').className).toMatch(/backdrop-blur/);
    expect(screen.getByTestId('auth-card').className).toMatch(/relative/);
    expect(screen.getByTestId('auth-accent')).toBeInTheDocument();
  });
});
