import urllib.request
import json
import ssl

url = "https://ajkhkmrxwfpqwywujhfu.supabase.co/rest/v1/Client"
headers = {
    'apikey': 'sb_publishable_N0TtoWxyljFXRp3boJV1tg_o5yoliT8',
    'Authorization': 'Bearer sb_publishable_N0TtoWxyljFXRp3boJV1tg_o5yoliT8',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

req = urllib.request.Request(url, method="POST", headers=headers, data=b'[{"dummy": 1}]')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

try:
    with urllib.request.urlopen(req, context=ctx) as response:
        result = response.read().decode('utf-8')
        print(f"Status: {response.getcode()}")
        print(f"Response: {result}")
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code}")
    print(f"Error reading: {e.read().decode('utf-8')}")
except Exception as e:
    print(f"Error: {e}")
