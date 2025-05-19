// Calendar functionality

class CalendarManager {
    constructor() {
        this.currentDate = new Date();
        this.currentView = 'month'; // month, week, day
        this.events = [];
        
        this.init();
    }
    
    init() {
        // Load events from localStorage
        const savedEvents = utils.loadFromLocalStorage('calendarEvents');
        if (savedEvents) {
            this.events = savedEvents;
        }
        
        // Initialize UI elements
        this.initCalendarNavigation();
        this.initCalendarViewButtons();
        this.initEventModal();
        
        // Render calendar
        this.renderCalendar();
    }
    
    // Initialize calendar navigation
    initCalendarNavigation() {
        const prevBtn = document.getElementById('prev-month');
        const nextBtn = document.getElementById('next-month');
        const todayBtn = document.getElementById('today-btn');
        
        prevBtn.addEventListener('click', () => {
            if (this.currentView === 'month') {
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            } else if (this.currentView === 'week') {
                this.currentDate.setDate(this.currentDate.getDate() - 7);
            } else if (this.currentView === 'day') {
                this.currentDate.setDate(this.currentDate.getDate() - 1);
            }
            this.renderCalendar();
        });
        
        nextBtn.addEventListener('click', () => {
            if (this.currentView === 'month') {
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            } else if (this.currentView === 'week') {
                this.currentDate.setDate(this.currentDate.getDate() + 7);
            } else if (this.currentView === 'day') {
                this.currentDate.setDate(this.currentDate.getDate() + 1);
            }
            this.renderCalendar();
        });
        
        todayBtn.addEventListener('click', () => {
            this.currentDate = new Date();
            this.renderCalendar();
        });
    }
    
