import pandas as pd
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter
import json
import os
from tqdm import tqdm
from geopy.exc import GeocoderUnavailable, GeocoderTimedOut

# ---- CONFIG ----
INPUT_FILE = "tennis_courts.csv"
OUTPUT_FILE = "tennis_courts_named.csv"
CACHE_FILE = "geocode_cache.json"
MAX_RETRIES = 3  # per row

# Load CSV
df = pd.read_csv(INPUT_FILE)
df = df.rename(columns={"@id": "id", "@lat": "lat", "@lon": "lon"})

# Geolocator with sane timeout
geolocator = Nominatim(user_agent="tennis-court-namer")
geocode = RateLimiter(
    lambda coords, **kwargs: geolocator.reverse(coords, timeout=10, **kwargs),
    min_delay_seconds=1,
    max_retries=0,  # we'll handle retries ourselves
    swallow_exceptions=True
)

# Load cache
if os.path.exists(CACHE_FILE):
    try:
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            content = f.read().strip()
            cache = json.loads(content) if content else {}
    except json.JSONDecodeError:
        print("⚠️ Cache file is invalid JSON. Starting with an empty cache.")
        cache = {}
else:
    cache = {}


failures = {}
rows_to_geocode = df[df['name'].isna() | (df['name'] == "")]
print(f"Total rows: {len(df)}, rows needing geocoding: {len(rows_to_geocode)}")

def fill_name(row):
    key = f"{row['lat']},{row['lon']}"
    if key in cache:
        return cache[key]

    retry_count = failures.get(key, 0)
    if retry_count >= MAX_RETRIES:
        return row['name']

    try:
        location = geocode((row['lat'], row['lon']), language="en")
        if location:
            name = location.address.split(",")[0]
            cache[key] = name
            # save cache every 50 new results
            if len(cache) % 50 == 0:
                with open(CACHE_FILE, "w", encoding="utf-8") as f:
                    json.dump(cache, f, ensure_ascii=False, indent=2)
            return name
    except (GeocoderUnavailable, GeocoderTimedOut, Exception) as e:
        failures[key] = retry_count + 1
        # don’t crash, just log
        print(f"⚠️ Geocoding failed for {key} (attempt {failures[key]}): {e}")

    return row['name']

print("Filling blank names...")

for i, row in tqdm(rows_to_geocode.iterrows(), total=len(rows_to_geocode), unit="row"):
    df.at[i, 'name'] = fill_name(row)

# Save results
df.to_csv(OUTPUT_FILE, index=False)
with open(CACHE_FILE, "w", encoding="utf-8") as f:
    json.dump(cache, f, ensure_ascii=False, indent=2)

print(f"✅ Done! Saved as {OUTPUT_FILE}")
print(f"⚠️ Skipped {len(failures)} rows due to repeated failures.")
