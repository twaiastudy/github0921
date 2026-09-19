const STORAGE_KEY = 'todo-list-items';

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const remainingCount = document.getElementById('remaining-count');
const filterButtons = document.querySelectorAll('.filter-button');

let todos = loadTodos();
let currentFilter = 'all';

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

// 依目前篩選條件取得要顯示的待辦事項。
function getVisibleTodos() {
  if (currentFilter === 'active') {
    return todos.filter((todo) => !todo.completed);
  }

  if (currentFilter === 'completed') {
    return todos.filter((todo) => todo.completed);
  }

  return todos;
}

// 當篩選結果為空時，提供清楚的提示文字。
function getEmptyMessage() {
  if (todos.length === 0) {
    return '還沒有任何待辦事項,新增一個吧!';
  }

  if (currentFilter === 'active') {
    return '目前沒有未完成的事項,這些項目只是被篩選掉,不是被刪除。切換到「全部」可再次查看。';
  }

  if (currentFilter === 'completed') {
    return '目前沒有已完成的事項,這些項目只是被篩選掉,不是被刪除。切換到「全部」可再次查看。';
  }

  return '還沒有任何待辦事項,新增一個吧!';
}

// 根據目前資料重新繪製清單、空狀態與未完成數量。
function renderTodos() {
  const visibleTodos = getVisibleTodos();

  todoList.replaceChildren();

  visibleTodos.forEach((todo) => {
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

  emptyState.hidden = visibleTodos.length > 0;
  emptyState.textContent = getEmptyMessage();

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

// 切換清單篩選條件。
function setFilter(filter) {
  currentFilter = filter;

  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === filter;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

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

// 按下篩選按鈕時，只顯示對應項目。
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setFilter(button.dataset.filter);
  });
});

renderTodos();