from flask import Flask, render_template, request
from services.weather_service import get_weather
from utils.scene_mapper import map_condition_to_theme

app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def index():
    weather = None
    theme = ""

    if request.method == "POST":
        city = request.form.get("city")
        weather = get_weather(city)

        if weather:
            theme = map_condition_to_theme(weather["condition"])

    return render_template("index.html", weather=weather, theme=theme)

if __name__ == "__main__":
    app.run(debug=True)