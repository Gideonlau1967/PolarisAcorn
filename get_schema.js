const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ajkhkmrxwfpqwywujhfu.supabase.co';
const supabaseKey = 'sb_publishable_N0TtoWxyljFXRp3boJV1tg_o5yoliT8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log("Fetching table data to infer schema...");
    const { data, error } = await supabase.from('Client').select('*').limit(1);

    if (error) {
        console.error("Error fetching data:", error);
    } else {
        console.log("Data:", data);
        if (data && data.length > 0) {
            console.log("Inferred Schema columns:", Object.keys(data[0]));
        } else {
            console.log("Table is empty. Cannot infer schema directly from rows.");

            // Try inserting a dummy row to see what error comes back
            const { error: insertErr } = await supabase.from('Client').insert([{ dummy: 1 }]);
            console.log("Insert dummy error:", insertErr);
        }
    }
}

test();
