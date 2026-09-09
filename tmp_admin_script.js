document.addEventListener('DOMContentLoaded', function () {
  const API = window.DREAM_API;
  const user = JSON.parse(localStorage.getItem('dream_user') || '{}');
  function apiFetch(url, opts = {}) {
    opts.headers = opts.headers || {};
    opts.headers['Content-Type'] = 'application/json';
    opts.credentials = 'include'; // Ensure cookies/session sent
    return fetch(API + url, opts).then(r => r.json());
  }

  // --- Logout Functionality ---
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async function () {
      try {
        await apiFetch('/api/logout', { method: 'POST' });
      } catch (e) {}
      localStorage.removeItem('dream_user');
      window.location.href = 'login.html';
    });
  }

  // --- Programs Management ---
  async function loadPrograms() {
    const container = document.getElementById('program-list');
    if (!container) {
      console.warn('program-list not found on this page');
      return;
    }
    container.innerHTML = '<div class="text-gray-400">Loading...</div>';
    try {
      const programs = await apiFetch('/api/programs'); // Fetch programs
      if (programs && programs.error && programs.error.toLowerCase().includes('admin access')) {
        container.innerHTML = `<div class='text-red-500'>Access denied: You do not have admin privileges.</div>`;
        return;
      }
      container.innerHTML = '';
      if (!programs.length) {
        container.innerHTML = '<div class="text-gray-400">No programs found.</div>';
        return;
      }
      (programs || []).forEach(p => {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between border-b pb-2';
        div.innerHTML = `
          <div class="flex items-center space-x-3">
            <img src="${p.image_url || 'assets/IMG_0076.jpg'}" alt="Program Image" class="w-12 h-12 rounded object-cover border" />
            <span class="font-medium">${p.title}</span>
            <span class="ml-2 text-xs text-gray-500">${p.status}</span>
          </div>
          <div class="space-x-2">
            <button class="px-2 py-1 bg-primary text-white rounded-md text-xs hover:bg-primary-dark" data-edit-program="${p.id}">Edit</button>
            <button class="px-2 py-1 bg-red-500 text-white rounded-md text-xs hover:bg-red-600" data-delete-program="${p.id}">Delete</button>
          </div>
        `;
        container.appendChild(div);
      });
      // Edit button
      container.querySelectorAll('button[data-edit-program]').forEach(btn => {
        btn.addEventListener('click', function() {
          const id = btn.getAttribute('data-edit-program');
          showEditProgramModal(id);
        });
      });
      // Delete button
      container.querySelectorAll('button[data-delete-program]').forEach(btn => {
        btn.addEventListener('click', async function() {
          const id = btn.getAttribute('data-delete-program');
          await apiFetch(`/api/programs/${id}`, {method:'DELETE'});
          loadPrograms();
        });
      });
    } catch (err) {
      container.innerHTML = `<div class="text-red-500">Failed to load programs.</div>`;
    }
  }

  // Add Program
