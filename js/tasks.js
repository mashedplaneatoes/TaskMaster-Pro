// Task management functionality

class TaskManager {
    constructor() {
        this.tasks = [];
        this.labels = [];
        this.init();
    }
    
    init() {
        // Load tasks from localStorage
        const savedTasks = utils.loadFromLocalStorage('tasks');
        if (savedTasks) {
            this.tasks = savedTasks;
        }
        
        // Load labels from localStorage
        const savedLabels = utils.loadFromLocalStorage('labels');
        if (savedLabels) {
            this.labels = savedLabels;
        }
        
        // Initialize UI elements
        this.initTaskForm();
        this.initTaskList();
        this.initBoardView();
        this.initTaskFilters();
        
        // Update task counts
        this.updateTaskCounts();
    }
    
    // Initialize task form
    initTaskForm() {
        const taskForm = document.getElementById('task-form');
        const taskModal = document.getElementById('task-modal');
        const addTaskBtn = document.getElementById('add-task-btn');
        const cancelTaskBtn = document.getElementById('cancel-task');
        const closeModalBtns = document.querySelectorAll('.close-modal');
        const taskLabelsInput = document.getElementById('task-labels');
        
        // Open modal when add task button is clicked
        addTaskBtn.addEventListener('click', () => {
            document.getElementById('task-modal-title').textContent = 'Add New Task';
            taskForm.reset();
            document.getElementById('task-id').value = '';
            document.getElementById('selected-labels').innerHTML = '';
            taskModal.classList.add('active');
        });
        
        // Close modal when cancel button is clicked
        cancelTaskBtn.addEventListener('click', () => {
            taskModal.classList.remove('active');
        });
        
        // Close modal when X button is clicked
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                btn.closest('.modal').classList.remove('active');
            });
        });
        
        // Handle label input
        taskLabelsInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && taskLabelsInput.value.trim()) {
                e.preventDefault();
                const label = taskLabelsInput.value.trim();
                
                // Add to selected labels
                const selectedLabels = document.getElementById('selected-labels');
                const labelElement = document.createElement('div');
                labelElement.className = 'selected-label';
                labelElement.innerHTML = `
                    ${label}
                    <span class="remove-label">&times;</span>
                `;
                selectedLabels.appendChild(labelElement);
                
                // Add event listener to remove label
                labelElement.querySelector('.remove-label').addEventListener('click', () => {
                    labelElement.remove();
                });
                
                // Add to labels list if not exists
                if (!this.labels.includes(label)) {
                    this.labels.push(label);
                    utils.saveToLocalStorage('labels', this.labels);
                    this.updateLabelFilters();
                }
                
                // Clear input
                taskLabelsInput.value = '';
            }
        });
        
        // Handle form submission
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form values
            const taskId = document.getElementById('task-id').value;
            const name = document.getElementById('task-name').value;
            const description = document.getElementById('task-description').value;
            const dueDate = document.getElementById('task-due-date').value;
            const dueTime = document.getElementById('task-due-time').value;
            const priority = document.getElementById('task-priority').value;
            const status = document.getElementById('task-status').value;
            const color = document.getElementById('task-color').value;
            const background = document.getElementById('task-background').value;
            
            // Get selected labels
            const selectedLabelsElements = document.querySelectorAll('#selected-labels .selected-label');
            const labels = Array.from(selectedLabelsElements).map(el => el.textContent.trim().replace('×', ''));
            
            // Create task object
            const task = {
                id: taskId || utils.generateId(),
                name,
                description,
                dueDate: dueDate ? new Date(`${dueDate}T${dueTime || '23:59'}`) : null,
                priority,
                status,
                labels,
                color,
                background,
                createdAt: new Date(),
                completedAt: null
            };
            
            // Add or update task
            if (taskId) {
                // Update existing task
                const index = this.tasks.findIndex(t => t.id === taskId);
                if (index !== -1) {
                    // Preserve creation date and completion status if not changed
                    task.createdAt = this.tasks[index].createdAt;
                    if (this.tasks[index].status === 'completed' && status !== 'completed') {
                        task.completedAt = null;
                    } else if (this.tasks[index].status !== 'completed' && status === 'completed') {
                        task.completedAt = new Date();
                    } else {
                        task.completedAt = this.tasks[index].completedAt;
                    }
                    
                    this.tasks[index] = task;
                }
            } else {
                // Add new task
                if (status === 'completed') {
                    task.completedAt = new Date();
                }
                this.tasks.push(task);
            }
            
            // Save tasks
            utils.saveToLocalStorage('tasks', this.tasks);
            
            // Update UI
            this.renderTasks();
            this.updateTaskCounts();
            
            // Close modal
            taskModal.classList.remove('active');
        });
    }
    
    // Initialize task list
    initTaskList() {
        const taskList = document.getElementById('task-list');
        
        // Handle task list interactions
        taskList.addEventListener('click', (e) => {
            const taskItem = e.target.closest('.task-item');
            if (!taskItem) return;
            
            const taskId = taskItem.dataset.id;
            const task = this.tasks.find(t => t.id === taskId);
            
            if (e.target.closest('.task-checkbox')) {
                // Toggle task completion
                this.toggleTaskCompletion(taskId);
            } else if (e.target.closest('.edit-task')) {
                // Edit task
                this.editTask(taskId);
            } else if (e.target.closest('.delete-task')) {
                // Delete task
                this.deleteTask(taskId);
            } else if (e.target.closest('.start-timer')) {
                // Start timer for this task
                window.timerManager.startTimerForTask(task);
                
                // Switch to timer view
                document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
                document.getElementById('timer-view').classList.add('active');
                
                // Update sidebar active state
                document.querySelectorAll('.sidebar li').forEach(item => item.classList.remove('active'));
                document.querySelector('.sidebar li[data-view="timer"]').classList.add('active');
            } else {
                // Show task details
                this.showTaskDetails(taskId);
            }
        });
        
        // Initialize view buttons
        const listViewBtn = document.getElementById('list-view-btn');
        const boardViewBtn = document.getElementById('board-view-btn');
        const listView = document.getElementById('list-view');
        const boardView = document.getElementById('board-view');
        
        listViewBtn.addEventListener('click', () => {
            listViewBtn.classList.add('active');
            boardViewBtn.classList.remove('active');
            listView.classList.add('active');
            boardView.classList.remove('active');
        });
        
        boardViewBtn.addEventListener('click', () => {
            boardViewBtn.classList.add('active');
            listViewBtn.classList.remove('active');
            boardView.classList.add('active');
            listView.classList.remove('active');
        });
    }
    
    // Initialize board view with drag and drop
    initBoardView() {
        const boardColumns = document.querySelectorAll('.board-column');
        
        boardColumns.forEach(column => {
            column.addEventListener('dragover', e => {
                e.preventDefault();
                const dragging = document.querySelector('.dragging');
                if (dragging) {
                    column.querySelector('.board-tasks').appendChild(dragging);
                }
            });
            
            // Handle task clicks in board view
            column.addEventListener('click', e => {
                const taskItem = e.target.closest('.board-task-item');
                if (!taskItem) return;
                
                const taskId = taskItem.dataset.id;
                
                if (e.target.closest('.edit-task')) {
                    this.editTask(taskId);
                } else if (e.target.closest('.delete-task')) {
                    this.deleteTask(taskId);
                } else if (e.target.closest('.start-timer')) {
                    const task = this.tasks.find(t => t.id === taskId);
                    window.timerManager.startTimerForTask(task);
                    
                    document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
                    document.getElementById('timer-view').classList.add('active');
                    
                    document.querySelectorAll('.sidebar li').forEach(item => item.classList.remove('active'));
                    document.querySelector('.sidebar li[data-view="timer"]').classList.add('active');
                } else {
                    this.showTaskDetails(taskId);
                }
            });
        });
    }
    
    // Initialize task filters
    initTaskFilters() {
        const filterLabel = document.getElementById('filter-label');
        const filterPriority = document.getElementById('filter-priority');
        
        // Update label filter options
        this.updateLabelFilters();
        
        // Add event listeners to filters
        filterLabel.addEventListener('change', () => this.renderTasks());
        filterPriority.addEventListener('change', () => this.renderTasks());
    }
    
    // Update label filter options
    updateLabelFilters() {
        const filterLabel = document.getElementById('filter-label');
        const currentValue = filterLabel.value;
        
        // Clear options except first one
        while (filterLabel.options.length > 1) {
            filterLabel.remove(1);
        }
        
        // Add label options
        this.labels.forEach(label => {
            const option = document.createElement('option');
            option.value = label;
            option.textContent = label;
            filterLabel.appendChild(option);
        });
        
        // Restore selected value if possible
        if (currentValue && this.labels.includes(currentValue)) {
            filterLabel.value = currentValue;
        }
    }
    
    // Render tasks based on current filters and view
    renderTasks() {
        this.renderTaskList();
        this.renderBoardView();
    }
    
    // Render task list view
    renderTaskList() {
        const taskList = document.getElementById('task-list');
        const filterLabel = document.getElementById('filter-label').value;
        const filterPriority = document.getElementById('filter-priority').value;
        
        // Filter tasks
        let filteredTasks = [...this.tasks];
        
        if (filterLabel) {
            filteredTasks = filteredTasks.filter(task => task.labels.includes(filterLabel));
        }
        
        if (filterPriority) {
            filteredTasks = filteredTasks.filter(task => task.priority === filterPriority);
        }
        
        // Sort tasks: first by status (incomplete first), then by due date, then by priority
        filteredTasks.sort((a, b) => {
            // Status comparison (incomplete first)
            if (a.status === 'completed' && b.status !== 'completed') return 1;
            if (a.status !== 'completed' && b.status === 'completed') return -1;
            
            // Due date comparison
            if (a.dueDate && b.dueDate) {
                return new Date(a.dueDate) - new Date(b.dueDate);
            }
            if (a.dueDate) return -1;
            if (b.dueDate) return 1;
                        // Priority comparison
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
        
        // Clear task list
        taskList.innerHTML = '';
        
        // Add tasks to list
        filteredTasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = 'task-item';
            taskItem.dataset.id = task.id;
            
            // Apply custom color if set
            if (task.color) {
                taskItem.style.borderLeft = `4px solid ${task.color}`;
            }
            
            // Apply custom background if set
            if (task.background) {
                taskItem.style.backgroundImage = `url(${task.background})`;
                taskItem.style.backgroundSize = 'cover';
                taskItem.style.backgroundPosition = 'center';
                taskItem.style.color = '#fff';
                taskItem.style.textShadow = '0 0 2px rgba(0,0,0,0.7)';
            }
            
            const isCompleted = task.status === 'completed';
            
            taskItem.innerHTML = `
                <div class="task-checkbox ${isCompleted ? 'checked' : ''}">
                    ${isCompleted ? '<i class="fas fa-check"></i>' : ''}
                </div>
                <div class="task-content">
                    <div class="task-name">${task.name}</div>
                    <div class="task-details">
                        ${task.dueDate ? `<span class="task-due-date">${new Date(task.dueDate).toLocaleDateString()}</span>` : ''}
                        <span class="task-priority ${task.priority}">${task.priority}</span>
                        ${task.labels.map(label => `<span class="task-label">${label}</span>`).join('')}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="icon-btn start-timer" title="Start Timer"><i class="fas fa-clock"></i></button>
                    <button class="icon-btn edit-task" title="Edit Task"><i class="fas fa-edit"></i></button>
                    <button class="icon-btn delete-task" title="Delete Task"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            taskList.appendChild(taskItem);
        });
        
        // Show empty state if no tasks
        if (filteredTasks.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <i class="fas fa-tasks"></i>
                <p>No tasks found</p>
                <button id="empty-add-task" class="primary-btn">Add Task</button>
            `;
            taskList.appendChild(emptyState);
            
            // Add event listener to empty state button
            document.getElementById('empty-add-task').addEventListener('click', () => {
                document.getElementById('add-task-btn').click();
            });
        }
    }
    
    // Render board view
    renderBoardView() {
        const boardColumns = document.querySelectorAll('.board-column');
        
        // Clear board columns
        boardColumns.forEach(column => {
            const tasksList = column.querySelector('.board-tasks');
            tasksList.innerHTML = '';
        });
        
        // Add tasks to appropriate columns
        this.tasks.forEach(task => {
            const column = document.querySelector(`.board-column[data-status="${task.status}"]`);
            if (!column) return;
            
            const tasksList = column.querySelector('.board-tasks');
            const taskItem = document.createElement('li');
            taskItem.className = 'board-task-item';
            taskItem.dataset.id = task.id;
            taskItem.draggable = true;
            
            // Apply custom color if set
            if (task.color) {
                taskItem.style.borderLeft = `4px solid ${task.color}`;
            }
            
            // Apply custom background if set
            if (task.background) {
                taskItem.style.backgroundImage = `url(${task.background})`;
                taskItem.style.backgroundSize = 'cover';
                taskItem.style.backgroundPosition = 'center';
                taskItem.style.color = '#fff';
                taskItem.style.textShadow = '0 0 2px rgba(0,0,0,0.7)';
            }
            
            taskItem.innerHTML = `
                <div class="task-name">${task.name}</div>
                <div class="task-details">
                    ${task.dueDate ? `<span class="task-due-date">${new Date(task.dueDate).toLocaleDateString()}</span>` : ''}
                    <span class="task-priority ${task.priority}">${task.priority}</span>
                </div>
                <div class="task-actions">
                    <button class="icon-btn start-timer" title="Start Timer"><i class="fas fa-clock"></i></button>
                    <button class="icon-btn edit-task" title="Edit Task"><i class="fas fa-edit"></i></button>
                    <button class="icon-btn delete-task" title="Delete Task"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            tasksList.appendChild(taskItem);
            
            // Add drag and drop functionality
            taskItem.addEventListener('dragstart', () => {
                taskItem.classList.add('dragging');
            });
            
            taskItem.addEventListener('dragend', () => {
                taskItem.classList.remove('dragging');
                
                // Update task status based on new column
                const newColumn = taskItem.closest('.board-column');
                if (newColumn) {
                    const newStatus = newColumn.dataset.status;
                    this.updateTaskStatus(task.id, newStatus);
                }
            });
        });
    }
    
    // Toggle task completion status
    toggleTaskCompletion(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        if (task.status === 'completed') {
            task.status = 'todo';
            task.completedAt = null;
        } else {
            task.status = 'completed';
            task.completedAt = new Date();
        }
        
        utils.saveToLocalStorage('tasks', this.tasks);
        this.renderTasks();
        this.updateTaskCounts();
    }
    
    // Update task status
    updateTaskStatus(taskId, newStatus) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const oldStatus = task.status;
        task.status = newStatus;
        
        // Update completedAt if status changed to/from completed
        if (newStatus === 'completed' && oldStatus !== 'completed') {
            task.completedAt = new Date();
        } else if (newStatus !== 'completed' && oldStatus === 'completed') {
            task.completedAt = null;
        }
        
        utils.saveToLocalStorage('tasks', this.tasks);
        this.updateTaskCounts();
    }
    
    // Edit task
    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        // Set form values
        document.getElementById('task-modal-title').textContent = 'Edit Task';
        document.getElementById('task-id').value = task.id;
        document.getElementById('task-name').value = task.name;
        document.getElementById('task-description').value = task.description || '';
        
        if (task.dueDate) {
            const dueDate = new Date(task.dueDate);
            document.getElementById('task-due-date').value = utils.formatDateForInput(dueDate);
            document.getElementById('task-due-time').value = utils.formatTimeForInput(dueDate);
        } else {
            document.getElementById('task-due-date').value = '';
            document.getElementById('task-due-time').value = '';
        }
        
        document.getElementById('task-priority').value = task.priority;
        document.getElementById('task-status').value = task.status;
        document.getElementById('task-color').value = task.color || '#4a90e2';
        document.getElementById('task-background').value = task.background || '';
        
        // Set selected labels
        const selectedLabels = document.getElementById('selected-labels');
        selectedLabels.innerHTML = '';
        
        task.labels.forEach(label => {
            const labelElement = document.createElement('div');
            labelElement.className = 'selected-label';
            labelElement.innerHTML = `
                ${label}
                <span class="remove-label">&times;</span>
            `;
            selectedLabels.appendChild(labelElement);
            
            // Add event listener to remove label
            labelElement.querySelector('.remove-label').addEventListener('click', () => {
                labelElement.remove();
            });
        });
        
        // Show modal
        document.getElementById('task-modal').classList.add('active');
    }
    
    // Delete task
    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            utils.saveToLocalStorage('tasks', this.tasks);
            this.renderTasks();
            this.updateTaskCounts();
        }
    }
    
    // Show task details
    showTaskDetails(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        // For now, just edit the task
        this.editTask(taskId);
    }
    
    // Update task counts
    updateTaskCounts() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(t => t.status === 'completed').length;
        
        document.getElementById('total-tasks').textContent = totalTasks;
        document.getElementById('completed-tasks').textContent = completedTasks;
        
        // Update progress bar
        const progressBar = document.getElementById('today-progress');
        const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        progressBar.style.width = `${progressPercentage}%`;
    }
    
    // Get tasks for calendar view
    getTasksForDate(date) {
        const dateString = date.toDateString();
        return this.tasks.filter(task => {
            if (!task.dueDate) return false;
            return new Date(task.dueDate).toDateString() === dateString;
        });
    }
    
    // Get all tasks
    getAllTasks() {
        return this.tasks;
    }
    
    // Get task by ID
    getTaskById(taskId) {
        return this.tasks.find(t => t.id === taskId);
    }
}

// Initialize task manager when DOM is loaded
window.taskManager = new TaskManager();

            
           
