def map_condition_to_theme(condition):
    condition = condition.lower()

    if any(x in condition for x in ["rain","drizzle","thunderstorm"]):
        return "rain"
    elif "cloud" in condition:
        return "clouds"
    elif "clear" in condition:
        return"clear"
    elif "snow" in condition:
        return "snow"
    else:
        return "default"
