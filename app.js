const STORAGE_KEY = 'todo-list-items';

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const remainingCount = document.getElementById('remaining-count');

let todos = loadTodos();

// 從 localStorage 讀取待辦資料，若格式異常則回傳空陣列。
function loadTodos() {
  try {
    const savedTodos = localStorage.getItem(STORAGE_KEY);
    const parsedTodos = savedTodos ? JSON.parse(savedTodos) : [];
    return Array.isArray(parsedTodos) ? parsedTodos : [];
  } catch (error) {
    console.warn('讀取待辦資料失敗，將改用空清單。', error);
    return [];
  }
}

// 將目前清單寫回 localStorage，讓重新整理後仍可保留資料。
function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// 產生每一筆待辦的唯一識別碼。
function createTodoId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// 根據目前資料重新繪製清單、空狀態與未完成數量。
function renderTodos() {
  todoList.replaceChildren();

  todos.forEach((todo) => {
    const item = document.createElement('li');
    item.className = todo.completed ? 'todo-item is-completed' : 'todo-item';
    item.dataset.id = todo.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = todo.completed;
    checkbox.setAttribute('aria-label', `勾選待辦事項：${todo.text}`);

    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = todo.text;

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'delete-button';
    deleteButton.textContent = '刪除';
    deleteButton.setAttribute('aria-label', `刪除待辦事項：${todo.text}`);

    item.append(checkbox, text, deleteButton);
    todoList.append(item);
  });

  emptyState.hidden = todos.length > 0;

  const unfinishedCount = todos.filter((todo) => !todo.completed).length;
  remainingCount.textContent = `未完成:${unfinishedCount} 項`;
}

// 新增待辦事項，會先忽略只有空白的輸入內容。
function addTodo(text) {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return;
  }

  todos.push({
    id: createTodoId(),
    text: trimmedText,
    completed: false,
  });

  saveTodos();
  renderTodos();
}

// 切換指定待辦的完成狀態。
function toggleTodo(todoId) {
  todos = todos.map((todo) => {
    if (todo.id === todoId) {
      return {
        ...todo,
        completed: !todo.completed,
      };
    }

    return todo;
  });

  saveTodos();
  renderTodos();
}

// 刪除指定的待辦事項。
function deleteTodo(todoId) {
  todos = todos.filter((todo) => todo.id !== todoId);
  saveTodos();
  renderTodos();
}

// 表單送出時新增待辦，並清空輸入框。
todoForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addTodo(todoInput.value);
  todoInput.value = '';
  todoInput.focus();
});

// 使用事件委派處理勾選與刪除操作。
todoList.addEventListener('click', (event) => {
  const item = event.target.closest('.todo-item');

  if (!item) {
    return;
  }

  const todoId = item.dataset.id;

  if (event.target.matches('.todo-checkbox')) {
    toggleTodo(todoId);
  }

  if (event.target.matches('.delete-button')) {
    deleteTodo(todoId);
  }
});

renderTodos();