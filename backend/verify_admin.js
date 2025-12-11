
const API_URL = "http://localhost:5000/api";

async function run() {
    console.log("Starting Admin Verification...\n");

    try {
        // 1. Register User
        console.log("1. Registering User...");
        const userRes = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fullName: "Admin Test User", email: `admintest${Date.now()}_${Math.random()}@example.com`, phone: `${Math.floor(Math.random()*10000000000)}` })
        });
        const userData = await userRes.json();
        if (!userData.success) throw new Error(userData.error);
        const userId = userData.data.id;
        console.log("   -> Success. User ID:", userId);

        // 2. Request Deposit
        console.log("2. Requesting Deposit (1000 INR)...");
        const depRes = await fetch(`${API_URL}/wallet/deposit`, {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ userId, amount: 1000, method: "UPI", txHash: "TEST_TX" })
        });
        const depData = await depRes.json();
        const txId = depData.transaction.id;
        console.log("   -> Success. Tx ID:", txId);

        // 3. Verify Initial Balance (Should be 0)
        console.log("3. Verifying Initial Balance...");
        const w1 = await (await fetch(`${API_URL}/wallet/${userId}`)).json();
        if (w1.balanceINR !== 0) throw new Error("Balance should be 0 before approval");
        console.log("   -> Success. Balance:", w1.balanceINR);

        // 4. Admin Approve
        console.log("4. Admin Approving Transaction...");
        const appRes = await fetch(`${API_URL}/admin/transactions/${txId}/status`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "approved", adminId: "admin" })
        });
        const appData = await appRes.json();
        if (!appData.success) throw new Error(appData.error);
        console.log("   -> Success. Approved.");

        // 5. Verify New Balance (Should be 1000)
        console.log("5. Verifying New Balance...");
        const w2 = await (await fetch(`${API_URL}/wallet/${userId}`)).json();
        if (w2.balanceINR !== 1000) throw new Error(`Balance mismatch. Expected 1000, got ${w2.balanceINR}`);
        console.log("   -> Success. Balance:", w2.balanceINR);

        // 6. Test Logs
        console.log("6. Checking Admin Logs...");
        const logs = await (await fetch(`${API_URL}/admin/logs`)).json();
        if (logs.length === 0) console.warn("   -> Warning: No logs found.");
        else console.log("   -> Success. Logs found:", logs.length);

        console.log("\nVERIFICATION COMPLETE: Admin flow verified.");

    } catch (err) {
        console.error("\nFAILED:", err.message);
    }
}

run();
