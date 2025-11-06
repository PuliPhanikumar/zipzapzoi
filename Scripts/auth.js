// scripts/auth.js
/* ZipZapZoi Universal Auth System — auth.js */
/* Place in scripts/auth.js */
(function(){
  const STORAGE_KEY = "zzz_user";
  const navArea = document.getElementById("navAuthArea");

  function getUser(){
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY) || "null");
    } catch(e){
      console.warn("Auth parse error", e);
      return null;
    }
  }

  function setUser(user){
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  function logoutUser(){
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }

  window.requireLogin = function(action){
    const user = getUser();
    if(!user){
      alert("Please log in or sign up to continue.");
      location.href = "Login Page.html";
      return false;
    }
    return true;
  }

  if(navArea){
    const user = getUser();
    if(user){
      navArea.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center text-primary font-bold uppercase">${(user.email||user.name||'U').charAt(0).toUpperCase()}</div>
          <div class="flex flex-col leading-tight">
            <p class="font-semibold">${(user.email||user.name||'User').split('@')[0]}</p>
            <button id="logoutBtn" class="text-sm text-red-500">Logout</button>
          </div>
        </div>
      `;
      const lb = document.getElementById("logoutBtn");
      if(lb) lb.addEventListener("click", logoutUser);
    } else {
      navArea.innerHTML = `
        <a href="Login Page.html" class="px-4 py-2 text-sm font-semibold">Log In</a>
        <a href="User Registration.html" class="px-5 py-2 bg-primary text-white rounded-full font-bold">Sign Up</a>
      `;
    }
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  if(saved && !sessionStorage.getItem(STORAGE_KEY)){
    sessionStorage.setItem(STORAGE_KEY, saved);
  }

  window.ZipZapAuth = { getUser, setUser, logoutUser };
})();
