// Statistics functionality

class StatsManager {
    constructor() {
        this.init();
    }
    
    init() {
        // Initialize charts
        this.initTaskStats();
        this.initFocusTimeStats();
        this.initProductivityStats();
        
        // Update stats when tab is clicked
        document.querySelectorAll('.stats-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.stats-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                document.querySelectorAll('.stats-content').forEach(content => content.classList.remove('active'));
                document.getElementById(tab.dataset.tab).classList.add('active');
                
                // Refresh charts when tab is shown
                this.refreshCharts(tab.dataset.tab);
            });
        });
    }
    
    // Initialize task statistics
    initTaskStats() {
        // Get task data
        const tasks = window.taskManager.getAllTasks();
        
        // Calculate task stats
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        // Update task stats in UI
        document.getElementById('stats-total-tasks').textContent = totalTasks;
        document.getElementById('stats-completed-tasks').textContent = completedTasks;
        document.getElementById('stats-completion-rate').textContent = `${completionRate}%`;
        
        // Create task status chart
        this.createTaskStatusChart();
        
        // Create task priority chart
        this.createTaskPriorityChart();
    }
    
    // Create task status chart
    createTaskStatusChart() {
        const tasks = window.taskManager.getAllTasks();
        
        // Count tasks by status
        const statusCounts = {
            'todo': 0,
            'in-progress': 0,
            'review': 0,
            'completed': 0
        };
        
        tasks.forEach(task => {
            statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
        });
        
        // Create chart
        const ctx = document.getElementById('task-status-chart').getContext('2d');
        
        if (this.taskStatusChart) {
            this.taskStatusChart.destroy();
        }
        
        this.taskStatusChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['To Do', 'In Progress', 'Review', 'Completed'],
                datasets: [{
                    data: [
                        statusCounts['todo'],
                        statusCounts['in-progress'],
                        statusCounts['review'],
                        statusCounts['completed']
                    ],
                    backgroundColor: [
                        '#4a90e2',
                        '#f5a623',
                        '#9013fe',
                        '#50e3c2'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    // Create task priority chart
    createTaskPriorityChart() {
        const tasks = window.taskManager.getAllTasks();
        
        // Count tasks by priority
        const priorityCounts = {
            'high': 0,
            'medium': 0,
            'low': 0
        };
        
        tasks.forEach(task => {
            priorityCounts[task.priority] = (priorityCounts[task.priority] || 0) + 1;
        });
        
        // Create chart
        const ctx = document.getElementById('task-priority-chart').getContext('2d');
        
        if (this.taskPriorityChart) {
            this.taskPriorityChart.destroy();
        }
        
        this.taskPriorityChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['High', 'Medium', 'Low'],
                datasets: [{
                    label: 'Tasks by Priority',
                    data: [
                        priorityCounts['high'],
                        priorityCounts['medium'],
                        priorityCounts['low']
                    ],
                    backgroundColor: [
                        '#d0021b',
                        '#f5a623',
                        '#7ed321'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }
    
    // Initialize focus time statistics
    initFocusTimeStats() {
        // Get session history
        const sessions = window.timerManager.getSessionHistory();
        
        // Calculate focus time stats
        const totalFocusTime = sessions.reduce((total, session) => total + session.duration, 0);
        const todayFocusTime = window.timerManager.getTodayFocusTime();
        
        // Update focus time stats in UI
        document.getElementById('stats-total-focus-time').textContent = utils.formatDurationForStats(totalFocusTime);
        document.getElementById('stats-today-focus-time').textContent = utils.formatDurationForStats(todayFocusTime);
        
        // Create focus time chart
        this.createFocusTimeChart();
        
        // Create focus time by task chart
        this.createFocusTimeByTaskChart();
    }
    
    // Create focus time chart
    createFocusTimeChart() {
        const sessions = window.timerManager.getSessionHistory();
        
        // Group sessions by day
        const focusByDay = {};
        const now = new Date();
        
        // Initialize last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            focusByDay[dateString] = 0;
        }
        
        // Sum up focus time by day
        sessions.forEach(session => {
            const date = new Date(session.date);
            const dateString = date.toISOString().split('T')[0];
            
            // Only include last 7 days
            if (focusByDay[dateString] !== undefined) {
                focusByDay[dateString] += session.duration;
            }
        });
        
        // Create chart
        const ctx = document.getElementById('focus-time-chart').getContext('2d');
        
        if (this.focusTimeChart) {
            this.focusTimeChart.destroy();
        }
        
        this.focusTimeChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Object.keys(focusByDay).map(date => {
                    const d = new Date(date);
                    return d.toLocaleDateString(undefined, { weekday: 'short' });
                }),
                datasets: [{
                    label: 'Focus Time (minutes)',
                    data: Object.values(focusByDay).map(seconds => Math.round(seconds / 60)),
                    borderColor: '#4a90e2',
                    backgroundColor: 'rgba(74, 144, 226, 0.1)',
                    fill: true,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Minutes'
                        }
                    }
                }
            }
        });
    }
    
    // Create focus time by task chart
    createFocusTimeByTaskChart() {
        const sessions = window.timerManager.getSessionHistory();
        const tasks = window.taskManager.getAllTasks();
        
        // Group sessions by task
        const focusByTask = {};
        
        // Sum up focus time by task
        sessions.forEach(session => {
            if (session.task) {
                focusByTask[session.task] = (focusByTask[session.task] || 0) + session.duration;
            } else {
                focusByTask['No task'] = (focusByTask['No task'] || 0) + session.duration;
            }
        });
        
        // Sort tasks by focus time (descending)
        const sortedTasks = Object.entries(focusByTask)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5); // Top 5 tasks
        
        // Create chart
        const ctx = document.getElementById('focus-by-task-chart').getContext('2d');
        
        if (this.focusByTaskChart) {
            this.focusByTaskChart.destroy();
        }
        
        this.focusByTaskChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedTasks.map(([taskId]) => {
                    if (taskId === 'No task') return 'No task';
                    const task = tasks.find(t => t.id === taskId);
                    return task ? task.name : 'Unknown task';
                }),
                datasets: [{
                    label: 'Focus Time (minutes)',
                    data: sortedTasks.map(([, duration]) => Math.round(duration / 60)),
                    backgroundColor: [
                        '#4a90e2',
                        '#50e3c2',
                        '#f5a623',
                        '#9013fe',
                        '#d0021b'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Minutes'
                        }
                    }
                }
            }
        });
    }
    
    // Initialize productivity statistics
    initProductivityStats() {
        // Get task and session data
        const tasks = window.taskManager.getAllTasks();
        const sessions = window.timerManager.getSessionHistory();
        
        // Calculate productivity stats
        const completedTasks = tasks.filter(task => task.status === 'completed');
        const averageCompletionTime = this.calculateAverageCompletionTime(completedTasks);
        const mostProductiveDay = this.calculateMostProductiveDay(sessions);
        
        // Update productivity stats in UI
        document.getElementById('stats-avg-completion-time').textContent = 
            averageCompletionTime ? utils.formatDurationForStats(averageCompletionTime) : 'N/A';
        
        document.getElementById('stats-most-productive-day').textContent = 
            mostProductiveDay ? mostProductiveDay : 'N/A';
                    // Create productivity by day of week chart
        this.createProductivityByDayChart();
        
        // Create task completion time chart
        this.createCompletionTimeChart();
    }
    
    // Calculate average completion time
    calculateAverageCompletionTime(completedTasks) {
        if (completedTasks.length === 0) return null;
        
        let totalCompletionTime = 0;
        let tasksWithCompletionTime = 0;
        
        completedTasks.forEach(task => {
            if (task.completedAt && task.createdAt) {
                const completionTime = new Date(task.completedAt) - new Date(task.createdAt);
                totalCompletionTime += completionTime;
                tasksWithCompletionTime++;
            }
        });
        
        return tasksWithCompletionTime > 0 ? Math.floor(totalCompletionTime / tasksWithCompletionTime / 1000) : null;
    }
    
    // Calculate most productive day
    calculateMostProductiveDay(sessions) {
        if (sessions.length === 0) return null;
        
        // Group sessions by day of week
        const focusByDay = {
            0: 0, // Sunday
            1: 0, // Monday
            2: 0, // Tuesday
            3: 0, // Wednesday
            4: 0, // Thursday
            5: 0, // Friday
            6: 0  // Saturday
        };
        
        // Sum up focus time by day of week
        sessions.forEach(session => {
            const date = new Date(session.date);
            const day = date.getDay();
            focusByDay[day] += session.duration;
        });
        
        // Find day with most focus time
        let maxDay = 0;
        let maxTime = 0;
        
        for (const [day, time] of Object.entries(focusByDay)) {
            if (time > maxTime) {
                maxDay = parseInt(day);
                maxTime = time;
            }
        }
        
        // Return day name
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[maxDay];
    }
    
    // Create productivity by day of week chart
    createProductivityByDayChart() {
        const sessions = window.timerManager.getSessionHistory();
        
        // Group sessions by day of week
        const focusByDay = {
            0: 0, // Sunday
            1: 0, // Monday
            2: 0, // Tuesday
            3: 0, // Wednesday
            4: 0, // Thursday
            5: 0, // Friday
            6: 0  // Saturday
        };
        
        // Sum up focus time by day of week
        sessions.forEach(session => {
            const date = new Date(session.date);
            const day = date.getDay();
            focusByDay[day] += session.duration;
        });
        
        // Create chart
        const ctx = document.getElementById('productivity-by-day-chart').getContext('2d');
        
        if (this.productivityByDayChart) {
            this.productivityByDayChart.destroy();
        }
        
        this.productivityByDayChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                datasets: [{
                    label: 'Focus Time (minutes)',
                    data: Object.values(focusByDay).map(seconds => Math.round(seconds / 60)),
                    backgroundColor: 'rgba(74, 144, 226, 0.2)',
                    borderColor: '#4a90e2',
                    pointBackgroundColor: '#4a90e2',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#4a90e2'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // Create task completion time chart
    createCompletionTimeChart() {
        const tasks = window.taskManager.getAllTasks();
        const completedTasks = tasks.filter(task => task.status === 'completed' && task.completedAt && task.createdAt);
        
        // Group tasks by completion time
        const completionTimes = {
            'under1h': 0,
            '1to4h': 0,
            '4to24h': 0,
            '1to3d': 0,
            'over3d': 0
        };
        
        completedTasks.forEach(task => {
            const completionTime = new Date(task.completedAt) - new Date(task.createdAt);
            const hours = completionTime / (1000 * 60 * 60);
            
            if (hours < 1) {
                completionTimes['under1h']++;
            } else if (hours < 4) {
                completionTimes['1to4h']++;
            } else if (hours < 24) {
                completionTimes['4to24h']++;
            } else if (hours < 72) {
                completionTimes['1to3d']++;
            } else {
                completionTimes['over3d']++;
            }
        });
        
        // Create chart
        const ctx = document.getElementById('completion-time-chart').getContext('2d');
        
        if (this.completionTimeChart) {
            this.completionTimeChart.destroy();
        }
        
        this.completionTimeChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Under 1 hour', '1-4 hours', '4-24 hours', '1-3 days', 'Over 3 days'],
                datasets: [{
                    data: [
                        completionTimes['under1h'],
                        completionTimes['1to4h'],
                        completionTimes['4to24h'],
                        completionTimes['1to3d'],
                        completionTimes['over3d']
                    ],
                    backgroundColor: [
                        '#7ed321',
                        '#50e3c2',
                        '#4a90e2',
                        '#f5a623',
                        '#d0021b'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    // Refresh charts based on tab
    refreshCharts(tabId) {
        if (tabId === 'task-stats') {
            this.createTaskStatusChart();
            this.createTaskPriorityChart();
        } else if (tabId === 'focus-stats') {
            this.createFocusTimeChart();
            this.createFocusTimeByTaskChart();
        } else if (tabId === 'productivity-stats') {
            this.createProductivityByDayChart();
            this.createCompletionTimeChart();
        }
    }
}

// Initialize stats manager when DOM is loaded
window.statsManager = new StatsManager();


        
    
