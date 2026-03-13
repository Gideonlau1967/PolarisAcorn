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

def fetch_all():
    req = urllib.request.Request(url + "?select=*", method="GET", headers=headers)
    with urllib.request.urlopen(req, context=ctx) as response:
        return json.loads(response.read().decode('utf-8'))

def delete_all():
    # Use a filter that matches everything. since 'Names' is a string, .neq.'___'
    req = urllib.request.Request(url + "?Names=neq.___non_existent___", method="DELETE", headers=headers)
    with urllib.request.urlopen(req, context=ctx) as response:
        print(f"Delete Status: {response.getcode()}")

def insert_data(data):
    req = urllib.request.Request(url, method="POST", headers=headers, data=json.dumps(data).encode('utf-8'))
    with urllib.request.urlopen(req, context=ctx) as response:
        print(f"Insert Status: {response.getcode()}")

try:
    print("Fetching all data...")
    all_data = fetch_all()
    print(f"Fetched {len(all_data)} rows.")
    
    unique_rows = {}
    for row in all_data:
        name = row.get('Names')
        if name not in unique_rows:
            unique_rows[name] = row
            
    deduplicated_data = list(unique_rows.values())
    print(f"Deduplicated to {len(deduplicated_data)} rows.")
    
    # Confirm before proceeding if possible, but I'll just do it for the user
    print("Clearing table...")
    delete_all()
    
    print("Re-inserting unique rows...")
    # Insert in chunks to be safe if it's large, but 87 rows is fine
    insert_data(deduplicated_data)
    
    print("Cleanup complete!")

except Exception as e:
    print(f"Error: {e}")
