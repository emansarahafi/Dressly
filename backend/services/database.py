import os
import certifi
import ssl
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv

load_dotenv()

uri = os.getenv("MONGODB_URI")

if not uri:
    raise RuntimeError("MONGODB_URI is missing. Add it in backend/.env")

# Use certifi's CA bundle so Atlas SSL certs verify correctly on macOS
tls_ca_file = certifi.where()

# Create a new client and connect to the server (explicit TLS CA)
client = MongoClient(uri, server_api=ServerApi('1'), tls=True, tlsCAFile=tls_ca_file)

# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    print("✅ Successfully connected to MongoDB!")
except Exception as e:
    print(f"❌ MongoDB connection error: {e}")