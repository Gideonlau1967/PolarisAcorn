const fetch = require('node-fetch'); // May not be needed in Node 18+ but using native
fetch("https://ajkhkmrxwfpqwywujhfu.supabase.co/rest/v1/Client?select=*&limit=1", {
    method: 'GET',
    headers: {
        'apikey': 'sb_publishable_N0TtoWxyljFXRp3boJV1tg_o5yoliT8',
        'Authorization': 'Bearer sb_publishable_N0TtoWxyljFXRp3boJV1tg_o5yoliT8',
        'Origin': 'http://localhost:8000'
    }
}).then(res => {
    console.log("Status:", res.status);
    console.log("CORS Headers:", res.headers.raw());
}).catch(console.error);
