(function () {
  async function initClerk() {
    if (!window.Clerk || !window.CLERK_AUTH_CONFIG) return;

    var config = window.CLERK_AUTH_CONFIG;

    await window.Clerk.load({
      publishableKey: config.publishableKey,
      signInUrl: config.signInUrl,
      signUpUrl: config.signUpUrl,
      afterSignInUrl: config.afterSignInUrl,
      afterSignUpUrl: config.afterSignUpUrl,
    });

    window.handleClerkAuthClick = function () {
      if (window.Clerk.user) {
        window.Clerk.signOut();
        return;
      }
      window.Clerk.redirectToSignIn({ redirectUrl: window.location.href });
    };

    var authButtons = document.querySelector('.clerk-auth-buttons');
    var userMenu = document.querySelector('.clerk-user-menu');
    var mountEl = document.getElementById('clerk-user-btn-mount');

    if (!authButtons) return;

    function updateUI() {
      var label = document.getElementById('mobile-auth-label');
      if (window.Clerk.user) {
        authButtons.style.display = 'none';
        if (userMenu) userMenu.style.display = 'flex';
        if (mountEl && !mountEl.hasChildNodes()) {
          window.Clerk.mountUserButton(mountEl);
        }
        if (label) label.textContent = 'Sign Out';
      } else {
        authButtons.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
        if (label) label.textContent = 'Login / Sign Up';
      }
    }

    window.Clerk.addListener(updateUI);
    updateUI();

    var loginBtn = document.getElementById('clerk-login');
    if (loginBtn) {
      loginBtn.addEventListener('click', window.handleClerkAuthClick);
    }

    var signOutBtn = document.getElementById('clerk-sign-out');
    if (signOutBtn) {
      signOutBtn.addEventListener('click', async function () {
        await window.Clerk.signOut();
      });
    }
  }

  initClerk();
})();
