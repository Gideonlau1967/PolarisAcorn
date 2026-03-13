import urllib.request
import json
import ssl

url = "https://ajkhkmrxwfpqwywujhfu.supabase.co/rest/v1/Client?select=*"
headers = {
    'apikey': 'sb_publishable_N0TtoWxyljFXRp3boJV1tg_o5yoliT8',
    'Authorization': 'Bearer sb_publishable_N0TtoWxyljFXRp3boJV1tg_o5yoliT8',
}

req = urllib.request.Request(url, method="GET", headers=headers)

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

try:
    with urllib.request.urlopen(req, context=ctx) as response:
        result = response.read().decode('utf-8')
        data = json.loads(result)
        print(f"Status: {response.getcode()}")
        print(f"Row Count: {len(data)}")
        if len(data) > 0:
            print("First row Sample:")
            print(json.dumps(data[0], indent=2))
except Exception as e:
    print(f"Error: {e}")
