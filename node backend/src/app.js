document.addEventListener('DOMContentLoaded', function () {
  // Mobile nav toggle
  var navToggle = document.getElementById('nav-toggle');
  var mobileMenu = document.getElementById('mobile-menu');
  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Auth forms cloning for mobile tabs
  var loginForm = document.getElementById('login-form');
  var registerForm = document.getElementById('register-form');
  var mobileForms = document.getElementById('mobile-forms');
  var tabLogin = document.getElementById('tab-login');
  var tabRegister = document.getElementById('tab-register');

  function sanitizeFormClone(form) {
    // Remove ids from cloned form to avoid duplicates and wire a submit handler
    var f = form.cloneNode(true);
    f.id = '';
    f.querySelectorAll('[id]').forEach(function (el) {
      el.removeAttribute('id');
    });
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      // Very small demo behavior: show an alert
      var title = f.querySelector('button[type="submit"]')?.textContent || 'Submit';
      alert(title.trim() + ' clicked (demo)');
    });
    return f;
  }

  function showMobile(type) {
    if (!mobileForms) return;
    mobileForms.innerHTML = '';
    if (type === 'login' && loginForm) {
      mobileForms.appendChild(sanitizeFormClone(loginForm));
      tabLogin.classList.add('bg-primary', 'text-white');
      tabLogin.classList.remove('bg-gray-100', 'text-gray-700');
      tabRegister.classList.remove('bg-primary', 'text-white');
      tabRegister.classList.add('bg-gray-100', 'text-gray-700');
    } else if (type === 'register' && registerForm) {
      mobileForms.appendChild(sanitizeFormClone(registerForm));
      tabRegister.classList.add('bg-primary', 'text-white');
      tabRegister.classList.remove('bg-gray-100', 'text-gray-700');
      tabLogin.classList.remove('bg-primary', 'text-white');
      tabLogin.classList.add('bg-gray-100', 'text-gray-700');
    }
  }

  // Initialize mobile view to login if visible
  if (mobileForms && tabLogin && tabRegister) {
    showMobile('login');
    tabLogin.addEventListener('click', function () { showMobile('login'); });
    tabRegister.addEventListener('click', function () { showMobile('register'); });
  }

  // Prevent default submit on desktop forms (demo behavior)
  [loginForm, registerForm].forEach(function (f) {
    if (!f) return;
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var btn = f.querySelector('button[type="submit"]');
      if (btn) alert((btn.textContent || 'Submit').trim() + ' clicked (demo)');
    });
  });
});

module.exports = appData;
