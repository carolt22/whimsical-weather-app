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

    function getWeatherType(condition) {
        condition = condition.toLowerCase();

        if (condition.includes("thunderstorm")) return "thunderstorm";
        if (condition.includes("rain")) return "rain";
        if (condition.includes("snow")) return "snow";
        if (condition.includes("clouds")) return "clouds";

        return "clear";

    }

    function triggerThunder() {
        const thunderLayer = document.querySelector(".thunder-layer");

        function flash() {
            thunderLayer.style.animation = "none";
            void thunderLayer.offsetWidth;
            thunderLayer.style.animation = "lightningFlash 1s ease";

            const next = Math.random() * 8000 + 4000;
            setTimeout(flash, next);
    }

    flash();
}

function mapweatherToTheme(condition, isNight) {
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

if (window.weatherData) {

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
} else {
    applyTheme("clear_day");
}

});
