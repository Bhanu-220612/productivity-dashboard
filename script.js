let tasks = [];
let taskId = 1;

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();
    
    if (taskText === '') return;
    
    const task = {
        id: taskId++,
        text: taskText,
        completed: false
    };
    
    tasks.push(task);
    taskInput.value = '';
    updateTaskList();
    updateStats();
}

function updateTaskList() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span style="${task.completed ? 'text-decoration: line-through; color: #888;' : ''}">
                ${task.text}
            </span>
            <div>
                <button onclick="completeTask(${task.id})">Complete</button>
                <button onclick="deleteTask(${task.id})" style="background: #dc3545;">Delete</button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

function completeTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        updateTaskList();
        updateStats();
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    updateTaskList();
    updateStats();
}

function updateStats() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    
    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('completedTasks').textContent = completedTasks;
}

// Allow adding task with Enter key
document.getElementById('taskInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});