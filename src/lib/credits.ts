import { UserAccount } from "@/types/db";
import clientPromise from "./mongodb";

const INITIAL_CREDITS = 10;

function asFiniteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

async function getUsersCollection() {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "jobfit");
  return db.collection<UserAccount>("users");
}

/**
 * Gets a user or creates a new one with 10 initial credits
 */
export async function getOrCreateUser(userId: string): Promise<UserAccount> {
  const users = await getUsersCollection();

  const result = (await users.findOneAndUpdate(
    { userId },
    {
      $setOnInsert: {
        userId,
        totalCredits: INITIAL_CREDITS,
        usedCredits: 0,
        remainingCredits: INITIAL_CREDITS,
        creditsTotal: INITIAL_CREDITS,
        creditsUsed: 0,
        creditsRemaining: INITIAL_CREDITS,
        createdAt: new Date(),
      },
      $set: { updatedAt: new Date() },
    },
    { upsert: true, returnDocument: "after" }
  )) as any;

  const user = (result?.value ?? result) as (UserAccount & {
    creditsRemaining?: number;
    creditsUsed?: number;
    creditsTotal?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }) | null;
  if (!user) {
    throw new Error("Failed to get or create user account");
  }

  const remA = asFiniteNumber(user.remainingCredits);
  const remB = asFiniteNumber(user.creditsRemaining);
  const remainingCredits =
    remA == null && remB == null ? INITIAL_CREDITS : remA == null ? (remB as number) : remB == null ? remA : Math.max(remA, remB);

  const usedA = asFiniteNumber(user.usedCredits);
  const usedB = asFiniteNumber(user.creditsUsed);
  const usedCredits = usedA == null && usedB == null ? 0 : usedA == null ? (usedB as number) : usedB == null ? usedA : Math.max(usedA, usedB);

  const totalA = asFiniteNumber(user.totalCredits);
  const totalB = asFiniteNumber(user.creditsTotal);
  const totalCredits =
    totalA == null && totalB == null ? remainingCredits + usedCredits : totalA == null ? (totalB as number) : totalB == null ? totalA : Math.max(totalA, totalB);

  if (
    user.remainingCredits !== remainingCredits ||
    user.usedCredits !== usedCredits ||
    user.totalCredits !== totalCredits ||
    user.creditsRemaining !== remainingCredits ||
    user.creditsUsed !== usedCredits ||
    user.creditsTotal !== totalCredits
  ) {
    await users.updateOne(
      { userId },
      {
        $set: {
          remainingCredits,
          usedCredits,
          totalCredits,
          creditsRemaining: remainingCredits,
          creditsUsed: usedCredits,
          creditsTotal: totalCredits,
          updatedAt: new Date(),
        },
      }
    );
  }

  return {
    ...(user as any),
    remainingCredits,
    usedCredits,
    totalCredits,
    updatedAt: new Date(),
  } as UserAccount;
}

/**
 * Checks if user has at least 1 credit remaining
 */
export async function hasCredits(userId: string): Promise<boolean> {
  const user = await getOrCreateUser(userId);
  return user.remainingCredits > 0;
}

/**
 * Deducts 1 credit from the user's account
 */
export async function deductCredit(userId: string): Promise<{ success: boolean; error?: string }> {
  const users = await getUsersCollection();

  await getOrCreateUser(userId);

  const res = await users.updateOne(
    {
      userId,
      $or: [{ remainingCredits: { $gt: 0 } }, { creditsRemaining: { $gt: 0 } }],
    },
    {
      $inc: {
        remainingCredits: -1,
        usedCredits: 1,
        creditsRemaining: -1,
        creditsUsed: 1,
      },
      $set: { updatedAt: new Date() },
    }
  );

  if (res.modifiedCount === 0) {
    return { success: false, error: "NO_CREDITS" };
  }

  return { success: true };
}
