// scripts/auth.js
/* ZipZapZoi Universal Auth System — auth.js */

(function () {
  function getUser() {
    try {
      if (window.ZZZDataManager && window.ZZZDataManager.getCurrentUser) {
        return window.ZZZDataManager.getCurrentUser();
      }
      const raw =
        sessionStorage.getItem('zzz_user') ||
        localStorage.getItem('zzz_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  // Global helper to require login
  window.requireLogin = function (action) {
    const user = getUser();
    if (!user) {
      alert('Please log in or sign up to continue.');
      location.href = 'Login-Page.html';
      return false;
    }
    return true;
  };

  document.addEventListener('DOMContentLoaded', function () {
    const user = getUser();
    const showEls = document.querySelectorAll('[data-auth-show]');
    const hideEls = document.querySelectorAll('[data-auth-hide]');

    if (user) {
      hideEls.forEach(el => el.classList.add('hidden'));
      showEls.forEach(el => el.classList.remove('hidden'));

      const nameSpan = document.getElementById('zzzUserName');
      if (nameSpan && user.name) nameSpan.textContent = user.name;
    } else {
      hideEls.forEach(el => el.classList.remove('hidden'));
      showEls.forEach(el => el.classList.add('hidden'));
    }

    // Logout button in header
    const logoutBtn = document.getElementById('zzzLogoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (window.ZZZDataManager && window.ZZZDataManager.setCurrentUser) {
          window.ZZZDataManager.setCurrentUser(null);
        }
        sessionStorage.removeItem('zzz_user');
        localStorage.removeItem('zzz_user');
        window.location.href = 'index.html';
      });
    }
  });
})();
