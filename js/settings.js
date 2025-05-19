// Settings functionality

class SettingsManager {
    constructor() {
        this.settings = {
            theme: 'light',
            sidebarCollapsed: false,
            notificationsEnabled: true,
            soundEnabled: true,
            autoStartBreaks: false,
            defaultView: 'list',
            defaultTaskSort: 'dueDate',
            defaultTaskFilter: 'all'
        };
        
        this.init();
    }
    
    init() {
        // Load settings from localStorage
        const savedSettings = utils.loadFromLocalStorage('settings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...savedSettings };
        }
        
        // Initialize UI elements
        this.initSettingsForm();
        this.initThemeToggle();
        this.initSidebarToggle();
        
        // Apply settings
        this.applySettings();
    }
    
    // Initialize settings form
    initSettingsForm() {
        const settingsForm = document.getElementById('settings-form');
        const resetSettingsBtn = document.getElementById('reset-settings');
        
        // Set initial form values
        document.getElementById('theme-select').value = this.settings.theme;
        document.getElementById('notifications-enabled').checked = this.settings.notificationsEnabled;
        document.getElementById('sound-enabled').checked = this.settings.soundEnabled;
        document.getElementById('auto-start-breaks').checked = this.settings.autoStartBreaks;
        document.getElementById('default-view').value = this.settings.defaultView;
        document.getElementById('default-task-sort').value = this.settings.defaultTaskSort;
        document.getElementById('default-task-filter').value = this.settings.defaultTaskFilter;
        
        // Handle form submission
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form values
            this.settings.theme = document.getElementById('theme-select').value;
            this.settings.notificationsEnabled = document.getElementById('notifications-enabled').checked;
            this.settings.soundEnabled = document.getElementById('sound-enabled').checked;
            this.settings.autoStartBreaks = document.getElementById('auto-start-breaks').checked;
            this.settings.defaultView = document.getElementById('default-view').value;
            this.settings.defaultTaskSort = document.getElementById('default-task-sort').value;
            this.settings.defaultTaskFilter = document.getElementById('default-task-filter').value;
            
            // Save settings
            utils.saveToLocalStorage('settings', this.settings);
            
            // Apply settings
            this.applySettings();
            
            // Show success message
            utils.showToast('Settings saved successfully');
        });
        
        // Handle reset settings
        resetSettingsBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all settings to default?')) {
                this.settings = {
                    theme: 'light',
                    sidebarCollapsed: false,
                    notificationsEnabled: true,
                    soundEnabled: true,
                    autoStartBreaks: false,
                    defaultView: 'list',
                    defaultTaskSort: 'dueDate',
                    defaultTaskFilter: 'all'
                };
                
                // Save settings
                utils.saveToLocalStorage('settings', this.settings);
                
                // Update form values
                document.getElementById('theme-select').value = this.settings.theme;
                document.getElementById('notifications-enabled').checked = this.settings.notificationsEnabled;
                document.getElementById('sound-enabled').checked = this.settings.soundEnabled;
                document.getElementById('auto-start-breaks').checked = this.settings.autoStartBreaks;
                document.getElementById('default-view').value = this.settings.defaultView;
                document.getElementById('default-task-sort').value = this.settings.defaultTaskSort;
                document.getElementById('default-task-filter').value = this.settings.defaultTaskFilter;
                
                // Apply settings
                this.applySettings();
                
                // Show success message
                utils.showToast('Settings reset to default');
            }
        });
    }
    
    // Initialize theme toggle
    initThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        
        themeToggle.addEventListener('click', () => {
            this.settings.theme = this.settings.theme === 'light' ? 'dark' : 'light';
            utils.saveToLocalStorage('settings', this.settings);
            this.applyTheme();
            
            // Update settings form
            document.getElementById('theme-select').value = this.settings.theme;
        });
    }
    
    // Initialize sidebar toggle
    initSidebarToggle() {
        const sidebarToggle = document.getElementById('sidebar-toggle');
        
        sidebarToggle.addEventListener('click', () => {
            this.settings.sidebarCollapsed = !this.settings.sidebarCollapsed;
            utils.saveToLocalStorage('settings', this.settings);
            this.applySidebarState();
        });
    }
    
    // Apply all settings
    applySettings() {
        this.applyTheme();
        this.applySidebarState();
        
        // Apply default view
        if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
            const viewButtons = document.querySelectorAll('.view-btn');
            viewButtons.forEach(btn => {
                if (btn.dataset.view === this.settings.defaultView) {
                    btn.click();
                }
            });
        }
        
        // Apply default task sort and filter
        if (window.taskManager) {
            const sortSelect = document.getElementById('sort-tasks');
            const filterSelect = document.getElementById('filter-tasks');
            
            if (sortSelect) sortSelect.value = this.settings.defaultTaskSort;
            if (filterSelect) filterSelect.value = this.settings.defaultTaskFilter;
            
            window.taskManager.renderTasks();
        }
    }
    
    // Apply theme
    applyTheme() {
        document.body.className = this.settings.theme;
        
        // Update theme toggle icon
        const themeToggle = document.getElementById('theme-toggle');
        if (this.settings.theme === 'dark') {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }
    
    // Apply sidebar state
    applySidebarState() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('main-content');
        
        if (this.settings.sidebarCollapsed) {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('expanded');
        } else {
            sidebar.classList.remove('collapsed');
            mainContent.classList.remove('expanded');
        }
        
        // Update sidebar toggle icon
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (this.settings.sidebarCollapsed) {
            sidebarToggle.innerHTML = '<i class="fas fa-chevron-right"></i>';
        } else {
            sidebarToggle.innerHTML = '<i class="fas fa-chevron-left"></i>';
        }
    }
    
    // Get a specific setting
    getSetting(key) {
        return this.settings[key];
    }
    
    // Update a specific setting
    updateSetting(key, value) {
        this.settings[key] = value;
        utils.saveToLocalStorage('settings', this.settings);
        this.applySettings();
    }
}

// Initialize settings manager when DOM is loaded
window.settingsManager = new SettingsManager();
