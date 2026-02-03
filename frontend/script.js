// Utility functions
const getToday = () => new Date();
const formatDate = (date) => date.toISOString().split('T')[0];
const parseDate = (str) => new Date(str + 'T00:00:00');

// LocalStorage handling
const STORAGE_KEY = 'tasks';
const loadTasks = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};
const saveTasks = (tasks) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

// Global state
let currentDate = getToday();
let selectedDate = formatDate(currentDate);
let tasks = loadTasks();

// DOM elements
const monthYearEl = document.getElementById('monthYear');
const calendarBody = document.getElementById('calendarBody');
const selectedDateEl = document.getElementById('selectedDate').querySelector('span');
const taskListEl = document.getElementById('taskList');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskModal = document.getElementById('taskModal');
const modalTitle = document.getElementById('modalTitle');
const taskForm = document.getElementById('taskForm');
const taskIdInput = document.getElementById('taskId');
const taskTitleInput = document.getElementById('taskTitle');
const taskDescInput = document.getElementById('taskDesc');
const taskDateInput = document.getElementById('taskDate');
const cancelBtn = document.getElementById('cancelBtn');

// Render calendar
const renderCalendar = () => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  monthYearEl.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;
  calendarBody.innerHTML = '';

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
        const dayTasks = tasks.filter(t => t.date === cellDateStr);
        if (dayTasks.length > 0) {
          cell.classList.add('has-tasks');
        }
        cell.addEventListener('click', () => {
          selectedDate = cellDateStr;
          selectedDateEl.textContent = selectedDate;
          renderCalendar();
          renderTaskList();
        });
        date++;
      }
      row.appendChild(cell);
    }
    calendarBody.appendChild(row);
  }
};

// Render task list for selected date
const renderTaskList = () => {
  const dayTasks = tasks.filter(t => t.date === selectedDate);
  taskListEl.innerHTML = '';
  if (dayTasks.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No tasks for this day.';
    taskListEl.appendChild(li);
    return;
  }
  dayTasks.forEach(task => {
    const li = document.createElement('li');
    const titleSpan = document.createElement('span');
    titleSpan.textContent = task.title;
    li.appendChild(titleSpan);
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'task-actions';
    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️';
    editBtn.title = 'Edit';
    editBtn.addEventListener('click', () => openModal('edit', task));
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    deleteBtn.title = 'Delete';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));
    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);
    li.appendChild(actionsDiv);
    taskListEl.appendChild(li);
  });
};

// Modal handling
const openModal = (mode, task = null) => {
  taskForm.reset();
  if (mode === 'add') {
    modalTitle.textContent = 'Add Task';
    taskIdInput.value = '';
    taskDateInput.value = selectedDate;
  } else if (mode === 'edit' && task) {
    modalTitle.textContent = 'Edit Task';
    taskIdInput.value = task.id;
    taskTitleInput.value = task.title;
    taskDescInput.value = task.description;
    taskDateInput.value = task.date;
  }
  taskModal.classList.remove('hidden');
};
const closeModal = () => {
  taskModal.classList.add('hidden');
};

// CRUD operations
const addTask = (task) => {
  tasks.push(task);
  saveTasks(tasks);
  renderCalendar();
  renderTaskList();
};
const updateTask = (updated) => {
  tasks = tasks.map(t => (t.id === updated.id ? updated : t));
  saveTasks(tasks);
  renderCalendar();
  renderTaskList();
};
const deleteTask = (id) => {
  if (!confirm('Are you sure you want to delete this task?')) return;
  tasks = tasks.filter(t => t.id !== id);
  saveTasks(tasks);
  renderCalendar();
  renderTaskList();
};

// Form submission
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = taskIdInput.value;
  const title = taskTitleInput.value.trim();
  const description = taskDescInput.value.trim();
  const date = taskDateInput.value;

  // Simple validation
  const titlePattern = /^[\w\s-]{1,50}$/;
  if (!titlePattern.test(title)) {
    alert('Title must be 1-50 characters and can include letters, numbers, spaces, hyphens, and underscores.');
    return;
  }

  if (id) {
    updateTask({ id, title, description, date });
  } else {
    const newTask = {
      id: Date.now().toString(),
      title,
      description,
      date,
    };
    addTask(newTask);
  }
  closeModal();
});

cancelBtn.addEventListener('click', closeModal);

// Navigation buttons
document.getElementById('prevMonth').addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});
document.getElementById('nextMonth').addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

// Add task button
addTaskBtn.addEventListener('click', () => openModal('add'));

// Initialize
selectedDateEl.textContent = selectedDate;
renderCalendar();
renderTaskList();