    // Initialize calendar view buttons
    initCalendarViewButtons() {
        const monthViewBtn = document.getElementById('month-view-btn');
        const weekViewBtn = document.getElementById('week-view-btn');
        const dayViewBtn = document.getElementById('day-view-btn');
        
        monthViewBtn.addEventListener('click', () => {
            this.currentView = 'month';
            this.updateViewButtons();
            this.renderCalendar();
        });
        
        weekViewBtn.addEventListener('click', () => {
            this.currentView = 'week';
            this.updateViewButtons();
            this.renderCalendar();
        });
        
        dayViewBtn.addEventListener('click', () => {
            this.currentView = 'day';
            this.updateViewButtons();
            this.renderCalendar();
        });
    }
        // Update view buttons active state
    updateViewButtons() {
        document.querySelectorAll('.calendar-view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`${this.currentView}-view-btn`).classList.add('active');
    }
    
    // Initialize event modal
    initEventModal() {
        const addEventBtn = document.getElementById('add-event-btn');
        const eventForm = document.getElementById('event-form');
        const eventModal = document.getElementById('event-modal');
        const cancelEventBtn = document.getElementById('cancel-event');
        
        // Open modal when add event button is clicked
        addEventBtn.addEventListener('click', () => {
            document.getElementById('event-modal-title').textContent = 'Add New Event';
            eventForm.reset();
            document.getElementById('event-id').value = '';
            
            // Set default date to current date
            const today = utils.formatDateForInput(new Date());
            document.getElementById('event-start-date').value = today;
            document.getElementById('event-end-date').value = today;
            
            eventModal.classList.add('active');
        });
        
        // Close modal when cancel button is clicked
        cancelEventBtn.addEventListener('click', () => {
            eventModal.classList.remove('active');
        });
        
        // Handle form submission
        eventForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form values
            const eventId = document.getElementById('event-id').value;
            const title = document.getElementById('event-title').value;
            const startDate = document.getElementById('event-start-date').value;
            const startTime = document.getElementById('event-start-time').value;
            const endDate = document.getElementById('event-end-date').value;
            const endTime = document.getElementById('event-end-time').value;
            const color = document.getElementById('event-color').value;
            const description = document.getElementById('event-description').value;
            const isAllDay = document.getElementById('event-all-day').checked;
            
            // Create event object
            const event = {
                id: eventId || utils.generateId(),
                title,
                start: new Date(`${startDate}T${isAllDay ? '00:00' : startTime}`),
                end: new Date(`${endDate}T${isAllDay ? '23:59' : endTime}`),
                color,
                description,
                isAllDay
            };
            
            // Add or update event
            if (eventId) {
                // Update existing event
                const index = this.events.findIndex(e => e.id === eventId);
                if (index !== -1) {
                    this.events[index] = event;
                }
            } else {
                // Add new event
                this.events.push(event);
            }
            
            // Save events
            utils.saveToLocalStorage('calendarEvents', this.events);
            
            // Update UI
            this.renderCalendar();
            
            // Close modal
            eventModal.classList.remove('active');
        });
    }
    
    // Render calendar based on current view
    renderCalendar() {
        if (this.currentView === 'month') {
            this.renderMonthView();
        } else if (this.currentView === 'week') {
            this.renderWeekView();
        } else if (this.currentView === 'day') {
            this.renderDayView();
        }
        
        // Update calendar title
        this.updateCalendarTitle();
    }
    
    // Update calendar title
    updateCalendarTitle() {
        const calendarTitle = document.getElementById('calendar-title');
        
        if (this.currentView === 'month') {
            const options = { month: 'long', year: 'numeric' };
            calendarTitle.textContent = this.currentDate.toLocaleDateString(undefined, options);
        } else if (this.currentView === 'week') {
            const weekStart = new Date(this.currentDate);
            weekStart.setDate(this.currentDate.getDate() - this.currentDate.getDay());
            
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            
            const options = { month: 'short', day: 'numeric' };
            calendarTitle.textContent = `${weekStart.toLocaleDateString(undefined, options)} - ${weekEnd.toLocaleDateString(undefined, options)}, ${weekEnd.getFullYear()}`;
        } else if (this.currentView === 'day') {
            const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
            calendarTitle.textContent = this.currentDate.toLocaleDateString(undefined, options);
        }
    }
    
    // Render month view
    renderMonthView() {
        const calendarContainer = document.getElementById('calendar-container');
        
        // Get first day of month
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const startingDay = firstDay.getDay(); // 0 (Sunday) to 6 (Saturday)
        
        // Get number of days in month
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        // Get days from previous month
        const prevMonthLastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 0);
        const prevMonthDays = prevMonthLastDay.getDate();
        
        // Create calendar HTML
        let calendarHTML = `
            <div class="calendar-header">
                ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => 
                    `<div class="calendar-day-header">${day}</div>`
                ).join('')}
            </div>
            <div class="calendar-grid">
        `;
        
        // Add days from previous month
        for (let i = startingDay - 1; i >= 0; i--) {
            const day = prevMonthDays - i;
            const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, day);
            calendarHTML += this.createCalendarDay(date, true);
        }
        
        // Add days from current month
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), i);
            calendarHTML += this.createCalendarDay(date);
        }
        
        // Add days from next month
        const totalDaysDisplayed = startingDay + daysInMonth;
        const nextMonthDays = 42 - totalDaysDisplayed; // 6 rows of 7 days = 42
        
        for (let i = 1; i <= nextMonthDays; i++) {
            const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, i);
            calendarHTML += this.createCalendarDay(date, true);
        }
        
        calendarHTML += '</div>';
        
        // Update calendar container
        calendarContainer.innerHTML = calendarHTML;
        
        // Add event listeners to calendar days
        this.addCalendarDayEventListeners();
    }
    
    // Create a calendar day cell
    createCalendarDay(date, isOtherMonth = false) {
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();
        
        // Get events for this day
        const dayEvents = this.getEventsForDate(date);
        const tasks = window.taskManager.getTasksForDate(date);
        
        // Create day cell HTML
        let dayHTML = `
            <div class="calendar-day ${isToday ? 'today' : ''} ${isOtherMonth ? 'other-month' : ''}" data-date="${date.toISOString()}">
                <div class="calendar-day-number">${date.getDate()}</div>
        `;
        
        // Add events
        dayEvents.forEach(event => {
            dayHTML += `
                <div class="calendar-event" style="background-color: ${event.color}" data-event-id="${event.id}">
                    ${event.isAllDay ? '● ' : utils.formatTime(event.start) + ' '}${event.title}
                </div>
            `;
        });
        
        // Add tasks
        tasks.forEach(task => {
            dayHTML += `
                <div class="calendar-event" style="background-color: ${task.color || '#4a90e2'}" data-task-id="${task.id}">
                    ◆ ${task.name}
                </div>
            `;
        });
        
        dayHTML += '</div>';
        
        return dayHTML;
    }
    
    // Add event listeners to calendar days
    addCalendarDayEventListeners() {
        const calendarDays = document.querySelectorAll('.calendar-day');
        
        calendarDays.forEach(day => {
            // Double click on day to add event
            day.addEventListener('dblclick', () => {
                const dateStr = day.dataset.date;
                this.openEventModal(new Date(dateStr));
            });
            
            // Click on event to edit
            day.querySelectorAll('.calendar-event').forEach(eventEl => {
                eventEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    
                    if (eventEl.dataset.eventId) {
                        const eventId = eventEl.dataset.eventId;
                        this.editEvent(eventId);
                    } else if (eventEl.dataset.taskId) {
                        const taskId = eventEl.dataset.taskId;
                        window.taskManager.editTask(taskId);
                    }
                });
            });
        });
    }
    
    // Render week view
    renderWeekView() {
        const calendarContainer = document.getElementById('calendar-container');
        
        // Get first day of week (Sunday)
        const weekStart = new Date(this.currentDate);
        weekStart.setDate(this.currentDate.getDate() - this.currentDate.getDay());
        
        // Create calendar HTML
        let calendarHTML = `
            <div class="calendar-header">
                ${Array.from({ length: 7 }, (_, i) => {
                    const day = new Date(weekStart);
                    day.setDate(weekStart.getDate() + i);
                    return `<div class="calendar-day-header">
                        ${day.toLocaleDateString(undefined, { weekday: 'short' })}<br>
                        ${day.getDate()}
                    </div>`;
                }).join('')}
            </div>
            <div class="calendar-week-grid">
        `;
        
        // Add time slots
        for (let hour = 0; hour < 24; hour++) {
            calendarHTML += `
                <div class="calendar-hour-row">
                    <div class="calendar-hour">${hour}:00</div>
                    <div class="calendar-hour-cells">
            `;
            
            // Add day columns
            for (let day = 0; day < 7; day++) {
                const date = new Date(weekStart);
                date.setDate(weekStart.getDate() + day);
                date.setHours(hour, 0, 0, 0);
                
                const events = this.getEventsForHour(date);
                
                calendarHTML += `
                    <div class="calendar-hour-cell" data-date="${date.toISOString()}">
                        ${events.map(event => `
                            <div class="calendar-event" style="background-color: ${event.color}" data-event-id="${event.id}">
                                ${utils.formatTime(event.start)} ${event.title}
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            
            calendarHTML += `
                    </div>
                </div>
            `;
        }
        
        calendarHTML += '</div>';
        
        // Update calendar container
        calendarContainer.innerHTML = calendarHTML;
        
        // Add event listeners
        this.addWeekViewEventListeners();
    }
    
    // Add event listeners to week view
    addWeekViewEventListeners() {
        const hourCells = document.querySelectorAll('.calendar-hour-cell');
        
        hourCells.forEach(cell => {
            // Double click on cell to add event
            cell.addEventListener('dblclick', () => {
                const dateStr = cell.dataset.date;
                this.openEventModal(new Date(dateStr));
            });
            
            // Click on event to edit
            cell.querySelectorAll('.calendar-event').forEach(eventEl => {
                eventEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const eventId = eventEl.dataset.eventId;
                    this.editEvent(eventId);
                });
            });
        });
    }
    
    // Render day view
    renderDayView() {
        const calendarContainer = document.getElementById('calendar-container');
        
        // Create calendar HTML
        let calendarHTML = `
            <div class="calendar-day-view">
                <div class="calendar-day-header">
                    ${this.currentDate.toLocaleDateString(undefined, { weekday: 'long' })}
                </div>
                <div class="calendar-day-hours">
        `;
        
        // Add time slots
        for (let hour = 0; hour < 24; hour++) {
            const date = new Date(this.currentDate);
            date.setHours(hour, 0, 0, 0);
            
            const events = this.getEventsForHour(date);
            
            calendarHTML += `
                <div class="calendar-hour-row">
                    <div class="calendar-hour">${hour}:00</div>
                    <div class="calendar-hour-cell" data-date="${date.toISOString()}">
                        ${events.map(event => `
                            <div class="calendar-event" style="background-color: ${event.color}" data-event-id="${event.id}">
                                ${utils.formatTime(event.start)} ${event.title}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        calendarHTML += `
                </div>
            </div>
        `;
        
        // Update calendar container
        calendarContainer.innerHTML = calendarHTML;
        
        // Add event listeners
        this.addDayViewEventListeners();
    }
    
    // Add event listeners to day view
    addDayViewEventListeners() {
        const hourCells = document.querySelectorAll('.calendar-hour-cell');
        
        hourCells.forEach(cell => {
            // Double click on cell to add event
            cell.addEventListener('dblclick', () => {
                const dateStr = cell.dataset.date;
                this.openEventModal(new Date(dateStr));
            });
            
            // Click on event to edit
            cell.querySelectorAll('.calendar-event').forEach(eventEl => {
                eventEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                                        const eventId = eventEl.dataset.eventId;
                    this.editEvent(eventId);
                });
            });
        });
    }
    
    // Open event modal with date pre-filled
    openEventModal(date) {
        document.getElementById('event-modal-title').textContent = 'Add New Event';
        document.getElementById('event-form').reset();
        document.getElementById('event-id').value = '';
        
        // Set default date to the clicked date
        document.getElementById('event-start-date').value = utils.formatDateForInput(date);
        document.getElementById('event-end-date').value = utils.formatDateForInput(date);
        
        // Set default time
        const hours = date.getHours();
        const minutes = date.getMinutes();
        document.getElementById('event-start-time').value = `${utils.padZero(hours)}:${utils.padZero(minutes)}`;
        document.getElementById('event-end-time').value = `${utils.padZero(hours + 1)}:${utils.padZero(minutes)}`;
        
        document.getElementById('event-modal').classList.add('active');
    }
    
    // Edit event
    editEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;
        
        document.getElementById('event-modal-title').textContent = 'Edit Event';
        document.getElementById('event-id').value = event.id;
        document.getElementById('event-title').value = event.title;
        document.getElementById('event-start-date').value = utils.formatDateForInput(event.start);
        document.getElementById('event-start-time').value = utils.formatTimeForInput(event.start);
        document.getElementById('event-end-date').value = utils.formatDateForInput(event.end);
        document.getElementById('event-end-time').value = utils.formatTimeForInput(event.end);
        document.getElementById('event-color').value = event.color;
        document.getElementById('event-description').value = event.description || '';
        document.getElementById('event-all-day').checked = event.isAllDay;
        
        document.getElementById('event-modal').classList.add('active');
    }
    
    // Delete event
    deleteEvent(eventId) {
        if (confirm('Are you sure you want to delete this event?')) {
            this.events = this.events.filter(e => e.id !== eventId);
            utils.saveToLocalStorage('calendarEvents', this.events);
            this.renderCalendar();
        }
    }
    
    // Get events for a specific date
    getEventsForDate(date) {
        const dateString = date.toDateString();
        
        return this.events.filter(event => {
            const eventStart = new Date(event.start).toDateString();
            const eventEnd = new Date(event.end).toDateString();
            
            // Check if date is between start and end dates
            return (
                dateString >= eventStart && 
                dateString <= eventEnd
            );
        });
    }
    
    // Get events for a specific hour
    getEventsForHour(date) {
        const dateString = date.toDateString();
        const hour = date.getHours();
        
        return this.events.filter(event => {
            const eventStart = new Date(event.start);
            const eventEnd = new Date(event.end);
            
            // For all-day events, show on all hours
            if (event.isAllDay) {
                return (
                    dateString >= new Date(eventStart).toDateString() && 
                    dateString <= new Date(eventEnd).toDateString()
                );
            }
            
            // For regular events, check if this hour is within the event time
            return (
                (dateString === new Date(eventStart).toDateString() && hour >= eventStart.getHours()) ||
                (dateString === new Date(eventEnd).toDateString() && hour <= eventEnd.getHours()) ||
                (dateString > new Date(eventStart).toDateString() && dateString < new Date(eventEnd).toDateString())
            );
        });
    }
    
    // Get all events
    getAllEvents() {
        return this.events;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.calendarManager = new CalendarManager();
});


                    


