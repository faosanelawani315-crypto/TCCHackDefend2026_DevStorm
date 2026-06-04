from pydantic import BaseModel

class FlightRequest(BaseModel):
    origin: str
    destination: str