const addProgramModal = document.getElementById('add-program-modal');
const addProgramForm = document.getElementById('addProgramForm');
if (addProgramForm) {
  addProgramForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(addProgramForm);
    const fileInput = addProgramForm.querySelector('input[type="file"][name="image"]');
    if (!fileInput || !fileInput.files[0]) {
      alert('Please select an image file.');
      return;
    }
    formData.append('image', fileInput.files[0]);
    try {
      const res = await fetch(`${API}/api/programs`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to add program');
      addProgramForm.reset();
      if (addProgramModal) addProgramModal.style.display = 'none';
      loadPrograms();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  });
} else {
  console.warn('addProgramForm not found in DOM');
}
  // Edit Program Modal logic
  function showEditProgramModal(id) {
    apiFetch(`/api/programs/${id}`).then(p => {
      const modal = document.getElementById('edit-program-modal');
      if (!modal) {
        console.warn('edit-program-modal not found on this page');
        return;
      }
      modal.style.display = 'block';
      modal.querySelector('input[type="text"]').value = p.title;
      modal.querySelector('select').value = p.status;
      // Image upload is now handled
      modal.querySelector('img').src = p.image_url || 'assets/program1.jpg';
      modal.dataset.programId = id;
    });
  }
  const editProgramForm = document.querySelector('#edit-program-modal form');
  if (editProgramForm) {
    editProgramForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const form = e.target;
      const id = form.dataset.id;
      const formData = new FormData(form);
      const fileInput = form.querySelector('input[type="file"][name="image"]');
      if (fileInput && fileInput.files[0]) {
        formData.append('image', fileInput.files[0]);
      } else {
        formData.delete('image');
      }
      try {
        const res = await fetch(`${API}/api/programs/${id}`, {
          method: 'PUT',
          body: formData,
          credentials: 'include'
        });
        if (!res.ok) throw new Error('Failed to update program');
        form.reset();
        document.getElementById('edit-program-modal').classList.add('hidden');
        loadPrograms();
      } catch (err) {
        alert('Error: ' + err.message);
      }
    });
  } else {
    console.warn('edit-program-modal form not found on this page');
  }

  // --- Gallery Management ---
  async function loadGallery() {
    const container = document.getElementById('gallery-list');
    if (!container) {
      console.warn('gallery-list not found on this page');
      return;
    }
    container.innerHTML = '<div class="text-gray-400">Loading...</div>';
    try {
      const images = await apiFetch('/api/gallery');
      if (images && images.error && images.error.toLowerCase().includes('admin access')) {
        container.innerHTML = `<div class='text-red-500'>Access denied: You do not have admin privileges.</div>`;
        return;
      }
      container.innerHTML = '';
      if (!images.length) {
        container.innerHTML = '<div class="text-gray-400">No images found.</div>';
        return;
      }
      (images || []).forEach(img => {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between border-b pb-2';
        div.innerHTML = `
          <div class="flex items-center space-x-2">
            <img src="${img.image_url || 'assets/IMG_0083.jpg'}" alt="Gallery" class="w-10 h-10 rounded object-cover border" />
            <span class="font-medium">${img.caption || ''}</span>
          </div>
          <div class="space-x-2">
          <button class="px-2 py-1 bg-primary text-white rounded-md text-xs hover:bg-primary-dark" data-edit-image="${img.id}">Edit</button>
          <button class="px-2 py-1 bg-red-500 text-white rounded-md text-xs hover:bg-red-600" data-delete-image="${img.id}">Delete</button>
        </div>
      `;
      container.appendChild(div);
    });
    // Edit button
    container.querySelectorAll('button[data-edit-image]').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = btn.getAttribute('data-edit-image');
        showEditImageModal(id);
      });
    });
  // Delete button
  container.querySelectorAll('button[data-delete-image]').forEach(btn => {
    btn.addEventListener('click', async function() {
      const id = btn.getAttribute('data-delete-image');
      await apiFetch(`/api/gallery/${id}`, {method:'DELETE'});
      loadGallery();
    });
  });
  } catch (err) {
    container.innerHTML = `<div class="text-red-500">Failed to load gallery.</div>`;
  }
}

// Add Image
const addImageForm = document.getElementById('addImageForm');
if (addImageForm) {
  addImageForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(addImageForm);
    const fileInput = addImageForm.querySelector('input[type="file"][name="image"]');
    if (!fileInput || !fileInput.files[0]) {
      alert('Please select an image file.');
      return;
    }
    formData.append('image', fileInput.files[0]);
    try {
      const res = await fetch(`${API}/api/gallery`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to add image');
      addImageForm.reset();
      const addImageModal = document.getElementById('add-image-modal');
      if (addImageModal) addImageModal.style.display = 'none';
      loadGallery();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  });
} else {
  console.warn('addImageForm not found in DOM');
}

// Edit Image Modal logic
function showEditImageModal(id) {
  apiFetch(`/api/gallery/${id}`).then(img => {
    const modal = document.getElementById('edit-image-modal');
    if (!modal) return;
    modal.style.display = 'block';
    modal.dataset.imageId = id;
    const captionInput = modal.querySelector('input[type="text"]');
    const previewImage = modal.querySelector('img');
    if (captionInput) captionInput.value = img.caption || '';
    if (previewImage) previewImage.src = img.image_url || 'assets/sample.jpg';
  });
}

