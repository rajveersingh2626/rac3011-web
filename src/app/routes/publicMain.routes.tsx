import type { RouteObject } from 'react-router';
import { ComingSoon } from '@/pages/ComingSoon';
import { RequireAuth } from './guards';
import { ShowcaseDetailPage } from '@/pages/public/ShowcaseDetailPage';
import { ClubShowcasePage } from '@/pages/public/ClubShowcasePage';
import { DrrProfilePage } from '@/pages/public/DrrProfilePage';
import { ClubLeadershipPage } from '@/pages/public/ClubLeadershipPage';
import { ResourceCategoryPage } from '@/pages/public/ResourceCategoryPage';
import { GuestKitPage } from '@/pages/public/GuestKitPage';
import { SisterClubFormPage } from '@/pages/public/SisterClubFormPage';
import { PublicationsPage } from '@/pages/public/PublicationsPage';
import { NewClubPage } from '@/pages/public/NewClubPage';
import { SponsorPage } from '@/pages/public/SponsorPage';
import { AchievementsPage } from '@/pages/public/AchievementsPage';
import { PartnersPage } from '@/pages/public/PartnersPage';
import { ContactPage } from '@/pages/public/ContactPage';
import { EventPage } from '@/pages/public/EventPage';
import { PrivacyPolicyPage } from '@/pages/public/PrivacyPolicyPage';
import { TermsOfServicePage } from '@/pages/public/TermsOfServicePage';
import { PublicEventPassPage } from '@/pages/public/PublicEventPassPage';

export const publicMainRouteObjects: RouteObject[] = [
  { path: '/pass/:token', element: <PublicEventPassPage /> },
  { path: '/showcase/:slug', element: <ShowcaseDetailPage /> },
  { path: '/showcase/clubs/:clubSlug', element: <ClubShowcasePage /> },
  { path: '/heritage/:slug', element: <DrrProfilePage /> },
  { path: '/leadership/clubs/:slug', element: <ClubLeadershipPage /> },
  { path: '/resources/documents', element: <ResourceCategoryPage category="documents" /> },
  { path: '/resources/guest-kit', element: <GuestKitPage /> },
  { element: <RequireAuth />, children: [{ path: '/resources/sister-club', element: <SisterClubFormPage /> }] },
  { path: '/resources/:category', element: <ResourceCategoryPage /> },
  { path: '/publications', element: <PublicationsPage /> },
  { path: '/get-involved/new-club', element: <NewClubPage /> },
  { path: '/get-involved/sponsor', element: <SponsorPage /> },
  { path: '/achievements', element: <AchievementsPage /> },
  { path: '/partners', element: <PartnersPage /> },
  { path: '/contact', element: <ContactPage /> },
  { path: '/calendar/:slug', element: <EventPage /> },
  { path: '/drr-calendar', element: <ComingSoon title="DRR calendar" /> },
  { path: '/drr-calendar/book/:slot', element: <ComingSoon title="Book DRR slot" /> },
  { path: '/privacy-policy', element: <PrivacyPolicyPage /> },
  { path: '/terms-of-service', element: <TermsOfServicePage /> },
];
