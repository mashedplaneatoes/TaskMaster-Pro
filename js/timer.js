// Timer functionality

class TimerManager {
    constructor() {
        this.timerMode = 'pomodoro'; // pomodoro, stopwatch, countdown
        this.timerState = 'stopped'; // stopped, running, paused
        this.currentTask = null;
        this.timeRemaining = 25 * 60; // Default: 25 minutes in seconds
        this.initialTime = 25 * 60;
        this.timerInterval = null;
        this.pomodoroSession = 1;
        this.sessionHistory = [];
        
        // Pomodoro settings
        this.pomodoroSettings = {
            workDuration: 25, // minutes
            breakDuration: 5, // minutes
            longBreakDuration: 15, // minutes
            sessionsBeforeLongBreak: 4
        };
        
        this.init();
    }
    
    init() {
        // Load settings from localStorage
        const savedSettings = utils.loadFromLocalStorage('timerSettings');
        if (savedSettings) {
            this.pomodoroSettings = savedSettings;
        }
        
        // Load session history from localStorage
        const savedHistory = utils.loadFromLocalStorage('sessionHistory');
        if (savedHistory) {
            this.sessionHistory = savedHistory;
        }
        
        // Initialize UI elements
        this.initTimerControls();
        this.initTimerSettings();
        this.initFullscreenTimer();
        this.updateTimerDisplay();
        this.updateTaskSelect();
    }
    
    // Initialize timer controls
    initTimerControls() {
        const pomodoroBtn = document.getElementById('pomodoro-btn');
        const stopwatchBtn = document.getElementById('stopwatch-btn');
        const countdownBtn = document.getElementById('countdown-btn');
        const startTimerBtn = document.getElementById('start-timer');
        const pauseTimerBtn = document.getElementById('pause-timer');
        const resetTimerBtn = document.getElementById('reset-timer');
        const timerTaskSelect = document.getElementById('timer-task-select');
        
        // Timer mode buttons
        pomodoroBtn.addEventListener('click', () => this.setTimerMode('pomodoro'));
        stopwatchBtn.addEventListener('click', () => this.setTimerMode('stopwatch'));
        countdownBtn.addEventListener('click', () => this.setTimerMode('countdown'));
        
        // Timer control buttons
        startTimerBtn.addEventListener('click', () => this.startTimer());
        pauseTimerBtn.addEventListener('click', () => this.pauseTimer());
        resetTimerBtn.addEventListener('click', () => this.resetTimer());
        
        // Task selection
        timerTaskSelect.addEventListener('change', () => {
            const taskId = timerTaskSelect.value;
            if (taskId) {
                this.currentTask = window.taskManager.getTaskById(taskId);
            } else {
                this.currentTask = null;
            }
        });
    }
    
    // Initialize timer settings
    initTimerSettings() {
        const pomodoroWork = document.getElementById('pomodoro-work');
        const pomodoroBreak = document.getElementById('pomodoro-break');
        const pomodoroLongBreak = document.getElementById('pomodoro-long-break');
        const pomodoroSessions = document.getElementById('pomodoro-sessions');
        
        // Set initial values from settings
        pomodoroWork.value = this.pomodoroSettings.workDuration;
        pomodoroBreak.value = this.pomodoroSettings.breakDuration;
        pomodoroLongBreak.value = this.pomodoroSettings.longBreakDuration;
        pomodoroSessions.value = this.pomodoroSettings.sessionsBeforeLongBreak;
        
        // Add event listeners to update settings
        const updateSettings = () => {
            this.pomodoroSettings = {
                workDuration: parseInt(pomodoroWork.value) || 25,
                breakDuration: parseInt(pomodoroBreak.value) || 5,
                longBreakDuration: parseInt(pomodoroLongBreak.value) || 15,
                sessionsBeforeLongBreak: parseInt(pomodoroSessions.value) || 4
            };
            
            utils.saveToLocalStorage('timerSettings', this.pomodoroSettings);
            
                        // Update timer if in pomodoro mode and stopped
            if (this.timerMode === 'pomodoro' && this.timerState === 'stopped') {
                this.resetTimer();
            }
        };
        
        pomodoroWork.addEventListener('change', updateSettings);
        pomodoroBreak.addEventListener('change', updateSettings);
        pomodoroLongBreak.addEventListener('change', updateSettings);
        pomodoroSessions.addEventListener('change', updateSettings);
    }
    
