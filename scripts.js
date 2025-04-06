function updateDateTime() {
    const now = new Date();
    
    // Format time
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strTime = `${hours}:${minutes}:${seconds} ${ampm}`;
    
    // Format short date
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    const strDate = `${day}/${month}/${year}`;
    
    // Format full date
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const strFullDate = now.toLocaleDateString('en-US', options);
    
    // Update the HTML
    document.getElementById('time').textContent = strTime;
    
    // Set the short date in the #date element
    const dateElement = document.getElementById('date');
    if (!dateElement.matches(':hover')) {
        dateElement.textContent = strDate;
    }
    
    // Store the full date for hover effect
    dateElement.setAttribute('data-full-date', strFullDate);
}

// Hover events
const dateElement = document.getElementById('date');
const timeElement = document.getElementById('time');
const calendarContainer = document.getElementById('calendar-container');

dateElement.addEventListener('mouseenter', function() {
    const fullDate = this.getAttribute('data-full-date');
    this.textContent = fullDate;
});

dateElement.addEventListener('mouseleave', function() {
    this.textContent = strDate;
});

// Calendar functionality
let currentDate = new Date();
let selectedDate = new Date();

function toggleCalendar() {
    calendarContainer.classList.toggle('calendar-hidden');
    if (!calendarContainer.classList.contains('calendar-hidden')) {
        renderCalendar();
        searchInput.value = ''; // Clear search input
    }
}

function renderCalendar() {
    const monthYear = document.getElementById('monthYear');
    const calendarDays = document.getElementById('calendar-days');
    
    // Set month and year
    monthYear.textContent = currentDate.toLocaleString('default', { 
        month: 'long', 
        year: 'numeric' 
    });
    
    // Get first day of month and total days
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // Clear previous calendar with empty div to maintain structure
    calendarDays.innerHTML = '<div style="display: none;"></div>';
    requestAnimationFrame(() => {
        calendarDays.innerHTML = '';
        
        // Add empty cells for days before first day of month
        for (let i = 0; i < firstDay.getDay(); i++) {
            calendarDays.appendChild(document.createElement('div'));
        }
        
        // Add days of month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dayElement = document.createElement('div');
            dayElement.textContent = day;
            
            const thisDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            if (thisDay.toDateString() === new Date().toDateString()) {
                dayElement.classList.add('today');
            }
            
            if (thisDay.toDateString() === selectedDate.toDateString()) {
                dayElement.classList.add('selected');
            }
            
            dayElement.addEventListener('click', () => {
                selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                toggleCalendar();
                updateDateTime();
            });
            
            calendarDays.appendChild(dayElement);
        }
    });
}

// Event listeners for calendar navigation
document.getElementById('prevMonth').addEventListener('click', (e) => {
    e.stopPropagation();
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', (e) => {
    e.stopPropagation();
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// Update click handlers to include the container
const clockContainer = document.querySelector('.clock-container');

// Remove individual click listeners from date and time
dateElement.removeEventListener('click', toggleCalendar);
timeElement.removeEventListener('click', toggleCalendar);

// Add click listener to the entire container
clockContainer.addEventListener('click', (e) => {
    // Don't toggle calendar if clicking on the calendar itself
    if (!calendarContainer.contains(e.target)) {
        toggleCalendar();
    }
});

// Update outside click handler
document.addEventListener('click', (e) => {
    if (!calendarContainer.contains(e.target) && 
        !clockContainer.contains(e.target)) {
        calendarContainer.classList.add('calendar-hidden');
    }
});

// Add search functionality
const searchInput = document.getElementById('calendar-search-input');

const searchOkButton = document.getElementById('calendar-search-ok');

// Function to handle search
function handleSearch() {
    const searchValue = searchInput.value.trim().toLowerCase();
    
    const datePattern = /(\d{1,2})?\s*([a-zA-Z]+)?\s*(\d{4})?/;
    const matches = searchValue.match(datePattern);
    
    if (matches) {
        const [_, day, month, year] = matches;
        let targetDate = new Date(currentDate);
        
        // Batch all date updates
        if (year) targetDate.setFullYear(parseInt(year));
        if (month) {
            const monthNames = ["january", "february", "march", "april", "may", "june",
                              "july", "august", "september", "october", "november", "december"];
            const monthIndex = monthNames.findIndex(m => m.startsWith(month.toLowerCase()));
            if (monthIndex !== -1) targetDate.setMonth(monthIndex);
        }
        if (day) targetDate.setDate(parseInt(day));
        
        // Update dates and render in one batch
        currentDate = new Date(targetDate);
        selectedDate = new Date(targetDate);
        
        // Use RAF to ensure smooth rendering
        requestAnimationFrame(() => {
            renderCalendar();
            searchInput.value = '';
            searchInput.blur();
        });
    }
}

// Add click handler for OK button
searchOkButton.addEventListener('click', (e) => {
    e.stopPropagation();
    handleSearch();
});

// Keep Enter key functionality
searchInput.addEventListener('keyup', function(e) {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

// Prevent calendar from closing when clicking OK button
searchOkButton.addEventListener('click', (e) => {
    e.stopPropagation();
});

// Add reset functionality
const resetButton = document.getElementById('calendar-reset');

resetButton.addEventListener('click', (e) => {
    e.stopPropagation();
    
    // Reset to today's date
    const today = new Date();
    currentDate = new Date(today);
    selectedDate = new Date(today);
    
    // Clear search input
    searchInput.value = '';
    
    // Update calendar view
    renderCalendar();
    
    // Update the displayed date
    updateDateTime();
});

// Prevent calendar from closing when clicking reset button
resetButton.addEventListener('click', (e) => {
    e.stopPropagation();
});

setInterval(updateDateTime, 1000);
updateDateTime();
