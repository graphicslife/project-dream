(function () {
  function toggleMobileMenu() {
    const toggle = document.getElementById('nav-toggle');
    const menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', function () {
      const isVisible = !menu.classList.contains('hidden');
      menu.classList.toggle('hidden', isVisible);
    });
  }

  function toggleSiteMenu() {
    const toggle = document.getElementById('menu-toggle');
    const close = document.getElementById('menu-close');
    const menu = document.getElementById('site-menu');
    const overlay = document.getElementById('menu-overlay');
    if (!toggle || !close || !menu || !overlay) return;

    function setMenuOpen(isOpen) {
      menu.classList.toggle('is-open', isOpen);
      overlay.classList.toggle('is-open', isOpen);
      menu.setAttribute('aria-hidden', String(!isOpen));
      toggle.setAttribute('aria-expanded', String(isOpen));
      document.body.classList.toggle('overflow-hidden', isOpen);
      if (isOpen) close.focus();
      else toggle.focus();
    }

    toggle.addEventListener('click', function () {
      setMenuOpen(!menu.classList.contains('is-open'));
    });
    close.addEventListener('click', function () { setMenuOpen(false); });
    overlay.addEventListener('click', function () { setMenuOpen(false); });
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setMenuOpen(false); });
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menu.classList.contains('is-open')) setMenuOpen(false);
    });
  }

  function bindMenuPreferences() {
    const languageButton = document.getElementById('menu-language');
    const contrastButton = document.getElementById('menu-contrast');
    const motionButton = document.getElementById('menu-motion');
    const languageValue = document.getElementById('menu-language-value');
    const contrastValue = document.getElementById('menu-contrast-value');
    const motionValue = document.getElementById('menu-motion-value');
    if (!languageButton || !contrastButton || !motionButton || !languageValue || !contrastValue || !motionValue) return;

    const settings = JSON.parse(localStorage.getItem('dream_preferences') || '{}');
    let language = settings.language || 'English';
    let contrast = settings.contrast || 'Light';
    let motion = settings.motion || 'Standard';

    function renderPreferences() {
      languageValue.textContent = language;
      contrastValue.textContent = contrast;
      motionValue.textContent = motion;
      document.documentElement.lang = language === 'Swahili' ? 'sw' : 'en';
      document.body.classList.toggle('dream-high-contrast', contrast === 'High contrast');
      document.body.classList.toggle('dream-reduced-motion', motion === 'Reduced');
      localStorage.setItem('dream_preferences', JSON.stringify({ language, contrast, motion }));
    }

    languageButton.addEventListener('click', function () {
      language = language === 'English' ? 'Swahili' : 'English';
      renderPreferences();
    });
    contrastButton.addEventListener('click', function () {
      contrast = contrast === 'Light' ? 'High contrast' : 'Light';
      renderPreferences();
    });
    motionButton.addEventListener('click', function () {
      motion = motion === 'Standard' ? 'Reduced' : 'Standard';
      renderPreferences();
    });
    renderPreferences();
  }

  function bindLogoutButtons() {
    document.querySelectorAll('[data-logout]').forEach(function (button) {
      button.addEventListener('click', function () {
        localStorage.removeItem('dream_user');
        window.location.href = 'login.html';
      });
    });
  }

  function bindFreshPageNavigation() {
    document.addEventListener('click', function (event) {
      const link = event.target.closest('a');
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return;

      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin || destination.pathname === window.location.pathname || destination.hash) return;

      destination.searchParams.set('_nav', Date.now().toString());
      link.href = destination.href;
    }, true);
  }

  function refreshRestoredPage() {
    if (!window.performance || !performance.getEntriesByType) return;

    const navigation = performance.getEntriesByType('navigation')[0];
    if (!navigation || navigation.type !== 'back_forward') return;

    const refreshKey = 'dream-refresh-' + window.location.pathname;
    if (sessionStorage.getItem(refreshKey)) {
      sessionStorage.removeItem(refreshKey);
      return;
    }

    sessionStorage.setItem(refreshKey, '1');
    window.location.reload();
  }

  document.addEventListener('DOMContentLoaded', function () {
    toggleMobileMenu();
    toggleSiteMenu();
    bindMenuPreferences();
    bindLogoutButtons();
    bindFreshPageNavigation();
    refreshRestoredPage();
  });
})();
