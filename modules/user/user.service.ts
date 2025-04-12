import { User } from "@app/modules/user/user.types.ts";
import { kv } from "@app/utils/db.ts";
import { ulid } from "jsr:@std/ulid";

export async function getUserByUserIdService(userId: string) {
  const res = await kv.get<User>(["users", userId]);
  return res.value;
}

/**
 * getAllUserService
 *
 * list options:
   ```
   {
      limit?: number;
      reverse?: boolean;
      cursor?: string;
      consistency?: Deno.KvConsistencyLevel;
      batchSize?: number;
   }
   ```
 * see: https://deno.land/api@v1.39.4?s=Deno.KvListOptions&unstable=
 * @returns
 */
export async function getAllUserService(
  options?: Deno.KvListOptions,
): Promise<[User[], string]> {
  const list = kv.list<User>(
    { prefix: ["users"] },
    options,
  );

  const users = [];
  for await (const entry of list) {
    users.push(entry.value);
  }
  return [users, list.cursor];
}

function createUserKey(user: User) {
  if (!user.id) {
    throw new Error("Failed to createUserKey. user.id is undefined");
  }
  if (!user.email) {
    throw new Error("Failed to createUserKey. user.email is undefined");
  }
  if (!user.user_name) {
    throw new Error("Failed to createUserKey. user.userName is undefined");
  }
  if (!user.mobile) {
    throw new Error("Failed to createUserKey. user.mobile is undefined");
  }
  if (!user.first_name) {
    throw new Error("Failed to createUserKey. user.firstName is undefined");
  }

  const usersById = ["users", user.id];
  const usersByEmailKey = ["users_by_email", user.email];
  const usersByUsernameKey = ["users_by_username", user.user_name];
  const userByMobileKey = ["users_by_mobile_phone", user.mobile];
  const usersByFirstnameKey = ["users_by_firstname", user.first_name, user.id];

  return [
    usersById,
    usersByEmailKey,
    usersByUsernameKey,
    userByMobileKey,
    usersByFirstnameKey,
  ];
}

export async function createUserService(user: User) {
  try {
    if (!user.id) user.id = ulid();

    if (!user.email) {
      throw new Error("Failed to create user. user.email is undefined");
    }
    if (!user.user_name) {
      throw new Error("Failed to create user. user.user_name is undefined");
    }
    if (!user.mobile) {
      throw new Error("Failed to create user. user.mobile is undefined");
    }
    if (!user.first_name) {
      throw new Error("Failed to create user. user.first_name is undefined");
    }

    const [
      usersKey,
      usersByEmailKey,
      usersByUsernameKey,
      userByMobileKey,
      usersByFirstnameKey,
    ] = createUserKey(user);

    // Operasi atomik untuk memastikan tidak ada konflik data
    const res = await kv.atomic()
      .check({ key: usersKey, versionstamp: null }) // Pastikan ID pengguna belum ada
      .check({ key: usersByEmailKey, versionstamp: null }) // Pastikan email belum digunakan
      .check({ key: usersByUsernameKey, versionstamp: null }) // Pastikan username belum digunakan
      .check({ key: userByMobileKey, versionstamp: null }) // Pastikan nomor telepon belum digunakan
      .set(usersKey, user)
      .set(usersByEmailKey, user)
      .set(userByMobileKey, user)
      .set(usersByUsernameKey, user)
      .set(usersByFirstnameKey, user)
      .commit();

    // Jika operasi gagal, lempar error
    if (!res.ok) {
      throw new Error("Failed to create user due to a conflict or other issue");
    }

    return res;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error creating user:", error.message);
      throw new Error(`Failed to create user: ${error.message}`);
    } else {
      console.error("Unknown error creating user:", error);
      throw new Error("Failed to create user due to an unknown error");
    }
  }
}

export async function updateUserService(user: User) {
  try {
    if (!user.id) {
      throw new Error("Failed to update user. user.id is undefined");
    }

    const existingUser = await kv.get<User>(["users", user.id]);
    if (!existingUser.value) {
      throw new Error(`User with ID ${user.id} not found`);
    }

    const [
      usersKey,
      usersByEmailKey,
      usersByUsernameKey,
      userByMobileKey,
      usersByFirstnameKey,
    ] = createUserKey(user);

    const res = await kv.atomic()
      .check({ key: usersKey, versionstamp: existingUser.versionstamp })
      .set(usersKey, user)
      .set(usersByEmailKey, user)
      .set(userByMobileKey, user)
      .set(usersByUsernameKey, user)
      .set(usersByFirstnameKey, user)
      .commit();

    if (!res.ok) {
      throw new Error("Failed to update user due to a conflict or other issue");
    }

    return res;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error updating user:", error.message);
      throw new Error(`Failed to update user: ${error.message}`);
    } else {
      console.error("Unknown error updating user:", error);
      throw new Error("Failed to update user due to an unknown error");
    }
  }
}

export async function deleteUserService(userId: string) {
  try {
    // Retrieve the existing user to get all related keys
    const existingUser = await kv.get<User>(["users", userId]);
    if (!existingUser.value) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const user = existingUser.value;

    const [
      usersKey,
      usersByEmailKey,
      usersByUsernameKey,
      userByMobileKey,
      usersByFirstnameKey,
    ] = createUserKey(user);

    // Perform atomic deletion of all related keys
    const res = await kv.atomic()
      .check({ key: usersKey, versionstamp: existingUser.versionstamp }) // Ensure the user exists
      .delete(usersKey)
      .delete(usersByEmailKey)
      .delete(usersByUsernameKey)
      .delete(userByMobileKey)
      .delete(usersByFirstnameKey)
      .commit();

    if (!res.ok) {
      throw new Error("Failed to delete user due to a conflict or other issue");
    }

    return res;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error deleting user:", error.message);
      throw new Error(`Failed to delete user: ${error.message}`);
    } else {
      console.error("Unknown error deleting user:", error);
      throw new Error("Failed to delete user due to an unknown error");
    }
  }
}
