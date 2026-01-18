// In-memory storage for MVP
let currentUser = null;
let projects = [];
let selectedProject = null;

function login() {
  const email = document.getElementById('email').value;
  const role = document.getElementById('role').value;
  if (!email) { alert('Enter email'); return; }
  currentUser = { email, role };
  document.getElementById('loginPage').classList.add('hidden');
  if(role === 'freelancer') showFreelancerDashboard();
  else showClientDashboard();
}

function showFreelancerDashboard() {
  document.getElementById('freelancerDashboard').classList.remove('hidden');
  renderFreelancerProjects();
}

function showClientDashboard() {
  document.getElementById('clientDashboard').classList.remove('hidden');
  renderClientProjects();
}

function showCreateProject() {
  document.getElementById('createProjectForm').classList.remove('hidden');
}

function cancelCreateProject() {
  document.getElementById('createProjectForm').classList.add('hidden');
}

function createProject() {
  const name = document.getElementById('projectName').value;
  const clientEmail = document.getElementById('projectClientEmail').value;
  if (!name || !clientEmail) { alert('Enter name and client email'); return; }
  const project = {
    id: Date.now(),
    name,
    status: 'In Progress',
    freelancerEmail: currentUser.email,
    clientEmail,
    updates: []
  };
  projects.push(project);
  document.getElementById('createProjectForm').classList.add('hidden');
  renderFreelancerProjects();
}

function renderFreelancerProjects() {
  const container = document.getElementById('freelancerProjects');
  container.innerHTML = '';
  projects.filter(p => p.freelancerEmail === currentUser.email).forEach(p => {
    const div = document.createElement('div');
    div.className = 'project-card';
    div.innerHTML = `<strong>${p.name}</strong> - Status: ${p.status} <button onclick="openProject(${p.id})">Open</button>`;
    container.appendChild(div);
  });
}

function renderClientProjects() {
  const container = document.getElementById('clientProjects');
  container.innerHTML = '';
  projects.filter(p => p.clientEmail === currentUser.email).forEach(p => {
    const div = document.createElement('div');
    div.className = 'project-card';
    div.innerHTML = `<strong>${p.name}</strong> - Status: ${p.status} <button onclick="openProject(${p.id})">Open</button>`;
    container.appendChild(div);
  });
}

function openProject(id) {
  selectedProject = projects.find(p => p.id === id);
  document.getElementById('freelancerDashboard').classList.add('hidden');
  document.getElementById('clientDashboard').classList.add('hidden');
  document.getElementById('projectDetailPage').classList.remove('hidden');
  document.getElementById('projectTitle').innerText = selectedProject.name;

  if(currentUser.role === 'freelancer') {
    document.getElementById('freelancerView').classList.remove('hidden');
    document.getElementById('clientView').classList.add('hidden');
    document.getElementById('projectStatus').value = selectedProject.status;
    renderUpdates();
  } else {
    document.getElementById('freelancerView').classList.add('hidden');
    document.getElementById('clientView').classList.remove('hidden');
    document.getElementById('clientProjectStatus').innerText = selectedProject.status;
    renderClientUpdates();
  }
}

function backToDashboard() {
  document.getElementById('projectDetailPage').classList.add('hidden');
  if(currentUser.role === 'freelancer') showFreelancerDashboard();
  else showClientDashboard();
}

function postUpdate() {
  const text = document.getElementById('projectUpdate').value;
  if(!text) return;
  selectedProject.updates.push({ user: currentUser.email, text });
  document.getElementById('projectUpdate').value = '';
  selectedProject.status = document.getElementById('projectStatus').value;
  renderUpdates();
}

function renderUpdates() {
  const list = document.getElementById('updateList');
  list.innerHTML = '';
  selectedProject.updates.forEach(u => {
    const li = document.createElement('li');
    li.textContent = `${u.user}: ${u.text}`;
    list.appendChild(li);
  });
}

function renderClientUpdates() {
  const list = document.getElementById('clientUpdateList');
  list.innerHTML = '';
  selectedProject.updates.forEach(u => {
    const li = document.createElement('li');
    li.textContent = `${u.user}: ${u.text}`;
    list.appendChild(li);
  });
}

function postClientComment() {
  const text = document.getElementById('clientComment').value;
  if(!text) return;
  selectedProject.updates.push({ user: currentUser.email, text });
  document.getElementById('clientComment').value = '';
  renderClientUpdates();
}
