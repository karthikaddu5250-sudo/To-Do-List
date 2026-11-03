/**
 * Smart To-Do List - Dashboard JavaScript (app.js)
 * Connects directly to Java Spring Boot REST API
 */

// Dynamically determine the backend REST API endpoint
const API_BASE = window.location.port === '8080' ? '/api/tasks' : 'http://localhost:8080/api/tasks';

// DOM Elements
const currentDateDisplay = document.getElementById('currentDateDisplay');
const statTotal = document.getElementById('statTotal');
const statCompleted = document.getElementById('statCompleted');
const statPending = document.getElementById('statPending');
const statOverdue = document.getElementById('statOverdue');
const progressPercent = document.getElementById('progressPercent');
const progressBarFill = document.getElementById('progressBarFill');
const progressSummary = document.getElementById('progressSummary');
const recentTasksList = document.getElementById('recentTasksList');
const upcomingTasksList = document.getElementById('upcomingTasksList');

// Modals & Controls
const addModal = document.getElementById('addModal');
const openAddModalBtn = document.getElementById('openAddModalBtn');
const closeAddModalBtn = document.getElementById('closeAddModalBtn');
const cancelAddBtn = document.getElementById('cancelAddBtn');
const addTaskForm = document.getElementById('addTaskForm');
const toastContainer = document.getElementById('toastContainer');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');

// =====================================================================
// 1. Theme Management (Dark / Light Mode)
// =====================================================================
function initTheme() {
  const savedTheme = localStorage.getItem('smart_todo_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('smart_todo_theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('themeIcon');
  if (!icon) return;
  if (theme === 'dark') {
    // Sun icon for switching to light
    icon.innerHTML = `<circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;
  } else {
    // Moon icon for switching to dark
    icon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
  }
}

// =====================================================================
// 2. Toast Notifications
// =====================================================================
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${escapeHtml(message)}</span>
  `;

  toastContainer.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, 3500);
}

// =====================================================================
// 3. Date & UI Helpers
// =====================================================================
function updateDateDisplay() {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  currentDateDisplay.textContent = new Date().toLocaleDateString('en-US', options);

  // Set default due date in add modal to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const taskDueDate = document.getElementById('taskDueDate');
  if (taskDueDate) {
    taskDueDate.value = tomorrow.toISOString().split('T')[0];
  }
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatRelativeDate(dateString) {
  if (!dateString) return '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dateString);
  due.setHours(0, 0, 0, 0);

  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `<span style="color: #ef4444; font-weight:700;">Overdue by ${Math.abs(diffDays)}d</span>`;
  } else if (diffDays === 0) {
    return `<span style="color: #f59e0b; font-weight:700;">Due Today</span>`;
  } else if (diffDays === 1) {
    return `<span>Tomorrow</span>`;
  } else {
    return `<span>In ${diffDays} days</span>`;
  }
}

// =====================================================================
// 4. Load Dashboard Statistics from Spring Boot REST API
// =====================================================================
async function loadDashboardStats() {
  try {
    const response = await fetch(`${API_BASE}/stats`);
    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }
    const stats = await response.json();

    // Animate numbers
    animateValue(statTotal, stats.totalTasks || 0);
    animateValue(statCompleted, stats.completedTasks || 0);
    animateValue(statPending, stats.pendingTasks || 0);
    animateValue(statOverdue, stats.overdueTasks || 0);

    // Update Progress Bar
    const percentage = stats.completionPercentage || 0;
    progressPercent.textContent = `${percentage}%`;
    progressBarFill.style.width = `${percentage}%`;
    progressSummary.textContent = `${stats.completedTasks || 0} of ${stats.totalTasks || 0} tasks completed`;

  } catch (error) {
    console.error('Error fetching statistics:', error);
    showToast('Failed to load dashboard statistics from backend.', 'error');
  }
}

function animateValue(element, targetValue) {
  if (!element) return;
  let start = 0;
  const duration = 600;
  const stepTime = 20;
  const steps = duration / stepTime;
  const increment = targetValue / steps;

  if (targetValue === 0) {
    element.textContent = '0';
    return;
  }

  const timer = setInterval(() => {
    start += increment;
    if (start >= targetValue) {
      element.textContent = targetValue;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(start);
    }
  }, stepTime);
}

