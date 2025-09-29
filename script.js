// Advanced Productivity Dashboard
let tasks = JSON.parse(localStorage.getItem('smartTasks')) || [];
let currentEnergy = 3;
let timerMode = 'focus';
let timerTime = 25 * 60;
let isTimerRunning = false;
let timerInterval;
let sessionsCompleted = 0;

// Initialize dashboard
function initDashboard() {
    updateTime();
    loadTasks();
    updateAnalytics();
    setInterval(updateTime, 1000);
    
    // Load saved energy level
    const savedEnergy = localStorage.getItem('currentEnergy');
    if (savedEnergy) {
        setEnergy(parseInt(savedEnergy));
    }
}

// Update current time
function updateTime() {
    const now = new Date();
    document.getElementById('currentTime').textContent = now.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// Energy Management
function setEnergy(level) {
    currentEnergy = level;
    localStorage.setItem('currentEnergy', level);
    
    // Update UI
    document.querySelectorAll('.energy-bar').forEach(bar => {
        bar.classList.remove('active');
    });
    document.querySelector(`.energy-bar[data-level="${level}"]`).classList.add('active');
    
    updateFocusScore();
    updateAISuggestions();
}

function updateFocusScore() {
    const baseScores = {1: 40, 2: 65, 3: 85, 4: 95};
    let score = baseScores[currentEnergy];
    
    // Adjust based on completed tasks
    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;
    if (totalTasks > 0) {
        const completionRate = (completedTasks / totalTasks) * 100;
        score = Math.min(100, (score + completionRate) / 2);
    }
    
    document.getElementById('focusPercent').textContent = Math.round(score) + '%';
    
    // Update circle progress (simplified)
    const circle = document.querySelector('.score-circle');
    circle.style.background = `conic-gradient(#48bb78 ${score}%, #e2e8f0 0%)`;
}

// Smart Task Analysis
function analyzeTask() {
    const input = document.getElementById('smartTaskInput').value.toLowerCase();
    const analysis = document.getElementById('taskAnalysis');
    
    if (!input) return;
    
    let priority = 'medium';
    let estimatedTime = '30-45 minutes';
    let suggestedTime = 'Current energy level';
    
    if (input.includes('urgent') || input.includes('important')) {
        priority = 'high';
        estimatedTime = '15-30 minutes';
        suggestedTime = 'Do now';
    } else if (input.includes('simple') || input.includes('quick')) {
        priority = 'low';
        estimatedTime = '10-20 minutes';
    }
    
    if (input.includes('research') || input.includes('study')) {
        estimatedTime = '60-90 minutes';
        suggestedTime = 'High energy periods';
    }
    
    analysis.innerHTML = `
        <strong>AI Analysis:</strong><br>
        📊 Priority: <span style="color: ${priority === 'high' ? '#e53e3e' : priority === 'medium' ? '#d69e2e' : '#38a169'}">${priority.toUpperCase()}</span><br>
        ⏱️ Estimated: ${estimatedTime}<br>
        🎯 Suggested: ${suggestedTime}
    `;
}

// Smart Task Management
function addSmartTask() {
    const input = document.getElementById('taskInput');
    const text = input.value.trim();
    
    if (!text) return;
    
    // Auto-detect priority
    let priority = 'low';
    if (text.toLowerCase().includes('urgent') || text.includes('🔥')) {
        priority = 'high';
    } else if (text.toLowerCase().includes('important') || text.includes('⚡')) {
        priority = 'medium';
    }
    
    const task = {
        id: Date.now(),
        text: text,
        priority: priority,
        completed: false,
        createdAt: new Date()
    };
    
    tasks.push(task);
    input.value = '';
    saveTasks();
    loadTasks();
    updateAnalytics();
    updateFocusScore();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    loadTasks();
    updateAnalytics();
    updateFocusScore();
}

function toggleTask(id) {
    const task = tasks.find(task => task.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        loadTasks();
        updateAnalytics();
        updateFocusScore();
    }
}

function filterTasks(priority) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    loadTasks(priority);
}

