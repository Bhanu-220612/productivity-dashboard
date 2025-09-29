// Task Management
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let timer;
let timerTime = 25 * 60; // 25 minutes in seconds
let isTimerRunning = false;
let sessionsCompleted = 0;
let totalFocusTime = 0;

// Initialize dashboard
function initDashboard() {
    updateTime();
    loadTasks();
    updateStats();
    loadNotes();
    setInterval(updateTime, 1000);
}

// Update current time
function updateTime() {
    const now = new Date();
    document.getElementById('currentTime').textContent = now.toLocaleString();
}

// Task Functions
function addTask() {
    const taskInput = document.getElementById('taskInput');
    const text = taskInput.value.trim();
    
    if (text === '') return;
    
    const task = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date()
    };
    
    tasks.push(task);
    taskInput.value = '';
    saveTasks();
    loadTasks();
    updateStats();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    loadTasks();
    updateStats();
}

function toggleTask(id) {
    const task = tasks.find(task => task.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        loadTasks();
        updateStats();
    }
}

function loadTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    
    tasks.forEach(task => {
        const taskItem = document.createElement('div');
        taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskItem.innerHTML = `
            <span>${task.text}</span>
            <div class="task-actions">
                <button class="complete-btn" onclick="toggleTask(${task.id})">
                    ${task.completed ? 'Undo' : 'Complete'}
                </button>
                <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        `;
        taskList.appendChild(taskItem);
    });
    
    document.getElementById('totalTasks').textContent = tasks.length;
    document.getElementById('completedTasks').textContent = tasks.filter(t => t.completed).length;
}

// Timer Functions
function startTimer() {
    if (!isTimerRunning) {
        isTimerRunning = true;
        timer = setInterval(updateTimer, 1000);
    }
}

function pauseTimer() {
    isTimerRunning = false;
    clearInterval(timer);
}

function resetTimer() {
    pauseTimer();
    timerTime = 25 * 60;
    updateTimerDisplay();
}

function updateTimer() {
    if (timerTime > 0) {
        timerTime--;
        updateTimerDisplay();
    } else {
        pauseTimer();
        sessionsCompleted++;
        totalFocusTime += 25;
        document.getElementById('sessionCount').textContent = sessionsCompleted;
        updateStats();
        alert('Timer completed! Take a 5-minute break.');
        resetTimer();
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(timerTime / 60);
    const seconds = timerTime % 60;
    document.getElementById('timerDisplay').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Notes Functions
function saveNotes() {
    const notes = document.getElementById('notesInput').value;
    localStorage.setItem('productivityNotes', notes);
    alert('Notes saved!');
}

function loadNotes() {
    const savedNotes = localStorage.getItem('productivityNotes');
    if (savedNotes) {
        document.getElementById('notesInput').value = savedNotes;
    }
}

// Habit Tracker
function toggleHabit(index) {
    const habitBtns = document.querySelectorAll('.habit-btn');
    const btn = habitBtns[index];
    btn.classList.toggle('completed');
    btn.textContent = btn.classList.contains('completed') ? '✓' : '○';
}

// Stats Functions
function updateStats() {
    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;
    const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const focusHours = Math.floor(totalFocusTime / 60);
    const focusMinutes = totalFocusTime % 60;
    
    document.getElementById('focusTime').textContent = `${focusHours}h ${focusMinutes}m`;
    document.getElementById('tasksCompleted').textContent = completedTasks;
    document.getElementById('productivityScore').textContent = `${productivityScore}%`;
}

// Local Storage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initDashboard);

// Add task on Enter key
document.getElementById('taskInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});