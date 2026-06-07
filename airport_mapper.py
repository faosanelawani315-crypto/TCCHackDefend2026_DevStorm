import joblib

origin_encoder = joblib.load(
    "models/origin_encoder.pkl"
)

dest_encoder = joblib.load(
    "models/dest_encoder.pkl"
)

def encode_airports(
    origin_code,
    destination_code
):

    origin_id = origin_encoder.transform(
        [origin_code]
    )[0]

    destination_id = dest_encoder.transform(
        [destination_code]
    )[0]

    return origin_id, destination_id