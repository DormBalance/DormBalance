"use client";

import { useEffect, useState } from "react";

interface HouseholdMember {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  curUserID: string;
  curHouseholdID: string;
}

export default function CreateExpenseModal({
  isOpen,
  onClose,
  onSuccess,
  curUserID: curUserID,
  curHouseholdID: currentHouseholdId,
}: Props) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [payingUser, setPayer] = useState("");
  const [deadline, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [household_members, setMembers] = useState<HouseholdMember[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState("");

  
  // Fetch household
  useEffect(() => {
  if (!isOpen) return;
    setLoading(true);
    fetch(`/api/household_members?userId=${curUserID}`)
      .then((r) => r.json())
      .then((data) => setMembers(data.filter((member) => member.id !== curUserID)))
      .catch(() => setErrors("Could not load household members"))
      .finally(() => setLoading(false));
  }, [isOpen, curUserID]);

  if (!isOpen) return null;

  async function handleSubmit() {
    if (!name || !amount) {
      setErrors("Name and amount required");
      return;
    }

    let formSubmission = JSON.stringify({
      expense_name: name,
      amount: amount,
      payer_user_id: payingUser,
      creator_user_id: curUserID,
      household_id: currentHouseholdId,
      split_type: "Equal",
      expense_date: deadline,
    });

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

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        
        <div style={styles.topbar}>
          <span></span>

          <span>
            <h2>Add Expense</h2>
          </span>
          
          <span>
            <button onClick={onClose}>X</button>
          </span>
        </div>
        {loading ? (<p>...</p>) : (
          <>
            <input
              placeholder="Expense name"
              value={name}
              onChange={(name) => setName(name.target.value)}
              style={styles.input}
            />

            <input
              placeholder="Amount"
              value={amount}
              onChange={(amount) => setAmount(amount.target.value)}
              style={styles.input}
            />

            <select
              value = {payingUser}
              onChange = {(payingUser) => setPayer(payingUser.target.value)}
              style = {styles.input}
            >
              <option value="">Select payer</option>
              {
                household_members?.map((member) => (
                  <option key={member.id} value={member.id}> {member.first_name} {member.last_name} </option>
                ))
              }
            </select>

            <input
              type="date"
              value={deadline}
              onChange={(e) => setDate(e.target.value)}
              style={styles.input}
            />

            {errors && <p style={{ color: "red" }}>{errors}</p>}

            <div style={styles.actions}>
              <button onClick={onClose}>Cancel</button>
              <button onClick={handleSubmit}>Create</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  topbar: {
    display: "flex",
    justifyItems: "center",
    justifyContent: "space-between"
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    background: "#fff",
    padding: 20,
    width: 320,
    border: "2px solid black",
    borderRadius: 8,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  input: {
    padding: 8,
    fontSize: 14,
  },
  actions: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 10,
  },
};