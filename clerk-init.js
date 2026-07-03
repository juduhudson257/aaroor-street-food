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

    // Intercept clicks to external sites or purchase actions
    document.addEventListener('click', function(e) {
      var target = e.target.closest('a') || e.target.closest('button');
      if (!target) return;

      var isExternal = false;
      var isPurchase = false;

      // Check for external links
      if (target.tagName === 'A' && target.href) {
        try {
          var url = new URL(target.href);
          if (url.hostname && url.hostname !== window.location.hostname && !target.href.startsWith('javascript:')) {
            isExternal = true;
          }
        } catch(err) {}
      }

      // Check for purchase/book keywords in text or id/class
      var text = (target.textContent || '').toLowerCase();
      var id = (target.id || '').toLowerCase();
      var className = (target.className || '').toLowerCase();
      
      var purchaseKeywords = ['purchase', 'buy', 'checkout', 'book homam', 'book now', 'add to cart'];
      var isMatch = purchaseKeywords.some(function(keyword) {
         return text.includes(keyword) || id.includes('checkout') || className.includes('checkout');
      });

      if (isMatch) {
        isPurchase = true;
      }

      // Check for specific onclick attributes that act as external/purchase
      var onclickAttr = target.getAttribute('onclick') || '';
      if (onclickAttr.includes('window.open') || onclickAttr.includes('whatsappUrl')) {
          isExternal = true;
      }

      if (isExternal || isPurchase) {
        if (!window.Clerk || !window.Clerk.user) {
          e.preventDefault();
          e.stopPropagation();
          if (window.appState && window.appState.showToast) {
              window.appState.showToast('Please login to continue.', 'info');
          }
          window.Clerk.redirectToSignIn({ redirectUrl: window.location.href });
        }
      }
    }, true); // use capture phase to intercept before inline handlers
  }

  initClerk();
})();
