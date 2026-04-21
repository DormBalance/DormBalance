"use client";

import { useEffect, useState } from "react";
import "./CreateExpenseModal.css";
import { createSettlement } from "@/lib/api";
import { HouseholdMember } from "@/types";

interface GUIElement {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    curUserID: string;
    curHouseholdID: string;
}

export default function CreateSettlementModal({
    isOpen,
    onClose,
    onSuccess,
    curUserID,
    curHouseholdID
}: GUIElement) {
    const [recipientUserId, setRecipientUserId] = useState<string>("");
    const [payerUserId, setPayerUserId] = useState<string>(curUserID);
    const [amount, setAmount] = useState<string>("");
    const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
    const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split("T")[0]);
    const [members, setMembers] = useState<HouseholdMember[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const getMembers = async () => {
            setLoading(true);

            try {
                let response = await fetch(`/api/household_members?userId=${curUserID}`);
                let data = await response.json();

                if (data.error || !data.length) {
                    setLoading(false);
                    return;
                }
                setMembers(data);
                setPayerUserId(data[0].id);
                setRecipientUserId(data.length > 1 ? data[1].id : data[0].id);

            } catch (err) {
                setError("Household members could not be loaded. Please try again.");

            } finally {
                setLoading(false);
            }
        };
        getMembers();
    }, [isOpen, curUserID]);

    async function submitSettlement() {
        if (!amount || Number(amount) <= 0) {
            setError("A valid amount is required");
            return;
        }

        if (payerUserId === recipientUserId) {
            setError("Payer and recipient must be different people");
            return;
        }

        const body = {
            household_id: curHouseholdID,
            payer_user_id: payerUserId,
            recipient_user_id: recipientUserId,
            amount: amount,
            payment_method: paymentMethod,
            payment_date: paymentDate
        }

        let result = await createSettlement(body);

        if (result.success === false) {
            setError(result.error);
            return;
        }

        onSuccess();
        onClose();
    }

    if (!isOpen) return null;

    return ( //partly copied from CreateExpenseModal
        <div className = "overlay">
        <div className = "modal">
        
        <div className = "topbar">
        
        <span/>
        <span>
            <h2>Settle Up</h2>
        </span>
        
        <span>
            <button onClick = {onClose}>X</button>
        </span>
        </div>
        {loading ? (<p>Loading...</p>) : (
            <>
            <label>Paid by</label>
            <select className="input"
                    value={payerUserId}
                    onChange={(e) => { setPayerUserId(e.target.value); setError(""); }}>
                    {members?.map((member) => (
                        <option key={member.id} value={member.id}>
                            {member.first_name} {member.last_name}
                        </option>
                    ))}
            </select>

            <label>Paid to</label>
            <select className="input"
                    value={recipientUserId}
                    onChange={(e) => { setRecipientUserId(e.target.value); setError(""); }}>
                    {members?.map((member) => (
                        <option key={member.id} value={member.id}>
                            {member.first_name} {member.last_name}
                        </option>
                    ))}
            </select>

            <label>Amount</label>
            <input  className="input"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => { setAmount(e.target.value); setError(""); }} />

            <label>Payment Method</label>
            <select className="cat-input"
                    value={paymentMethod}
                    onChange={(e) => { setPaymentMethod(e.target.value); setError(""); }}>
                <option value="Cash">Cash</option>
                <option value="Venmo">Venmo</option>
                <option value="Zelle">Zelle</option>
                <option value="PayPal">PayPal</option>
                <option value="Other">Other</option>
            </select>

            <label>Date</label>
            <input  className="input"
                    type="date"
                    value={paymentDate}
                    onChange={(e) => { setPaymentDate(e.target.value); setError(""); }} />

            {error && <p className="error">{error}</p>}

            <div className="actions">
                <button className="btn-submit" onClick={submitSettlement}>
                    Confirm Settlement
                </button>
                <button className="btn-cancel" onClick={onClose}>
                    Cancel
                </button>
            </div>
            </>
        )}
        </div>
        </div>
    );
}