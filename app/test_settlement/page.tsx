'use client';

import { useState } from 'react';
import CreateSettlementModal from '../../components/CreateSettlementModal';
import '../../components/CreateExpenseModal.css';

export default function Page() {
    const [isModalVisible, setIsModalVisible] = useState(true);

    let curUserId = "1"; // Temp test id; REPLACE LATER
    let curHouseholdID = "1"; // Temp test id; REPLACE LATER

    return (
        <CreateSettlementModal
            isOpen         = {isModalVisible}
            onClose        = {() => setIsModalVisible(false)}
            onSuccess      = {() => setIsModalVisible(false)}
            curUserID      = {curUserId}
            curHouseholdID = {curHouseholdID}
        />
    );
}
