import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import JSONifyBigInt from '../../../utilities/BigInt';
import { parseJsonFile } from 'next/dist/build/load-jsconfig';
import { stringify } from 'node:querystring';

const adapter = new PrismaPg({connectionString: process.env.DATABASE_URL});
const prisma = new PrismaClient({adapter});

// Route: /api/expense_category?household_id=<household_id>&expense_category_id=<expense_category_id>
// Returns the expense category name for the given household
export async function GET(request: NextRequest) {
  let householdId = request.nextUrl.searchParams.get('household_id');
  let expenseCategoryId = request.nextUrl.searchParams.get('expense_category_id');

  if (!householdId || !expenseCategoryId)
    return NextResponse.json({ error: "household_id and expense_category_id must be provided" }, { status: 400 });

  let curCategory = await prisma.expense_categories.findFirst({
    where: {
      id: BigInt(expenseCategoryId),
      household_id: BigInt(householdId)
    },
    select: {id: true, category_name: true}
  });

  if (!curCategory)
    return NextResponse.json({ error: "Expense category not found" }, { status: 404 });
        
  let categoryName = curCategory.category_name;

  return NextResponse.json(JSON.stringify({category_name: categoryName}));
}

// Body: { household_id: string, category_name: string }
// Creates a new expense category for the given household
export async function POST(request: NextRequest) {
    const body = await request.json();
    let householdId = body.household_id;
    let categoryName = body.category_name;

    if (!householdId || !categoryName)
      return NextResponse.json({ error: "household_id and category_name must be provided" }, { status: 400 });

    // check if already exists

    let existing = await prisma.expense_categories.findFirst({
        where: {
            household_id: BigInt(householdId),
            category_name: categoryName
        }
    });

    if (existing)
        return NextResponse.json({ error: "Expense category already exists" }, { status: 204 });

    let newCategory = await prisma.expense_categories.create({
      data: {
        household_id: BigInt(householdId),
        category_name: categoryName
      }
    });

    return NextResponse.json({
        status: 200, 
        category_id: newCategory.id.toString(), 
        category_name: newCategory.category_name
    });
}
