from datetime import datetime

def find_closest_humidity(response, current_time):
    hourly_times = response["hourly"]["time"]
    hourly_values = response["hourly"]["relative_humidity_2m"]

    t_current = datetime.fromisoformat(current_time)

    closest_index = min(
        range(len(hourly_times)),
        key=lambda i: abs(datetime.fromisoformat(hourly_times[i]) - t_current)
    )

    return hourly_values[closest_index]