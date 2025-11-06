// scripts/logout.js
(function(){
  function doLogout(){
    try {
      sessionStorage.removeItem('zzz_user');
      localStorage.removeItem('zzz_user');
      // fallback redirect location
      window.location.href = 'Login Page.html';
    } catch(err){
      console.error('Logout failed:', err);
    }
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    document.querySelectorAll('#logoutBtn, #sidebarLogout, [data-action="logout"]').forEach(el=>{
      el.addEventListener('click', doLogout);
    });
  });

  window.ZipZapLogout = { logout: doLogout };
})();
