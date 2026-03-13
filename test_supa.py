import urllib.request
import json

url = "https://ajkhkmrxwfpqwywujhfu.supabase.co/rest/v1/Client?select=*&limit=1"
headers = {
    "apikey": "sb_publishable_N0TtoWxyljFXRp3boJV1tg_o5yoliT8",
    "Authorization": "Bearer sb_publishable_N0TtoWxyljFXRp3boJV1tg_o5yoliT8",
    "Origin": "http://localhost:8000"
}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        print("Status:", response.status)
        print("Headers:", response.headers)
        print("Data:", response.read().decode())
except Exception as e:
    print("Error:", e)
