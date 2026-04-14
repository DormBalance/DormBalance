'use client';

import { useState } from 'react';
import CreateExpenseModal from '../../components/CreateExpenseModal';
import '../../components/CreateExpenseModal.css';

export default function Page() {
  const [isModalVisible, setIsModalVisible] = useState(true);

  let curUserId = "8"; // Temp test id; REPLACE LATER
  let curHouseholdID = "3"; // Temp test id; REPLACE LATER

  return (
    // link to stylesheet
    <html>
        <body>
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