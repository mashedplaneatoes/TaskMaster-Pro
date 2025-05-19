// Main application functionality

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all managers
    // These are initialized in their respective files
    
    // Initialize UI elements
    initUI();
    
    // Initialize navigation
    initNavigation();
    
    // Initialize drag and drop for board view
    initDragAndDrop();
    
    // Check for notifications permission
    checkNotificationsPermission();
});
// Initialize UI elements
function initUI() {
    // Initialize tooltips
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(tooltip => {
        tooltip.addEventListener('mouseenter', (e) => {
            const tooltipText = e.target.dataset.tooltip;
            const tooltipEl = document.createElement('div');
            tooltipEl.className = 'tooltip';
            tooltipEl.textContent = tooltipText;
            document.body.appendChild(tooltipEl);
            
            const rect = e.target.getBoundingClientRect();
            tooltipEl.style.top = `${rect.top - tooltipEl.offsetHeight - 5}px`;
            tooltipEl.style.left = `${rect.left + (rect.width / 2) - (tooltipEl.offsetWidth / 2)}px`;
        });
        
        tooltip.addEventListener('mouseleave', () => {
            const tooltipEl = document.querySelector('.tooltip');
            if (tooltipEl) {
                tooltipEl.remove();
            }
        });
    });
    
    // Initialize modals
    const modalTriggers = document.querySelectorAll('[data-modal]');
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const modalId = trigger.dataset.modal;
            const modal = document.getElementById(modalId);
            modal.classList.add('active');
        });
    });
    
    const modalCloseButtons = document.querySelectorAll('.modal-close');
    modalCloseButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            modal.classList.remove('active');
        });
    });
    
    // Close modal when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
    
    // Initialize tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabGroup = button.closest('.tab-group');
            const tabId = button.dataset.tab;
            
            // Update active tab button
            tabGroup.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');
            
            // Update active tab content
            tabGroup.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Initialize dropdowns
    const dropdownTriggers = document.querySelectorAll('.dropdown-trigger');
    dropdownTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = trigger.nextElementSibling;
            dropdown.classList.toggle('active');
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-menu.active').forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    });
    
    // Initialize view buttons
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            const view = button.dataset.view;
            
            // Update active view button
            document.querySelectorAll('.view-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');
            
            // Update active view
            document.querySelectorAll('.view-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${view}-view`).classList.add('active');
            
            // Update tasks display based on view
            if (window.taskManager) {
                window.taskManager.currentView = view;
                window.taskManager.renderTasks();
            }
        });
    });
}

// Initialize navigation
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const pageId = link.dataset.page;
            
            // Update active nav link
            navLinks.forEach(navLink => {
                navLink.classList.remove('active');
            });
            link.classList.add('active');
            
            // Update active page
            pages.forEach(page => {
                page.classList.remove('active');
            });
            document.getElementById(pageId).classList.add('active');
            
            // Update page title
            document.getElementById('page-title').textContent = link.textContent.trim();
            
            // Refresh content based on page
            if (pageId === 'tasks-page' && window.taskManager) {
                window.taskManager.renderTasks();
            } else if (pageId === 'calendar-page' && window.calendarManager) {
                window.calendarManager.renderCalendar();
            } else if (pageId === 'stats-page' && window.statsManager) {
                // Refresh all charts
                window.statsManager.refreshCharts('task-stats');
                window.statsManager.refreshCharts('focus-stats');
                window.statsManager.refreshCharts('productivity-stats');
            }
        });
    });
}

// Initialize drag and drop for board view
function initDragAndDrop() {
    let draggedItem = null;
    
    // Add event listeners when board view is active
    const boardViewObserver = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const boardView = document.getElementById('board-view');
                if (boardView.classList.contains('active')) {
                    setupDragAndDrop();
                }
            }
        });
    });
    
    const boardView = document.getElementById('board-view');
    if (boardView) {
        boardViewObserver.observe(boardView, { attributes: true });
        
        // Setup initially if board view is active
        if (boardView.classList.contains('active')) {
            setupDragAndDrop();
        }
    }
    
    function setupDragAndDrop() {
        const taskItems = document.querySelectorAll('.task-item');
        const columns = document.querySelectorAll('.board-column');
        
        taskItems.forEach(item => {
            item.setAttribute('draggable', true);
            
            item.addEventListener('dragstart', () => {
                draggedItem = item;
                setTimeout(() => {
                    item.classList.add('dragging');
                }, 0);
            });
            
            item.addEventListener('dragend', () => {
                draggedItem = null;
                item.classList.remove('dragging');
            });
        });
        
        columns.forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                column.classList.add('drag-over');
            });
            
            column.addEventListener('dragleave', () => {
                column.classList.remove('drag-over');
            });
            
            column.addEventListener('drop', (e) => {
                e.preventDefault();
                column.classList.remove('drag-over');
                
                if (draggedItem) {
                    const taskId = draggedItem.dataset.taskId;
                    const newStatus = column.dataset.status;
                    
                    // Update task status
                    if (window.taskManager) {
                        window.taskManager.updateTaskStatus(taskId, newStatus);
                    }
                }
            });
        });
    }
}

// Check for notifications permission
function checkNotificationsPermission() {
    if (window.settingsManager && window.settingsManager.getSetting('notificationsEnabled')) {
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            // Show notification permission request
            const permissionBanner = document.createElement('div');
            permissionBanner.className = 'notification-permission-banner';
            permissionBanner.innerHTML = `
                <p>Allow notifications to receive task reminders and timer alerts.</p>
                <div class="notification-permission-actions">
                    <button id="allow-notifications" class="btn btn-primary">Allow</button>
                    <button id="dismiss-notification-banner" class="btn btn-text">Dismiss</button>
                </div>
            `;
            
            document.body.appendChild(permissionBanner);
            
            // Handle allow button
            document.getElementById('allow-notifications').addEventListener('click', () => {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        utils.showToast('Notifications enabled');
                    }
                    permissionBanner.remove();
                });
            });
            
            // Handle dismiss button
            document.getElementById('dismiss-notification-banner').addEventListener('click', () => {
                permissionBanner.remove();
            });
        }
    }
}

// Show welcome message for new users
function showWelcomeMessage() {
    const isFirstVisit = !utils.loadFromLocalStorage('hasVisitedBefore');
    
    if (isFirstVisit) {
        const welcomeModal = document.createElement('div');
        welcomeModal.className = 'modal active';
        welcomeModal.id = 'welcome-modal';
        welcomeModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Welcome to TaskMaster Pro!</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Thank you for choosing TaskMaster Pro to help you stay organized and productive.</p>
                    <p>Here's a quick overview of what you can do:</p>
                    <ul>
                        <li><strong>Tasks:</strong> Create, organize, and track your tasks</li>
                        <li><strong>Timer:</strong> Use the Pomodoro technique to stay focused</li>
                        <li><strong>Calendar:</strong> Schedule your tasks and events</li>
                        <li><strong>Statistics:</strong> Track your productivity over time</li>
                    </ul>
                    <p>Get started by creating your first task!</p>
                </div>
                <div class="modal-footer">
                    <button id="welcome-modal-close" class="btn btn-primary">Get Started</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(welcomeModal);
        
        // Handle close button
        document.getElementById('welcome-modal-close').addEventListener('click', () => {
            welcomeModal.remove();
        });
        
        // Mark as visited
        utils.saveToLocalStorage('hasVisitedBefore', true);
    }
}

// Call welcome message function
showWelcomeMessage();



