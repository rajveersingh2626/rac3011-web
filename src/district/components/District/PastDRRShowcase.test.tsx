import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PastDRRShowcase from './PastDRRShowcase';
import { getDrrCollages, resolveCollageUrl } from '../../data/drrCollages';

vi.mock('@/lib/publicApi/heritage', () => ({
  fetchPastDrrs: vi.fn().mockResolvedValue({ items: [] }),
}));

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('DRR Tenure Collages & Showcase', () => {
  describe('drrCollages Registry', () => {
    it('provides collages for tenures and handles multiple DRRs in a single year', () => {
      // 2020-21 Co-DRRs
      const sarthakCollages = getDrrCollages('drr-38');
      const yaaminiCollages = getDrrCollages('drr-37');

      expect(sarthakCollages.length).toBe(5);
      expect(yaaminiCollages.length).toBe(3);
      expect(sarthakCollages[0]).toContain('sarthak');
      expect(yaaminiCollages[0]).toContain('yaamini');

      // 2022-23 Co-DRRs
      const rahulCollages = getDrrCollages('drr-40');
      const ankitCollages = getDrrCollages('drr-41');
      expect(rahulCollages.length).toBe(3);
      expect(ankitCollages.length).toBe(3);

      // Unknown or historical DRR without collages
      const unknown = getDrrCollages('drr-unknown');
      expect(unknown).toEqual([]);
    });

    it('resolves remote cloud storage URLs cleanly', () => {
      expect(resolveCollageUrl('https://s3.amazonaws.com/my-bucket/pic.webp')).toBe(
        'https://s3.amazonaws.com/my-bucket/pic.webp',
      );
      expect(resolveCollageUrl('/assets/drr-collages/test.webp')).toBe(
        '/assets/drr-collages/test.webp',
      );
    });
  });

  describe('PastDRRShowcase Component', () => {
    it('renders both DRRs for 2020-21 on distinct cards', async () => {
      renderWithClient(<PastDRRShowcase />);

      expect(screen.getByRole('heading', { name: 'Rtr. Sarthak Bansal' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Rtr. Yaamini Thareja' })).toBeInTheDocument();
    }, 15000);

    it('allows flipping a card to reveal the collage and opening the zoom modal', async () => {
      renderWithClient(<PastDRRShowcase />);

      // Find Sarthak's card heading
      const sarthakHeading = screen.getByRole('heading', { name: 'Rtr. Sarthak Bansal' });
      const cardContainer = sarthakHeading.closest('.rotaract-card');
      expect(cardContainer).toBeInTheDocument();

      const flipButtons = screen.getAllByRole('button', { name: /collages/i });
      expect(flipButtons.length).toBeGreaterThan(0);

      // Click flip
      fireEvent.click(flipButtons[0]);

      // Back side controls should appear
      const zoomButtons = screen.getAllByTitle('Zoom in to cover screen');
      expect(zoomButtons.length).toBeGreaterThan(0);

      // Click zoom to open screen-covering lightbox modal
      fireEvent.click(zoomButtons[0]);

      // Lightbox close button should be in the DOM
      const closeButton = screen.getByTitle('Close (Esc)');
      expect(closeButton).toBeInTheDocument();

      // Press Escape to close lightbox
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByTitle('Close (Esc)')).not.toBeInTheDocument();
    }, 15000);
  });
});
