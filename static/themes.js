document.addEventListener("DOMContentLoaded", function() {

    const bglayer = document.getElementById("background-layer");

    const themes = {
        clear_day: "/static/images/day.jpg",
        clear_night: "/static/images/night.jpg",
        rain: "/static/images/rain.jpg",
        snow: "/static/images/snow.jpg",
        clouds: "/static/images/cloudy.jpg",
        thunderstorm: "/static/images/storm.jpg"
    };

    function applyTheme(themeKey) {
        if (!themes[themeKey]) return;
        bglayer.style.backgroundImage = `url(${themes[themeKey]})`;
    }

    function applyWeatherClass(className) {
        document.body.classList.remove("rain","snow","clouds","thunderstorm");
        document.body.classList.add(className);
    }

    function mapweatherToTheme(condition, isNight) {
        if (!condition) return "clear_day";

        condition = condition.toLowerCase();

        if(condition.includes("thunderstorm")) return "thunderstorm";
        if(condition.includes("rain")) return "rain";
        if(condition.includes("snow")) return "snow";
        if(condition.includes("cloud")) return "clouds";

        if(condition.includes("clear")) {
            return isNight ? "clear_night" : "clear_day";
        }

        return "clear_day";
    }

    function getWeatherType(condition) {
        if (!condition) return "clear_day";

        condition = condition.toLowerCase();

        if (condition.includes("thunderstorm")) return "thunderstorm";
        if (condition.includes("rain")) return "rain";
        if (condition.includes("snow")) return "snow";
        if (condition.includes("clouds")) return "clouds";

        return "clear";

    }

    function triggerThunder() {
        const thunderLayer = document.querySelector(".thunder-layer");
        if (!thunderLayer) return;

        function flash() {
            thunderLayer.style.animation = "none";
            void thunderLayer.offsetWidth;
            thunderLayer.style.animation = "lightningFlash 1s ease";

            const next = Math.random() * 8000 + 4000;
            setTimeout(flash, next);
        }
        
        flash();
    }

    if (!window.weatherData) {
        applyTheme("clear_day");
    } else {
        const condition = window.weatherData.description;

        const now = window.weatherData.current;
        const sunrise = window.weatherData.sunrise;
        const sunset = window.weatherData.sunset;

        const isNight = now < sunrise || now > sunset; 

        const weatherType = getWeatherType(condition);

        const themeKey = mapweatherToTheme(condition, isNight);

        applyTheme(themeKey);
        applyWeatherClass(weatherType);

        if (themeKey === "thunderstorm") {
            triggerThunder();
        }
    }
    

    const slider = document.querySelector(".forecast-container");

    if (slider) {
        let isDown = false;
        let startX;
        let scrollLeft;

        slider.addEventListener("mousedown", (e) => {
            isDown = true;
            slider.classList.add("dragging");
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });

        slider.addEventListener("mouseleave", () => {
            isDown = false;
            slider.classList.remove("dragging");
        });

        slider.addEventListener("mouseup", () => {
            isDown = false;
            slider.classList.remove("dragging");
        });

        slider.addEventListener("mousemove", (e) => {
            if (!isDown) return;
            
            e.preventDefault();

            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2;
            slider.scrollLeft = scrollLeft - walk;
        });
    }

    const tempEl = document.getElementById("temperature");
    const toggleBtn = document.getElementById("temp-toggle");
    const forecastTemps = document.querySelectorAll(".forecast-temp");

    let isCelsius = true;

    function toFahrenheit(c) {
        return (c * 9/5) + 32;
    }

    if (tempEl && toggleBtn && window.weatherData) {

        const savedUnit = localStorage.getItem("unit");
        
        if (savedUnit === "F") {
            isCelsius = false;
        }

        function updateTemps() {
            const baseTemp = window.weatherData.temperature;

            if (isCelsius) {
                tempEl.textContent = `${baseTemp}°C`;
                toggleBtn.textContent = "Switch to °F";

                forecastTemps.forEach(el => {
                    const c = parseFloat(el.dataset.temp);
                    el.textContent = `${c}°C`;
                });

            } else {
                const f = toFahrenheit(baseTemp);
                tempEl.textContent = `${Math.round(f)}°F`;
                toggleBtn.textContent = "Switch to °C";

                forecastTemps.forEach(el => {
                    const c = parseFloat(el.dataset.temp);
                    const f = toFahrenheit(c);
                    el.textContent = `${Math.round(f)}°F`;
                });
            }
        } 

        updateTemps();

        toggleBtn.addEventListener("click", () => {
            isCelsius = !isCelsius;
            localStorage.setItem("unit", isCelsius ? "C" : "F");
            updateTemps();
        });  
    }
});