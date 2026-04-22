from flask import Flask, render_template, request
from services.weather_service import get_weather, get_forecast
from utils.scene_mapper import map_condition_to_theme
import os

app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def index():
    weather = None
    error = None
    forecast = None
    scene = "default"

    if request.method == "POST":
        city = request.form.get("city")

        if not city:
            error = "Please enter a city."
            return render_template("index.html", error=error)
        
        try:
            weather = get_weather(city)

            if not weather:
                error = f"Couldn't find '{city}'. Try another city."
            else:
                forecast = get_forecast(city)
                scene = map_condition_to_theme(weather["condition"])
        except Exception as e:
            print("ERROR.",e)
            error = "Something went wrong. Please try again."
    
    return render_template(
        "index.html", 
        weather=weather,
        forecast=forecast,
        error=error,
        scene=scene
        )

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)