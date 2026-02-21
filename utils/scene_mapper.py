def map_condition_to_theme(condition):
    condition = condition.lower()

    if "clear" in condition:
        return "sunny"
    elif "rain" in condition:
        return "rain"
    elif "snow" in condition:
        return "snow"
    else:
        return "cloudy"