import urllib.request
import json
import ssl

url = "https://ajkhkmrxwfpqwywujhfu.supabase.co/rest/v1/"
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
        # Find the Client table definition
        if 'definitions' in data and 'Client' in data['definitions']:
            print("Client Table Columns:")
            props = data['definitions']['Client'].get('properties', {})
            for col, details in props.items():
                print(f"- {col}: {details.get('type', 'unknown')}")
        else:
            print("Client table not found in OpenAPI spec.")
except Exception as e:
    print(f"Error: {e}")
