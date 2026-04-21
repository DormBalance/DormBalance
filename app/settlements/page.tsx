"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/auth/auth";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import "../dashboard/dashboard.css";
import "./settlements.css";
import { GetSettlementResponse } from "@/types";
import { getSettlements } from "@/lib/api";
import CreateSettlementModal from "@/components/CreateSettlementModal"; // Copilot generated per Settle-Up button onClick


function formatDate(dateString: string): string{
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatCurrency(amount: number): string{
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(amount);
}

type Balance = {
    from: string;
    to: string;
    amount: string;
};


export default function SettlementsPage() {
        const { session, user } = useAuth();
        let [householdID, setHouseholdID] = useState<string>("");
        let [currUser, setCurrUser] = useState<string>("");
        let [balances, setBalance] = useState<Balance[]>([]);
        let [settlements, setSettlements] = useState<GetSettlementResponse[]>([]);
        let [loading, setLoading] = useState<boolean>(true);
        let [error, setError] = useState<string>("");
        let [showSettleModal, setShowSettleModal] = useState<boolean>(false); // Copilot generated per Settle-Up button onClick

        // Copied from dashboard/page.tsx pattern — fetches household and DB user ID via API
        useEffect(() => {
            if (!session?.access_token) return;
            async function loadHousehold() {
                const res = await fetch("/api/households", {
                    headers: { "Authorization": `Bearer ${session.access_token}` },
                });
                if (!res.ok) return;
                const data = await res.json();
                if (data.length === 0) return;
                const household = data[0];
                setHouseholdID(String(household.id));
                const membersRes = await fetch(`/api/households/${household.id}/members`, {
                    headers: { "Authorization": `Bearer ${session.access_token}` },
                });
                if (!membersRes.ok) return;
                const members = await membersRes.json();
                const me = members.find((m: any) => m.email === user?.email);
                if (me) setCurrUser(String(me.id));
            }
            loadHousehold();
        }, [session]);

        async function loadExpenses(){
            if (!householdID) return;
            setLoading(true);
            setError("");
            let balances = await fetch(`/api/balances?household_id=${householdID}`);

            let balancesInfo = await balances.json();
            setBalance(balancesInfo.balances);
            setLoading(false);

            let settlementsResult = await getSettlements(householdID);

            if (settlementsResult.success === false) {
                setError("Failed to load settlement history");
                setLoading(false);
                return;
            }

            setSettlements(settlementsResult.data);
            setLoading(false);
        }
        useEffect(() => {
            loadExpenses();
        }, [householdID]);

        let whoYouOwe = balances.filter((balance) => balance.from === currUser);
        let whoOwesYou = balances.filter((balance) => balance.to === currUser);
        let totalOwed = whoYouOwe.reduce((totalSum, balance) => totalSum + Number(balance.amount), 0);
        let totalYouAreOwed = whoOwesYou.reduce((totalSum, balance) => totalSum + Number(balance.amount), 0);
        let finalBalance = totalOwed - totalYouAreOwed;

    return(
        <DashboardLayout>
            <div>
                <div className = "settlement-page-header">
                    <h1 className = "settlement-page-title">Settlements</h1>
                    <button className = "settle-btn" onClick={() => setShowSettleModal(true)}>Settle-Up</button> {/* Copilot generated per Settle-Up button onClick */}
                </div>
            </div>
            {error && <p style = {{color: "red", marginBottom: 16}}>{error}</p>}
            {loading && <p style = {{color: "#888", marginBottom: 16}}>Loading...</p>}

            <div className = "stat-cards-row">
                <StatCard
                    label="Total Owed"
                    value={formatCurrency(totalOwed)}
                />
                <StatCard
                    label="Total You're Owed"
                    value={formatCurrency(totalYouAreOwed)}
                />
                <StatCard
                label = "Balance" 
                value = {finalBalance >= 0 ? `+${formatCurrency(finalBalance)}` : `-${formatCurrency(Math.abs(finalBalance))}`} 
                valueClassName={finalBalance >= 0 ? "positive" : "negative"}/>
            </div>

            <div className = "settlement-info-cols">

            <div className = "settlement-info-row">
                <div className = "settlement-cards">
                    <h2 className = "settlement-cards-titles">Who You Owe</h2>
                    <div className = "settlements-info-table">
                        <div className = "settlements-info-table-header">
                            <span>From</span>
                            <span>Amount</span>
                        </div>
                        {whoYouOwe.length === 0 ? (
                    <div className = "settlements-empty">You do not owe anybody</div>
                ): (
                    whoYouOwe.map((balance) => (
                        <div className = "settlements-info-row" key={balance.to}>
                            <span className = "settlement-member">
                                <div className = "member">{balance.to.charAt(0).toUpperCase()}</div>
                                    {balance.to}
                            </span>
                            <span className = "amount-owe">{formatCurrency(Number(balance.amount))}</span>
                        </div>
                        ))
                    )}
                    </div>
                </div>
            </div>

              <div className = "settlement-info-row">
                <div className = "settlement-cards">
                    <h2 className = "settlement-cards-titles">Who Owes You</h2>
                    <div className = "settlements-info-table">
                        <div className = "settlements-info-table-header">
                            <span>From</span>
                            <span>Amount</span>
                        </div>
                        {whoOwesYou.length === 0 ? (
                    <div className = "settlements-empty">You do not owe anybody</div>
                ): (
                    whoOwesYou.map((balance) => (
                        <div className = "settlements-info-row" key={balance.to}>
                            <span className = "settlement-member">
                                <div className = "member">{balance.to.charAt(0).toUpperCase()}</div>
                                    {balance.to}
                            </span>
                            <span className = "amount-owed">You're Owed {formatCurrency(Number(balance.amount))}</span>
                        </div>
                        ))
                    )}
                    </div>
                </div>
            </div>
            </div>

            <div className = "settlement-history-card">
                <div className = "settlement-history-header">
                    <h2 className = "settlements-cards-titles">Settlement History</h2>
                    <button className="view-all-btn">View All</button>
                </div>
                <div className = "settlement-history-table-header">
                    <span>Date</span>
                    <span>From</span>
                    <span>To</span>
                    <span>Amount</span>
                    <span>Method</span>
                    <span>Status</span>
                </div>
                {settlements.length === 0 ? (
                    <div className="settlements-empty">No settlements yet</div>
                ) : (
                    settlements.map((settlement) => (
                        <div className="settlement-history-row" key={settlement.id}>
                            <span>{formatDate(settlement.payment_date)}</span>
                            <span className="settlement-member">
                                <div className="member">
                                    {settlement.settlement_payer.first_name.charAt(0).toUpperCase()}
                                </div>
                                {settlement.settlement_payer.first_name} {settlement.settlement_payer.last_name}
                            </span>

                            <span className="settlement-member">
                                <div className="member">
                                    {settlement.settlement_recipient.first_name.charAt(0).toUpperCase()}
                                </div>
                                {settlement.settlement_recipient.first_name} {settlement.settlement_recipient.last_name}
                            </span>

                            <span>{formatCurrency(Number(settlement.amount))}</span>
                            <span>{settlement.payment_method}</span>
                            <span className="status-completed">Completed</span>
                        </div>
                    ))
                )}
            </div>
            <CreateSettlementModal
                isOpen         = {showSettleModal}
                onClose        = {() => setShowSettleModal(false)}
                onSuccess      = {() => { setShowSettleModal(false); loadExpenses(); }}
                curUserID      = {currUser}
                curHouseholdID = {householdID}
            />
        </DashboardLayout>
    );
}