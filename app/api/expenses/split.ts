export type ComputedRowDataType = {
    UserID: bigint;
    OptStatus: boolean;
    Amount: string; //Usimg string to avoid floatig decimals (verification pruposes)
};

export type EqualSplitInputType = {
    PayingUserIDs: bigint[];
    ExcludedUserIDs: bigint[];
    Amount: number;
};


function containsUserID(set: Set<string>, user_id: bigint): boolean{ //just a local helper, no export
    return set.has(user_id.toString());
};


export function CalculateEqualSplit(input: EqualSplitInputType): ComputedRowDataType[]{
    const PayingUserIDs = input.PayingUserIDs;
    const ExcludedUserIDs = input.ExcludedUserIDs ?? [];
    const Amount = input.Amount;

    const repeatedUsers = new Set<string>();
    for(let i = 0; i < PayingUserIDs.length; i++){
        const userIDString = PayingUserIDs[i].toString();
        if(repeatedUsers.has(userIDString)){
            throw new Error("Duplicate error");
        }
        repeatedUsers.add(userIDString);
    }

    if(PayingUserIDs.length === 0){
        throw new Error("Equal split does not have any users participating");
    }

    if (!Number.isFinite(Amount) || Amount <= 0){
        throw new Error("Equal split does not have both a finite or positive number");
    }

    const ExcludedUsers = new Set(ExcludedUserIDs.map((id) => id.toString())); // converting to string for easier comparison
    const PayingUsers = PayingUserIDs.filter((user_id) => !containsUserID(ExcludedUsers, user_id));

    if(PayingUsers.length === 0){
        throw new Error("Equal split does not have a user")
    }

    const totalCents = Math.round(Amount * 100);
    const remainder =  totalCents % PayingUsers.length;
    const defaultAmount = Math.floor(totalCents / PayingUsers.length);

    const rows: ComputedRowDataType[] = [];
    for(let i = 0; i < PayingUsers.length; i++){
        let user_id = PayingUsers[i];
        let cents = defaultAmount;
        if(i < remainder){
            cents += 1;
        }
        let dollars = cents / 100;
        let dollarString = dollars.toFixed(2);

        let includedRow = {
            UserID: user_id,
            OptStatus: false,
            Amount: dollarString
        };

        rows.push(includedRow);
    }

    for(let i = 0; i < ExcludedUserIDs.length; i++){
        let excludedRow = {
            UserID: ExcludedUserIDs[i],
            OptStatus: true,
            Amount: "0.00"
        };
        rows.push(excludedRow);
    } 
    return rows;
};

export type PercentSplitParticipants = {
    UserID: bigint;
    Percent: number;
}

export type PercentSplitInputType = {
    Participants: PercentSplitParticipants[];
    ExcludedUserIDs: bigint[];
    Amount: number;
};

export function CalculatePercentSplit(input: PercentSplitInputType): ComputedRowDataType[]{
    const Participants = input.Participants;
    const ExcludedUserIDs = input.ExcludedUserIDs ?? [];
    const Amount = input.Amount;

    //basic filtering and validations (mostly the same as equal split, could make a helper as well but im lazy and i like my code explicit)

    const repeatedUsers = new Set<string>();
    for(let i = 0; i < Participants.length; i++){
        const userIDString = Participants[i].UserID.toString();
        if(repeatedUsers.has(userIDString)){
            throw new Error("Duplicate error");
        }
        repeatedUsers.add(userIDString);
    }

    if (!Number.isFinite(Amount) || Amount <= 0){
        throw new Error("Percent split does not have both a finite or positive number");
    }

    if(Participants.length === 0){
        throw new Error("Percent split does not have any participants");
    }

    const ExcludedUsers = new Set(ExcludedUserIDs.map((id) => id.toString()));
    const PayingUsers = Participants.filter((user_id) => !ExcludedUsers.has(user_id.UserID.toString()));

     if(PayingUsers.length === 0){
        throw new Error("Percent split does not have a user")
    }

    let sumOfPercents = 0;
    for(let i = 0; i < PayingUsers.length; i++){
        if (!Number.isFinite(PayingUsers[i].Percent) || PayingUsers[i].Percent < 0){
            throw new Error("Invalid percents");
        }
        sumOfPercents += PayingUsers[i].Percent;
    }

    if (Math.abs(sumOfPercents - 100) > 0.0001){
        throw new Error("Percents are invalid and do not sum up to 100");
    }

    //cents logic
    const totalCents = Math.round(Amount * 100);
    const centsPerUser: number[] = [];
    let centsUsed = 0;
    
    for(let i = 0; i < PayingUsers.length; i++){
        const centsToPay = (totalCents * PayingUsers[i].Percent) / 100; //these lines are the only real logic difference.
        const cents = Math.floor(centsToPay);
        centsPerUser.push(cents);
        centsUsed += cents;
        }   

    let remainder = totalCents - centsUsed;
    for(let i = 0; remainder > 0; i++){
        centsPerUser[i] += 1;
        remainder -= 1;

        if(i === centsPerUser.length - 1){
            i = -1;
        }
    }

    //repeated code from equal split, mabye turn into helper but still gets the job done. (im to lazy)
    const rows: ComputedRowDataType[] = [];
    for(let i = 0; i < PayingUsers.length; i++){
        let cents = centsPerUser[i];
        let dollars = cents / 100;
        let dollarString = dollars.toFixed(2);

        let includedRow = {
            UserID: PayingUsers[i].UserID,
            OptStatus: false,
            Amount: dollarString
        };

        rows.push(includedRow);

    }

     for(let i = 0; i < ExcludedUserIDs.length; i++){
        let excludedRow = {
            UserID: ExcludedUserIDs[i],
            OptStatus: true,
            Amount: "0.00"
        };
        rows.push(excludedRow);
    } 
    return rows;

}