// =====================================================================
// 5. Load Recent Tasks
// =====================================================================
async function loadRecentTasks() {
  try {
    const response = await fetch(`${API_BASE}/recent`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const tasks = await response.json();

    if (!tasks || tasks.length === 0) {
      recentTasksList.innerHTML = `
        <div class="empty-state" style="padding: 1.5rem;">
          <p class="empty-desc">No tasks found. Click "New Task" above to get started!</p>
        </div>
      `;
      return;
    }

    recentTasksList.innerHTML = tasks.map(task => `
      <div class="mini-task-item ${task.status === 'COMPLETED' ? 'is-completed' : ''}">
        <div class="mini-task-left">
          <button class="action-btn btn-complete" title="Mark Complete" onclick="markTaskComplete(${task.id})">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </button>
          <div class="mini-task-content">
            <span class="mini-task-title" style="${task.status === 'COMPLETED' ? 'text-decoration: line-through; color: var(--text-muted);' : ''}">${escapeHtml(task.title)}</span>
            <div class="mini-task-meta">
              <span class="badge badge-priority-${task.priority.toLowerCase()}">${task.priority}</span>
              <span class="badge badge-category">${task.category}</span>
            </div>
          </div>
        </div>
        <div style="font-size: 0.8rem; color: var(--text-muted);">
          ${formatRelativeDate(task.dueDate)}
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error fetching recent tasks:', error);
    recentTasksList.innerHTML = `
      <div style="padding: 1.25rem; text-align: center; color: var(--text-muted);">
        <p style="color: #ef4444; font-size: 0.88rem; margin-bottom: 0.6rem; font-weight: 500;">
          ⚠️ Could not connect to Spring Boot server.
        </p>
        <button class="btn-secondary" style="padding: 0.4rem 0.9rem; font-size: 0.82rem;" onclick="refreshDashboard()">
          🔄 Retry Connection
        </button>
      </div>
    `;
  }
}

// =====================================================================
// 6. Load Upcoming Deadlines
// =====================================================================
async function loadUpcomingTasks() {
  try {
    const response = await fetch(`${API_BASE}/upcoming`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const tasks = await response.json();

    if (!tasks || tasks.length === 0) {
      upcomingTasksList.innerHTML = `
        <div class="empty-state" style="padding: 1.5rem;">
          <p class="empty-desc">🎉 All caught up! No impending deadlines.</p>
        </div>
      `;
      return;
    }

    upcomingTasksList.innerHTML = tasks.slice(0, 5).map(task => `
      <div class="mini-task-item">
        <div class="mini-task-left">
          <div class="mini-task-content">
            <span class="mini-task-title">${escapeHtml(task.title)}</span>
            <div class="mini-task-meta">
              <span class="badge badge-priority-${task.priority.toLowerCase()}">${task.priority}</span>
              <span>Due: ${task.dueDate}</span>
            </div>
          </div>
        </div>
        <div>
          ${formatRelativeDate(task.dueDate)}
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error fetching upcoming tasks:', error);
    upcomingTasksList.innerHTML = `
      <div style="padding: 1.25rem; text-align: center; color: var(--text-muted);">
        <p style="color: #ef4444; font-size: 0.88rem; margin-bottom: 0.6rem; font-weight: 500;">
          ⚠️ Could not connect to Spring Boot server.
        </p>
        <button class="btn-secondary" style="padding: 0.4rem 0.9rem; font-size: 0.82rem;" onclick="refreshDashboard()">
          🔄 Retry Connection
        </button>
      </div>
    `;
  }
}

// Global dashboard refresh function
window.refreshDashboard = function() {
  loadDashboardStats();
  loadRecentTasks();
  loadUpcomingTasks();
};

// =====================================================================
// 7. Complete Task
// =====================================================================
window.markTaskComplete = async function(id) {
  try {
    const response = await fetch(`${API_BASE}/${id}/complete`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    showToast('Task marked as completed! 🎯', 'success');

    // Refresh dashboard components
    loadDashboardStats();
    loadRecentTasks();
    loadUpcomingTasks();
  } catch (error) {
    console.error('Error completing task:', error);
    showToast('Could not complete task. Check server connection.', 'error');
  }
};

// =====================================================================
// 8. Add Task Modal & Submission
// =====================================================================
function openModal() {
  addModal.classList.add('active');
  document.getElementById('taskTitle').focus();
}

function closeModal() {
  addModal.classList.remove('active');
  addTaskForm.reset();
  updateDateDisplay();
}

addTaskForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = document.getElementById('taskTitle').value.trim();
  const description = document.getElementById('taskDesc').value.trim();
  const dueDate = document.getElementById('taskDueDate').value;
  const priority = document.getElementById('taskPriority').value;
  const category = document.getElementById('taskCategory').value;
  const status = document.getElementById('taskStatus').value;

  if (!title) {
    document.getElementById('titleError').classList.add('visible');
    return;
  }
  document.getElementById('titleError').classList.remove('visible');

  const newTask = { title, description, dueDate, priority, category, status };

  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Server returned ${response.status}`);
    }

    showToast('Task created successfully in MySQL! 🚀', 'success');
    closeModal();

    // Refresh Dashboard Data
    loadDashboardStats();
    loadRecentTasks();
    loadUpcomingTasks();
  } catch (error) {
    console.error('Error adding task:', error);
    showToast(`Failed to create task: ${error.message}`, 'error');
  }
});

// =====================================================================
// 9. Event Listeners & Initialization
// =====================================================================
openAddModalBtn.addEventListener('click', openModal);
closeAddModalBtn.addEventListener('click', closeModal);
cancelAddBtn.addEventListener('click', closeModal);
themeToggleBtn.addEventListener('click', toggleTheme);

// Close modal on click outside
addModal.addEventListener('click', (e) => {
  if (e.target === addModal) closeModal();
});

// Mobile Sidebar Toggle
if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });
}

// Initial Launch
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  updateDateDisplay();
  loadDashboardStats();
  loadRecentTasks();
  loadUpcomingTasks();
});

