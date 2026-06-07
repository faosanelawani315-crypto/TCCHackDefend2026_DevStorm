import requests

AIRPORTS = {
    "JFK": (40.6413, -73.7781),
    "LAX": (33.9416, -118.4085),
    "ATL": (33.6407, -84.4277),
    "ORD": (41.9742, -87.9073),
    "DFW": (32.8998, -97.0403)
}

def get_weather(airport_code):

    lat, lon = AIRPORTS[airport_code]

    url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}"
        f"&longitude={lon}"
        "&hourly=temperature_2m,"
        "visibility,"
        "wind_speed_10m,"
        "precipitation"
    )

    data = requests.get(url).json()

    return {
        "TEMPERATURE":
            data["hourly"]["temperature_2m"][0],

        "VISIBILITY":
            data["hourly"]["visibility"][0],

        "WIND_SPEED":
            data["hourly"]["wind_speed_10m"][0],

        "PRECIPITATION":
            data["hourly"]["precipitation"][0]
    }