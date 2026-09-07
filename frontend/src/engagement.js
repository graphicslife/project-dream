// Engagement tracking snippet for all pages
(function() {
  function getMeta(name) {
    var el = document.querySelector('meta[name="' + name + '"]');
    return el ? el.content : '';
  }
  var apiBase = window.DREAM_API || (
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:3000'
      : window.location.origin
  );
  var engagementId = null;
  var start = Date.now();
  var interacted = false;
  var scrolled = 0;
  function sendEngagementStart() {
    try {
      fetch(apiBase + '/api/engagement', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({
          page_url: window.location.pathname,
          page_title: document.title,
          referrer: document.referrer
        })
      })
      .then(r => r.json())
      .then(data => { if (data && data.engagement_id) engagementId = data.engagement_id; })
      .catch(() => {});
    } catch (e) {}
  }
  function sendEngagementEnd() {
    if (!engagementId) return;
    var timeSpent = Math.round((Date.now() - start) / 1000);
    try {
      fetch(apiBase + '/api/engagement/' + engagementId, {
        method: 'PATCH',
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({
          time_spent_seconds: timeSpent,
          scrolled_percent: scrolled,
          interacted: interacted
        })
      }).catch(() => {});
    } catch (e) {}
  }
  window.addEventListener('DOMContentLoaded', sendEngagementStart);
  window.addEventListener('beforeunload', sendEngagementEnd);
  window.addEventListener('scroll', function() {
    var doc = document.documentElement;
    var percent = 100 * (window.scrollY + window.innerHeight) / doc.scrollHeight;
    scrolled = Math.max(scrolled, Math.round(percent));
  });
  ['click','keydown','touchstart'].forEach(function(evt) {
    window.addEventListener(evt, function() { interacted = true; }, { once: true });
  });
})();
