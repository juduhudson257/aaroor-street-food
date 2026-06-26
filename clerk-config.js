(function () {
  var publishableKey =
    'pk_test_ZnJlZS10aHJ1c2gtNDYuY2xlcmsuYWNjb3VudHMuZGV2JA';

  var origin =
    typeof window !== 'undefined' && window.location && window.location.origin
      ? window.location.origin
      : 'https://aaroor-street-food.vercel.app';

  function clerkAccountsOrigin(key) {
    var encoded = key.replace(/^pk_(test|live)_/, '');
    var decoded = atob(encoded);
    var instance = decoded.split('.clerk.accounts.dev')[0];
    return 'https://' + instance + '.accounts.dev';
  }

  var accountsOrigin = clerkAccountsOrigin(publishableKey);

  window.CLERK_PUBLISHABLE_KEY = publishableKey;

  window.CLERK_AUTH_CONFIG = {
    publishableKey: publishableKey,
    signInUrl: accountsOrigin + '/sign-in',
    signUpUrl: accountsOrigin + '/sign-up',
    afterSignInUrl: origin + '/',
    afterSignUpUrl: origin + '/',
  };

  window.__clerk_publishable_key = publishableKey;
})();
