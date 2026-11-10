
const API_URL = "/todos";

const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");
const emptyState = document.getElementById("empty-state");
const message = document.getElementById("message");

const totalCount = document.getElementById("total-count");
const completedCount = document.getElementById("completed-count");
const pendingCount = document.getElementById("pending-count");


// Show success or error messages
function showMessage(text, type) {
    message.textContent = text;
    message.className = type;

    setTimeout(() => {
        message.textContent = "";
        message.className = "";
    }, 3000);
}


// Load all todos from Flask
async function loadTodos() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Could not fetch tasks");
        }

        const data = await response.json();

        displayTodos(data.todos);

    } catch (error) {
        showMessage(error.message, "error");
    }
}


// Display todos on the page
function displayTodos(todos) {
    todoList.replaceChildren();

    emptyState.style.display = todos.length === 0 ? "block" : "none";

    let completed = 0;

    todos.forEach(todo => {
        if (todo.completed) {
            completed++;
        }

        const li = document.createElement("li");
        li.className = "todo-item";

        // Checkbox
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "todo-checkbox";
        checkbox.checked = todo.completed;

        checkbox.addEventListener("change", () => {
            updateTodo(todo.id, {
                completed: checkbox.checked
            });
        });

        // Task title
        const title = document.createElement("span");
        title.className = "todo-title";
        title.textContent = todo.title;

        if (todo.completed) {
            title.classList.add("completed");
        }

        // Action buttons
        const actions = document.createElement("div");
        actions.className = "actions";

        const editButton = document.createElement("button");
        editButton.className = "action-btn edit-btn";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", () => {
            editTodo(todo);
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "action-btn delete-btn";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            deleteTodo(todo.id);
        });

        actions.append(editButton, deleteButton);
        li.append(checkbox, title, actions);

        todoList.appendChild(li);
    });

    // Update statistics
    totalCount.textContent = todos.length;
    completedCount.textContent = completed;
    pendingCount.textContent = todos.length - completed;
}


// Add a new todo
todoForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = todoInput.value.trim();

    if (!title) {
        showMessage("Please enter a task.", "error");
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title: title })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Could not add task");
        }

        todoInput.value = "";
        showMessage("Task added successfully!", "success");

        loadTodos();

    } catch (error) {
        showMessage(error.message, "error");
    }
});


// Update a todo
async function updateTodo(id, updatedData) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || data.error || "Could not update task");
        }

        showMessage("Task updated successfully!", "success");
        loadTodos();

    } catch (error) {
        showMessage(error.message, "error");
        loadTodos();
    }
}


// Edit task title
function editTodo(todo) {
    const newTitle = prompt("Edit your task:", todo.title);

    if (newTitle === null) {
        return;
    }

    if (!newTitle.trim()) {
        showMessage("Task title cannot be empty.", "error");
        return;
    }

    updateTodo(todo.id, {
        title: newTitle.trim()
    });
}


// Delete a todo
async function deleteTodo(id) {
    const confirmDelete = confirm("Are you sure you want to delete this task?");

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not delete task");
        }

        showMessage("Task deleted successfully!", "success");
        loadTodos();

    } catch (error) {
        showMessage(error.message, "error");
    }
}


// Refresh button
document.getElementById("refresh-btn").addEventListener("click", loadTodos);


// Load todos when page opens
loadTodos();
