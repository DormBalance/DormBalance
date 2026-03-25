'use client';

import { useState } from 'react';
import CreateExpenseModal from '../../components/CreateExpenseModal';
import '../../components/CreateExpenseModal.css';

export default function Page() {
  const [isModalVisible, setIsModalVisible] = useState(false);

  let curUserId = "8"; // Temp test id; REPLACE LATER
  let curHouseholdID = "3"; // Temp test id; REPLACE LATER

  return (
    // link to stylesheet
    <html>
        <body>
            <h1>Expenses</h1>

            <button onClick={ () => setIsModalVisible(true) }>
                Add Expense
            </button>

            <CreateExpenseModal
                isOpen          = {isModalVisible}
                onClose         = {() => setIsModalVisible(false)}
                onSuccess       = {() => setIsModalVisible(false)}
                curUserID       = {curUserId}
                curHouseholdID  = {curHouseholdID}
            />
        </body>
    </html>
  );
}