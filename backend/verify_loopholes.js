
const API_URL = "http://localhost:5000/api";

async function run() {
    console.log("Starting Loophole Verification...\n");

    try {
        // 1. Register Referrer
        console.log("1. Registering Referrer...");
        const refRes = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fullName: "Referrer User", email: `ref${Date.now()}@test.com`, phone: `${Math.floor(Math.random()*10000000000)}` })
        });
        const refData = await refRes.json();
        const referrer = refData.data;
        console.log("   -> Success. Referrer Code:", referrer.referralCode);

        // 2. Register New User with Code
        console.log("2. Registering New User (Referred)...");
        const newRes = await fetch(`${API_URL}/auth/register`, {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ 
                 fullName: "Bonus Target", 
                 email: `target${Date.now()}@test.com`, 
                 phone: `${Math.floor(Math.random()*10000000000)}`,
                 referralCode: referrer.referralCode
             })
        });
        const newData = await newRes.json();
        const newUser = newData.data;
        console.log("   -> Success. New User ID:", newUser.id);

        // 3. Verify Referrer List
        console.log("3. Verifying Referrals List...");
        const listRes = await fetch(`${API_URL}/auth/referrals/${referrer.referralCode}`);
        const list = await listRes.json();
        if (list.length !== 1) throw new Error("Referral list count mismatch");
        if (list[0].id !== newUser.id) throw new Error("Referral list ID mismatch");
        console.log("   -> Success. User found in referral list.");

        // 4. Deposit 1000
        console.log("4. Requesting Deposit (1000 INR)...");
        const depRes = await fetch(`${API_URL}/wallet/deposit`, {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ userId: newUser.id, amount: 1000, method: "UPI", txHash: "REF_TEST" })
        });
        const depData = await depRes.json();
        const txId = depData.transaction.id;

        // 5. Verify Admin Visibility (Get All Txs)
        console.log("5. Checking Admin Dashboard Visibility...");
        const allTxsRes = await fetch(`${API_URL}/admin/transactions`);
        const allTxs = await allTxsRes.json();
        const foundTx = allTxs.find(t => t.id === txId);
        if (!foundTx) throw new Error("Transaction NOT visible in Admin Dashboard endpoint!");
        console.log("   -> Success. Transaction visible to Admin.");

        // 6. Approve & Check Bonus
        console.log("6. Approving & Checking Bonus...");
        await fetch(`${API_URL}/admin/transactions/${txId}/status`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "approved", adminId: "admin" })
        });
        
        // Check Referrer Wallet
        const wRes = await fetch(`${API_URL}/wallet/${referrer.id}`);
        const w = await wRes.json();
        const expectedBonus = 1000 * 0.05; // 50
        if (w.balanceINR !== expectedBonus) throw new Error(`Referrer did not get bonus. Bal: ${w.balanceINR}, Exp: ${expectedBonus}`);
        console.log("   -> Success! Bonus Received:", w.balanceINR);

        console.log("\nVERIFICATION COMPLETE: All loopholes fixed.");

    } catch (err) {
        console.error("\nFAILED:", err.message);
    }
}

run();
