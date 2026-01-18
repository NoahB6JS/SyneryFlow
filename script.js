// Database storage system
let currentUser = null;
let projects = [];
let selectedProject = null;
let projectRequests = [];

// Initialize database from localStorage
function initializeDatabase() {
  const storedUsers = localStorage.getItem('users');
  const storedProjects = localStorage.getItem('projects');
  const storedRequests = localStorage.getItem('projectRequests');
  
  if (!storedUsers) {
    localStorage.setItem('users', JSON.stringify([]));
  }
  
  if (!storedRequests) {
    localStorage.setItem('projectRequests', JSON.stringify([]));
  }
  
  if (storedProjects) {
    projects = JSON.parse(storedProjects);
  }
  
  if (storedRequests) {
    projectRequests = JSON.parse(storedRequests);
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

// Project request management functions
function getProjectRequests() {
  return JSON.parse(localStorage.getItem('projectRequests') || '[]');
}

function saveProjectRequests(requests) {
  localStorage.setItem('projectRequests', JSON.stringify(requests));
  projectRequests = requests;
}

function addProjectRequest(requestData) {
  const requests = getProjectRequests();
  requests.push(requestData);
  saveProjectRequests(requests);
}

function getRequestsForClient(clientEmail) {
  return getProjectRequests().filter(req => req.clientEmail === clientEmail && req.status === 'pending');
}

function getRequestsFromFreelancer(freelancerEmail) {
  return getProjectRequests().filter(req => req.freelancerEmail === freelancerEmail);
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
    dateOfBirth: user.dateOfBirth,
    createdAt: user.createdAt
  };
  
  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('navbar').classList.remove('hidden');
  
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
    dateOfBirth: newUser.dateOfBirth,
    createdAt: newUser.createdAt
  };
  
  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('navbar').classList.remove('hidden');
  
  if (role === 'freelancer') {
    showFreelancerDashboard();
  } else {
    showClientDashboard();
  }
  
  alert('Registration successful! Welcome to ' + role + ' dashboard.');
}

function showFreelancerDashboard() {
  document.getElementById('freelancerDashboard').classList.remove('hidden');
  document.getElementById('freelancerUserName').textContent = `Welcome, ${currentUser.name}`;
  renderFreelancerRequests();
  renderFreelancerClients();
  renderFreelancerProjects();
}
function showClientDashboard() {
  document.getElementById('clientDashboard').classList.remove('hidden');
  document.getElementById('clientUserName').textContent = `Welcome, ${currentUser.name}`;
  renderProjectRequests();
  renderClientProjects();
}

// Client request rendering functions
function renderProjectRequests() {
  const container = document.getElementById('projectRequestsList');
  const requests = getRequestsForClient(currentUser.email);
  
  if (requests.length === 0) {
    container.innerHTML = '<div class="empty-requests"><p>No pending project requests</p></div>';
    return;
  }
  
  container.innerHTML = '';
  
  requests.forEach(request => {
    const requestCard = document.createElement('div');
    requestCard.className = 'request-card';
    
    const createdDate = new Date(request.createdAt);
    
    requestCard.innerHTML = `
      <div class="request-header">
        <h4 class="request-title">${request.name}</h4>
        <div class="request-meta">
          <span class="request-date">${createdDate.toLocaleDateString()}</span>
          <span class="request-status">Pending</span>
        </div>
      </div>
      <div class="request-freelancer">
        <strong>From:</strong> ${request.freelancerName} (${request.freelancerEmail})
      </div>
      <div class="request-message">${request.message}</div>
      <div class="request-actions">
        <button onclick="viewProjectDetails(${request.id})" class="view-details-btn">View Project Details</button>
      </div>
    `;
    
    container.appendChild(requestCard);
  });
}

