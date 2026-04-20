const BALANCES_URL = "http://localhost:3000/api/balances";

async function GetBalancesValid() {
    const householdId = "1";
    const url = `${BALANCES_URL}?household_id=${householdId}`;
    const response = await fetch(url, {
        method: "GET",
        headers: { 'Content-Type': 'application/json' }
    });

    let balances = await response.json();
    if (response.ok && balances !== null) {
        console.log("---------- TEST PASSED: GetBalancesValid ----------");
        console.log(`   Successfully retrieved balances for household ${householdId}.`);
    }
    else {
        console.log("---------- TEST FAILED: GetBalancesValid ----------");
        console.log(`   Failed to retrieve balances for household ${householdId}.`);
    }
}

async function GetBalancesInvalid() {
    const householdId = "-999";
    const url = `${BALANCES_URL}?household_id=${householdId}`;

    const response = await fetch(url, {method: "GET"});

    let balances = await response.json();
    if (response.ok && balances !== null) {
        console.log("---------- TEST PASSED: GetBalancesInvalid ----------");
        console.log(`   Successfully retrieved balances for household ${householdId}.`);
    }
    else {
        console.log("---------- TEST FAILED: GetBalancesInvalid ----------");
        console.log(`   Failed to retrieve balances for household ${householdId}.`);
    }
}