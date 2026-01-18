// Database storage system
let currentUser = null;
let projects = [];
let selectedProject = null;

// Initialize database from localStorage
function initializeDatabase() {
  const storedUsers = localStorage.getItem('users');
  const storedProjects = localStorage.getItem('projects');
  
  if (!storedUsers) {
    localStorage.setItem('users', JSON.stringify([]));
  }
  
  if (storedProjects) {
    projects = JSON.parse(storedProjects);
  }
}

// User management functions
function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '[]');
}

function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

function findUserByEmail(email) {
  const users = getUsers();
  return users.find(user => user.email === email);
}

function addUser(userData) {
  const users = getUsers();
  users.push(userData);
  saveUsers(users);
}

// Project management functions
function saveProjects() {
  localStorage.setItem('projects', JSON.stringify(projects));
}

// Form switching functions
function showSignupForm() {
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('signupForm').classList.remove('hidden');
}

function showLoginForm() {
  document.getElementById('signupForm').classList.add('hidden');
  document.getElementById('loginForm').classList.remove('hidden');
}

// Validation functions
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password) {
  return password.length >= 6;
}

function validateAge(dateOfBirth) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1;
  }
  
  return age >= 18;
}

// Authentication functions
function login() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  if (!email || !password) {
    alert('Please enter both email and password');
    return;
  }
  
  if (!validateEmail(email)) {
    alert('Please enter a valid email address');
    return;
  }
  
  const user = findUserByEmail(email);
  
  if (!user) {
    alert('No account found with this email address');
    return;
  }
  
  if (user.password !== password) {
    alert('Incorrect password');
    return;
  }
  
  currentUser = {
    email: user.email,
    name: user.name,
    role: user.role,
    dateOfBirth: user.dateOfBirth
  };
  
  document.getElementById('loginPage').classList.add('hidden');
  
  if (user.role === 'freelancer') {
    showFreelancerDashboard();
  } else {
    showClientDashboard();
  }
}

function signup() {
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const dateOfBirth = document.getElementById('signupDob').value;
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('signupConfirmPassword').value;
  const role = document.getElementById('signupRole').value;
  
  // Validation
  if (!name || !email || !dateOfBirth || !password || !confirmPassword || !role) {
    alert('Please fill in all fields');
    return;
  }
  
  if (!validateEmail(email)) {
    alert('Please enter a valid email address');
    return;
  }
  
  if (!validatePassword(password)) {
    alert('Password must be at least 6 characters long');
    return;
  }
  
  if (password !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }
  
  if (!validateAge(dateOfBirth)) {
    alert('You must be at least 18 years old to register');
    return;
  }
  
  // Check if user already exists
  if (findUserByEmail(email)) {
    alert('An account with this email already exists');
    return;
  }
  
  // Create new user
  const newUser = {
    email,
    name,
    dateOfBirth,
    password,
    role,
    createdAt: new Date().toISOString()
  };
  
  addUser(newUser);
  
  // Auto-login after successful registration
  currentUser = {
    email: newUser.email,
    name: newUser.name,
    role: newUser.role,
    dateOfBirth: newUser.dateOfBirth
  };
  
  document.getElementById('loginPage').classList.add('hidden');
  
  if (role === 'freelancer') {
    showFreelancerDashboard();
  } else {
    showClientDashboard();
  }
  
  alert('Registration successful! Welcome to ' + role + ' dashboard.');
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
  
  // Verify client exists
  const client = findUserByEmail(clientEmail);
  if (!client) {
    alert('No client found with this email address');
    return;
  }
  
  if (client.role !== 'client') {
    alert('The specified email is not registered as a client');
    return;
  }
  
  const project = {
    id: Date.now(),
    name,
    status: 'In Progress',
    freelancerEmail: currentUser.email,
    freelancerName: currentUser.name,
    clientEmail,
    clientName: client.name,
    createdAt: new Date().toISOString(),
    updates: []
  };
  
  projects.push(project);
  saveProjects();
  
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
  
  const update = {
    user: currentUser.name,
    userEmail: currentUser.email,
    text,
    timestamp: new Date().toISOString(),
    type: 'update'
  };
  
  selectedProject.updates.push(update);
  selectedProject.status = document.getElementById('projectStatus').value;
  
  saveProjects();
  document.getElementById('projectUpdate').value = '';
  renderUpdates();
}

function renderUpdates() {
  const list = document.getElementById('updateList');
  list.innerHTML = '';
  
  selectedProject.updates.forEach(u => {
    const li = document.createElement('li');
    const date = new Date(u.timestamp).toLocaleDateString();
    const type = u.type === 'comment' ? '[Comment]' : '[Update]';
    li.innerHTML = `<strong>${u.user}</strong> ${type} - ${date}<br>${u.text}`;
    list.appendChild(li);
  });
}

function renderClientUpdates() {
  const list = document.getElementById('clientUpdateList');
  list.innerHTML = '';
  
  selectedProject.updates.forEach(u => {
    const li = document.createElement('li');
    const date = new Date(u.timestamp).toLocaleDateString();
    const type = u.type === 'comment' ? '[Comment]' : '[Update]';
    li.innerHTML = `<strong>${u.user}</strong> ${type} - ${date}<br>${u.text}`;
    list.appendChild(li);
  });
}

// Initialize the application
window.onload = function() {
  initializeDatabase();
};

function postClientComment() {
  const text = document.getElementById('clientComment').value;
  if(!text) return;
  
  const comment = {
    user: currentUser.name,
    userEmail: currentUser.email,
    text,
    timestamp: new Date().toISOString(),
    type: 'comment'
  };
  
  selectedProject.updates.push(comment);
  saveProjects();
  document.getElementById('clientComment').value = '';
  renderClientUpdates();
}
