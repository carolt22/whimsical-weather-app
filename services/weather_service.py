import os 
import requests
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

API_KEY = os.getenv("API_KEY")

def get_weather(city):
    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        "q": city,
        "appid": API_KEY,
        "units": "metric"
    }

    response = requests.get(url, params=params)

    if response.status_code == 200:
        data = response.json()

        description = data["weather"][0]["description"]
        temp = data["main"]["temp"]

        condition = classify_condition(description)

        return { 
            "city": city,
            "temperature": temp,
            "description": description,
            "condition": condition,
            "sunrise":data["sys"]["sunrise"],
            "sunset":data["sys"]["sunset"],
            "current":data["dt"]
        }
    
    return None
        
def get_forecast(city):    
    forecast_url = "https://api.openweathermap.org/data/2.5/forecast"

    forecast_params = {
        "q": city,
        "appid": API_KEY,
        "units": "metric"
    }

    forecast_response = requests.get(forecast_url, params=forecast_params)
    forecast_data = forecast_response.json()

    daily_forecasts = []

    for item in forecast_data["list"]:
        if "12:00:00" in item["dt_txt"]:

            date_str = item["dt_txt"].split(" ")[0]

            date_obj = datetime.strptime(date_str, "%Y-%m-%d")
            weekday = date_obj.strftime("%a")

            daily_forecasts.append({
                "date": weekday,
                "temp": item["main"]["temp"],
                "description": item["weather"][0]["description"],
                "icon": item["weather"][0]["icon"]
            })

    return daily_forecasts[:5]
    

def classify_condition(description):
    description = description.lower()

    if "rain" in description:
        return "rain"
    elif "cloud" in description:
        return "clouds"
    elif "clear" in description:
        return "clear"
    elif "snow" in description:
        return "snow"
    else:
        return "default"
    