import os 
import requests
from dotenv import load_dotenv

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
            "condition": condition
        }
    
    return None

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
    
    