function loadTasks(filter = 'all') {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    
    let filteredTasks = tasks;
    if (filter !== 'all') {
        filteredTasks = tasks.filter(task => task.priority === filter);
    }
    
    filteredTasks.forEach(task => {
        const taskItem = document.createElement('div');
        taskItem.className = `task-item ${task.priority} ${task.completed ? 'completed' : ''}`;
        taskItem.innerHTML = `
            <div>
                <span>${task.text}</span>
                <div class="task-priority">${task.priority}</div>
            </div>
            <div class="task-actions">
                <button class="complete-btn" onclick="toggleTask(${task.id})">
                    ${task.completed ? '↶' : '✓'}
                </button>
                <button class="delete-btn" onclick="deleteTask(${task.id})">✕</button>
            </div>
        `;
        taskList.appendChild(taskItem);
    });
}

// Timer Functions
function setTimerMode(mode) {
    timerMode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const times = {focus: 25, break: 5, long: 15};
    timerTime = times[mode] * 60;
    resetTimer();
}

function startTimer() {
    if (!isTimerRunning) {
        isTimerRunning = true;
        timerInterval = setInterval(updateTimer, 1000);
    }
}

function pauseTimer() {
    isTimerRunning = false;
    clearInterval(timerInterval);
}

function resetTimer() {
    pauseTimer();
    const times = {focus: 25, break: 5, long: 15};
    timerTime = times[timerMode] * 60;
    updateTimerDisplay();
}

function updateTimer() {
    if (timerTime > 0) {
        timerTime--;
        updateTimerDisplay();
    } else {
        pauseTimer();
        sessionsCompleted++;
        document.getElementById('sessionCount').textContent = sessionsCompleted;
        
        if (timerMode === 'focus') {
            alert('🎉 Focus session completed! Take a break.');
            setTimerMode('break');
        } else {
            alert('💪 Break over! Ready for next focus session?');
            setTimerMode('focus');
        }
        
        updateAnalytics();
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(timerTime / 60);
    const seconds = timerTime % 60;
    document.getElementById('timerMinutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('timerSeconds').textContent = seconds.toString().padStart(2, '0');
}

// Analytics
function updateAnalytics() {
    const completedToday = tasks.filter(t => t.completed).length;
    const totalFocusTime = sessionsCompleted * 25; // 25 minutes per session
    
    document.getElementById('completedToday').textContent = completedToday;
    document.getElementById('focusHours').textContent = Math.floor(totalFocusTime / 60) + 'h ' + (totalFocusTime % 60) + 'm';
    
    const efficiency = tasks.length > 0 ? Math.round((completedToday / tasks.length) * 100) : 0;
    document.getElementById('efficiency').textContent = efficiency + '%';
}

// AI Suggestions based on energy and time
function updateAISuggestions() {
    const suggestions = document.getElementById('aiSuggestions');
    const energySuggestions = {
        1: ['Start with small, easy tasks', 'Take frequent short breaks', 'Listen to focus music'],
        2: ['Mix challenging and easy tasks', 'Use Pomodoro technique', 'Review your goals'],
        3: ['Tackle most important tasks', 'Deep work sessions', 'Learn something new'],
        4: ['Creative problem solving', 'Strategic planning', 'Mentor others']
    };
    
    const currentSuggestions = energySuggestions[currentEnergy];
    suggestions.innerHTML = currentSuggestions.map(s => `<div class="suggestion">${s}</div>`).join('');
}

// Local Storage
function saveTasks() {
    localStorage.setItem('smartTasks', JSON.stringify(tasks));
}

// Initialize
document.addEventListener('DOMContentLoaded', initDashboard);

// Keyboard shortcuts
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        if (document.activeElement.id === 'smartTaskInput') {
            analyzeTask();
        } else if (document.activeElement.id === 'taskInput') {
            addSmartTask();
        }
    }
});