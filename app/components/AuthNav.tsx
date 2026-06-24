'use client';

import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';

export default function AuthNav() {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <Show when='signed-out'>
        <SignInButton>
          <button className='primary-btn'>Sign In</button>
        </SignInButton>
        <SignUpButton>
          <button className='secondary-btn'>Sign Up</button>
        </SignUpButton>
      </Show>
      <Show when='signed-in'>
        <UserButton />
      </Show>
    </div>
  );
}
