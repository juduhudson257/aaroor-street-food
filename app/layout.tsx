import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import AuthNav from './components/AuthNav';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Divine Voice | Pure Spiritual Journey, Puja & homams',
  description: 'Discover peace and purpose with authentic puja products, online homam services, temple prasadham, and community food donations at The Divine Voice.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider
          signInUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL}
          signUpUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL}
          signInFallbackRedirectUrl={process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL}
          signUpFallbackRedirectUrl={process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL}
        >
          <header className="header-container" style={{ padding: '20px 0', background: 'rgba(250, 248, 245, 0.95)' }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <a href="/" className="brand-wrapper">
                <img src="/divine-logo.png" alt="The Divine Voice" className="header-logo-img" />
              </a>
              <AuthNav />
            </div>
          </header>
          <main style={{ paddingTop: '120px' }}>{children}</main>
        </ClerkProvider>
      </body>
    </html>
  );
}
