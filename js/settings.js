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
    
    // Fix the initSettingsForm method
initSettingsForm() {
    // The HTML might not have these elements, so add null checks
    const settingsForm = document.getElementById('settings-form');
    const resetSettingsBtn = document.getElementById('reset-settings');
    
    // Set initial form values if the elements exist
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) {
        themeSelect.value = this.settings.theme;
    }
    
    const notificationsEnabled = document.getElementById('enable-notifications');
    if (notificationsEnabled) {
        notificationsEnabled.checked = this.settings.notificationsEnabled;
    }
    
    const soundEnabled = document.getElementById('sound-notifications');
    if (soundEnabled) {
        soundEnabled.checked = this.settings.soundEnabled;
    }
    
    const autoStartBreaks = document.getElementById('auto-start-breaks');
    if (autoStartBreaks) {
        autoStartBreaks.checked = this.settings.autoStartBreaks;
    }
    
    // Handle form submission if the form exists
    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form values with null checks
            if (themeSelect) {
                this.settings.theme = themeSelect.value;
            }
            
            if (notificationsEnabled) {
                this.settings.notificationsEnabled = notificationsEnabled.checked;
            }
            
            if (soundEnabled) {
                this.settings.soundEnabled = soundEnabled.checked;
            }
            
            if (autoStartBreaks) {
                this.settings.autoStartBreaks = autoStartBreaks.checked;
            }
            
            // Save settings
            utils.saveToLocalStorage('settings', this.settings);
            
            // Apply settings
            this.applySettings();
            
            // Show success message
            if (window.utils && window.utils.showToast) {
                window.utils.showToast('Settings saved successfully');
            }
        });
    }
    
    // Handle reset settings if the button exists
    if (resetSettingsBtn) {
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
                
                // Update form values with null checks
                if (themeSelect) {
                    themeSelect.value = this.settings.theme;
                }
                
                if (notificationsEnabled) {
                    notificationsEnabled.checked = this.settings.notificationsEnabled;
                }
                
                if (soundEnabled) {
                    soundEnabled.checked = this.settings.soundEnabled;
                }
                
                if (autoStartBreaks) {
                    autoStartBreaks.checked = this.settings.autoStartBreaks;
                }
                
                // Apply settings
                this.applySettings();
                
                // Show success message
                if (window.utils && window.utils.showToast) {
                    window.utils.showToast('Settings reset to default');
                }
            }
        });
    }
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
