import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import JSONifyBigInt from '../../../utilities/BigInt';

const adapter = new PrismaPg({connectionString: process.env.DATABASE_URL});
const prisma = new PrismaClient({adapter});

// Route: /api/household_members?userId=<id>
// Returns all members of the given user's household, along with their role
export async function GET(request: NextRequest) {
  let userId = request.nextUrl.searchParams.get('userId');

  if (!userId)
    return NextResponse.json({ error: "userId not provided" }, { status: 400 });

  let curHouse = await prisma.household_members.findFirst({
    where: {user_id: BigInt(userId)},
    
    select: {household_id: true}
  });

  if (!curHouse)
    return NextResponse.json({ error: "This user has no household" }, { status: 404 });

  let members = await prisma.household_members.findMany({
    where: {household_id: curHouse.household_id},
    include: {
      user: {
        select: {id: true, first_name: true, last_name: true},
      }
    }
  });
  
  const result = members.map(
    (member) => ({
      id:         member.user.id,
      first_name: member.user.first_name,
      last_name:  member.user.last_name,
      role:       member.role
  }));

  return NextResponse.json(JSONifyBigInt(result));
}
