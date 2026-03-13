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

data = [
    {
        "Names": "Python Test Client",
        "Contact Number": "12345678",
        "Last Met": "2023-11-01",
        "Schedule to Meet": "2023-12-01",
        "Sep": "x",
        "Oct": "1",
        "Nov": "",
        "Dec": "",
        "Jan": "",
        "Feb": "",
        "Mar": "",
        "Remarks": "Test from Python",
        "Completed": "No",
        "Data Folder": "Test/Folder"
    }
]

req = urllib.request.Request(url, method="POST", headers=headers, data=json.dumps(data).encode('utf-8'))

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
