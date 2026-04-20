document.addEventListener("DOMContentLoaded", () => {

    //// GLOBALS + HELPERS ////
    const bglayer = document.getElementById("background-layer");

    const themes = {
        clear_day: "/static/images/day.jpg",
        clear_night: "/static/images/night.jpg",
        rain: "/static/images/rain.jpg",
        snow: "/static/images/snow.jpg",
        clouds: "/static/images/cloudy.jpg",
        thunderstorm: "/static/images/storm.jpg",

        day_time: "/static/images/day-time.jpg",
        night_time: "/static/images/starrynight.jpg",

        clouds_night: "/static/images/cloudy-night.jpg",
        partly_night: "/static/images/partly-clear-night.jpg",
        star_night: "/static/images/clear-night.jpg",

        sun_rise: "/static/images/sunrise.jpg",
        sun_set: "/static/images/sunset.jpg"
    };

    const themeImages = Object.values(themes);

    themeImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });

    function applyTheme(themeKey) {
        if (!themes[themeKey]) return;
        bglayer.style.backgroundImage = `url(${themes[themeKey]})`;
    }

    let currentWeatherTheme = "day_time";

    function isNightTime(now, sunrise, sunset) {
        return now < sunrise || now > sunset;
    }

    function getTimeRemaining(targetUnix) {
        const diff = (targetUnix * 1000) - Date.now();
        if (diff <= 0) return null;

        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        return `${h}h ${m}m`;
    }

    function formatCityTime(unix, tz) {
        return new Date((unix + tz) * 1000).toUTCString().slice(17, 22);
    }

    //temp toggle

    function setupTempToggle() {
        const tempEl = document.getElementById("temperature");
        const toggleBtn = document.getElementById("temp-toggle");
        const forecastTemps = document.querySelectorAll(".forecast-temp");

        if (!tempEl || !toggleBtn || !window.weatherData) return;

        let isCelsius = localStorage.getItem("unit") !== "F";
        
        function toFahrenheit(c) {
            return (c * 9/5) + 32;
        }

        function updateTemps() {
            const baseTemp = window.weatherData.temperature;

            tempEl.textContent = isCelsius    
                 ? `${baseTemp}°C`
                 : `${Math.round(toFahrenheit(baseTemp))}°F`;

            toggleBtn.textContent = isCelsius
                 ? "Switch to °F"
                 : "Switch to °C";

            forecastTemps.forEach(el => {
                    const c = parseFloat(el.dataset.temp);
                    const value = isCelsius ? c : Math.round(toFahrenheit(c));
                    const unit = isCelsius ? "°C" : "°F";
                    el.textContent = `${value}${unit}`;
            });
        }

        toggleBtn.addEventListener("click", () => {
            isCelsius = !isCelsius;
            localStorage.setItem("unit", isCelsius ? "C" : "F");
            updateTemps();
        });

        updateTemps();
    }

    let description, current, sunrise, sunset, clouds, timezone, isNight, nowSec; 

    //// WEATHER THEME ENGINE ////

    function getWeatherTheme(condition, isNight) {
        if (!condition) return "day_time";

        condition = condition.toLowerCase();

        if(condition.includes("thunderstorm")) return "thunderstorm";
        if(condition.includes("rain")) return "rain";
        if(condition.includes("snow")) return "snow";
        if(condition.includes("cloud")) return "clouds";
        
        return isNight ? "clear_night" : "clear_day";
    }

    function getWeatherType(condition) {
        condition = condition.toLowerCase();

        if (condition.includes("thunderstorm")) return "thunderstorm";
        if (condition.includes("rain")) return "rain";
        if (condition.includes("snow")) return "snow";
        if (condition.includes("cloud")) return "clouds";

        return "clear";
    }

    function applyWeatherClass(type) {
        if (document.body.classList.contains("expanded-mode")) return;

        document.body.classList.remove("rain","snow","clouds","thunderstorm");
        document.body.classList.add(type);
    }

    function applyWeatherEffects(condition, isNight) {
        const type = getWeatherType(condition);
        applyWeatherClass(type);

        if (type === "thunderstorm") {
            triggerThunder();
        }
    }

    function triggerThunder() {
        const thunderLayer = document.querySelector(".thunder-layer");
        if (!thunderLayer) return;

        let active = true;

        function flash() {
            if (!active) return;

            const intensity = Math.random() * 0.5 +0.2;
            
            thunderLayer.style.opacity = intensity;
            thunderLayer.style.animation = "none";
            void thunderLayer.offsetWidth;
            thunderLayer.style.animation = "lightningFlash 1s ease";

            const next = Math.random() * 20000 + 15000;
            setTimeout(flash, next);
        }
        
        flash();

        return() => { active = false; };
    }

    //// ASTRONOMY MODULE ////

    function initSunCard() {
        const sunriseEl = document.getElementById("sunrise-time");
        const sunsetEl = document.getElementById("sunset-time");
        const statusEl = document.getElementById("sun-status");

        if (!sunriseEl || !sunsetEl || !statusEl) return;

        sunriseEl.textContent = `Sunrise: ${formatCityTime(sunrise, timezone)}`;
        sunsetEl.textContent = `Sunset: ${formatCityTime(sunset, timezone)}`;

        if (nowSec < sunrise) {
                statusEl.textContent = `Sunrise in ${getTimeRemaining(sunrise)}`;
            } else if (nowSec < sunset) {
                statusEl.textContent = `Sunset in ${getTimeRemaining(sunset)}`;
            } else {
                statusEl.textContent = `Next sunrise in ${getTimeRemaining(sunrise + 86400)}`;
            }
    }

    function getStargazingRating(description, clouds, isNight) {
            if (!description) return "--";
            if (!isNight) return "Daylight - Not visible";

            const cond = description.toLowerCase();

            if (cond.includes("rain") || cond.includes("thunder"))return "Poor";
            if (clouds > 75) return "Poor";
            if (clouds > 50) return "Limited";
            if (clouds > 25) return "Decent";

            return "Excellent"
        }

    function initStarCard() {
        const ratingEl = document.getElementById("stargazing");
        const moonEl = document.getElementById("moon-phase");
        const moonIcon = document.getElementById("moon-icon");
        const moonText = document.getElementById("moon-text");

        if (!ratingEl) return;
        
        let rating = getStargazingRating(description, clouds, isNight);
        const moonPhase = getMoonPhase();
        
        rating = adjustRatingForMoon(rating, moonPhase);
        ratingEl.textContent = rating;

        if (moonIcon && moonText) {
            const phaseClassMap = {
                "New Moon": "moon-new",
                "Waxing Crescent": "moon-waxing-crescent",
                "First Quarter": "moon-first-quarter",
                "Waxing Gibbous": "moon-waxing-gibbous",
                "Full Moon": "moon-full",
                "Waning Gibbous": "moon-waning-gibbous",
                "Last Quarter": "moon-last-quarter",
                "Waning Crescent": "moon-waning-crescent"
            };

        const phaseClass = phaseClassMap[moonPhase] || "moon-new";
        
        moonIcon.className = "moon-icon " + phaseClass;
        moonText.textContent = moonPhase;
}
        generateStars(rating, isNight);
    }

    function getMoonPhase() {
        const now = new Date();
        const lp = 2551443;
        const knownNewMoon = new Date("2000-01-06T18:14:00Z");
        
        const synodicMonth = 29.53058867;

        const daysSince = (now - knownNewMoon) / (1000 * 60 * 60 * 24);

        const phase = (daysSince % synodicMonth) / synodicMonth;

        if (phase < 0.0625) return "New Moon";
        if (phase < 0.1875) return "Waxing Crescent";
        if (phase < 0.3125) return "First Quarter";
        if (phase < 0.4375) return "Waxing Gibbous";
        if (phase < 0.5625) return "Full Moon";
        if (phase < 0.6875) return "Waning Gibbous";
        if (phase < 0.8125) return "Last Quarter";
        if (phase < 0.9375) return "Waning Crescent";

        return "New Moon";
    }

    function adjustRatingForMoon(rating, phase) {
        if (phase === "Full Moon") {
            if (rating === "Excellent") rating = "Decent";
            if (rating === "Decent") rating = "Limited";
        }
        return rating;
    }

    //STAR SYSTEM

    function generateStars(rating, isNight) {
        const layer = document.querySelector(".star-layer");
        const isExpanded = document.body.classList.contains("expanded-mode");

        if (!layer || !isExpanded) return;

         if(!isNight) {
            layer.style.opacity = "0";
            layer.innerHTML = "";
            return;
        }

        layer.innerHTML = "";

        let count = rating === "Excellent" ? 120 :
                    rating === "Decent" ? 80 :
                    rating === "Limited" ? 40 :
                    rating === "Poor" ? 15 : 0;

        let twinkle = (rating === "Excellent") || (rating === "Decent");

        for (let i = 0; i < count; i++) {
            const star = document.createElement("div");
            star.classList.add("star");

            if (twinkle && Math.random() > 0.6) {
                star.classList.add("twinkle");
            }

            star.style.top = Math.random() * 100 + "%";
            star.style.left = Math.random() * 100 + "%";

            layer.appendChild(star);
        
        }

        if (!document.body.classList.contains("expanded-mode")) {
            layer.style.opacity = "0";
            layer.innerHTML = "";
            return;
        }

        requestAnimationFrame(() => {
            layer.style.opacity = "1";
        });
    }

    function clearStars() {
        const layer = document.querySelector(".star-layer");
        if (!layer) return;

        layer.style.opacity = "0"
        layer.innerHTML = "";
    }

    //// EXPANDABLE CARDS ////

    function setupExpandableCard(id, getTheme) {
        const card = document.getElementById(id);
        const weatherCard = document.querySelector(".weather-card");

        if(!card) return;

        card.addEventListener("click", (e) => {
            e.stopPropagation();

            if (card.classList.contains("expanded")) return;

            if (weatherCard) {
                weatherCard.style.visibility = "hidden";
                weatherCard.style.opacity = "0";
            }

            document.body.classList.remove("rain","snow","clouds","thunderstorm");

            document.querySelectorAll(".info-card").forEach(c => {
                if (c !== card) c.classList.add("hidden");
                c.classList.remove("expanded");
            });

            card.classList.add("expanded");
            document.body.classList.add("expanded-mode");
            
            applyTheme(getTheme());

            if(window.weatherData) {
                if (id === "sun-card" && typeof initSunCard === 'function') initSunCard();
                if (id === "star-card" && typeof initStarCard === 'function') initStarCard();
            }

            document.addEventListener("click", handleOutsideClick);
        });
    }

    function handleOutsideClick(e) {
        const expanded = document.querySelector(".info-card.expanded");

        if (!expanded) {
            document.removeEventListener("click", handleOutsideClick);
            return;
        }

        if (expanded.contains(e.target)) return;

        resetCards();
    }

    function resetCards() {
        const weatherCard = document.querySelector(".weather-card");

        document.querySelectorAll(".info-card").forEach(c => {
            c.classList.remove("hidden","expanded");
        });

        if (weatherCard) {
            weatherCard.style.visibility = "visible";
            weatherCard.style.opacity = "1";
        }

        document.body.classList.remove("expanded-mode");

        clearStars();

        applyTheme(currentWeatherTheme);
        applyWeatherEffects(description, isNight);

        document.removeEventListener("click", handleOutsideClick);
    }

    //sun theme
    setupExpandableCard("sun-card", () => {
        const diffRise = Math.abs(nowSec - sunrise);
        const diffSet = Math.abs(nowSec - sunset);

        if (diffRise < 1800) return "sun_rise";
        if (diffSet < 1800) return "sun_set";

        return isNight ? "night_time" : "day_time";
    });

    //star theme
    setupExpandableCard("star-card", () => {
        if (!isNight) return "day_time";

        const cond = description.toLowerCase();

        if (cond.includes("thunderstorm")) return "thunderstorm";
        if (cond.includes("rain")) return "rain";
        if (cond.includes("snow")) return "snow";

        if (clouds > 75) return "clouds_night";
        if (clouds > 25) return "partly_night";

        return "star_night";
    });

    // CARD DETAILS //

    function updatePreviews() {
        const sunEl = document.getElementById("sun-preview");
        const starEl = document.getElementById("star-preview");

        if (sunEl) {
            sunEl.textContent = getSunPreview(nowSec, sunrise, sunset);
        }

        if (starEl) {
           const rating = getStargazingRating(description, clouds, isNight);
            starEl.textContent = getStarPreviewText(rating, isNight, clouds);
        }
    }

    function getSunPreview(nowSec, sunrise, sunset) {
        if (nowSec < sunrise) {
            return `Sunrise in ${getTimeRemaining(sunrise)}`;
        } else if (nowSec < sunset) {
            return `Sunset in ${getTimeRemaining(sunset)}`;
        } else {
            return "Sun has set";
        }
    }

    function getStarPreviewText(rating, isNight, clouds) {
        if (!isNight) return "Stars hidden by daylight";

        if (rating === "Excellent") return "Perfect night for stargazing 💫";
        if (rating === "Decent") return "Some stars visible tonight";
        if (rating === "Limited") return "Clouds may block the view";
        if (rating === "Poor") return "Low visibility - Not ideal for stargazing";

        return "Look up tonight";
    }

    //// UI/UX ////

    const input = document.querySelector("input[name='city']");
    if (input) input.focus();

    function setupLoader() {
        const form = document.getElementById("weather-form");
        const btn = document.getElementById("search-btn");
        const loader = document.getElementById("loader");
        const overlay = document.getElementById("loader-overlay");

        if (!form || !btn || !loader) return;
     
        form.addEventListener("submit", () => {
            loader.style.display = "block";
            overlay.style.display = "block";

            btn.textContent = "Loading...";
            btn.disabled = true;
        });
    }

    function setupSlider() {
        const slider = document.querySelector(".forecast-container");
        if (!slider) return;

        let isDown = false;
        let startX;
        let scrollLeft;

        slider.addEventListener("mousedown", (e) => {
            isDown = true;
            slider.classList.add("dragging");
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });

        ["mouseleave", "mouseup"].forEach(event => {
            slider.addEventListener(event, () => {
                isDown = false;
                slider.classList.remove("dragging");
            });
        });

        slider.addEventListener("mousemove", (e) => {
            if (!isDown) return;
            e.preventDefault();

            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2;
            slider.scrollLeft = scrollLeft - walk;
        });
    }

    function applyGlassTheme(isNight) {
        document.documentElement.style.setProperty(
            "--glass-bg",
            isNight
              ? "rgba(10, 15, 30, 0.33)"
              : "rgba(10, 15, 30, 0.2)"
        );
    }

    //// INIT ////

    function init() {
        const currentHour = new Date().getHours();

        if (!window.weatherData) {
            const isNight = currentHour < 6 || currentHour > 18;
            applyTheme(isNight ? "night_time" : "day_time");
            return;
        }

        const data = window.weatherData;

        description = data.description;
        current = data.current;
        sunrise = data.sunrise;
        sunset = data.sunset;
        clouds = data.clouds || 0;
        timezone = data.timezone;

        nowSec = Date.now() / 1000;

        isNight = isNightTime(nowSec, sunrise, sunset);

        currentWeatherTheme = getWeatherTheme(description, isNight);

        applyGlassTheme(isNight);
        applyTheme(currentWeatherTheme);
        applyWeatherEffects(description, isNight);

        setupTempToggle();
        setupSlider();
        setupLoader();

        updatePreviews();
    }

    init();
});
