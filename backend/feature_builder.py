import pandas as pd
from datetime import datetime

def build_features(
    origin_id,
    destination_id,
    weather,
    flight
):

    now = datetime.now()

    return pd.DataFrame([{

        "YEAR":
            now.year,

        "MONTH":
            now.month,

        "DAY":
            now.day,

        "DAY_OF_WEEK":
            now.weekday(),

        "ORIGIN_AIRPORT":
            origin_id,

        "DESTINATION_AIRPORT":
            destination_id,

        "SCHEDULED_DEPARTURE":
            flight["SCHEDULED_DEPARTURE"],

        "SCHEDULED_TIME":
            flight["SCHEDULED_TIME"],

        "ELAPSED_TIME":
            flight["ELAPSED_TIME"],

        "DISTANCE":
            flight["DISTANCE"],

        "SCHEDULED_ARRIVAL":
            flight["SCHEDULED_ARRIVAL"],

        "HOUR":
            now.hour,

        "VISIBILITY":
            weather["VISIBILITY"],

        "WIND_SPEED":
            weather["WIND_SPEED"],

        "TEMPERATURE":
            weather["TEMPERATURE"],

        "PRECIPITATION":
            weather["PRECIPITATION"]

    }])