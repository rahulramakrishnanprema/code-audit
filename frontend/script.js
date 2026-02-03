// Utility functions
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDate(str) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return null;
  }
  const [year, month, day] = str.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

// Data layer
const STORAGE_KEY = 'daily_planner_tasks';

function loadTasks() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks to localStorage:', e);
    alert('Unable to save tasks. Local storage quota may have been exceeded.');
  }
}

// Calendar logic
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDate = formatDate(new Date());

const calendarTableBody = document.querySelector('#calendar tbody');
const monthYearLabel = document.getElementById('month-year');

function renderCalendar(month, year) {
  calendarTableBody.innerHTML = '';
  monthYearLabel.textContent = `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let date = 1;
  for (let i = 0; i < 6; i++) {
    const row = document.createElement('tr');
    for (let j = 0; j < 7; j++) {
      const cell = document.createElement('td');
      if (i === 0 && j < firstDay) {
        cell.textContent = '';
      } else if (date > daysInMonth) {
        cell.textContent = '';
      } else {
        const cellDate = new Date(year, month, date);
        const cellDateStr = formatDate(cellDate);
        cell.textContent = date;
        cell.dataset.date = cellDateStr;
        if (cellDateStr === selectedDate) {
          cell.classList.add('selected');
        }
        cell.addEventListener('click', () => {
          selectedDate = cellDateStr;
          updateSelectedDate();
          renderCalendar(currentMonth, currentYear);
          renderTasks();
        });
        date++;
      }
      row.appendChild(cell);
    }
    calendarTableBody.appendChild(row);
  }
}

function updateSelectedDate() {
  document.getElementById('selected-date').textContent = selectedDate;
  document.getElementById('task-date').value = selectedDate;
}

document.getElementById('prev-month').addEventListener('click', () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar(currentMonth, currentYear);
});

document.getElementById('next-month').addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar(currentMonth, currentYear);
});

// Task list logic
const tasksList = document.getElementById('tasks-list');
const taskForm = document.getElementById('task-form');
const taskTitleInput = document.getElementById('task-title');
const taskDescInput = document.getElementById('task-desc');
const taskIdInput = document.getElementById('task-id');
const taskDateInput = document.getElementById('task-date');
const cancelEditBtn = document.getElementById('cancel-edit');

function renderTasks() {
  const tasks = loadTasks();
  const tasksForDate = tasks.filter(t => t.date === selectedDate);
  tasksList.innerHTML = '';
  if (tasksForDate.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No tasks for this date.';
    tasksList.appendChild(li);
    return;
  }
  tasksForDate.forEach(task => {
    const li = document.createElement('li');
    li.classList.toggle('completed', task.completed);

    const titleSpan = document.createElement('span');
    titleSpan.className = 'task-title';
    titleSpan.textContent = task.title;
    li.appendChild(titleSpan);

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'task-actions';

    const completeBtn = document.createElement('button');
    completeBtn.textContent = task.completed ? 'Undo' : 'Done';
    completeBtn.addEventListener('click', () => {
      toggleComplete(task.id);
    });
    actionsDiv.appendChild(completeBtn);

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => {
      editTask(task);
    });
    actionsDiv.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
      deleteTask(task.id);
    });
    actionsDiv.appendChild(deleteBtn);

    li.appendChild(actionsDiv);
    tasksList.appendChild(li);
  });
}

function toggleComplete(id) {
  const tasks = loadTasks();
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks(tasks);
    renderTasks();
  }
}

function deleteTask(id) {
  let tasks = loadTasks();
  tasks = tasks.filter(t => t.id !== id);
  saveTasks(tasks);
  renderTasks();
}

function editTask(task) {
  taskIdInput.value = task.id;
  taskTitleInput.value = task.title;
  taskDescInput.value = task.description;
  taskForm.scrollIntoView({ behavior: 'smooth' });
  cancelEditBtn.style.display = 'inline-block';
}

function clearEdit() {
  taskIdInput.value = '';
  taskTitleInput.value = '';
  taskDescInput.value = '';
  cancelEditBtn.style.display = 'none';
}

cancelEditBtn.addEventListener('click', clearEdit);

// Form handling
function generateId() {
  return crypto.randomUUID();
}

function validateTask(title) {
  return title.trim().length > 0;
}

taskForm.addEventListener('submit', e => {
  e.preventDefault();
  const title = taskTitleInput.value.trim();
  const description = taskDescInput.value.trim();
  const date = taskDateInput.value;

  if (!validateTask(title)) {
    alert('Title cannot be empty.');
    return;
  }

  if (!parseDate(date)) {
    alert('Invalid date.');
    return;
  }

  const tasks = loadTasks();
  const id = taskIdInput.value;
  if (id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.title = title;
      task.description = description;
    }
  } else {
    const newTask = {
      id: generateId(),
      title,
      description,
      completed: false,
      date,
    };
    tasks.push(newTask);
  }
  saveTasks(tasks);
  clearEdit();
  renderTasks();
});

// Keyboard shortcuts
document.addEventListener('keydown', e => {
  const key = e.key;
  const current = parseDate(selectedDate);
  if (!current) return;
  if (key === 'ArrowLeft') {
    current.setDate(current.getDate() - 1);
  } else if (key === 'ArrowRight') {
    current.setDate(current.getDate() + 1);
  } else if (key === 'ArrowUp') {
    current.setDate(current.getDate() - 7);
  } else if (key === 'ArrowDown') {
    current.setDate(current.getDate() + 7);
  } else if (key === 'Enter') {
    taskForm.scrollIntoView({ behavior: 'smooth' });
    taskTitleInput.focus();
    return;
  } else {
    return;
  }
  e.preventDefault();
  selectedDate = formatDate(current);
  updateSelectedDate();
  renderCalendar(currentMonth, currentYear);
  renderTasks();
});

// Initialization
renderCalendar(currentMonth, currentYear);
updateSelectedDate();
renderTasks();