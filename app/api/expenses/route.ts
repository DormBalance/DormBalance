import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, SplitType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({connectionString: process.env.DATABASE_URL});
const prisma = new PrismaClient({adapter});

// Helper to parse BigInt types into string for JSON response
function JSONifyBigInt<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_key, val) => 
      typeof val === 'bigint' ? val.toString() : val)
  );
}

interface CreateExpenseBody {
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
}

export async function POST(request: NextRequest) {
  let body: CreateExpenseBody;

  try {
    body = await request.json();
  }
  catch {
    return NextResponse.json({error: "Request body is not valid JSON"}, {status: 400});
  }

  let {
    expense_name, description,
    household_id, creator_user_id,
    payer_user_id, amount,
    split_type, expense_date: expense_date,
    recurring_expense_id, expense_category_id,
  } = body;

  //  Validate Inputs
  if (!creator_user_id)
    return NextResponse.json({error: "creator_user_id is required"}, {status: 400});

  if (!payer_user_id)
    return NextResponse.json({error: "payer_user_id is required"}, {status: 400});

  if (!expense_name?.trim())
    return NextResponse.json({error: "expense_name is required"}, {status: 400});

  if (!household_id)
    return NextResponse.json({error: "household_id is required"}, {status: 400});  

  if (!expense_date)
    return NextResponse.json({error: "expense_date is required"}, {status: 400});

  const amountStr = String(amount).trim();
  const twoDecimalRegex = /^\d+(\.\d{1,2})?$/; // Check for positive number with up to 2 decimal places

  if (!twoDecimalRegex.test(amountStr))
    return NextResponse.json({error: "amount must be a positive number with at most 2 decimal places"}, {status: 400});


  let resolvedSplitType: SplitType;
  if (split_type === 'Equal')
    resolvedSplitType = SplitType.Equal;
  else if (split_type === 'Custom')
    resolvedSplitType = SplitType.Custom;
  else
    return NextResponse.json({error: "split_type must be either 'Equal' or 'Custom'"}, {status: 400});

  const expenseDateObj = new Date(expense_date);
  if (isNaN(expenseDateObj.getTime()))
    return NextResponse.json({error: "expense_date is not a valid date"}, {status: 400});

  const paymentAmount = parseFloat(amountStr);
  if (isNaN(paymentAmount) || paymentAmount <= 0)
    return NextResponse.json({error: "amount must be a positive number"}, {status: 400});

  try {
    const expense = await prisma.expenses.create({
      data: {
        expense_name: expense_name.trim(),
        description: description?.trim() ?? '',
        household_id: BigInt(household_id),
        expense_category_id: expense_category_id ? BigInt(expense_category_id) : null,
        split_type: resolvedSplitType,
        creator_user_id: BigInt(creator_user_id),
        payer_user_id: BigInt(payer_user_id),
        expense_date: expenseDateObj,
        amount: paymentAmount,
        recurring_expense_id: recurring_expense_id ? BigInt(recurring_expense_id) : null,
      }
    });

    return NextResponse.json({ success: true, expense: JSONifyBigInt(expense) }, { status: 201 });
  }
  catch (err) {
    console.error(`Error creating expense ${expense_name}: `, err);
    return NextResponse.json({error: "We encountered an error while creating the expense"}, {status: 500});
  }
}
