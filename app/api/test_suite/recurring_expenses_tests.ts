const RECURRING_URL = "http://localhost:3000/api/recurring_expenses";

interface CreateRecurringBillBody {
    household_id: string;
    creator_user_id: string;
    payer_user_id: string;
    expense_name: string;
    description: string;
    amount: string | number;
    frequency: string;
    next_expense_date: string;
    expense_category_id?: string;
    split_type: string;
    included_user_ids?: string[];
    participants?: {
        user_id: string;
        percent: number;
    }[];
}

// #region 'POST' method tests
async function CreateRecurringExpenseValid() {
    let body: CreateRecurringBillBody = {
        household_id: "1",
        creator_user_id: "1",
        payer_user_id: "1",
        expense_name: "TEST RECURRING EXPENSE",
        description: `TEST (CreateRecurringExpenseValid) ${new Date().toISOString()}`,
        amount: 100,
        frequency: "Monthly",
        next_expense_date: new Date().toISOString(),
        split_type: "Equal",
        included_user_ids: ["1", "2"],
    };

    let response = await fetch(RECURRING_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (response.ok) {
        console.log("---------- TEST PASSED: CreateRecurringExpenseValid ----------")
        console.log("   Recurring expense created successfully.");
    }
    else {
        console.log("---------- TEST FAILED: CreateRecurringExpenseValid ----------");
        console.error("   Failed to create recurring expense. Status:", response.status);
    }
}

async function CreateRecurringExpenseInvalid() {
    // Tests using invalid amount
    let body: CreateRecurringBillBody = {
        household_id: "1",
        creator_user_id: "1",
        payer_user_id: "1",
        expense_name: "TEST RECURRING EXPENSE",
        description: `TEST (CreateRecurringExpenseInvalid) ${new Date().toISOString()}`,
        //!-- INVALID amount
        amount: -100,
        frequency: "Monthly",
        next_expense_date: new Date().toISOString(),
        split_type: "Equal",
        included_user_ids: ["1", "2"],
    };

    let response = await fetch(RECURRING_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        console.log("---------- TEST PASSED: CreateRecurringExpenseInvalid ----------");
        console.log("   Invalid recurring expense was correctly rejected.");
    }
    else {
        console.log("---------- TEST FAILED: CreateRecurringExpenseInvalid ----------");
        console.error("   Invalid recurring expense was not rejected.");
    }
}
//#endregion

//#region 'GET' method tests
async function GetRecurringExpensesValid() {
    let householdId = "1";
    let url = `${RECURRING_URL}?household_id=${householdId}`;

    let response = await fetch(url, { method: "GET" });

    if (response.ok) {
        console.log("---------- TEST PASSED: GetRecurringExpensesValid ----------")
        console.log("   Recurring expenses retrieved successfully.");
    }
    else {
        console.log("---------- TEST FAILED: GetRecurringExpensesValid ----------");
        console.error(`   Failed to retrieve recurring expenses. Status: ${response.status}`);
    }
}

async function GetRecurringExpensesInvalid() {
    // Testing for invalid frequency
    let householdId = "1";
    let frequency = "semi-hourly";
    let url = `${RECURRING_URL}?household_id=${householdId}&frequency=${frequency}`;

    let response = await fetch(url, { method: "GET" });

    if (!response.ok) {
        console.log("---------- TEST PASSED: GetRecurringExpensesInvalid ----------");
        console.log("   Invalid frequency was CORRECTLY rejected.");
    }
    else {
        console.log("---------- TEST FAILED: GetRecurringExpensesInvalid ----------");
        console.error("   Invalid frequency was NOT rejected.");
    }
}
//#endregion

export function runRecurringExpensesTests() {
    console.log("Running Recurring Expenses tests...");
    GetRecurringExpensesValid();
    GetRecurringExpensesInvalid();
    CreateRecurringExpenseValid();
    CreateRecurringExpenseInvalid();
}

runRecurringExpensesTests();