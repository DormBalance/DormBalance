"use client";

import { useEffect, useState } from "react";
import "./CreateExpenseModal.css";
import SelectMembers from "./SelectMembers";

interface GUIElement {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  curUserID: string;
  curHouseholdID: string;
}

type HouseholdMember = {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
};

type ExpenseParticipant = {
  user_id: string;
  percent: number;
};

export default function CreateExpenseModal({
  isOpen,
  onClose,
  onSuccess,
  curUserID: curUserID,
  curHouseholdID: currentHouseholdId,
}: GUIElement) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [deadline, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [splitType, setSplitType] = useState("Equal");
  const [expenseParticipants, setExpenseParticipants] = useState<ExpenseParticipant[]>([]);
  const [payerUserId, setPayerUserId] = useState(curUserID);
  const [paymentType, setPaymentType] = useState("once");

  const [household_members, setMembers] = useState<HouseholdMember[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState("");

  
  // Fetch household
  useEffect(
    () => {
      setLoading(true);

      let getMembers = async () => {
        try {
          const response = await fetch(`/api/household_members?userId=${curUserID}`);
          const data = await response.json();
          setMembers(data);
        }
        catch {
          setErrors("Household members could not be loaded. Please try again.");
        }
        finally {
          setLoading(false);
        }
      };

      getMembers();
    }, 
    [isOpen, curUserID]
  );


  if (!isOpen) return null;

  type CreateExpenseBody = {
    expense_name: string;
    description?: string;
    household_id: string;
    creator_user_id: string;
    payer_user_id?: string;
    amount: string | number;
    split_type: string;
    expense_date: string;
    recurring_expense_id?: string;
    expense_category_id?: string;
    excluded_user_ids?: string[];
    included_user_ids?: string[];
    participants?: {
      user_id: string;
      percent: number;
    }[];
  };

  async function submitExpense() {
    if (!name || !amount) {
      setErrors("Name and amount required");
      return;
    }

    let body : CreateExpenseBody = {
      expense_name: name,
      amount: amount,
      household_id: currentHouseholdId,
      creator_user_id: curUserID,
      payer_user_id: payerUserId,
      split_type: splitType,
      expense_date: deadline,
      description: description || undefined,
    };

    if (splitType === "Equal")
      body.included_user_ids = expenseParticipants.map((participant) => participant.user_id);
    else
      body.participants = expenseParticipants;

    let formSubmission = JSON.stringify(body);

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        body: formSubmission
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors(data.error?? "An error occurred");
        return;
      }

      console.log("Expense Created! ID:", data.expense_id);

      onClose();
    }
    catch {
      setErrors("Network error");
    }
  }

  const loading_text = "...";

  return (
    <div className = "overlay">
      <div className = "modal">

        <div className = "topbar">
          <span></span>

          <span>
            <h2>Add Expense</h2>
          </span>

          <span>
            <button onClick = {onClose}>X</button>
          </span>
        </div>
        {loading ? (<p>{loading_text}</p>) : (
          <>
            <div className="name-category" style={{ display: "flex", gap: "5px" }}>
              <input
                placeholder = "Expense name"
                value       = {name}
                onChange    = {(name) => setName(name.target.value)}
                className   = "input"
              />
            </div>

            <input
              placeholder = "Description"
              value       = {description}
              onChange    = {(descriptionChange) => setDescription(descriptionChange.target.value)}
              className   = "input"
            />

            <input
              placeholder = "Expense amount"
              value       = {amount}
              onChange    = {(amount) => setAmount(amount.target.value)}
              className   = "input"
            />

            <div className = "split-type">
              <button className = {splitType === "Equal"  ? "active" : ""} onClick = {() => setSplitType("Equal")} >Equal</button>
              <button className = {splitType === "Custom" ? "active" : ""} onClick = {() => setSplitType("Custom")}>Custom</button>
            </div>

            <label>Paid by</label>
            <select
              className = "input"
              value     = {payerUserId}
              onChange  = {(event) => {
                setPayerUserId(event.target.value); 
                setExpenseParticipants([])
              }}
            >
              {household_members?.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.first_name} {member.last_name}
                </option>
              ))}
            </select>

            <SelectMembers
              members       = {household_members?.filter((member) => member.id !== payerUserId) ?? []}
              selectedIds   = {expenseParticipants.map((participant) => participant.user_id)}
              showAmounts   = {splitType === "Custom"}
              onToggleCheck = {(ids) =>
                setExpenseParticipants(ids.map((id) => ({ user_id: id, percent: 0 })))
              }
              onAmountChange = { (userId, percentSplit) => {
                setExpenseParticipants((prev) => 
                  Array.from(prev).map((participant) =>
                    participant.user_id === userId ? { user_id: userId, percent: percentSplit } : participant
                  )
                )
                console.log(expenseParticipants);
              }}
            />
            
            {/* NOT YET IMPLEMENTED
            <label>Payment Type</label>
            <div className = "split-type">
              <button className = {paymentType === "Once"  ? "active" : ""} onClick = {() => setPaymentType("Once")} >Once</button>
              <button className = {paymentType === "Weekly" ? "active" : ""} onClick = {() => setPaymentType("Weekly")}>Weekly</button>
              <button className = {paymentType === "Monthly" ? "active" : ""} onClick = {() => setPaymentType("Monthly")}>Monthly</button>
            </div> 
            */}
            

            <label>{paymentType == "once" ? "Due Date" : "Start Date"}</label>
            <input id='deadline'
              type      = "date"
              value     = {deadline}
              onChange  = {(deadline)  => setDate(deadline.target.value)}
              className = "input"
            />

            { errors && 
              <p className = "error">{errors}</p>
            }

            <div className = "actions">
              <button className = "btn-submit" onClick = {submitExpense}>Add Expense</button>
              <button className = "btn-cancel" onClick = {onClose}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
