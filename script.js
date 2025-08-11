// Improved and robust script: theme toggle, storage, filters, animations, edit/save
const root = document.documentElement;
const tasksList = document.getElementById('tasks-list');
const addForm = document.getElementById('add-task');
const filterForm = document.getElementById('tasks-filter');
const themeToggle = document.getElementById('theme-toggle');
const completeAllBtn = document.getElementById('complete-all');
const clearCompletedBtn = document.getElementById('clear-completed');
const taskCountEl = document.getElementById('task-count');

///////// THEME //////
function setTheme(theme){
  root.setAttribute('data-theme', theme);
  localStorage.setItem('todo-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
  themeToggle.setAttribute('aria-pressed', theme === 'dark');
}
(function initTheme(){
  const saved = localStorage.getItem('todo-theme');
  if(saved === 'dark' || saved === 'light'){ setTheme(saved); }
  else {
    // default: prefer light
    setTheme('light');
  }
})();

themeToggle.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  setTheme(next);
});

///////// TASK ELEMENT CREATION //////
function createTaskElement(text, done = false){
  const li = document.createElement('li');
  li.className = 'task';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'check-task';
  checkbox.checked = !!done;

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'task-name';
  input.value = text || '';
  input.readOnly = true;
  if(done) input.style.textDecoration = 'line-through';

  const actions = document.createElement('div');
  actions.className = 'actions';

  const editBtn = document.createElement('button');
  editBtn.className = 'icon-btn edit-btn';
  editBtn.type = 'button';
  editBtn.textContent = '✏️ Edit';

  const delBtn = document.createElement('button');
  delBtn.className = 'icon-btn delete-btn';
  delBtn.type = 'button';
  delBtn.textContent = '🗑 Delete';

  actions.append(editBtn, delBtn);
  li.append(checkbox, input, actions);
  return li;
}

///////// STORAGE //////
function saveTasks(){
  const arr = [];
  tasksList.querySelectorAll('.task').forEach(li => {
    const text = li.querySelector('.task-name').value;
    const done = li.querySelector('.check-task').checked;
    arr.push({text, done});
  });
  localStorage.setItem('todo-tasks', JSON.stringify(arr));
}

function loadTasks(){
  const raw = localStorage.getItem('todo-tasks');
  let arr = [];
  try { arr = raw ? JSON.parse(raw) : []; } catch(e){ arr = []; }
  tasksList.innerHTML = '';
  if(arr.length === 0){
    // starter example
    tasksList.appendChild(createTaskElement('Example task — try editing me', false));
  } else {
    arr.forEach(t => tasksList.appendChild(createTaskElement(t.text, t.done)));
  }
  applyFilterToAll();
  updateTaskCount();
}

///////// FILTERS & COUNT //////
function getActiveFilter(){
  const checked = filterForm.querySelector('input[name="task filter"]:checked');
  return checked ? checked.value : 'both';
}

function applyFilterToTask(li){
  const f = getActiveFilter();
  const done = li.querySelector('.check-task').checked;
  if(f === 'checkedTasks') li.style.display = done ? 'flex' : 'none';
  else if(f === 'notCheckedTasks') li.style.display = !done ? 'flex' : 'none';
  else li.style.display = 'flex';
}

function applyFilterToAll(){
  tasksList.querySelectorAll('.task').forEach(li => applyFilterToTask(li));
}

function updateTaskCount(){
  const remaining = tasksList.querySelectorAll('.check-task:not(:checked)').length;
  taskCountEl.textContent = `${remaining} task${remaining !== 1 ? 's' : ''} remaining`;
}

filterForm.addEventListener('change', () => {
  applyFilterToAll();
});

///////// EVENTS: add / click / change / keyboard //////
addForm.addEventListener('submit', e => {
  e.preventDefault();
  const input = addForm.querySelector('input[type="text"]');
  const text = (input.value || '').trim();
  if(!text){ alert("Please enter a task name."); return; }
  const li = createTaskElement(text, false);
  tasksList.appendChild(li);
  input.value = '';
  applyFilterToTask(li);
  updateTaskCount();
  saveTasks();
});

tasksList.addEventListener('click', e => {
  const li = e.target.closest('li');
  if(!li) return;

  // delete
  if(e.target.classList.contains('delete-btn')){
    li.remove();
    saveTasks();
    updateTaskCount();
    return;
  }

  // edit / save
  if(e.target.classList.contains('edit-btn')){
    const input = li.querySelector('.task-name');
    if(input.readOnly){
      input.readOnly = false;
      input.focus();
      e.target.textContent = '💾 Save';
    } else {
      input.readOnly = true;
      e.target.textContent = '✏️ Edit';
      saveTasks();
    }
  }
});

// checkbox change
tasksList.addEventListener('change', e => {
  if(e.target.classList.contains('check-task')){
    const li = e.target.closest('li');
    li.querySelector('.task-name').style.textDecoration = e.target.checked ? 'line-through' : 'none';
    applyFilterToTask(li);
    updateTaskCount();
    saveTasks();
  }
});

// when user finishes editing (click away), ensure we save and switch button back
tasksList.addEventListener('focusout', e => {
  if(e.target.classList && e.target.classList.contains('task-name')){
    const li = e.target.closest('li');
    const btn = li.querySelector('.edit-btn');
    e.target.readOnly = true;
    if(btn) btn.textContent = '✏️ Edit';
    saveTasks();
  }
});

// allow press Enter while editing to finish
tasksList.addEventListener('keydown', e => {
  if(e.target.classList && e.target.classList.contains('task-name')){
    if(e.key === 'Enter'){ e.preventDefault(); e.target.blur(); }
  }
});

///////// BULK ACTIONS //////
completeAllBtn.addEventListener('click', () => {
  tasksList.querySelectorAll('.check-task').forEach(cb => {
    cb.checked = true;
    cb.closest('li').querySelector('.task-name').style.textDecoration = 'line-through';
  });
  applyFilterToAll();
  updateTaskCount();
  saveTasks();
});

clearCompletedBtn.addEventListener('click', () => {
  tasksList.querySelectorAll('.check-task:checked').forEach(cb => cb.closest('li').remove());
  applyFilterToAll();
  updateTaskCount();
  saveTasks();
});

///////// init //////
loadTasks();
