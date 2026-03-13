import urllib.request
import json
import ssl
from collections import Counter

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
        
        names = [row.get('Names') for row in data if row.get('Names')]
        counts = Counter(names)
        duplicates = {name: count for name, count in counts.items() if count > 1}
        
        print(f"Total Rows: {len(data)}")
        print(f"Unique Names: {len(counts)}")
        print(f"Duplicates found: {len(duplicates)}")
        for name, count in duplicates.items():
            print(f" - {name}: {count} occurrences")
            
except Exception as e:
    print(f"Error: {e}")
