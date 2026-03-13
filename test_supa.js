const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ajkhkmrxwfpqwywujhfu.supabase.co';
const supabaseKey = 'sb_publishable_N0TtoWxyljFXRp3boJV1tg_o5yoliT8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log("Testing connection...");
    const { data, error } = await supabase.from('Client').select('*').limit(1);
    
    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Success data:", data);
        
        // Let's insert dummy
        const testData = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                "Client Name": "Test Client Insert From Node",
        };
        const {data: insertData, error: insertError} = await supabase.from('Client').upsert([testData]);
        if(insertError) {
             console.error("Insert error:", insertError.message, insertError.details, insertError.hint);
        } else {
             console.log("Insert success");
        }
    }
}

test();