const editImageForm = document.querySelector('#edit-image-modal form');
if (editImageForm) {
  editImageForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const modal = document.getElementById('edit-image-modal');
    const id = modal && modal.dataset.imageId;
    if (!id) return;

    const form = e.target;
    const formData = new FormData(form);
    const fileInput = form.querySelector('input[type="file"][name="image"]');
    if (fileInput && fileInput.files[0]) {
      formData.append('image', fileInput.files[0]);
    }

    try {
      const res = await fetch(`${API}/api/gallery/${id}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to update image');
      form.reset();
      if (modal) modal.style.display = 'none';
      loadGallery();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  });
}
}

// --- Top-Level Pending Members ---
async function loadPendingMembers() {
  const container = document.getElementById('pending-members');
  container.innerHTML = '<div class="text-gray-400">Loading...</div>';
  try {
    const all = await apiFetch('/api/admin/users');
    if (all && all.error && all.error.toLowerCase().includes('admin access')) {
      container.innerHTML = `<div class='text-red-500'>Access denied: You do not have admin privileges.</div>`;
      return;
    }
    container.innerHTML = '';
    const pending = (all || []).filter(u => u.status !== 'approved');
    if (!pending.length) {
      container.innerHTML = '<div class="text-gray-400">No pending members.</div>';
      return;
    }
    pending.forEach(u => {
      const div = document.createElement('div');
      div.className = 'flex items-center justify-between border-b pb-2';
      div.innerHTML = `
        <div>
          <span class="font-medium">${u.username}</span>
          <span class="ml-2 text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">${u.role || 'Pending'}</span>
          <span class="ml-2 text-xs text-gray-500">${u.email}</span>
        </div>
        <div class="space-x-2">
          <select class="px-2 py-1 rounded text-xs border" data-role-select="${u.id}">
            <option value="member">Member</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
          <button class="px-3 py-1 bg-primary text-white rounded-md text-xs font-medium hover:bg-primary-dark" data-approve="${u.id}">Approve</button>
          <button class="px-3 py-1 bg-green-500 text-white rounded-md text-xs font-medium hover:bg-green-600" data-reject="${u.id}">Reject</button>
        </div>
      `;
      container.appendChild(div);
    });
    container.querySelectorAll('button[data-approve]').forEach(btn => {
      btn.addEventListener('click', async function() {
        const id = btn.getAttribute('data-approve');
        const roleSelect = container.querySelector(`select[data-role-select="${id}"]`);
        const selectedRole = roleSelect ? roleSelect.value : 'member';
        await apiFetch(`/api/admin/users/${id}/approve`, {method:'PUT', body:JSON.stringify({role:selectedRole, status:'approved'})});
        loadPendingMembers();
        loadMembers();
      });
    });
    container.querySelectorAll('button[data-reject]').forEach(btn => {
      btn.addEventListener('click', async function() {
        const id = btn.getAttribute('data-reject');
        await apiFetch(`/api/admin/users/${id}`, {method:'DELETE'});
        loadPendingMembers();
        loadMembers();
      });
    });
  } catch (err) {
    container.innerHTML = `<div class="text-red-500">Failed to load pending members.</div>`;
  }
}

// --- Approved Members Table ---
async function loadMembers() {
  const tbody = document.getElementById('members-table-body');
  tbody.innerHTML = '<tr><td colspan="5" class="text-gray-400 py-4 text-center">Loading...</td></tr>';
  try {
    const all = await apiFetch('/api/admin/users');
    if (all && all.error && all.error.toLowerCase().includes('admin access')) {
      tbody.innerHTML = `<tr><td colspan="5" class='text-red-500 py-4 text-center'>Access denied: You do not have admin privileges.</td></tr>`;
      return;
    }
    tbody.innerHTML = '';
    const approved = (all || []).filter(u => u.status === 'approved');
    if (!approved.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-gray-400 py-4 text-center">No approved members.</td></tr>';
      return;
    }
    approved.forEach(u => {
      const tr = document.createElement('tr');
      tr.className = 'border-b';
      tr.innerHTML = `
        <td class="py-3 px-4">${u.username}</td>
        <td class="py-3 px-4">${u.email}</td>
        <td class="py-3 px-4">
          <span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">${u.status}</span>
        </td>
        <td class="py-3 px-4">
          <span>${u.role}</span>
          <select class="ml-2 px-2 py-1 rounded text-xs border" data-role-change="${u.id}">
            <option value="member" ${u.role==='member'?'selected':''}>Member</option>
            <option value="admin" ${u.role==='admin'?'selected':''}>Admin</option>
            <option value="super_admin" ${u.role==='super_admin'?'selected':''}>Super Admin</option>
          </select>
          <button class="ml-2 px-2 py-1 bg-primary text-white rounded-md text-xs font-medium hover:bg-primary-dark" data-promote="${u.id}">Change Role</button>
        </td>
        <td class="py-3 px-4 text-right space-x-2">
          <button class="px-3 py-1 bg-green-500 text-white rounded-md text-xs font-medium hover:bg-green-600" data-reject="${u.id}">Remove</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
    tbody.querySelectorAll('button[data-reject]').forEach(btn => {
      btn.addEventListener('click', async function() {
        const id = btn.getAttribute('data-reject');
        await apiFetch(`/api/admin/users/${id}`, {method:'DELETE'});
        loadMembers();
      });
    });
    tbody.querySelectorAll('button[data-promote]').forEach(btn => {
      btn.addEventListener('click', async function() {
        const id = btn.getAttribute('data-promote');
        const roleSelect = tbody.querySelector(`select[data-role-change="${id}"]`);
        const selectedRole = roleSelect ? roleSelect.value : 'member';
        await apiFetch(`/api/admin/users/${id}/approve`, {method:'PUT', body:JSON.stringify({role:selectedRole, status:'approved'})});
        loadMembers();
      });
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-red-500 py-4 text-center">Failed to load members.</td></tr>`;
  }
}

// --- Member Search ---
const memberSearchForm = document.getElementById('member-search-form');
const memberSearchInput = document.getElementById('member-search-input');
const memberSearchResult = document.getElementById('member-search-result');
if (memberSearchForm && memberSearchInput && memberSearchResult) {
  memberSearchForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    memberSearchResult.innerHTML = '';
    const query = memberSearchInput.value.trim().toLowerCase();
    if (!query) {
      memberSearchResult.innerHTML = '<div class="text-gray-500">Type a name or email to search.</div>';
      return;
    }
    memberSearchResult.innerHTML = '<div class="text-gray-500">Searching...</div>';
    try {
      const res = await apiFetch('/api/admin/users');
      if (!Array.isArray(res)) {
        memberSearchResult.innerHTML = '<div class="text-red-500">Search is unavailable right now. Please sign in as an admin.</div>';
        return;
      }
      const users = res || [];
      const normalizedQuery = query.trim();
      const found = users.filter(u => {
        if (!u || u.status !== 'approved') return false;
        const matchesName = u.username && u.username.toLowerCase().includes(normalizedQuery);
        const matchesEmail = u.email && u.email.toLowerCase().includes(normalizedQuery);
        return matchesName || matchesEmail;
      });
      if (!found.length) {
        memberSearchResult.innerHTML = '<div class="text-red-500">No user found.</div>';
        return;
      }
      memberSearchResult.innerHTML = found.map(foundUser => `
        <div class="bg-gray-50 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="flex-1">
            <div class="font-bold text-lg text-primary mb-1">${foundUser.username}</div>
            <div class="text-sm text-gray-600 mb-1">${foundUser.email}</div>
            <div class="text-xs text-gray-500 mb-2">Status: <span class="font-semibold">${foundUser.status}</span></div>
            <div class="text-xs text-gray-500 mb-2">Role: <span class="font-semibold">${foundUser.role}</span></div>
          </div>
          <div class="flex gap-3">
            <button data-remove-user="${foundUser.id}" class="px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600">Remove</button>
          </div>
        </div>
      `).join('');
      document.querySelectorAll('[data-remove-user]').forEach(removeBtn => {
        removeBtn.addEventListener('click', async function() {
          const id = removeBtn.getAttribute('data-remove-user');
          await apiFetch(`/api/admin/users/${id}`, {method:'DELETE'});
          memberSearchResult.innerHTML += '<div class="text-red-500 mt-2">User removed!</div>';
          loadMembers();
        });
      });
    } catch (err) {
      memberSearchResult.innerHTML = `<div class="text-red-500">Search failed: ${err.message}</div>`;
    }
  });
}

// --- Admin Logs ---
async function loadAdminLogs() {
  const container = document.getElementById('admin-logs');
  container.innerHTML = '<div class="text-gray-400">Loading...</div>';
  try {
    const logs = await apiFetch('/api/admin/logs');
    if (logs && logs.error) {
      container.innerHTML = `<div class='text-red-500'>${logs.error}</div>`;
      return;
    }
    if (!logs.length) {
      container.innerHTML = '<div class="text-gray-400">No admin actions found.</div>';
      return;
    }
    container.innerHTML = '';
    logs.forEach(log => {
      container.innerHTML += `<div><span class='font-bold'>${log.action}</span> by Admin #${log.admin_id} on Target #${log.target_id || '-'} <span class='text-gray-500'>${new Date(log.created_at).toLocaleString()}</span></div>`;
    });
  } catch (err) {
    container.innerHTML = `<div class='text-red-500'>Failed to load admin logs.</div>`;
  }
}

function communityText(value) {
  return String(value || '').replace(/[&<>'"]/g, function (character) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character];
  });
}

function communityCard(record, type) {
  const details = type === 'volunteer'
    ? `<p class="text-sm text-gray-600"><strong>Interests:</strong> ${communityText(Array.isArray(record.interests) ? record.interests.join(', ') : record.interests)}</p><p class="text-sm text-gray-600"><strong>Availability:</strong> ${communityText(record.availability || 'Not provided')}</p><p class="mt-2 text-sm text-gray-700">${communityText(record.motivation)}</p>`
    : `<p class="text-sm text-gray-700"><strong>${communityText(record.subject)}</strong></p><p class="mt-2 whitespace-pre-wrap text-sm text-gray-600">${communityText(record.message)}</p>`;
  const endpoint = type === 'volunteer' ? 'volunteer-interests' : 'team-messages';
  return `<article class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm" data-community-card="${type}" data-id="${record.id}">
    <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div><h4 class="font-bold text-primary">${communityText(record.name)}</h4><p class="text-xs text-gray-500"><a class="text-primary hover:underline" href="mailto:${communityText(record.email)}">${communityText(record.email)}</a>${record.phone ? ' · ' + communityText(record.phone) : ''}</p><p class="mt-1 text-xs text-gray-400">${new Date(record.created_at).toLocaleString()}</p></div>
    <select class="rounded-lg border border-gray-200 px-2 py-1 text-xs" data-community-status><option value="new" ${record.status === 'new' ? 'selected' : ''}>New</option><option value="reviewing" ${record.status === 'reviewing' ? 'selected' : ''}>Reviewing</option><option value="contacted" ${record.status === 'contacted' ? 'selected' : ''}>Contacted</option><option value="closed" ${record.status === 'closed' ? 'selected' : ''}>Closed</option></select></div>
    <div class="mt-3">${details}</div><textarea data-community-notes class="mt-3 w-full rounded-lg border border-gray-200 p-2 text-sm" rows="2" placeholder="Private admin follow-up notes...">${communityText(record.admin_notes)}</textarea><div class="mt-2 flex items-center justify-between"><span data-community-result class="text-xs text-gray-500"></span><button type="button" data-community-save class="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white">Save update</button></div>
  </article>`;
}

async function loadCommunityInbox(type) {
  const container = document.getElementById(type === 'volunteer' ? 'volunteer-inbox' : 'message-inbox');
  if (!container) return;
  const endpoint = type === 'volunteer' ? '/api/admin/volunteer-interests' : '/api/admin/team-messages';
  try {
    const records = await apiFetch(endpoint);
    if (!Array.isArray(records) || !records.length) { container.innerHTML = '<div class="text-gray-400">No submissions yet.</div>'; return; }
    container.innerHTML = records.map(record => communityCard(record, type)).join('');
    container.querySelectorAll('[data-community-save]').forEach(button => {
      button.addEventListener('click', async function () {
        const card = button.closest('[data-community-card]');
        const result = card.querySelector('[data-community-result]');
        result.textContent = 'Saving...';
        const response = await apiFetch(`${endpoint}/${card.dataset.id}`, { method: 'PUT', body: JSON.stringify({ status: card.querySelector('[data-community-status]').value, admin_notes: card.querySelector('[data-community-notes]').value }) });
        result.textContent = response && !response.error ? 'Saved' : (response.error || 'Could not save');
      });
    });
  } catch (error) { container.innerHTML = '<div class="text-red-500">Failed to load submissions.</div>'; }
}

// Initial load
window.addEventListener('DOMContentLoaded', () => {
  loadPendingMembers();
  loadMembers();
  loadPrograms();
  loadGallery();
  loadAdminLogs();
  loadCommunityInbox('volunteer');
  loadCommunityInbox('message');
});

tailwindConfig = { theme: { extend: { colors: { primary: '#5a67d8', 'primary-dark': '#434190' } } } }

const API = window.DREAM_API || 'http://localhost:3000';
      async function validateAdminSession() {
        try {
          const res = await fetch(API + '/api/session', { credentials: 'include' });
          const data = await res.json();
          const role = data && data.user && data.user.role;
          if (!res.ok || !role || (role !== 'admin' && role !== 'super_admin')) {
            window.location.href = 'login.html';
            return;
          }
          localStorage.setItem('dream_user', JSON.stringify({ ...(JSON.parse(localStorage.getItem('dream_user') || '{}')), ...data.user }));
        } catch (err) {
          window.location.href = 'login.html';
        }
      }
      validateAdminSession();