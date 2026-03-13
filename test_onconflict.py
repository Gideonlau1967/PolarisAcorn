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

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

data = [
    {
        "Names": "Raymond Koh & Chong Choon Siang",
        "Remarks": "Updated via Conflict Test"
    }
]

# Note: on PostgREST, upsert with onConflict is done via POST with resolution=merge or similar?
# Actually Supabase JS upsert(data, {onConflict: 'Names'}) translates to a POST with a specific header or query param.
# For PostgREST, it's often a POST with Prefer: resolution=merge-duplicates header or similar.

print("Attempting to upsert duplicate...")
req = urllib.request.Request(url + "?on_conflict=Names", method="POST", headers=headers, data=json.dumps(data).encode('utf-8'))
# Prefer header for PostgREST upsert
headers_with_prefer = headers.copy()
headers_with_prefer['Prefer'] = 'resolution=merge-duplicates,return=representation'
req = urllib.request.Request(url + "?on_conflict=Names", method="POST", headers=headers_with_prefer, data=json.dumps(data).encode('utf-8'))

try:
    with urllib.request.urlopen(req, context=ctx) as response:
        result = response.read().decode('utf-8')
        print(f"Status: {response.getcode()}")
        # Check if it returned the row
        print(f"Result length: {len(json.loads(result))}")
        
    # Check total count
    req_count = urllib.request.Request(url + "?select=*", method="GET", headers=headers)
    with urllib.request.urlopen(req_count, context=ctx) as response:
        data_len = len(json.loads(response.read().decode('utf-8')))
        print(f"Final Row Count: {data_len}")

except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code}")
    print(f"Error reading: {e.read().decode('utf-8')}")
except Exception as e:
    print(f"Error: {e}")