    // Initialize fullscreen timer
    initFullscreenTimer() {
        const fullscreenBtn = document.getElementById('fullscreen-timer-btn');
        const fullscreenTimer = document.getElementById('fullscreen-timer');
        const fullscreenPause = document.getElementById('fullscreen-pause');
        const fullscreenStop = document.getElementById('fullscreen-stop');
        
        fullscreenBtn.addEventListener('click', () => {
            if (this.timerState === 'stopped') {
                this.startTimer();
            }
            
            fullscreenTimer.classList.remove('hidden');
            this.updateFullscreenDisplay();
        });
        
        fullscreenPause.addEventListener('click', () => {
            if (this.timerState === 'running') {
                this.pauseTimer();
                fullscreenPause.innerHTML = '<i class="fas fa-play"></i>';
            } else if (this.timerState === 'paused') {
                this.startTimer();
                fullscreenPause.innerHTML = '<i class="fas fa-pause"></i>';
            }
        });
        
        fullscreenStop.addEventListener('click', () => {
            this.resetTimer();
            fullscreenTimer.classList.add('hidden');
        });
        
        // Allow ESC key to exit fullscreen
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !fullscreenTimer.classList.contains('hidden')) {
                fullscreenTimer.classList.add('hidden');
            }
        });
    }
    
    // Set timer mode (pomodoro, stopwatch, countdown)
    setTimerMode(mode) {
        this.timerMode = mode;
        
        // Update UI
        document.querySelectorAll('.timer-mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`${mode}-btn`).classList.add('active');
        
        // Show/hide relevant settings
        document.getElementById('pomodoro-settings').style.display = mode === 'pomodoro' ? 'block' : 'none';
        document.getElementById('countdown-settings').style.display = mode === 'countdown' ? 'block' : 'none';
        
        // Reset timer
        this.resetTimer();
    }
    
    // Start timer
    startTimer() {
        if (this.timerState === 'running') return;
        
        // If timer was stopped (not paused), record start time
        if (this.timerState === 'stopped') {
            this.startTime = new Date();
            
            // For stopwatch, start from 0
            if (this.timerMode === 'stopwatch') {
                this.timeRemaining = 0;
            }
            // For countdown, get time from input
            else if (this.timerMode === 'countdown') {
                const hours = parseInt(document.getElementById('countdown-hours').value) || 0;
                const minutes = parseInt(document.getElementById('countdown-minutes').value) || 0;
                const seconds = parseInt(document.getElementById('countdown-seconds').value) || 0;
                
                this.timeRemaining = (hours * 3600) + (minutes * 60) + seconds;
                this.initialTime = this.timeRemaining;
                
                if (this.timeRemaining <= 0) {
                    alert('Please set a time greater than zero.');
                    return;
                }
            }
            // For pomodoro, use settings
            else if (this.timerMode === 'pomodoro') {
                // Determine if we're in a work or break session
                const isBreak = document.getElementById('timer-session-type').textContent.includes('Break');
                
                if (!isBreak) {
                    this.timeRemaining = this.pomodoroSettings.workDuration * 60;
                } else if (this.pomodoroSession % this.pomodoroSettings.sessionsBeforeLongBreak === 0) {
                    this.timeRemaining = this.pomodoroSettings.longBreakDuration * 60;
                } else {
                    this.timeRemaining = this.pomodoroSettings.breakDuration * 60;
                }
                
                this.initialTime = this.timeRemaining;
            }
        }
        
        this.timerState = 'running';
        
        // Update UI
        document.getElementById('start-timer').classList.add('hidden');
        document.getElementById('pause-timer').classList.remove('hidden');
        
        // Start interval
        this.timerInterval = setInterval(() => {
            if (this.timerMode === 'stopwatch') {
                this.timeRemaining++;
            } else {
                this.timeRemaining--;
            }
            
            this.updateTimerDisplay();
            this.updateFullscreenDisplay();
            
            // Check if timer is complete
            if (this.timerMode !== 'stopwatch' && this.timeRemaining <= 0) {
                this.timerComplete();
            }
        }, 1000);
    }
    
    // Pause timer
    pauseTimer() {
        if (this.timerState !== 'running') return;
        
        this.timerState = 'paused';
        clearInterval(this.timerInterval);
        
        // Update UI
        document.getElementById('start-timer').classList.remove('hidden');
        document.getElementById('pause-timer').classList.add('hidden');
    }
    
    // Reset timer
    resetTimer() {
        this.timerState = 'stopped';
        clearInterval(this.timerInterval);
        
        // Update UI
        document.getElementById('start-timer').classList.remove('hidden');
        document.getElementById('pause-timer').classList.add('hidden');
        
        // Reset time based on mode
        if (this.timerMode === 'pomodoro') {
            this.timeRemaining = this.pomodoroSettings.workDuration * 60;
            document.getElementById('timer-session-type').textContent = `Work Session ${this.pomodoroSession}`;
        } else if (this.timerMode === 'stopwatch') {
            this.timeRemaining = 0;
        } else if (this.timerMode === 'countdown') {
            this.timeRemaining = this.initialTime || 0;
        }
        
        this.updateTimerDisplay();
        this.updateFullscreenDisplay();
    }
    
    // Timer complete
    timerComplete() {
        clearInterval(this.timerInterval);
        this.timerState = 'stopped';
        
        // Play sound
        this.playAlarm();
        
        // Show notification
        const sessionType = document.getElementById('timer-session-type').textContent;
        utils.showNotification('Timer Complete', `Your ${sessionType} is complete!`);
        
        // Record session in history
        if (this.timerMode === 'pomodoro' && !sessionType.includes('Break')) {
            const sessionData = {
                date: new Date(),
                duration: this.initialTime,
                task: this.currentTask ? this.currentTask.id : null,
                taskName: this.currentTask ? this.currentTask.name : 'No task'
            };
            
            this.sessionHistory.push(sessionData);
            utils.saveToLocalStorage('sessionHistory', this.sessionHistory);
        }
        
        // For pomodoro, switch between work and break
        if (this.timerMode === 'pomodoro') {
            const isBreak = document.getElementById('timer-session-type').textContent.includes('Break');
            
            if (isBreak) {
                // After break, start next work session
                this.pomodoroSession++;
                document.getElementById('timer-session-type').textContent = `Work Session ${this.pomodoroSession}`;
                this.timeRemaining = this.pomodoroSettings.workDuration * 60;
            } else {
                // After work, start break
                if (this.pomodoroSession % this.pomodoroSettings.sessionsBeforeLongBreak === 0) {
                    document.getElementById('timer-session-type').textContent = 'Long Break';
                    this.timeRemaining = this.pomodoroSettings.longBreakDuration * 60;
                } else {
                    document.getElementById('timer-session-type').textContent = 'Short Break';
                    this.timeRemaining = this.pomodoroSettings.breakDuration * 60;
                }
            }
            
            this.initialTime = this.timeRemaining;
        }
        
        // Update UI
        document.getElementById('start-timer').classList.remove('hidden');
        document.getElementById('pause-timer').classList.add('hidden');
        this.updateTimerDisplay();
        this.updateFullscreenDisplay();
    }
    
    // Play alarm sound
    playAlarm() {
        const audio = new Audio('/assets/sounds/alarm.mp3');
        audio.play();
    }
    
    // Update timer display
    updateTimerDisplay() {
        const timerElement = document.getElementById('timer');
        timerElement.textContent = utils.formatDuration(this.timeRemaining);
        
        // Update progress bar
        if (this.timerMode !== 'stopwatch' && this.initialTime > 0) {
            const progress = (1 - (this.timeRemaining / this.initialTime)) * 100;
            document.getElementById('timer-progress').style.width = `${progress}%`;
        } else if (this.timerMode === 'stopwatch') {
            // For stopwatch, no progress bar
            document.getElementById('timer-progress').style.width = '0%';
        }
    }
    
    // Update fullscreen timer display
    updateFullscreenDisplay() {
        const fullscreenTimer = document.getElementById('fullscreen-timer-display');
        fullscreenTimer.textContent = utils.formatDuration(this.timeRemaining);
        
        // Update task name
        const taskName = document.getElementById('fullscreen-task-name');
        if (this.currentTask) {
            taskName.textContent = this.currentTask.name;
        } else {
            const sessionType = document.getElementById('timer-session-type').textContent;
            taskName.textContent = sessionType;
        }
    }
    
    // Update task select dropdown
    updateTaskSelect() {
        const taskSelect = document.getElementById('timer-task-select');
        const tasks = window.taskManager.getAllTasks().filter(task => task.status !== 'completed');
        
        // Clear current options
        taskSelect.innerHTML = '<option value="">No task</option>';
        
        // Add task options
        tasks.forEach(task => {
            const option = document.createElement('option');
            option.value = task.id;
            option.textContent = task.name;
            taskSelect.appendChild(option);
        });
        
        // If current task exists, select it
        if (this.currentTask) {
            const taskExists = tasks.some(task => task.id === this.currentTask.id);
            if (taskExists) {
                taskSelect.value = this.currentTask.id;
            } else {
                this.currentTask = null;
            }
        }
    }
    
    // Start timer for a specific task
    startTimerForTask(task) {
        this.currentTask = task;
        this.updateTaskSelect();
        
        // Set timer mode to pomodoro
        this.setTimerMode('pomodoro');
        
        // Start timer
        this.startTimer();
    }
    
    // Get session history
    getSessionHistory() {
        return this.sessionHistory;
    }
    
    // Get total focus time for today
    getTodayFocusTime() {
        const today = new Date().toDateString();
        return this.sessionHistory
            .filter(session => new Date(session.date).toDateString() === today)
            .reduce((total, session) => total + session.duration, 0);
    }
    
    // Get total focus time for a specific task
    getTaskFocusTime(taskId) {
        return this.sessionHistory
            .filter(session => session.task === taskId)
            .reduce((total, session) => total + session.duration, 0);
    }
}

// Initialize timer manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.timerManager = new TimerManager();
});


