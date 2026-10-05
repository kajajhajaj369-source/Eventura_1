import './app.css';
import './role-preview.css';
import { useEffect, type FormEvent, type ReactNode, useState } from 'react';
import { ClerkProvider, SignIn, SignUp, useAuth, useClerk } from '@clerk/react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, ArrowUpRight, CalendarDays, Check, ChevronRight, CircleHelp, Clock3, Command, Compass, GraduationCap, LayoutDashboard, LogOut, Menu, ShieldCheck, Sparkles, Users, X } from 'lucide-react';
import { Link, Redirect, Route, Router as WouterRouter, Switch, useLocation, useParams } from 'wouter';
import { useGetCurrentUser, useGetDashboardSummary, useUpdateMyProfile, getGetCurrentUserQueryKey, setAuthTokenGetter } from '@workspace/api-client-react';
import type { AppRole, DashboardSummary, ProfileUpdate, UserProfile } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const clerkPubKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  'pk_test_YW1wbGUtZ2Vja28tNzQ2LmNsZXJrLmFjY291bnRzLmRldiQ';
const clerkAppearance = {
  cssLayerName: 'clerk',
  variables: {
    colorPrimary: '#4f5fd3',
    colorForeground: '#242a48',
    colorMutedForeground: '#707792',
    colorDanger: '#bf4742',
    colorBackground: '#ffffff',
    colorInput: '#f7f8fc',
    colorInputForeground: '#242a48',
    colorNeutral: '#dfe2ed',
    fontFamily: 'DM Sans, sans-serif',
    borderRadius: '0.85rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-xl',
    card: '!shadow-none !border-0 !bg-transparent',
    footer: '!shadow-none !border-0 !bg-transparent',
    headerTitle: 'font-display text-[#242a48]',
    headerSubtitle: 'text-[#707792]',
    socialButtonsBlockButtonText: { color: '#303651', fontWeight: 600 },
    formFieldLabel: 'text-[#303651] font-semibold',
    footerActionLink: 'text-[#4f5fd3] font-semibold',
    footerActionText: 'text-[#707792]',
    dividerText: 'text-[#707792]',
    formFieldInput: 'rounded-xl border-[#dfe2ed] bg-[#f7f8fc]',
    formButtonPrimary: 'rounded-xl bg-[#4f5fd3] hover:bg-[#404fbd]',
    socialButtonsBlockButton: 'rounded-xl border-[#dfe2ed]',
    alertText: 'text-[#9c3f3a]',
    otpCodeFieldInput: 'rounded-lg border-[#dfe2ed]',
  },
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
};

const roleInfo: Record<AppRole, { slug: string; label: string; description: string }> = {
  COLLEGE_ADMIN: { slug: 'admin', label: 'College Admin', description: 'Campus-wide oversight' },
  CLUB: { slug: 'club', label: 'Club', description: 'Club operations' },
  ORGANIZER: { slug: 'organizer', label: 'Organizer', description: 'Event operations' },
  STUDENT: { slug: 'student', label: 'Student', description: 'Campus life' },
  VOLUNTEER: { slug: 'volunteer', label: 'Volunteer', description: 'Your commitments' },
};

const moduleMap: Record<string, string[]> = {
  admin: ['Events', 'Approvals', 'Clubs', 'Designations', 'Analytics', 'Finance', 'Certificates'],
  club: ['Events', 'Members', 'Organizers', 'Templates', 'Analytics'],
  organizer: ['Events', 'Registrations', 'Attendance', 'Volunteers', 'Tasks', 'Finance', 'Feedback', 'Certificates', 'Analytics'],
  student: ['Discover events', 'Registrations', 'QR passes', 'Attendance', 'Feedback', 'Certificates'],
  volunteer: ['Assigned events', 'Tasks', 'Duty schedule', 'Attendance'],
};

const roleOrder: AppRole[] = ['COLLEGE_ADMIN', 'CLUB', 'ORGANIZER', 'STUDENT', 'VOLUNTEER'];