// Project details view function
function viewProjectDetails(requestId) {
  const requests = getProjectRequests();
  selectedRequest = requests.find(req => req.id === requestId);
  
  if (!selectedRequest) return;
  
  // Show project details in a modal-like view
  const detailsView = document.createElement('div');
  detailsView.className = 'project-details-modal';
  detailsView.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Project Request Details</h3>
        <button onclick="closeProjectDetails()" class="close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <div class="project-info">
          <div class="info-group">
            <label>Project Name:</label>
            <p>${selectedRequest.name}</p>
          </div>
          <div class="info-group">
            <label>From Freelancer:</label>
            <p>${selectedRequest.freelancerName}</p>
          </div>
          <div class="info-group">
            <label>Freelancer Email:</label>
            <p>${selectedRequest.freelancerEmail}</p>
          </div>
          <div class="info-group">
            <label>Request Message:</label>
            <p>${selectedRequest.message}</p>
          </div>
          <div class="info-group">
            <label>Request Date:</label>
            <p>${new Date(selectedRequest.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div class="project-details-form">
          <h4>Additional Project Details</h4>
          <label>Project Description:</label>
          <textarea id="modalProjectDescription" placeholder="Describe what you want done in this project..."></textarea>
          
          <label>Project Requirements:</label>
          <textarea id="modalProjectRequirements" placeholder="List specific requirements, deliverables, or expectations..."></textarea>
          
          <label>Estimated Timeline:</label>
          <select id="modalProjectTimeline">
            <option value="">Select timeline</option>
            <option value="Less than 1 week">Less than 1 week</option>
            <option value="1-2 weeks">1-2 weeks</option>
            <option value="2-4 weeks">2-4 weeks</option>
            <option value="1-2 months">1-2 months</option>
            <option value="2-3 months">2-3 months</option>
            <option value="3+ months">3+ months</option>
          </select>
          
          <label>Budget Range:</label>
          <select id="modalProjectBudget">
            <option value="">Select budget range</option>
            <option value="Under $500">Under $500</option>
            <option value="$500-$1,000">$500-$1,000</option>
            <option value="$1,000-$2,500">$1,000-$2,500</option>
            <option value="$2,500-$5,000">$2,500-$5,000</option>
            <option value="$5,000-$10,000">$5,000-$10,000</option>
            <option value="Over $10,000">Over $10,000</option>
          </select>
        </div>
      </div>
      <div class="modal-actions">
        <button onclick="acceptProjectFromModal()" class="accept-btn">Accept Request</button>
        <button onclick="declineProjectFromModal()" class="decline-btn">Decline Request</button>
        <button onclick="closeProjectDetails()" class="cancel-btn">Cancel</button>
      </div>
    </div>
  `;
  
  // Add to page
  document.body.appendChild(detailsView);
  
  // Hide main dashboard
  document.getElementById('clientDashboard').classList.add('hidden');
}

function closeProjectDetails() {
  // Remove modal
  const modal = document.querySelector('.project-details-modal');
  if (modal) {
    modal.remove();
  }
  
  // Show main dashboard
  document.getElementById('clientDashboard').classList.remove('hidden');
  selectedRequest = null;
}

function acceptProjectFromModal() {
  const description = document.getElementById('modalProjectDescription').value;
  const requirements = document.getElementById('modalProjectRequirements').value;
  const timeline = document.getElementById('modalProjectTimeline').value;
  const budget = document.getElementById('modalProjectBudget').value;
  
  if (!description || !requirements || !timeline || !budget) {
    alert('Please fill in all project details');
    return;
  }
  
  // Create the project
  const project = {
    id: Date.now(),
    name: selectedRequest.name,
    description,
    requirements,
    timeline,
    budget,
    status: 'Not Started',
    freelancerEmail: selectedRequest.freelancerEmail,
    freelancerName: selectedRequest.freelancerName,
    clientEmail: selectedRequest.clientEmail,
    clientName: selectedRequest.clientName,
    createdAt: new Date().toISOString(),
    updates: [
      {
        user: currentUser.name,
        userEmail: currentUser.email,
        text: `Project created with details: ${description}`,
        timestamp: new Date().toISOString(),
        type: 'update',
        activityType: 'project_update'
      }
    ]
  };
  
  projects.push(project);
  saveProjects();
  
  // Remove accepted request from requests
  const requests = getProjectRequests();
  const requestIndex = requests.findIndex(req => req.id === selectedRequest.id);
  if (requestIndex !== -1) {
    requests.splice(requestIndex, 1);
    saveProjectRequests(requests);
  }
  
  alert('Project request accepted! Project has been created.');
  
  // Close modal and refresh sections
  closeProjectDetails();
  renderProjectRequests();
  renderClientProjects();
}

function declineProjectFromModal() {
  if (confirm('Are you sure you want to decline this project request?')) {
    // Remove declined request
    const requests = getProjectRequests();
    const requestIndex = requests.findIndex(req => req.id === selectedRequest.id);
    if (requestIndex !== -1) {
      requests.splice(requestIndex, 1);
      saveProjectRequests(requests);
    }
    
    alert('Project request declined.');
    closeProjectDetails();
  }
}

// Add project details view for existing projects
function viewClientProjectDetails(projectId) {
  const project = projects.find(p => p.id === projectId);
  
  if (!project) return;
  
  // Show project details in a modal
  const detailsView = document.createElement('div');
  detailsView.className = 'project-details-modal';
  detailsView.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Project Details</h3>
        <button onclick="closeProjectDetails()" class="close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <div class="project-info">
          <div class="info-group">
            <label>Project Name:</label>
            <p>${project.name}</p>
          </div>
          <div class="info-group">
            <label>Freelancer:</label>
            <p>${project.freelancerName}</p>
          </div>
          <div class="info-group">
            <label>Status:</label>
            <p>${project.status}</p>
          </div>
          <div class="info-group">
            <label>Budget:</label>
            <p>${project.budget}</p>
          </div>
          <div class="info-group">
            <label>Timeline:</label>
            <p>${project.timeline}</p>
          </div>
          <div class="info-group">
            <label>Description:</label>
            <p>${project.description}</p>
          </div>
          <div class="info-group">
            <label>Requirements:</label>
            <p>${project.requirements}</p>
          </div>
          <div class="info-group">
            <label>Created Date:</label>
            <p>${new Date(project.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
      <div class="modal-actions">
        <button onclick="openProject(${project.id})" class="accept-btn">Open Project</button>
        <button onclick="closeProjectDetails()" class="cancel-btn">Close</button>
      </div>
    </div>
  `;
  
  // Add to page
  document.body.appendChild(detailsView);
  
  // Hide main dashboard
  document.getElementById('clientDashboard').classList.add('hidden');
}

function cancelRequestView() {
  document.getElementById('projectRequestForm').classList.add('hidden');
  document.getElementById('clientDashboard').classList.remove('hidden');
  selectedRequest = null;
  renderProjectRequests();
}

// Freelancer request rendering functions
function renderFreelancerRequests() {
  const container = document.getElementById('freelancerRequestsList');
  const requests = getRequestsFromFreelancer(currentUser.email);
  
  if (requests.length === 0) {
    container.innerHTML = '<div class="empty-requests"><p>No project requests sent yet</p></div>';
    return;
  }
  
  container.innerHTML = '';
  
  requests.forEach(request => {
    const requestCard = document.createElement('div');
    requestCard.className = `freelancer-request-card ${request.status}`;
    
    const createdDate = new Date(request.createdAt);
    const statusDate = request.status === 'accepted' && request.acceptedAt ? 
      new Date(request.acceptedAt) : 
      request.status === 'rejected' && request.rejectedAt ? 
      new Date(request.rejectedAt) : null;
    
    let statusText = request.status.charAt(0).toUpperCase() + request.status.slice(1);
    let additionalInfo = '';
    
    if (statusDate) {
      additionalInfo = `<small>${statusText} on ${statusDate.toLocaleDateString()}</small>`;
    }
    
    requestCard.innerHTML = `
      <div class="freelancer-request-header">
        <h4 class="freelancer-request-title">${request.name}</h4>
        <div class="freelancer-request-meta">
          <span class="freelancer-request-date">Sent: ${createdDate.toLocaleDateString()}</span>
          <span class="freelancer-request-status ${request.status}">${statusText}</span>
        </div>
      </div>
      <div class="freelancer-request-client">Client: ${request.clientName} (${request.clientEmail})</div>
      <div class="freelancer-request-message">${request.message}</div>
      ${additionalInfo}
    `;
    
    container.appendChild(requestCard);
  });
}
function renderFreelancerClients() {
  const container = document.getElementById('freelancerClients');
  container.innerHTML = '';
  
  // Get unique clients from projects
  const clientEmails = [...new Set(projects
    .filter(p => p.freelancerEmail === currentUser.email)
    .map(p => p.clientEmail)
  )];
  
  if (clientEmails.length === 0) {
    container.innerHTML = `
      <div class="empty-clients">
        <h3>No clients yet</h3>
        <p>Start by creating your first project to add clients</p>
        <button onclick="showCreateProject()">+ Create Project</button>
      </div>
    `;
    return;
  }
  
  // Add clients section title
  const sectionTitle = document.createElement('h2');
  sectionTitle.className = 'clients-section-title';
  sectionTitle.textContent = `My Clients (${clientEmails.length})`;
  container.appendChild(sectionTitle);
  
  // Render each client
  clientEmails.forEach(clientEmail => {
    const client = findUserByEmail(clientEmail);
    if (!client) return;
    
    const clientProjects = projects.filter(p => 
      p.freelancerEmail === currentUser.email && p.clientEmail === clientEmail
    );
    
    const clientCard = document.createElement('div');
    clientCard.className = 'client-card';
    
    const statusClass = `status-${clientProjects.find(p => p.status)?.status?.toLowerCase().replace(/\s+/g, '-') || 'not-started'}`;
    
    clientCard.innerHTML = `
      <div class="client-card-header">
        <h3>${client.name}</h3>
        <span class="client-email">${client.email}</span>
      </div>
      
      <div class="client-info">
        <div class="info-item">
          <label>Role</label>
          <span>Client</span>
        </div>
        <div class="info-item">
          <label>Member Since</label>
          <span>${client.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'Unknown'}</span>
        </div>
        <div class="info-item">
          <label>Date of Birth</label>
          <span>${new Date(client.dateOfBirth).toLocaleDateString()}</span>
        </div>
        <div class="info-item">
          <label>Total Projects</label>
          <span>${clientProjects.length}</span>
        </div>
      </div>
      
      <div class="client-stats">
        <div class="stat-badge">
          <span class="number">${clientProjects.filter(p => p.status === 'Completed').length}</span>
          <span class="label">Completed</span>
        </div>
        <div class="stat-badge">
          <span class="number">${clientProjects.filter(p => p.status === 'In Progress').length}</span>
          <span class="label">In Progress</span>
        </div>
        <div class="stat-badge">
          <span class="number">${clientProjects.length}</span>
          <span class="label">Total Projects</span>
        </div>
      </div>
      
      <div class="client-projects">
        <h4>Recent Projects</h4>
        <ul class="project-list">
          ${clientProjects.slice(0, 3).map(project => `
            <li>
              <span class="project-name">${project.name}</span>
              <span class="project-status status-${project.status.toLowerCase().replace(/\s+/g, '-')}">${project.status}</span>
            </li>
          `).join('')}
          ${clientProjects.length > 3 ? `<li><span style="color: var(--gray-color); font-style: italic;">+${clientProjects.length - 3} more projects</span></li>` : ''}
        </ul>
      </div>
    `;
    
    container.appendChild(clientCard);
  });
}

function renderFreelancerProjects() {
  const container = document.getElementById('freelancerProjects');
  container.innerHTML = '';
  
  const freelancerProjects = projects.filter(p => p.freelancerEmail === currentUser.email);
  
  if (freelancerProjects.length === 0) {
    container.innerHTML = `<div class="empty-state"><p>No projects yet</p><small>Create your first project to get started</small></div>`;
    return;
  }
  
  // Add projects section title
  const sectionTitle = document.createElement('h2');
  sectionTitle.className = 'clients-section-title';
  sectionTitle.textContent = 'All Projects';
  container.appendChild(sectionTitle);
  
  freelancerProjects.forEach(p => {
    const div = document.createElement('div');
    div.className = 'project-card';
    div.innerHTML = `<strong>${p.name}</strong> - Status: ${p.status} <button onclick="openProject(${p.id})">Open</button>`;
    container.appendChild(div);
  });
}

function renderClientProjects() {
  const container = document.getElementById('clientProjects');
  container.innerHTML = '';
  
  const clientProjects = projects.filter(p => p.clientEmail === currentUser.email);
  
  if (clientProjects.length === 0) {
    container.innerHTML = `<div class="empty-state"><p>No projects yet</p><small>Accepted project requests will appear here</small></div>`;
    return;
  }
  
  // Add projects section title
  const sectionTitle = document.createElement('h2');
  sectionTitle.className = 'clients-section-title';
  sectionTitle.textContent = 'My Projects';
  container.appendChild(sectionTitle);
  
  clientProjects.forEach(p => {
    const div = document.createElement('div');
    div.className = 'project-card';
    
    const projectInfo = `
      <strong>${p.name}</strong><br>
      <small>Freelancer: ${p.freelancerName}</small><br>
      <small>Budget: ${p.budget}</small><br>
      <small>Timeline: ${p.timeline}</small>
    `;
    
    div.innerHTML = `${projectInfo} - Status: ${p.status} <button onclick="viewClientProjectDetails(${p.id})" class="view-details-btn">View Details</button> <button onclick="openProject(${p.id})">Open</button>`;
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
    renderTimeline(); // Render timeline for client view
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
    type: 'update',
    activityType: 'project_update'
  };
  
  selectedProject.updates.push(update);
  saveProjects();
  document.getElementById('projectUpdate').value = '';
  renderUpdates();
  
  // Update timeline if client is viewing
  if (currentUser.role === 'client') {
    renderTimeline();
  }
}

function renderUpdates() {
  const list = document.getElementById('updateList');
  list.innerHTML = '';
  
  if (selectedProject.updates.length === 0) {
    list.innerHTML = '<div class="empty-state"><p>No updates yet</p><small>Be the first to post an update</small></div>';
    return;
  }
  
  selectedProject.updates.forEach(u => {
    const li = document.createElement('li');
    const date = new Date(u.timestamp);
    const typeClass = u.type === 'comment' ? 'comment' : (u.type === 'status_change' ? 'status-change' : 'update');
    const typeText = u.type === 'comment' ? 'Comment' : (u.type === 'status_change' ? 'Status Change' : 'Update');
    
    li.innerHTML = `
      <strong>${u.user}</strong>
      <span class="update-type ${typeClass}">${typeText}</span>
      <span class="update-date">${date.toLocaleDateString()} at ${date.toLocaleTimeString()}</span>
      <span class="update-text">${u.text}</span>
    `;
    list.appendChild(li);
  });
}

function renderClientUpdates() {
  const list = document.getElementById('clientUpdateList');
  list.innerHTML = '';
  
  if (selectedProject.updates.length === 0) {
    list.innerHTML = '<div class="empty-state"><p>No activity yet</p><small>Project updates and comments will appear here</small></div>';
    return;
  }
  
  selectedProject.updates.forEach(u => {
    const li = document.createElement('li');
    const date = new Date(u.timestamp);
    const typeClass = u.type === 'comment' ? 'comment' : (u.type === 'status_change' ? 'status-change' : 'update');
    const typeText = u.type === 'comment' ? 'Comment' : (u.type === 'status_change' ? 'Status Change' : 'Update');
    
    li.innerHTML = `
      <strong>${u.user}</strong>
      <span class="update-type ${typeClass}">${typeText}</span>
      <span class="update-date">${date.toLocaleDateString()} at ${date.toLocaleTimeString()}</span>
      <span class="update-text">${u.text}</span>
    `;
    list.appendChild(li);
  });
}

// Save project status function
function saveProjectStatus() {
  const newStatus = document.getElementById('projectStatus').value;
  const oldStatus = selectedProject.status;
  
  if (oldStatus === newStatus) {
    alert('No changes to save.');
    return;
  }
  
  // Update project status
  selectedProject.status = newStatus;
  
  // Add status change activity
  const statusChange = {
    user: currentUser.name,
    userEmail: currentUser.email,
    text: `Status changed from "${oldStatus}" to "${newStatus}"`,
    timestamp: new Date().toISOString(),
    type: 'status_change',
    activityType: 'status_change'
  };
  selectedProject.updates.push(statusChange);
  
  // Save to database
  saveProjects();
  
  // Update client view if applicable
  if (currentUser.role === 'client') {
    document.getElementById('clientProjectStatus').innerText = newStatus;
    renderClientUpdates();
    renderTimeline();
  } else {
    renderUpdates();
  }
  
  // Show success feedback
  const saveBtn = document.querySelector('.save-status-btn');
  saveBtn.classList.add('saved');
  saveBtn.textContent = 'Saved!';
  
  setTimeout(() => {
    saveBtn.classList.remove('saved');
    saveBtn.textContent = 'Save Status';
  }, 2000);
}

// Timeline visualization functions
function renderTimeline() {
  const canvas = document.getElementById('timelineCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // Get project updates sorted by timestamp
  const updates = [...selectedProject.updates].sort((a, b) => 
    new Date(a.timestamp) - new Date(b.timestamp)
  );
  
  if (updates.length === 0) {
    // Draw empty state
    ctx.fillStyle = '#999';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('No activity yet', width / 2, height / 2);
    return;
  }
  
  // Draw timeline
  const padding = 40;
  const graphWidth = width - 2 * padding;
  const graphHeight = height - 2 * padding;
  
  // Draw axes
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();
  
  // Calculate time range with tighter spacing
  const now = new Date();
  const projectStart = selectedProject.createdAt ? new Date(selectedProject.createdAt) : new Date(updates[0].timestamp);
  const timeRange = now - projectStart;
  
  // Scrunch values together by reducing the effective width
  const scrunchFactor = 0.7; // Use 70% of available width
  const actualGraphWidth = graphWidth * scrunchFactor;
  const offsetX = (graphWidth - actualGraphWidth) / 2;
  
  // Store activity points for hover detection
  const activityPoints = [];
  
  // Draw activity points
  updates.forEach((update, index) => {
    const updateDate = new Date(update.timestamp);
    const x = padding + offsetX + ((updateDate - projectStart) / timeRange) * actualGraphWidth;
    
    // Determine color based on activity type
    let color;
    if (update.activityType === 'client_comment') {
      color = '#27ae60'; // Green for client comments
    } else if (update.activityType === 'status_change') {
      color = '#f39c12'; // Orange for status changes
    } else {
      color = '#4a90e2'; // Blue for project updates
    }
    
    // Draw smaller point
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, height / 2, 4, 0, 2 * Math.PI); // Reduced from 6 to 4
    ctx.fill();
    
    // Store point data for hover detection
    activityPoints.push({
      x: x,
      y: height / 2,
      date: updateDate,
      color: color,
      update: update
    });
    
    // Draw connecting line to next point with increased thickness
    if (index < updates.length - 1) {
      const nextUpdate = updates[index + 1];
      const nextDate = new Date(nextUpdate.timestamp);
      const nextX = padding + offsetX + ((nextDate - projectStart) / timeRange) * actualGraphWidth;
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 4; // Increased from 2 to 4
      ctx.globalAlpha = 0.6; // Increased opacity for better visibility
      ctx.beginPath();
      ctx.moveTo(x, height / 2);
      ctx.lineTo(nextX, height / 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  });
  
  // Draw title
  ctx.fillStyle = '#333';
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('Project Activity Timeline', padding, padding - 10);
  
  // Store activity points for hover detection
  canvas.activityPoints = activityPoints;
  
  // Add hover event listener for tooltips
  canvas.onmousemove = function(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Check if hovering over any point
    let hoveredPoint = null;
    for (const point of activityPoints) {
      const distance = Math.sqrt(Math.pow(mouseX - point.x, 2) + Math.pow(mouseY - point.y, 2));
      if (distance <= 8) { // Slightly larger hover area than the point
        hoveredPoint = point;
        break;
      }
    }
    
    // Show/hide tooltip
    const tooltip = document.getElementById('timelineTooltip');
    if (hoveredPoint) {
      if (!tooltip) {
        const newTooltip = document.createElement('div');
        newTooltip.id = 'timelineTooltip';
        newTooltip.style.cssText = `
          position: absolute;
          background: #333;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          pointer-events: none;
          z-index: 1000;
          white-space: nowrap;
        `;
        document.body.appendChild(newTooltip);
      }
      
      const tooltip = document.getElementById('timelineTooltip');
      tooltip.textContent = hoveredPoint.date.toLocaleDateString() + ' ' + hoveredPoint.date.toLocaleTimeString();
      tooltip.style.left = (e.clientX + 10) + 'px';
      tooltip.style.top = (e.clientY - 25) + 'px';
      tooltip.style.display = 'block';
    } else {
      const tooltip = document.getElementById('timelineTooltip');
      if (tooltip) {
        tooltip.style.display = 'none';
      }
    }
  };
  
  canvas.onmouseleave = function() {
    const tooltip = document.getElementById('timelineTooltip');
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  };
}

// Navigation functions
function showDashboard() {
  hideAllPages();
  
  if (currentUser.role === 'freelancer') {
    showFreelancerDashboard();
  } else {
    showClientDashboard();
  }
}

function showProjects() {
  hideAllPages();
  
  if (currentUser.role === 'freelancer') {
    showFreelancerDashboard();
  } else {
    showClientDashboard();
  }
}

function showProfile() {
  hideAllPages();
  document.getElementById('profilePage').classList.remove('hidden');
  loadProfileData();
}

function hideAllPages() {
  document.getElementById('freelancerDashboard').classList.add('hidden');
  document.getElementById('clientDashboard').classList.add('hidden');
  document.getElementById('createProjectForm').classList.add('hidden');
  document.getElementById('projectDetailPage').classList.add('hidden');
  document.getElementById('profilePage').classList.add('hidden');
}

function loadProfileData() {
  // Load personal information
  document.getElementById('profileName').textContent = currentUser.name;
  document.getElementById('profileEmail').textContent = currentUser.email;
  document.getElementById('profileRole').textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
  document.getElementById('profileDob').textContent = new Date(currentUser.dateOfBirth).toLocaleDateString();
  
  if (currentUser.createdAt) {
    document.getElementById('profileMemberSince').textContent = new Date(currentUser.createdAt).toLocaleDateString();
  } else {
    document.getElementById('profileMemberSince').textContent = 'Unknown';
  }
  
  // Calculate project statistics
  const userProjects = projects.filter(p => 
    (currentUser.role === 'freelancer' && p.freelancerEmail === currentUser.email) ||
    (currentUser.role === 'client' && p.clientEmail === currentUser.email)
  );
  
  const totalProjects = userProjects.length;
  const activeProjects = userProjects.filter(p => p.status !== 'Completed').length;
  const completedProjects = userProjects.filter(p => p.status === 'Completed').length;
  
  document.getElementById('totalProjects').textContent = totalProjects;
  document.getElementById('activeProjects').textContent = activeProjects;
  document.getElementById('completedProjects').textContent = completedProjects;
}

// Logout function
function logout() {
  currentUser = null;
  
  // Hide all dashboards, forms, and navigation
  document.getElementById('freelancerDashboard').classList.add('hidden');
  document.getElementById('clientDashboard').classList.add('hidden');
  document.getElementById('createProjectForm').classList.add('hidden');
  document.getElementById('projectDetailPage').classList.add('hidden');
  document.getElementById('profilePage').classList.add('hidden');
  document.getElementById('navbar').classList.add('hidden');
  
  // Show login form
  document.getElementById('loginPage').classList.remove('hidden');
  showLoginForm();
  
  // Clear form fields
  document.getElementById('loginEmail').value = '';
  document.getElementById('loginPassword').value = '';
  document.getElementById('signupName').value = '';
  document.getElementById('signupEmail').value = '';
  document.getElementById('signupDob').value = '';
  document.getElementById('signupPassword').value = '';
  document.getElementById('signupConfirmPassword').value = '';
  document.getElementById('signupRole').value = '';
  
  alert('You have been logged out successfully.');
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
    type: 'comment',
    activityType: 'client_comment'
  };
  
  selectedProject.updates.push(comment);
  saveProjects();
  document.getElementById('clientComment').value = '';
  renderClientUpdates();
  renderTimeline();
}
