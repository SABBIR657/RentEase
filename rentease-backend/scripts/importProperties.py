import pandas as pd
import pymongo
import json
import sys
from datetime import datetime
import os

# ─────────────────────────────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────────────────────────────

CSV_FILE = os.path.join(os.path.dirname(__file__), "dataset.csv")      # ← put your Kaggle CSV filename here
MONGO_URI   ="mongodb+srv://RentEase:11223@cluster0.gmtwazh.mongodb.net/?appName=Cluster0"
DB_NAME     = "rentease"
COLLECTION  = "properties"

# ⚠️  LIMIT SETTING
# Currently set to 50 for development.
# To import full dataset later → change 50 to 5000 (or None for all rows)
IMPORT_LIMIT = 50     # ← CHANGE THIS TO 5000 WHEN READY

# ─────────────────────────────────────────────────────────────────
# COLUMN MAPPING
# Map your Kaggle CSV column names → RentEase MongoDB field names
# ⚠️  If your CSV has different column names → update the LEFT side
# ─────────────────────────────────────────────────────────────────
COLUMN_MAP = {
    "suburb":         "suburb",
    "locality":       "locality",
    "state":          "state",
    "postcode":       "postcode",
    "street_address": "street_address",
    "price_display":  "rentPrice",
    "bedrooms":       "bedrooms",
    "bathrooms":      "bathrooms",
    "propertyType":   "type",
    "parking_spaces": "parking",
    "description":    "description",
    "latitude":       "latitude",
    "longitude":      "longitude",
    "amenities":      "amenities",
}

# ─────────────────────────────────────────────────────────────────
# PROPERTY TYPE MAPPING
# Maps Kaggle type names → our enum values
# ⚠️  Add more mappings if your dataset has different type names
# ─────────────────────────────────────────────────────────────────
TYPE_MAP = {
    "house":      "house",
    "House":      "house",
    "apartment":  "apartment",
    "Apartment":  "apartment",
    "unit":       "unit",
    "Unit":       "unit",
    "townhouse":  "townhouse",
    "Townhouse":  "townhouse",
    "studio":     "studio",
    "Studio":     "studio",
    "flat":       "apartment",
    "Flat":       "apartment",
    "villa":      "house",
    "Villa":      "house",
}

# ─────────────────────────────────────────────────────────────────
# LOAD & CLEAN
# ─────────────────────────────────────────────────────────────────
print(f"\n{'='*50}")
print("RentEase — Kaggle Property Import Script")
print(f"{'='*50}")

# Load CSV
print(f"\n[1] Loading CSV: {CSV_FILE}")
try:
    df = pd.read_csv(CSV_FILE)
    print(f"    Loaded {len(df)} rows, {len(df.columns)} columns")
    print(f"    Columns: {list(df.columns)}")
except FileNotFoundError:
    print(f"    ERROR: {CSV_FILE} not found.")
    print(f"    Place your Kaggle CSV in the same folder as this script.")
    sys.exit(1)

# Rename columns
print(f"\n[2] Mapping columns...")
rename = {k: v for k, v in COLUMN_MAP.items() if k in df.columns}
df = df.rename(columns=rename)
print(f"    Mapped: {list(rename.keys())}")

# Drop rows missing critical fields
print(f"\n[3] Cleaning data...")
before = len(df)
required = ["suburb", "rentPrice", "bedrooms", "bathrooms", "type"]
existing_required = [f for f in required if f in df.columns]
df = df.dropna(subset=existing_required)

# Clean rentPrice — remove $ signs, commas, convert to float
if "rentPrice" in df.columns:
    df["rentPrice"] = df["rentPrice"].astype(str)
    df["rentPrice"] = df["rentPrice"].str.replace(r'[^\d.]', '', regex=True)
    df["rentPrice"] = pd.to_numeric(df["rentPrice"], errors='coerce')
    df = df.dropna(subset=["rentPrice"])
    df = df[df["rentPrice"] > 0]
    df = df[df["rentPrice"] < 10000]  # remove outliers

# Clean bedrooms / bathrooms / parking
for col in ["bedrooms", "bathrooms", "parking"]:
    if col in df.columns:
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(int)
        df[col] = df[col].clip(0, 20)

# Clean property type
if "type" in df.columns:
    df["type"] = df["type"].astype(str).str.strip()
    df["type"] = df["type"].map(TYPE_MAP).fillna("other")

# Clean lat/lng
if "latitude" in df.columns and "longitude" in df.columns:
    df["latitude"]  = pd.to_numeric(df["latitude"],  errors='coerce').fillna(0)
    df["longitude"] = pd.to_numeric(df["longitude"], errors='coerce').fillna(0)

# Fill missing text fields
for col in ["suburb", "locality", "state", "postcode", "street_address", "description"]:
    if col in df.columns:
        df[col] = df[col].fillna("").astype(str).str.strip()
    else:
        df[col] = ""

# Fill missing amenities
if "amenities" in df.columns:
    df["amenities"] = df["amenities"].fillna("").astype(str)
else:
    df["amenities"] = ""

after = len(df)
print(f"    Rows before cleaning: {before}")
print(f"    Rows after cleaning:  {after}")
print(f"    Dropped: {before - after} invalid rows")

