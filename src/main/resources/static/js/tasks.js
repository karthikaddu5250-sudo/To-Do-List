/**
 * Smart To-Do List - Task Management JavaScript (tasks.js)
 * Full CRUD, Filtering, Searching, Sorting, and Modal Integrations
 */

// Dynamically determine the backend REST API endpoint
const API_BASE = window.location.port === '8080' ? '/api/tasks' : 'http://localhost:8080/api/tasks';

// DOM Elements
const taskGrid = document.getElementById('taskGrid');
const searchInput = document.getElementById('searchInput');
const filterStatus = document.getElementById('filterStatus');
const filterPriority = document.getElementById('filterPriority');
const filterCategory = document.getElementById('filterCategory');
const sortField = document.getElementById('sortField');
const resetFiltersBtn = document.getElementById('resetFiltersBtn');

// Modals
const addModal = document.getElementById('addModal');
const openAddModalBtn = document.getElementById('openAddModalBtn');
const closeAddModalBtn = document.getElementById('closeAddModalBtn');
const cancelAddBtn = document.getElementById('cancelAddBtn');
const addTaskForm = document.getElementById('addTaskForm');

const editModal = document.getElementById('editModal');
const closeEditModalBtn = document.getElementById('closeEditModalBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const editTaskForm = document.getElementById('editTaskForm');

const deleteModal = document.getElementById('deleteModal');
const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const deleteTaskTitleDisplay = document.getElementById('deleteTaskTitleDisplay');

const toastContainer = document.getElementById('toastContainer');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');

let currentTasks = [];
let taskToDeleteId = null;
let searchDebounceTimer = null;

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
// 3. Helpers
// =====================================================================
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function isOverdue(dueDate, status) {
  if (!dueDate || status === 'COMPLETED') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

function formatStatus(status) {
  if (status === 'IN_PROGRESS') return 'In Progress';
  if (status === 'COMPLETED') return 'Completed';
  return 'Pending';
}

// =====================================================================
// 4. Load Tasks from Backend with Search, Filter & Sort
// =====================================================================
async function loadTasks() {
  try {
    const params = new URLSearchParams();

    const search = searchInput.value.trim();
    const status = filterStatus.value;
    const priority = filterPriority.value;
    const category = filterCategory.value;
    const [sortBy, sortDir] = sortField.value.split('-');

    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    if (category) params.append('category', category);
    if (sortBy) params.append('sortBy', sortBy);
    if (sortDir) params.append('sortDir', sortDir);

    const url = `${API_BASE}?${params.toString()}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    currentTasks = await response.json();
    renderTasks(currentTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    taskGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon" style="background: rgba(239, 68, 68, 0.1); color: #ef4444;">✕</div>
        <h3 class="empty-title">Failed to load tasks</h3>
        <p class="empty-desc">Ensure the Java Spring Boot backend is running on port 8080.</p>
        <button class="btn-primary" onclick="loadTasks()">Retry Connection</button>
      </div>
    `;
  }
}

// =====================================================================
// 5. Render Task Cards
// =====================================================================
function renderTasks(tasks) {
  if (!tasks || tasks.length === 0) {
    taskGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">📝</div>
        <h3 class="empty-title">No tasks found</h3>
        <p class="empty-desc">No tasks match your active filters or your to-do list is empty.</p>
        <button class="btn-primary" onclick="openAddModal()">Create Your First Task</button>
      </div>
    `;
    return;
  }

  taskGrid.innerHTML = tasks.map(task => {
    const overdue = isOverdue(task.dueDate, task.status);
    const completed = task.status === 'COMPLETED';

    return `
      <div class="task-card ${completed ? 'is-completed' : ''} ${overdue ? 'is-overdue' : ''}">
        <div>
          <div class="task-card-header">
            <div class="task-badges">
              <span class="badge badge-priority-${task.priority.toLowerCase()}">
                ● ${task.priority}
              </span>
              <span class="badge badge-category">
                ${task.category}
              </span>
              ${overdue ? '<span class="badge badge-overdue">⚠️ Overdue</span>' : ''}
            </div>
            <span class="badge badge-status-${task.status.toLowerCase().replace('_', '-')}">
              ${formatStatus(task.status)}
            </span>
          </div>

          <h3 class="task-title">${escapeHtml(task.title)}</h3>
          <p class="task-desc">${escapeHtml(task.description || 'No description provided.')}</p>
        </div>

        <div class="task-footer">
          <div class="task-due ${overdue ? 'due-urgent' : ''}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>Due: ${task.dueDate}</span>
          </div>

          <div class="task-actions">
            ${!completed ? `
              <button class="action-btn btn-complete" title="Mark as Completed" onclick="markTaskComplete(${task.id})">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M20 6L9 17l-5-5"></path>
                </svg>
              </button>
            ` : `
              <span style="color: #10b981; font-size: 0.82rem; font-weight: 600; margin-right: 0.25rem;">✓ Done</span>
            `}

            <button class="action-btn btn-edit" title="Edit Task" onclick="openEditModal(${task.id})">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>

            <button class="action-btn btn-delete" title="Delete Task" onclick="openDeleteModal(${task.id})">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// =====================================================================
// 6. Complete Task (PATCH /api/tasks/{id}/complete)
// =====================================================================
window.markTaskComplete = async function(id) {
  try {
    const response = await fetch(`${API_BASE}/${id}/complete`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    showToast('Task marked as completed! 🎯', 'success');
    loadTasks();
  } catch (error) {
    console.error('Error completing task:', error);
    showToast('Failed to update task status.', 'error');
  }
};

// =====================================================================
// 7. Add Task (POST /api/tasks)
// =====================================================================
function openAddModal() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById('taskDueDate').value = tomorrow.toISOString().split('T')[0];
  addModal.classList.add('active');
  document.getElementById('taskTitle').focus();
}

function closeAddModal() {
  addModal.classList.remove('active');
  addTaskForm.reset();
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

    if (!response.ok) throw new Error(`Server returned HTTP ${response.status}`);

    showToast('Task created successfully! 🚀', 'success');
    closeAddModal();
    loadTasks();
  } catch (error) {
    console.error('Error adding task:', error);
    showToast(`Error creating task: ${error.message}`, 'error');
  }
});

// =====================================================================
// 8. Edit Task (GET /api/tasks/{id} & PUT /api/tasks/{id})
// =====================================================================
window.openEditModal = async function(id) {
  try {
    const response = await fetch(`${API_BASE}/${id}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const task = await response.json();

    document.getElementById('editTaskId').value = task.id;
    document.getElementById('editTaskTitle').value = task.title;
    document.getElementById('editTaskDesc').value = task.description || '';
    document.getElementById('editTaskDueDate').value = task.dueDate;
    document.getElementById('editTaskPriority').value = task.priority;
    document.getElementById('editTaskCategory').value = task.category;
    document.getElementById('editTaskStatus').value = task.status;

    editModal.classList.add('active');
  } catch (error) {
    console.error('Error loading task for edit:', error);
    showToast('Failed to retrieve task details for editing.', 'error');
  }
};

function closeEditModal() {
  editModal.classList.remove('active');
  editTaskForm.reset();
}

editTaskForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('editTaskId').value;
  const title = document.getElementById('editTaskTitle').value.trim();
  const description = document.getElementById('editTaskDesc').value.trim();
  const dueDate = document.getElementById('editTaskDueDate').value;
  const priority = document.getElementById('editTaskPriority').value;
  const category = document.getElementById('editTaskCategory').value;
  const status = document.getElementById('editTaskStatus').value;

  if (!title) {
    document.getElementById('editTitleError').classList.add('visible');
    return;
  }
  document.getElementById('editTitleError').classList.remove('visible');

  const updatedTask = { title, description, dueDate, priority, category, status };

  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTask)
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    showToast('Task updated successfully! ✨', 'success');
    closeEditModal();
    loadTasks();
  } catch (error) {
    console.error('Error updating task:', error);
    showToast('Failed to update task.', 'error');
  }
});

// =====================================================================
// 9. Delete Task (DELETE /api/tasks/{id})
// =====================================================================
window.openDeleteModal = function(id) {
  const task = currentTasks.find(t => t.id === id);
  if (!task) return;

  taskToDeleteId = id;
  deleteTaskTitleDisplay.textContent = `"${task.title}"`;
  deleteModal.classList.add('active');
};

function closeDeleteModal() {
  deleteModal.classList.remove('active');
  taskToDeleteId = null;
}

confirmDeleteBtn.addEventListener('click', async () => {
  if (!taskToDeleteId) return;

  try {
    const response = await fetch(`${API_BASE}/${taskToDeleteId}`, {
      method: 'DELETE'
    });

    if (!response.ok && response.status !== 204) {
      throw new Error(`HTTP ${response.status}`);
    }

    showToast('Task deleted successfully! 🗑️', 'info');
    closeDeleteModal();
    loadTasks();
  } catch (error) {
    console.error('Error deleting task:', error);
    showToast('Failed to delete task.', 'error');
  }
});

// =====================================================================
// 10. Filters, Search & Event Bindings
// =====================================================================
window.quickFilterCategory = function(cat) {
  filterCategory.value = cat;
  loadTasks();
};

searchInput.addEventListener('input', () => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    loadTasks();
  }, 300);
});

filterStatus.addEventListener('change', loadTasks);
filterPriority.addEventListener('change', loadTasks);
filterCategory.addEventListener('change', loadTasks);
sortField.addEventListener('change', loadTasks);

resetFiltersBtn.addEventListener('click', () => {
  searchInput.value = '';
  filterStatus.value = '';
  filterPriority.value = '';
  filterCategory.value = '';
  sortField.value = 'dueDate-asc';
  loadTasks();
});

// Modal Event Listeners
openAddModalBtn.addEventListener('click', openAddModal);
closeAddModalBtn.addEventListener('click', closeAddModal);
cancelAddBtn.addEventListener('click', closeAddModal);

closeEditModalBtn.addEventListener('click', closeEditModal);
cancelEditBtn.addEventListener('click', closeEditModal);

closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
cancelDeleteBtn.addEventListener('click', closeDeleteModal);

themeToggleBtn.addEventListener('click', toggleTheme);

// Close on backdrop click
[addModal, editModal, deleteModal].forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });
});

// Mobile Sidebar Toggle
if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });
}

// Initial Page Load
document.addEventListener('DOMContentLoaded', () => {
  initTheme();

  // Read URL query parameters for category filter
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');
  if (categoryParam) {
    filterCategory.value = categoryParam.toUpperCase();
  }

  loadTasks();
});
