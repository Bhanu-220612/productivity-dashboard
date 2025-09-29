// AI Suggestions based on time and mood
const aiSuggestions = {
    morning: ["Plan your day", "Review goals", "Exercise session", "Deep work block"],
    afternoon: ["Lunch break", "Creative work", "Meetings", "Learning time"],
    evening: ["Review progress", "Plan tomorrow", "Relaxation", "Reading"],
    focus: ["Pomodoro sessions", "Distraction-free work", "Single task focus"],
    creative: ["Brainstorming", "Idea generation", "Prototype building"],
    learning: ["Study session", "Practice coding", "Watch tutorials"],
    planning: ["Goal setting", "Task prioritization", "Schedule review"]
};

// Initialize the dashboard
function initDashboard() {
    updateAISuggestions();
    createTimeBlocks();
    setupEventListeners();
    updateFocusScore();
}

// AI Suggestion Engine
function updateAISuggestions() {
    const hour = new Date().getHours();
    let timeOfDay = 'morning';
    if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    if (hour >= 17) timeOfDay = 'evening';

    const currentMood = document.querySelector('.mood-option.active').dataset.mood;
    
    const suggestions = [
        ...aiSuggestions[timeOfDay].slice(0, 2),
        ...aiSuggestions[currentMood].slice(0, 2)
    ];

    const aiContainer = document.getElementById('aiSuggestions');
    aiContainer.innerHTML = suggestions.map(suggestion => 
        `<div class="suggestion">${suggestion}</div>`
    ).join('');
}

// Create interactive time blocks
function createTimeBlocks() {
    const timeline = document.getElementById('timeline');
    for (let i = 0; i < 12; i++) {
        const block = document.createElement('div');
        block.className = 'time-block';
        block.addEventListener('click', () => scheduleTimeBlock(i));
        timeline.appendChild(block);
    }
}

// Voice Recognition
function setupVoiceRecognition() {
    const voiceBtn = document.getElementById('voiceBtn');
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    
    recognition.continuous = false;
    recognition.lang = 'en-US';

    voiceBtn.addEventListener('click', () => {
        recognition.start();
        voiceBtn.style.background = '#10b981';
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById('smartTaskInput').value = transcript;
        voiceBtn.style.background = 'var(--primary)';
        analyzeTaskWithAI(transcript);
    };
}

// AI Task Analysis
function analyzeTaskWithAI(taskText) {
    // Simulate AI analysis
    const complexity = taskText.length > 50 ? 'Complex' : 'Simple';
    const estimatedTime = Math.max(15, Math.min(120, taskText.length * 2));
    
    showAIAnalysis({
        complexity,
        estimatedTime,
        priority: taskText.includes('urgent') ? 'High' : 'Normal',
        suggestedTime: getOptimalTime()
    });
}

function showAIAnalysis(analysis) {
    const suggestion = `AI Analysis: ${analysis.complexity} task, ${analysis.estimatedTime}min, ${analysis.priority} priority`;
    const aiContainer = document.getElementById('aiSuggestions');
    aiContainer.innerHTML = `<div class="suggestion highlight">${suggestion}</div>` + aiContainer.innerHTML;
}

// Energy Level Tracking
function setupEnergyTracking() {
    const energyBars = document.querySelectorAll('.energy-bar');
    energyBars.forEach(bar => {
        bar.addEventListener('click', () => {
            energyBars.forEach(b => b.classList.remove('active'));
            bar.classList.add('active');
            updateFocusScore();
        });
    });
}

// Mood Selection
function setupMoodSelection() {
    const moodOptions = document.querySelectorAll('.mood-option');
    moodOptions.forEach(option => {
        option.addEventListener('click', () => {
            moodOptions.forEach(m => m.classList.remove('active'));
            option.classList.add('active');
            updateAISuggestions();
            updateFocusScore();
        });
    });
}

// Dynamic Focus Score
function updateFocusScore() {
    const energyLevel = document.querySelector('.energy-bar.active').dataset.level;
    const mood = document.querySelector('.mood-option.active').dataset.mood;
    
    const energyScore = (energyLevel / 4) * 50;
    const moodScore = mood === 'focus' ? 35 : 25;
    
    const focusScore = Math.min(100, energyScore + moodScore + 15);
    
    document.getElementById('focusScore').textContent = Math.round(focusScore) + '%';
    
    // Update progress ring
    const progressRing = document.querySelector('.ring-progress');
    const circumference = 314;
    const offset = circumference - (focusScore / 100) * circumference;
    progressRing.style.strokeDashoffset = offset;
}

// Time Block Scheduling
function scheduleTimeBlock(hour) {
    const currentMood = document.querySelector('.mood-option.active').dataset.mood;
    const suggestions = aiSuggestions[currentMood];
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    
    alert(`Scheduled for ${hour + 8}:00 - ${randomSuggestion}`);
}

// Event Listeners
function setupEventListeners() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        setupVoiceRecognition();
    } else {
        document.getElementById('voiceBtn').style.display = 'none';
    }
    
    setupEnergyTracking();
    setupMoodSelection();
    
    document.getElementById('aiAnalyzeBtn').addEventListener('click', () => {
        const taskText = document.getElementById('smartTaskInput').value;
        if (taskText) analyzeTaskWithAI(taskText);
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initDashboard);