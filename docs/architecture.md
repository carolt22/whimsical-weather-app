# Architecture Overview 

## System Flow 

User → Frontend (HTML/CSS/JS)
     → Flask Backend 
     → OpenWeather API
     → Response processed → UI updated

## Components 

### Frontend 
- Handles UI rendering and animations 
- Manages user interactions (search, toggles, card expansion)
- Updates DOM dynamically based on API data 

### Backend (Flask)
- Handles API requests 
- Processes and structures weather data
- Passes data to frontend through templating

### External API
- OpenWeatherMap for weather and forecast data
