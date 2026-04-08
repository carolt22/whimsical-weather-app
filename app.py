from flask import Flask, render_template, request
from services.weather_service import get_weather, get_forecast
from utils.scene_mapper import map_condition_to_theme

app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def index():
    weather = None
    error = None
    forecast = None
    scene = "default"

    if request.method == "POST":
        city = request.form.get("city")
        weather = get_weather(city)
        forecast = get_forecast(city)

        if weather:
            scene = map_condition_to_theme(weather["condition"])
        else:
            error = "City not found."
    
    return render_template(
        "index.html", 
        weather=weather,
        forecast=forecast,
        error=error,
        scene=scene
        )

if __name__ == "__main__":
    app.run(debug=True)