import { oauthAccounts, users } from "$lib/server/db/schema";
import { db } from "$lib/server/db/worker";
import { and, eq } from "drizzle-orm";

export default class UserRepository {
  static async findById(id: string) {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user[0];
  }

  static async findByGoogleId(
    googleId: string
  ) {
    return await db
      .select()
      .from(users)
      .innerJoin(oauthAccounts, eq(users.id, oauthAccounts.userId))
      .where(
        and(
          eq(oauthAccounts.provider, "google"),
          eq(oauthAccounts.providerUserId, googleId)
        ))
      .limit(1)
      .then((results) => results.pop());

  }
}