const previewProfiles: Record<AppRole, UserProfile> = {
  COLLEGE_ADMIN: { id: '487c9790-d7c5-4904-a720-4f9d66ad3bf2', name: 'Admin (kajajhajaj369)', email: 'kajajhajaj369@gmail.com', role: 'COLLEGE_ADMIN', collegeName: 'Northbridge University', profile: { phone: null, department: 'Campus Administration', bio: 'Sole College Administrator with designation assignment authority.' }, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
  CLUB: { id: '00000000-0000-4000-8000-000000000002', name: 'Sam Rivera', email: 'sam.club@preview.eventura.test', role: 'CLUB', collegeName: 'Northbridge University', profile: { phone: null, department: 'Student Organizations', bio: 'Sample role preview.' }, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
  ORGANIZER: { id: '00000000-0000-4000-8000-000000000003', name: 'Jordan Kim', email: 'jordan.organizer@preview.eventura.test', role: 'ORGANIZER', collegeName: 'Northbridge University', profile: { phone: null, department: 'Campus Events', bio: 'Sample role preview.' }, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
  STUDENT: { id: '00000000-0000-4000-8000-000000000004', name: 'Casey Patel', email: 'casey.student@preview.eventura.test', role: 'STUDENT', collegeName: 'Northbridge University', profile: { phone: null, department: 'Computer Science', bio: 'Sample role preview.' }, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
  VOLUNTEER: { id: '00000000-0000-4000-8000-000000000005', name: 'Riley Chen', email: 'riley.volunteer@preview.eventura.test', role: 'VOLUNTEER', collegeName: 'Northbridge University', profile: { phone: null, department: 'Campus Community', bio: 'Sample role preview.' }, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
};

function previewEventDate(daysAhead: number, hour: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

function buildPreviewSummary(role: AppRole, greeting: string, metrics: DashboardSummary['metrics']): DashboardSummary {
  const rolePrefix = role.toLowerCase().replace(/_/g, '-');
  return {
    role,
    collegeName: 'Northbridge University',
    greeting,
    metrics,
    events: [
      { id: `preview-${rolePrefix}-event-1`, title: 'Campus Creative Week', category: 'Arts & culture', startAt: previewEventDate(4, 18), venue: 'North Hall', status: 'PUBLISHED' },
      { id: `preview-${rolePrefix}-event-2`, title: 'Open Mic on the Quad', category: 'Campus community', startAt: previewEventDate(8, 19), venue: 'Founders Green', status: 'APPROVED' },
    ],
    activity: [
      { id: `${rolePrefix}-activity-1`, title: 'Sample workspace update', detail: 'Illustrative activity for this role preview.', occurredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
      { id: `${rolePrefix}-activity-2`, title: 'Campus Creative Week', detail: 'A sample event is on this preview dashboard.', occurredAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString() },
    ],
  };
}

const previewSummaries: Record<AppRole, DashboardSummary> = {
  COLLEGE_ADMIN: buildPreviewSummary('COLLEGE_ADMIN', 'Welcome, Avery.', [
    { key: 'published-events', label: 'Published events', value: 12, helper: 'Sample campus total', tone: 'accent' },
    { key: 'active-clubs', label: 'Active clubs', value: 8, helper: 'Sample organizations', tone: 'success' },
    { key: 'upcoming-events', label: 'Coming this week', value: 4, helper: 'Across campus', tone: 'neutral' },
    { key: 'pending-reviews', label: 'Needs review', value: 2, helper: 'Sample queue', tone: 'warning' },
  ]),
  CLUB: buildPreviewSummary('CLUB', 'Welcome, Sam.', [
    { key: 'club-members', label: 'Club members', value: 34, helper: 'Sample organization', tone: 'accent' },
    { key: 'club-events', label: 'Upcoming events', value: 2, helper: 'For this club', tone: 'success' },
    { key: 'club-organizers', label: 'Organizers', value: 5, helper: 'Sample team', tone: 'neutral' },
    { key: 'club-registrations', label: 'Registrations', value: 28, helper: 'Across sample events', tone: 'warning' },
  ]),
  ORGANIZER: buildPreviewSummary('ORGANIZER', 'Welcome, Jordan.', [
    { key: 'owned-events', label: 'Events owned', value: 3, helper: 'Sample portfolio', tone: 'accent' },
    { key: 'organizer-events', label: 'Coming this week', value: 2, helper: 'Sample schedule', tone: 'success' },
    { key: 'organizer-volunteers', label: 'Volunteers', value: 12, helper: 'Across sample events', tone: 'neutral' },
    { key: 'organizer-updates', label: 'Recent updates', value: 5, helper: 'Sample activity', tone: 'warning' },
  ]),
  STUDENT: buildPreviewSummary('STUDENT', 'Welcome, Casey.', [
    { key: 'discover-events', label: 'Discover events', value: 8, helper: 'Sample campus calendar', tone: 'accent' },
    { key: 'student-registrations', label: 'My registrations', value: 3, helper: 'Sample activity', tone: 'success' },
    { key: 'student-groups', label: 'Campus groups', value: 2, helper: 'Sample memberships', tone: 'neutral' },
    { key: 'student-updates', label: 'New this week', value: 4, helper: 'Sample updates', tone: 'warning' },
  ]),
  VOLUNTEER: buildPreviewSummary('VOLUNTEER', 'Welcome, Riley.', [
    { key: 'assigned-shifts', label: 'Assigned shifts', value: 2, helper: 'Sample assignments', tone: 'accent' },
    { key: 'scheduled-hours', label: 'Hours scheduled', value: 6, helper: 'Sample schedule', tone: 'success' },
    { key: 'volunteer-events', label: 'Upcoming events', value: 2, helper: 'Sample commitments', tone: 'neutral' },
    { key: 'completed-tasks', label: 'Completed tasks', value: 5, helper: 'Sample activity', tone: 'warning' },
  ]),
};

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function CacheUserInvalidator() {
  const { addListener } = useClerk();
  const { getToken } = useAuth();
  const client = useQueryClient();
  useEffect(() => {
    setAuthTokenGetter(() => getToken());
  }, [getToken]);
  useEffect(() => {
    let previousId: string | null | undefined;
    return addListener(({ user }) => {
      const nextId = user?.id ?? null;
      if (previousId !== undefined && previousId !== nextId) client.clear();
      previousId = nextId;
    });
  }, [addListener, client]);
  return null;
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <Link href="/" className={`brand-lockup ${compact ? 'brand-compact' : ''}`} data-testid="link-eventura-home">
    <img src={`${basePath}/logo.svg`} alt="" className="brand-mark" />
    <span className="font-display brand-name">eventura<span>.</span></span>
  </Link>;
}

function Home() {
  const { isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  return <main className="landing page-enter">
    <header className="landing-nav">
      <Brand />
      <nav className="landing-links" aria-label="Main navigation">
        <a href="#workspace" data-testid="link-workspace">Workspace</a>
        <a href="#roles" data-testid="link-roles">For your role</a>
        <a href="#rhythm" data-testid="link-rhythm">How it works</a>
        <Link href="/preview" className="text-link" data-testid="link-nav-preview" style={{ color: '#4f5fd3', fontWeight: 600 }}>Explore Dashboards</Link>
      </nav>
      <div className="landing-actions">
        {isSignedIn ? (
          <>
            <Link href="/preview" className="button button-primary" data-testid="link-nav-preview-dash">Open Dashboards <ArrowRight size={15} /></Link>
            <button type="button" onClick={() => signOut({ redirectUrl: basePath || '/' })} className="text-link" data-testid="button-home-signout" style={{ cursor: 'pointer', background: 'none', border: 'none' }}>Sign out</button>
          </>
        ) : (
          <>
            <Link href="/sign-in" className="text-link" data-testid="link-sign-in">Sign in</Link>
            <Link href="/sign-up" className="button button-primary" data-testid="link-get-started">Get started <ArrowRight size={16} /></Link>
          </>
        )}
      </div>
    </header>
    <section className="hero hero-grid">
      <div className="hero-copy">
        <div className="eyebrow"><span className="eyebrow-dot" /> THE CAMPUS WORKSPACE</div>
        <h1>Make campus<br /><span>feel connected.</span></h1>
        <p>One place for the people who make college life happen. Plan together, keep the details in sync, and make room for the moments that matter.</p>
        <div className="hero-ctas">
          {isSignedIn ? (
            <Link href="/preview" className="button button-primary button-large" data-testid="link-hero-open-dashboards">
              Open Admin &amp; Role Dashboards <ArrowRight size={17} />
            </Link>
          ) : (
            <>
              <Link href="/sign-up" className="button button-primary button-large" data-testid="link-create-account">Bring your campus together <ArrowRight size={17} /></Link>
              <Link href="/sign-in" className="hero-secondary" data-testid="link-returning-user">Already part of a campus? <span>Sign in</span></Link>
            </>
          )}
        </div>
        <Link href="/preview" className="role-preview-entry" data-testid="link-role-preview">Preview all 5 roles (Admin, Club, Student...) <ArrowRight size={14} /></Link>
        <div className="hero-proof"><div className="proof-icons"><span>A</span><span>C</span><span>S</span><span>+</span></div><span>For every team behind campus life</span></div>
      </div>
      <div className="hero-art" aria-label="Illustration of a connected campus workspace">
        <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
        <div className="art-core"><div className="core-symbol"><Command size={34} strokeWidth={1.8} /></div><div className="core-name font-display">one campus<br />workspace</div></div>
        <div className="orbit-node node-admin"><div className="node-icon"><ShieldCheck size={18} /></div><span>Campus admin</span></div>
        <div className="orbit-node node-club"><div className="node-icon violet"><Users size={18} /></div><span>Clubs</span></div>
        <div className="orbit-node node-student"><div className="node-icon gold"><GraduationCap size={18} /></div><span>Students</span></div>
        <div className="orbit-node node-volunteer"><div className="node-icon teal"><Sparkles size={17} /></div><span>Volunteers</span></div>
        <div className="art-stamp"><span>01</span><span>ONE SHARED<br />CAMPUS VIEW</span></div>
      </div>
      <div className="hero-index"><span>01 / 03</span><span>Built for the whole campus</span></div>
    </section>
    <section className="trust-strip">
      <span className="trust-lead">A better rhythm for</span>
      <div><Users size={17} /><span>Student organizations</span></div><div><CalendarDays size={17} /><span>Event teams</span></div><div><GraduationCap size={17} /><span>Campus communities</span></div>
    </section>
    <section id="workspace" className="story-section">
      <div className="section-kicker">01 — THE SHARED VIEW</div>
      <div className="story-layout"><h2>Less chasing.<br /><span>More showing up.</span></h2>
        <div className="story-text"><p>Campus events run on a lot of good people and a lot of moving pieces. EVENTURA gives each team a clear place to work—without losing sight of everyone else.</p>
          <div className="story-stats"><div><strong>05</strong><span>connected roles</span></div><div><strong>01</strong><span>shared workspace</span></div><div><strong>∞</strong><span>ways to belong</span></div></div>
        </div></div>
      <div className="workspace-preview">
        <div className="preview-sidebar"><div className="preview-brand"><img src={`${basePath}/logo.svg`} alt="" /> EVENTURA</div><div className="preview-selected"><LayoutDashboard size={15} /> Overview</div><div className="preview-line"><CalendarDays size={15} /> Events</div><div className="preview-line"><Users size={15} /> Community</div><div className="preview-user"><span>JM</span><div>Jordan Miller<small>Student · Northbridge</small></div></div></div>
        <div className="preview-main"><div className="preview-top"><span>MONDAY, OCTOBER 14</span><span className="preview-top-pill">STUDENT VIEW</span></div><h3>Find your next thing.</h3><p>Good things are happening around campus.</p>
          <div className="preview-event-row"><div className="preview-date"><b>18</b><small>OCT</small></div><div><strong>Design for Good: Studio Night</strong><small>Arts &amp; culture · North Hall</small></div><ArrowUpRight size={17} /></div>
          <div className="preview-event-row"><div className="preview-date date-purple"><b>22</b><small>OCT</small></div><div><strong>Open Mic on the Quad</strong><small>Community · Founders Green</small></div><ArrowUpRight size={17} /></div>
          <div className="preview-caption">A glimpse of the workspace <span>PREVIEW ONLY</span></div></div>
      </div>
      <p className="preview-disclaimer">Illustrative interface preview. No event actions are available here.</p>
    </section>
    <section id="roles" className="roles-section">
      <div className="section-kicker">02 — EVERY ROLE, IN CONTEXT</div><div className="roles-heading"><h2>Different work.<br /><span>One campus.</span></h2><p>Useful views for the people doing the work—connected by the campus they share.</p></div>
      <div className="role-list">
        {[
          ['01','Campus admins','Keep campus activity and club operations in view.','COLLEGE ADMIN'],
          ['02','Clubs','Bring members and organizers onto the same page.','CLUB'],
          ['03','Organizers','Stay oriented across the moving parts of an event.','ORGANIZER'],
          ['04','Students','See what is happening and keep your campus life together.','STUDENT'],
          ['05','Volunteers','Know where you are expected and what is on your schedule.','VOLUNTEER'],
        ].map(([n,title,copy,tag]) => <article className="role-row" key={n}><span className="role-number">{n}</span><h3>{title}</h3><p>{copy}</p><span className="role-tag">{tag}</span></article>)}
      </div>
    </section>
    <section id="rhythm" className="rhythm-section">
      <div className="section-kicker">03 — A CLEARER CAMPUS RHYTHM</div><div className="rhythm-main"><h2>Fewer tabs.<br /><span>Better handoffs.</span></h2><div className="rhythm-copy"><p>EVENTURA is built to make campus coordination feel less like a relay race. Role-aware dashboards give each person the right context, with shared visibility where it counts.</p><div className="rhythm-points"><div><span>01</span><p><b>Start with your role</b><small>Your workspace opens to the things relevant to your work.</small></p></div><div><span>02</span><p><b>Stay in the loop</b><small>Campus updates and event context live in one dependable place.</small></p></div><div><span>03</span><p><b>Make room for people</b><small>Less time tracking details means more time building community.</small></p></div></div></div></div>
    </section>
    <section className="closing-cta"><div className="closing-kicker">THE CAMPUS IS ALREADY HAPPENING.</div><h2>Give it a home.</h2><p>Join the workspace built for the people who bring campus life to life.</p><Link href="/sign-up" className="button button-light button-large" data-testid="link-start-now">Start with EVENTURA <ArrowRight size={17} /></Link><div className="closing-mark"><img src={`${basePath}/logo.svg`} alt="" /></div></section>
    <footer className="landing-footer"><Brand compact /><span>One campus. Many ways to make it matter.</span><div><Link href="/sign-in" data-testid="footer-sign-in">Sign in</Link><Link href="/sign-up" data-testid="footer-sign-up">Create account</Link></div><small>© {new Date().getFullYear()} EVENTURA</small></footer>
  </main>;
}

function LoadingPage({ label = 'Loading your workspace' }: { label?: string }) {
  return <main className="center-state" aria-live="polite" data-testid="status-loading"><div className="state-mark"><img src={`${basePath}/logo.svg`} alt="" /></div><p>{label}</p><div className="loading-lines"><span className="skeleton" /><span className="skeleton" /></div></main>;
}

function ErrorState({ message, retry }: { message: string; retry: () => void }) {
  return <div className="state-card" role="alert" data-testid="status-error"><div className="state-icon error-icon"><CircleHelp size={20} /></div><h2>We couldn't load this view</h2><p>{message}</p><button className="button button-primary" onClick={retry} data-testid="button-retry">Try again <ArrowRight size={15} /></button></div>;
}

function ProfileQueryState({ children }: { children: (profile: UserProfile) => ReactNode }) {
  const query = useGetCurrentUser();
  const { signOut } = useClerk();
  if (query.isLoading) return <LoadingPage label="Finding your campus profile" />;
  if (query.isError) return <main className="center-state"><ErrorState message="Your profile is temporarily unavailable. Please try again." retry={() => query.refetch()} /></main>;
  if (!query.data || typeof query.data !== 'object' || !('role' in (query.data as object))) {
    return <main className="center-state">
      <div className="state-card" style={{ maxWidth: '460px', textAlign: 'center' }}>
        <h2>Signed in to EVENTURA</h2>
        <p>You are signed in! Because this is a static Netlify deployment, you can explore the complete interactive dashboards for all 5 roles below:</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.25rem', width: '100%' }}>
          <Link className="button button-primary" href="/preview" style={{ justifyContent: 'center' }}>
            Open Admin &amp; Role Dashboards <ArrowRight size={15} />
          </Link>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link className="button button-secondary" href="/">Return home</Link>
            <button type="button" className="button button-secondary" onClick={() => signOut({ redirectUrl: basePath || '/' })}>Sign out</button>
          </div>
        </div>
      </div>
    </main>;
  }
  return <>{children(query.data)}</>;
}

function HomeRedirect() {
  return <Home />;
}

function PortalPage() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <LoadingPage label="Checking your session" />;
  if (!isSignedIn) return <Redirect to="/" />;
  return <ProfileQueryState>{profile => {
    const slug = roleInfo[profile?.role]?.slug || 'student';
    return <Redirect to={`/${slug}`} />;
  }}</ProfileQueryState>;
}

function SignInPage() {
  return <main className="auth-layout"><div className="auth-side"><Brand /><div className="auth-side-copy"><div className="eyebrow"><span className="eyebrow-dot" /> YOUR CAMPUS, IN SYNC</div><h1>Pick up<br />where you<br /><span>belong.</span></h1><p>Sign in to return to your campus workspace.</p><div className="auth-note"><span><ShieldCheck size={18} /></span><p>One dependable place for the people behind campus life.</p></div></div><div className="auth-side-foot">EVENTURA · CAMPUS WORKSPACE</div></div><div className="auth-form-area"><Link href="/" className="auth-back" data-testid="link-auth-home"><ChevronRight size={15} /> Back to home</Link><SignIn routing="path" path={basePath + '/sign-in'} signUpUrl={basePath + '/sign-up'} /></div></main>;
}

function SignUpPage() {
  return <main className="auth-layout"><div className="auth-side signup-side"><Brand /><div className="auth-side-copy"><div className="eyebrow"><span className="eyebrow-dot" /> A PLACE FOR YOUR PEOPLE</div><h1>Good things<br />happen when<br /><span>we connect.</span></h1><p>Start building a better rhythm for campus life.</p><div className="auth-note"><span><Sparkles size={18} /></span><p>Five campus roles. One shared place to make it happen.</p></div></div><div className="auth-side-foot">EVENTURA · CAMPUS WORKSPACE</div></div><div className="auth-form-area"><Link href="/" className="auth-back" data-testid="link-auth-home"><ChevronRight size={15} /> Back to home</Link><SignUp routing="path" path={basePath + '/sign-up'} signInUrl={basePath + '/sign-in'} /></div></main>;
}

function ProtectedRole({ role }: { role: AppRole }) {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <LoadingPage label="Verifying your access" />;
  if (!isSignedIn) return <Redirect to="/" />;
  return <ProfileQueryState>{profile => {
    if (profile.role !== role) return <AccessDenied role={profile.role} requestedRole={role} />;
    return <RoleWorkspace profile={profile} />;
  }}</ProfileQueryState>;
}

function AccessDenied({ role, requestedRole }: { role: AppRole; requestedRole: AppRole }) {
  const requested = roleInfo[requestedRole]?.label || requestedRole;
  const currentRoleInfo = roleInfo[role] || { label: 'Student', slug: 'student' };
  return <main className="center-state"><div className="state-card access-card"><div className="state-icon"><ShieldCheck size={21} /></div><span className="eyebrow">ROLE-RESTRICTED WORKSPACE</span><h2>This view is for {requested}</h2><p>Your profile is set up for <b>{currentRoleInfo.label}</b>. We keep each workspace scoped to its assigned role.</p><Link href={`/${currentRoleInfo.slug}`} className="button button-primary" data-testid="link-your-workspace">Go to your workspace <ArrowRight size={15} /></Link></div></main>;
}

function ProfilePage() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <LoadingPage />;
  if (!isSignedIn) return <Redirect to="/" />;
  return <ProfileQueryState>{profile => <ProfileEditor profile={profile} />}</ProfileQueryState>;
}

function ProfileEditor({ profile }: { profile: UserProfile }) {
  const update = useUpdateMyProfile();
  const client = useQueryClient();
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.profile.phone ?? '');
  const [department, setDepartment] = useState(profile.profile.department ?? '');
  const [bio, setBio] = useState(profile.profile.bio ?? '');
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState('');
  const hasChanges = name !== profile.name || phone !== (profile.profile.phone ?? '') || department !== (profile.profile.department ?? '') || bio !== (profile.profile.bio ?? '');
  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    setSaved(false);
    if (!name.trim()) { setFormError('Add your name before saving.'); return; }
    const data: ProfileUpdate = { name: name.trim(), phone: phone || null, department: department || null, bio: bio || null };
    update.mutate({ data }, {
      onSuccess: result => { client.setQueryData(getGetCurrentUserQueryKey(), result); setSaved(true); },
      onError: () => setFormError('Your changes could not be saved. Please try again.'),
    });
  };
  return <WorkspaceFrame profile={profile} title="Your profile" crumb="ACCOUNT">
    <div className="profile-grid page-enter">
      <section className="profile-intro"><div className="profile-avatar" aria-hidden="true">{initials(profile.name)}</div><span className="eyebrow">CAMPUS IDENTITY</span><h1 className="font-display">{profile.name}</h1><p>{roleInfo[profile.role].label} · {profile.collegeName || 'Campus community'}</p><div className="profile-email"><span>EMAIL ADDRESS</span><strong>{profile.email}</strong><small>Email is managed by your sign-in account.</small></div><div className="profile-note"><ShieldCheck size={17} /><p>Your role keeps your workspace relevant and access appropriately scoped.</p></div></section>
      <section className="profile-form-card"><div className="card-heading"><div><span className="eyebrow">PROFILE DETAILS</span><h2>Make it yours</h2></div><span className="edit-badge">EDITABLE</span></div>
        <form onSubmit={save} className="profile-form" data-testid="form-profile">
          <label>Full name<input value={name} onChange={event => setName(event.target.value)} maxLength={120} required data-testid="input-profile-name" /></label>
          <label>Phone number<input value={phone} onChange={event => setPhone(event.target.value)} maxLength={40} placeholder="Add a contact number" data-testid="input-profile-phone" /></label>
          <label>Department<input value={department} onChange={event => setDepartment(event.target.value)} maxLength={120} placeholder="Your school or department" data-testid="input-profile-department" /></label>
          <label>Short introduction<textarea value={bio} onChange={event => setBio(event.target.value)} rows={4} maxLength={500} placeholder="A little about what brings you to campus…" data-testid="input-profile-bio" /><small className="char-count">{bio.length}/500</small></label>
          {formError && <div className="form-alert" role="alert" data-testid="status-profile-error">{formError}</div>}
          {saved && <div className="form-success" role="status" data-testid="status-profile-saved"><Check size={16} /> Your profile is up to date.</div>}
          <div className="form-footer"><span>Changes are saved to your campus profile.</span><button className="button button-primary" type="submit" disabled={update.isPending || !hasChanges} data-testid="button-save-profile">{update.isPending ? 'Saving…' : 'Save changes'} {!update.isPending && <ArrowRight size={15} />}</button></div>
        </form>
      </section>
    </div>
  </WorkspaceFrame>;
}

function RoleWorkspace({ profile }: { profile: UserProfile }) {
  const params = useParams<{ module?: string }>();
  const { role } = profile;
  const roleSlug = roleInfo[role].slug;
  const currentModule = params.module ? decodeURIComponent(params.module).replace(/-/g, ' ') : '';
  const moduleLabel = moduleMap[roleSlug].find(item => item.toLowerCase() === currentModule.toLowerCase()) ?? '';
  if (params.module && !moduleLabel) return <WorkspaceFrame profile={profile} title="Page unavailable" crumb="WORKSPACE"><PlaceholderPage title="This workspace page isn't available" role={role} /></WorkspaceFrame>;
  let content: ReactNode;
  if (moduleLabel.toLowerCase() === 'designations') {
    content = <DesignationsManager profile={profile} />;
  } else if (moduleLabel) {
    content = <PlaceholderPage title={moduleLabel} role={role} />;
  } else {
    content = <DashboardContent profile={profile} />;
  }
  return <WorkspaceFrame profile={profile} title={moduleLabel || 'Overview'} crumb={roleInfo[role].label.toUpperCase()}>
    {content}
  </WorkspaceFrame>;
}

function WorkspaceFrame({ profile, title, crumb, children, previewMode = false, onPreviewNavigate }: { profile: UserProfile; title: string; crumb: string; children: ReactNode; previewMode?: boolean; onPreviewNavigate?: (view: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();
  const roleSlug = roleInfo[profile.role].slug;
  const { signOut } = useClerk();
  const signOutUser = () => signOut({ redirectUrl: basePath || '/' });
  const navItems = [{ label: 'Overview', href: `/${roleSlug}`, icon: LayoutDashboard }, ...moduleMap[roleSlug].map((label, index) => ({ label, href: `/${roleSlug}/${slugify(label)}`, icon: index === 0 ? CalendarDays : index === 1 ? Users : Compass })), { label: 'My profile', href: '/profile', icon: Users }];
  const initialsText = initials(profile.name);
  return <div className="workspace app-frame">
    <aside className={`workspace-sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-head"><Brand compact /><button className="icon-button sidebar-close" onClick={() => setMenuOpen(false)} aria-label="Close navigation" data-testid="button-close-menu"><X size={18} /></button></div>
      <div className="campus-switch"><div className="campus-crest"><GraduationCap size={18} /></div><div><small>YOUR CAMPUS</small><strong>{profile.collegeName || 'Campus workspace'}</strong></div><ChevronRight size={15} /></div>
      <div className="sidebar-section-label">WORKSPACE</div>
      <nav className="sidebar-nav" aria-label={`${roleInfo[profile.role].label} navigation`}>
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const active = previewMode
            ? item.label === 'My profile' ? title === 'Your profile' : item.label === title
            : index === 0 ? title === 'Overview' : item.href === '/profile' ? title === 'Your profile' : location === item.href;
          const itemContent = <><Icon size={17} strokeWidth={active ? 2.2 : 1.8} /><span>{item.label}</span>{active && <span className="nav-active-dot" />}</>;
          if (previewMode) return <button type="button" key={item.href} className={`side-link side-link-button ${active ? 'side-link-active' : ''}`} onClick={() => { setMenuOpen(false); onPreviewNavigate?.(item.label); }} data-testid={`nav-${slugify(item.label)}`} aria-current={active ? 'page' : undefined}>{itemContent}</button>;
          return <Link href={item.href} key={item.href} className={`side-link ${active ? 'side-link-active' : ''}`} onClick={() => setMenuOpen(false)} data-testid={`nav-${slugify(item.label)}`} aria-current={active ? 'page' : undefined}>{itemContent}</Link>;
        })}
      </nav>
      <div className="sidebar-bottom"><div className="sidebar-help"><span><CircleHelp size={16} /></span><div><b>Need a hand?</b><small>Your campus team can help.</small></div></div>
        <div className="sidebar-user"><div className="user-monogram">{initialsText}</div><div className="user-details"><strong>{profile.name}</strong><small>{roleInfo[profile.role].label}{previewMode ? ' · sample' : ''}</small></div>{previewMode ? <Link href="/" className="icon-button signout-button" aria-label="Exit role preview" title="Exit preview" data-testid="link-exit-role-preview"><LogOut size={17} /></Link> : <button onClick={signOutUser} className="icon-button signout-button" aria-label="Sign out" title="Sign out" data-testid="button-sign-out"><LogOut size={17} /></button>}</div>
      </div>
    </aside>
    {menuOpen && <button className="sidebar-backdrop" aria-label="Close menu" onClick={() => setMenuOpen(false)} data-testid="button-menu-backdrop" />}
    <div className="workspace-main">
      <header className="workspace-topbar"><div className="topbar-left"><button className="icon-button mobile-menu-button" onClick={() => setMenuOpen(true)} aria-label="Open navigation" data-testid="button-open-menu"><Menu size={20} /></button><span className="topbar-campus">{profile.collegeName || 'Campus workspace'}</span><ChevronRight size={14} /><span className="topbar-crumb">{crumb}</span></div><div className="topbar-right">{!previewMode && <Link href="/preview" className="workspace-preview-link" data-testid="link-role-preview">Preview roles</Link>}<span className="workspace-status"><i /> {previewMode ? 'SAMPLE PREVIEW' : 'CAMPUS SPACE'}</span>{previewMode ? <button type="button" className="topbar-avatar preview-avatar" aria-label="Preview profile" data-testid="button-preview-profile" onClick={() => onPreviewNavigate?.('My profile')}>{initialsText}</button> : <Link href="/profile" className="topbar-avatar" aria-label="Open profile" data-testid="link-profile-avatar">{initialsText}</Link>}</div></header>
      <main className="workspace-content"><div className="content-title-row"><div><span className="eyebrow">{crumb}</span><h1 className="font-display" data-testid="text-page-title">{title}</h1></div><div className="today-label"><Clock3 size={15} /><span>{new Intl.DateTimeFormat('en', { weekday: 'long', month: 'short', day: 'numeric' }).format(new Date())}</span></div></div>{children}</main>
      <footer className="workspace-footer"><span>EVENTURA <b>·</b> Campus, in sync.</span>{previewMode ? <button type="button" className="workspace-footer-preview-link" onClick={() => onPreviewNavigate?.('My profile')} data-testid="button-preview-footer-profile">Sample profile <ArrowUpRight size={13} /></button> : <Link href="/profile" data-testid="footer-profile">Account settings <ArrowUpRight size={13} /></Link>}</footer>
    </div>
  </div>;
}

function DashboardContent({ profile }: { profile: UserProfile }) {
  const summaryQuery = useGetDashboardSummary();
  if (summaryQuery.isLoading) return <DashboardSkeleton />;
  if (summaryQuery.isError) return <ErrorState message="Dashboard information is temporarily unavailable." retry={() => summaryQuery.refetch()} />;
  const summary = summaryQuery.data;
  if (!summary) return <div className="empty-panel" data-testid="empty-dashboard"><div className="empty-icon"><LayoutDashboard size={20} /></div><h2>Your campus view is getting ready</h2><p>There is no dashboard information to show yet. Check back soon.</p></div>;
  return <DashboardView profile={profile} summary={summary} />;
}

function DashboardView({ profile, summary }: { profile: UserProfile; summary: DashboardSummary }) {
  return <div className="dashboard-content page-enter">
    <section className="welcome-banner"><div className="welcome-copy"><span className="welcome-overline"><Sparkles size={14} /> YOUR CAMPUS PULSE</span><h2>{summary.greeting || `Good to see you, ${profile.name.split(' ')[0]}.`}</h2><p>A clear view of what is moving across your {roleInfo[profile.role].label.toLowerCase()} workspace.</p></div><div className="welcome-graphic"><div className="welcome-disc disc-back" /><div className="welcome-disc disc-mid" /><div className="welcome-disc disc-front"><Command size={26} /></div><span className="graphic-star star-a" /><span className="graphic-star star-b" /></div><span className="welcome-mark">E / CAMPUS</span></section>
    {summary.metrics?.length ? <section className="metric-grid" aria-label="Workspace metrics">{summary.metrics.map(metric => <article className={`metric-card metric-${metric.tone}`} key={metric.key} data-testid={`metric-${slugify(metric.key)}`}><div className="metric-top"><span>{metric.label}</span><span className={`metric-bullet tone-${metric.tone}`} /></div><strong className="font-display">{formatMetric(metric.value)}</strong><p>{metric.helper}</p></article>)}</section> : <div className="inline-empty" data-testid="empty-metrics">There are no workspace metrics to show yet.</div>}
    <div className="dashboard-lower"><section className="data-panel events-panel"><div className="panel-heading"><div><span className="eyebrow">ON YOUR RADAR</span><h2>Upcoming events</h2></div><span className="panel-count">{summary.events?.length ?? 0} {summary.events?.length === 1 ? 'item' : 'items'}</span></div>
      {summary.events?.length ? <div className="event-list">{summary.events.map((event, index) => <article className="event-row" key={event.id} data-testid={`event-${event.id}`}><div className={`event-date date-tone-${index % 3}`}><b>{new Date(event.startAt).getDate()}</b><small>{new Intl.DateTimeFormat('en', { month: 'short' }).format(new Date(event.startAt)).toUpperCase()}</small></div><div className="event-info"><strong>{event.title}</strong><span>{event.category} <i /> {event.venue}</span></div><div className="event-meta"><span className={`status-pill status-${event.status.toLowerCase()}`}>{humanize(event.status)}</span><small>{new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(new Date(event.startAt))}</small></div></article>)}</div> : <div className="panel-empty" data-testid="empty-events"><CalendarDays size={20} /><h3>Nothing on the calendar yet</h3><p>When campus events are available, they will appear here.</p></div>}
      </section>
      <section className="data-panel activity-panel"><div className="panel-heading"><div><span className="eyebrow">THE LATEST</span><h2>Recent activity</h2></div><span className="activity-mark"><span /> LIVE</span></div>
      {summary.activity?.length ? <div className="activity-list">{summary.activity.map((activity, index) => <article className="activity-row" key={activity.id} data-testid={`activity-${activity.id}`}><span className={`activity-dot dot-${index % 3}`} /><div><strong>{activity.title}</strong><p>{activity.detail}</p><small>{formatRelative(activity.occurredAt)}</small></div></article>)}</div> : <div className="panel-empty activity-empty" data-testid="empty-activity"><Clock3 size={20} /><h3>All caught up</h3><p>New updates will show here as they happen.</p></div>}</section></div>
    <div className="dashboard-footnote"><span><ShieldCheck size={15} /> Your view is scoped to your role and campus.</span><span>Updated just now</span></div>
  </div>;
}

function DashboardSkeleton() {
  return <div className="dashboard-content" aria-label="Loading dashboard" data-testid="skeleton-dashboard"><div className="skeleton skeleton-welcome" /><div className="skeleton-metrics">{[1,2,3,4].map(i => <div className="skeleton skeleton-metric" key={i} />)}</div><div className="skeleton-panels"><div className="skeleton skeleton-panel" /><div className="skeleton skeleton-panel" /></div></div>;
}

function PlaceholderPage({ title, role, onBack }: { title: string; role: AppRole; onBack?: () => void }) {
  return <section className="phase-placeholder page-enter" data-testid="phase-placeholder"><div className="placeholder-illustration"><div className="placeholder-ring ring-a" /><div className="placeholder-ring ring-b" /><div className="placeholder-center"><Compass size={27} /></div><span className="placeholder-chip chip-one"><span /> READY FOR PHASE 1</span><span className="placeholder-chip chip-two">E / {roleInfo[role].slug.toUpperCase()}</span></div><div className="placeholder-copy"><span className="eyebrow">A CLEAR PLACE TO START</span><h2>{title}</h2><p>This {roleInfo[role].label.toLowerCase()} workspace keeps your {title.toLowerCase()} destination easy to find. Detailed workflows are not part of this phase.</p><div className="phase-tag"><span /> PHASE 1 DESTINATION</div>{onBack ? <button type="button" className="button button-secondary" onClick={onBack} data-testid="button-preview-back-overview"><ArrowRight size={15} /> Back to overview</button> : <Link href={`/${roleInfo[role].slug}`} className="button button-secondary" data-testid="link-back-overview"><ArrowRight size={15} /> Back to overview</Link>}</div><div className="placeholder-note"><ShieldCheck size={17} /><span>Role-aware navigation is active. This section is a Phase 1 placeholder, not an event workflow.</span></div></section>;
}

function PreviewProfileContent({ profile }: { profile: UserProfile }) {
  return <div className="profile-grid page-enter" data-testid="preview-profile">
    <section className="profile-intro"><div className="profile-avatar">{initials(profile.name)}</div><span className="eyebrow">SAMPLE PROFILE</span><h2>{profile.name}</h2><p>This is preview data only. It is not a Clerk account and cannot change your real profile.</p><div className="profile-email"><span>ROLE</span><strong>{roleInfo[profile.role].label}</strong><small>Read-only development fixture</small></div><div className="profile-note"><ShieldCheck size={15} /><p>Profile editing is disabled in role preview.</p></div></section>
    <section className="profile-form-card preview-profile-card"><div className="card-heading"><div><span className="eyebrow">PREVIEW ONLY</span><h2>Profile details</h2></div><span className="edit-badge">SAMPLE DATA</span></div><div className="preview-profile-fields">
      <div><span>Name</span><strong>{profile.name}</strong></div><div><span>Sample email</span><strong>{profile.email}</strong></div><div><span>Campus</span><strong>{profile.collegeName ?? 'Not assigned'}</strong></div><div><span>Department</span><strong>{profile.profile.department ?? 'Not provided'}</strong></div><div><span>Phone</span><strong>{profile.profile.phone ?? 'Not provided'}</strong></div><div><span>Bio</span><strong>{profile.profile.bio ?? 'Not provided'}</strong></div>
    </div></section>
  </div>;
}

type MemberRecord = {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  departmentName?: string | null;
  isActive?: boolean;
};

const SOLE_ADMIN_EMAIL = 'kajajhajaj369@gmail.com';

const initialMembers: MemberRecord[] = [
  { id: '487c9790-d7c5-4904-a720-4f9d66ad3bf2', name: 'Admin (You)', email: 'kajajhajaj369@gmail.com', role: 'COLLEGE_ADMIN', departmentName: 'Campus Administration', isActive: true },
  { id: '7e3d8365-e429-4961-bea9-554ce0764cde', name: 'Jordan Lee', email: 'club@demo.eventura.invalid', role: 'CLUB', departmentName: 'Student Organizations', isActive: true },
  { id: '66febbd2-f590-4563-8d3f-5c36c8364b80', name: 'Jordan Lee (VIT)', email: 'vit.club@demo.eventura.invalid', role: 'CLUB', departmentName: 'Robotics Club', isActive: true },
  { id: '5165a9e6-63fb-40af-a662-993993a2ae75', name: 'Sam Rivera', email: 'organizer@demo.eventura.invalid', role: 'ORGANIZER', departmentName: 'Campus Events', isActive: true },
  { id: '8e2e54f8-777e-48c5-a36b-bfd4c4c011b8', name: 'Sam Rivera (VIT)', email: 'vit.organizer@demo.eventura.invalid', role: 'ORGANIZER', departmentName: 'Cultural Fest', isActive: true },
  { id: '64f490bf-8575-488a-9b49-a70af84129e1', name: 'Taylor Morgan', email: 'student.one@demo.eventura.invalid', role: 'STUDENT', departmentName: 'Computer Science', isActive: true },
  { id: '23d67b58-6493-48e9-b6c4-a306bdce4831', name: 'Casey Patel', email: 'student.two@demo.eventura.invalid', role: 'STUDENT', departmentName: 'Electrical Engineering', isActive: true },
  { id: 'bfc0233f-ea27-4371-9d71-c429deeda311', name: 'Morgan Chen', email: 'student.three@demo.eventura.invalid', role: 'STUDENT', departmentName: 'Business School', isActive: true },
  { id: 'a8f1829b-676c-43d3-973f-e1ea5687e118', name: 'Riley Brooks', email: 'volunteer.one@demo.eventura.invalid', role: 'VOLUNTEER', departmentName: 'Community Outreach', isActive: true },
  { id: '596933aa-f52c-417f-98c0-557844cdc031', name: 'Jamie Okafor', email: 'volunteer.two@demo.eventura.invalid', role: 'VOLUNTEER', departmentName: 'Campus Security & Ushers', isActive: true },
];

function DesignationsManager({ profile, previewMode = false }: { profile: UserProfile; previewMode?: boolean }) {
  const [members, setMembers] = useState<MemberRecord[]>(initialMembers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | AppRole>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!previewMode) {
      fetch('/api/admin/members')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.members?.length) setMembers(data.members);
        })
        .catch(() => {});
    }
  }, [previewMode]);

  const handleRoleChange = async (memberId: string, newRole: AppRole) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;
    if (member.email.toLowerCase() === SOLE_ADMIN_EMAIL.toLowerCase()) {
      setFeedback('The primary administrator designation is locked to kajajhajaj369@gmail.com.');
      return;
    }

    setUpdatingId(memberId);
    try {
      if (!previewMode) {
        const res = await fetch(`/api/admin/members/${memberId}/role`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: newRole }),
        });
        if (!res.ok) {
          const err = await res.json();
          setFeedback(err.error || 'Failed to update role.');
          setUpdatingId(null);
          return;
        }
      }
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));
      setFeedback(`Designation for ${member.name} successfully updated to ${roleInfo[newRole].label}!`);
      setTimeout(() => setFeedback(null), 4000);
    } catch {
      setFeedback('Network error while updating designation.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = members.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || m.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div style={{ background: 'linear-gradient(135deg, #1f274a 0%, #2f3b70 100%)', borderRadius: '16px', padding: '24px 28px', color: '#fff', boxShadow: '0 10px 30px rgba(31,39,74,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a0aaff', fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em', marginBottom: '8px' }}>
          <ShieldCheck size={16} /> SOLE ADMINISTRATOR PRIVILEGE ENFORCED
        </div>
        <h2 style={{ fontSize: '23px', fontWeight: 800, margin: '0 0 8px 0', fontFamily: 'var(--app-font-display)' }}>
          Designation Authority: <span style={{ color: '#8898ff' }}>{SOLE_ADMIN_EMAIL}</span>
        </h2>
        <p style={{ margin: 0, fontSize: '13px', color: '#cbd3ee', maxWidth: '750px', lineHeight: 1.6 }}>
          Only <b>{SOLE_ADMIN_EMAIL}</b> holds College Administrator authority on EVENTURA. You can assign and modify designations for any person on campus below.
        </p>
      </div>

      {feedback && (
        <div style={{ padding: '12px 18px', borderRadius: '10px', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={16} /> {feedback}
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between', background: '#fff', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e9ebf2' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: '1 1 260px' }}>
          <input
            type="text"
            placeholder="Search members by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '9px 14px', borderRadius: '8px', border: '1px solid #dfe2ed', fontSize: '13px', background: '#f8f9fd', outline: 'none' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', alignItems: 'center' }}>
          {(['ALL', 'CLUB', 'ORGANIZER', 'STUDENT', 'VOLUNTEER'] as const).map(rf => (
            <button
              key={rf}
              type="button"
              onClick={() => setRoleFilter(rf)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: roleFilter === rf ? '#4f5fd3' : '#e4e7f0',
                background: roleFilter === rf ? '#eef1ff' : '#fff',
                color: roleFilter === rf ? '#4f5fd3' : '#646c86',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {rf === 'ALL' ? 'All Roles' : roleInfo[rf].label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e9ebf2', overflow: 'hidden' }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid #f0f1f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong style={{ fontSize: '14px', color: '#2d334e' }}>Campus Members ({filtered.length})</strong>
          <span style={{ fontSize: '11px', color: '#888fa6' }}>Select any role to reassign designation</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filtered.map(member => {
            const isSoleAdmin = member.email.toLowerCase() === SOLE_ADMIN_EMAIL.toLowerCase();
            return (
              <div
                key={member.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 22px',
                  borderBottom: '1px solid #f2f3f7',
                  gap: '14px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '220px', flex: '1 1 240px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: isSoleAdmin ? '#eff0ff' : '#f3f4f8',
                    color: isSoleAdmin ? '#4f5fd3' : '#575f79',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '14px',
                  }}>
                    {initials(member.name)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '13px', color: '#20263f' }}>{member.name}</strong>
                      {isSoleAdmin && (
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '50px', background: '#eef0ff', color: '#4f5fd3' }}>
                          Sole Admin
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', color: '#7c849e', marginTop: '2px' }}>
                      {member.email} {member.departmentName ? `· ${member.departmentName}` : ''}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {isSoleAdmin ? (
                    <div style={{
                      padding: '7px 14px',
                      borderRadius: '8px',
                      background: '#eff2ff',
                      color: '#4f5fd3',
                      fontSize: '12px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}>
                      <ShieldCheck size={14} /> College Admin (Primary)
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label style={{ fontSize: '11px', color: '#68708c', fontWeight: 600 }}>
                        Designation:
                      </label>
                      <select
                        value={member.role}
                        disabled={updatingId === member.id}
                        onChange={e => handleRoleChange(member.id, e.target.value as AppRole)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1px solid #d8dbe8',
                          background: '#fff',
                          color: '#2a314c',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          outline: 'none',
                        }}
                      >
                        <option value="CLUB">Club Lead</option>
                        <option value="ORGANIZER">Event Organizer</option>
                        <option value="STUDENT">Student</option>
                        <option value="VOLUNTEER">Volunteer</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RolePreviewPage() {
  const [role, setRole] = useState<AppRole>('COLLEGE_ADMIN');
  const [selectedView, setSelectedView] = useState('Overview');
  const profile = previewProfiles[role];
  const selectView = (view: string) => setSelectedView(view === 'My profile' ? 'Your profile' : view);
  let content: ReactNode;
  if (selectedView === 'Overview') {
    content = <DashboardView profile={profile} summary={previewSummaries[role]} />;
  } else if (selectedView === 'Your profile') {
    content = <PreviewProfileContent profile={profile} />;
  } else if (selectedView === 'Designations') {
    content = <DesignationsManager profile={profile} previewMode />;
  } else {
    content = <PlaceholderPage title={selectedView} role={role} onBack={() => setSelectedView('Overview')} />;
  }

  return <div className="role-preview-page" data-testid="dev-role-preview">
    <header className="role-preview-header"><div className="role-preview-copy"><span className="role-preview-kicker"><ShieldCheck size={15} /> DEVELOPMENT PREVIEW <i /> SAMPLE DATA</span><p>Switch roles to inspect each dashboard shell. This does not change your account or grant API access.</p></div><div className="role-preview-actions"><div className="role-preview-switcher" aria-label="Choose a sample role">{roleOrder.map(roleKey => <button type="button" key={roleKey} className={`role-preview-tab ${role === roleKey ? 'role-preview-tab-active' : ''}`} aria-pressed={role === roleKey} onClick={() => { setRole(roleKey); setSelectedView('Overview'); }} data-testid={`preview-role-${roleInfo[roleKey].slug}`}>{roleInfo[roleKey].label}</button>)}</div><Link href="/" className="role-preview-exit" data-testid="link-exit-role-preview">Exit preview <ArrowUpRight size={14} /></Link></div></header>
    <WorkspaceFrame profile={profile} title={selectedView} crumb={roleInfo[role].label.toUpperCase()} previewMode onPreviewNavigate={selectView}>{content}</WorkspaceFrame>
  </div>;
}

function WorkspaceRoute({ role }: { role: AppRole }) {
  return <ProtectedRole role={role} />;
}

function AppRoutes() {
  return <RoutedErrorBoundary><Switch>
    <Route path="/" component={HomeRedirect} />
    <Route path="/sign-in/*?" component={SignInPage} />
    <Route path="/sign-up/*?" component={SignUpPage} />
    <Route path="/portal" component={PortalPage} />
    <Route path="/profile" component={ProfilePage} />
    <Route path="/preview" component={RolePreviewPage} />
    <Route path="/dev/role-preview" component={RolePreviewPage} />
    <Route path="/admin/:module?" component={() => <WorkspaceRoute role="COLLEGE_ADMIN" />} />
    <Route path="/club/:module?" component={() => <WorkspaceRoute role="CLUB" />} />
    <Route path="/organizer/:module?" component={() => <WorkspaceRoute role="ORGANIZER" />} />
    <Route path="/student/:module?" component={() => <WorkspaceRoute role="STUDENT" />} />
    <Route path="/volunteer/:module?" component={() => <WorkspaceRoute role="VOLUNTEER" />} />
    <Route component={NotFoundPage} />
  </Switch></RoutedErrorBoundary>;
}

function stripBase(path: string) {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path;
}

function ClerkProviderWithRouter() {
  const [, setLocation] = useLocation();
  return <ClerkProvider
    publishableKey={clerkPubKey}
    proxyUrl={import.meta.env.PROD ? (import.meta.env.VITE_CLERK_PROXY_URL || undefined) : undefined}
    appearance={clerkAppearance}
    signInUrl={basePath + '/sign-in'}
    signUpUrl={basePath + '/sign-up'}
    localization={{
      signIn: { start: { title: 'Welcome back', subtitle: 'Sign in to return to your campus workspace.' } },
      signUp: { start: { title: 'Join your campus', subtitle: 'Create your EVENTURA workspace account.' } },
    }}
    routerPush={(to) => setLocation(stripBase(to))}
    routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
  >
    <QueryClientProvider client={queryClient}>
      <TooltipProvider><CacheUserInvalidator /><AppRoutes /><Toaster /></TooltipProvider>
    </QueryClientProvider>
  </ClerkProvider>;
}

function ClerkRouter() {
  return <WouterRouter base={basePath}>
    <ClerkProviderWithRouter />
  </WouterRouter>;
}

function App() {
  return <ClerkRouter />;
}

function NotFoundPage() {
  return <main className="not-found-page"><Brand /><div className="not-found-content"><span className="eyebrow">404 / PAGE NOT FOUND</span><h1 className="font-display">Looks like this<br /><span>isn't your room.</span></h1><p>The page may have moved, or it may not belong to this campus workspace.</p><Link href="/" className="button button-primary" data-testid="link-not-found-home">Back to EVENTURA <ArrowRight size={15} /></Link></div><span className="not-found-code">E / 404</span></main>;
}

function slugify(value: string) { return value.toLowerCase().replace(/\s+/g, '-'); }
function initials(value: string) { return value.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase() ?? '').join('') || 'EV'; }
function humanize(value: string) { return value.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, character => character.toUpperCase()); }
function formatMetric(value: number) { return new Intl.NumberFormat('en', { notation: Math.abs(value) >= 10000 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(value); }
function formatRelative(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  const hours = Math.floor((Date.now() - date.getTime()) / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'Yesterday' : `${days} days ago`;
}

export default App;