# Apply limit
# ⚠️  TO IMPORT MORE RECORDS LATER:
#     Change IMPORT_LIMIT at the top of this file from 50 to 5000
if IMPORT_LIMIT:
    df = df.head(IMPORT_LIMIT)
    print(f"\n    Applying limit: {IMPORT_LIMIT} records")
    print(f"    ⚠️  To import more: change IMPORT_LIMIT in this script")
    print(f"    ⚠️  Recommended production value: 5000")

# ─────────────────────────────────────────────────────────────────
# BUILD DOCUMENTS
# ─────────────────────────────────────────────────────────────────
print(f"\n[4] Building MongoDB documents...")

documents = []
for _, row in df.iterrows():
    lat = float(row.get("latitude",  0) or 0)
    lng = float(row.get("longitude", 0) or 0)

    # Parse amenities — could be comma-separated string or list
    raw_amenities = str(row.get("amenities", ""))
    if raw_amenities and raw_amenities != "nan":
        amenities_list = [a.strip() for a in raw_amenities.split(",") if a.strip()]
    else:
        amenities_list = []

    # Build title from suburb + type + bedrooms
    suburb  = str(row.get("suburb", "")).strip()
    p_type  = str(row.get("type",   "house")).strip()
    beds    = int(row.get("bedrooms", 1))
    title   = f"{beds} Bedroom {p_type.title()} in {suburb}" if suburb else f"{beds} Bedroom {p_type.title()}"

    doc = {
        "title":          title,
        "description":    str(row.get("description", ""))[:1000],  # cap at 1000 chars
        "type":           str(row.get("type", "other")),
        "suburb":         str(row.get("suburb",         "")),
        "locality":       str(row.get("locality",       "")),
        "state":          str(row.get("state",          "")),
        "postcode":       str(row.get("postcode",       "")),
        "street_address": str(row.get("street_address", "")),
        "location": {
            "type":        "Point",
            "coordinates": [lng, lat],   # MongoDB: [longitude, latitude]
        },
        "rentPrice":   float(row.get("rentPrice", 0)),
        "bedrooms":    int(row.get("bedrooms",  0)),
        "bathrooms":   int(row.get("bathrooms", 0)),
        "parking":     int(row.get("parking",   0)),
        "amenities":   amenities_list,
        "images":      [],          # no images from Kaggle data
        "status":      "available",
        "isFeatured":  False,
        "isApproved":  True,        # auto-approved — Kaggle data is trusted
        "averageRating": 0,
        "totalReviews":  0,
        "source":      "kaggle",    # marks this as imported data
        "createdAt":   datetime.utcnow(),
        "updatedAt":   datetime.utcnow(),
    }
    documents.append(doc)

print(f"    Built {len(documents)} documents")

# ─────────────────────────────────────────────────────────────────
# IMPORT TO MONGODB
# ─────────────────────────────────────────────────────────────────
print(f"\n[5] Connecting to MongoDB...")
print(f"    URI: {MONGO_URI}")

try:
    client = pymongo.MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.server_info()
    print(f"    Connected!")
except Exception as e:
    print(f"    ERROR: Cannot connect to MongoDB: {e}")
    print(f"    Make sure MongoDB is running: net start MongoDB")
    sys.exit(1)

db         = client[DB_NAME]
collection = db[COLLECTION]

# Count existing Kaggle records
existing = collection.count_documents({"source": "kaggle"})
if existing > 0:
    print(f"\n    Found {existing} existing Kaggle records.")
    answer = input("    Delete existing Kaggle records and re-import? (y/n): ").strip().lower()
    if answer == 'y':
        collection.delete_many({"source": "kaggle"})
        print(f"    Deleted {existing} existing records.")
    else:
        print("    Skipping import. Exiting.")
        sys.exit(0)

# Insert documents
print(f"\n[6] Importing {len(documents)} documents...")
result = collection.insert_many(documents)
print(f"    ✅ Successfully imported {len(result.inserted_ids)} properties!")

# ─────────────────────────────────────────────────────────────────
# VERIFY
# ─────────────────────────────────────────────────────────────────
print(f"\n[7] Verification...")
total     = collection.count_documents({"source": "kaggle"})
available = collection.count_documents({"source": "kaggle", "status": "available"})
approved  = collection.count_documents({"source": "kaggle", "isApproved": True})
sample    = collection.find_one({"source": "kaggle"})

print(f"    Total Kaggle records:    {total}")
print(f"    Available properties:    {available}")
print(f"    Approved (visible):      {approved}")
print(f"\n    Sample document:")
print(f"    Title:     {sample.get('title')}")
print(f"    Type:      {sample.get('type')}")
print(f"    Suburb:    {sample.get('suburb')}")
print(f"    Rent:      ${sample.get('rentPrice')}/wk")
print(f"    Bedrooms:  {sample.get('bedrooms')}")
print(f"    Bathrooms: {sample.get('bathrooms')}")

print(f"\n{'='*50}")
print(f"Import complete! {total} properties in MongoDB.")
print(f"{'='*50}\n")

# ─────────────────────────────────────────────────────────────────
# NOTES FOR LATER
# ─────────────────────────────────────────────────────────────────
print("⚠️  TO SCALE UP TO 5000 RECORDS LATER:")
print("   1. Open scripts/importProperties.py")
print("   2. Find: IMPORT_LIMIT = 50")
print("   3. Change to: IMPORT_LIMIT = 5000")
print("   4. Run: python scripts/importProperties.py")
print("   5. When asked to delete existing → type y")
print("")
print("⚠️  TO IMPORT ALL RECORDS (no limit):")
print("   Change: IMPORT_LIMIT = None")
print("")