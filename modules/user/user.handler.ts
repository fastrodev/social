import { Context, HttpRequest } from "fastro/core/server/types.ts";
import {
  createUserService,
  deleteUserService,
  getAllUserService,
  getUserByUserIdService,
  updateUserService,
} from "@app/modules/user/user.service.ts";
import { STATUS_CODE, STATUS_TEXT } from "fastro/core/server/deps.ts";
import { User } from "@app/modules/user/user.types.ts";
import { createUserSchema, updateUserSchema } from "./user.schemas.ts";
import { z } from "zod";

export async function getAllUsers(_req: HttpRequest, ctx: Context) {
  const [users, cursor] = await getAllUserService();
  if (!users) {
    return ctx.send(
      {
        status: STATUS_CODE.NotFound,
        message: STATUS_TEXT[STATUS_CODE.NotFound],
      },
      STATUS_CODE.NotFound,
    );
  }

  return ctx.send(
    { data: users, cursor, status: STATUS_CODE.OK },
    STATUS_CODE.OK,
  );
}

const userIdSchema = z.string().min(1, "userId is required");

export async function getUserByUserIdHandler(req: HttpRequest, ctx: Context) {
  try {
    const userId = userIdSchema.parse(req.params?.userId);

    const userData = await getUserByUserIdService(userId);
    if (!userData) {
      return ctx.send(
        {
          status: STATUS_CODE.NotFound,
          message: "User not found",
        },
        STATUS_CODE.NotFound,
      );
    }

    return ctx.send({ data: userData, status: STATUS_CODE.OK });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ctx.send(
        {
          status: STATUS_CODE.BadRequest,
          message: error.errors.map((e) => e.message).join(", "),
        },
        STATUS_CODE.BadRequest,
      );
    }

    console.error("Error fetching user:", error);

    return ctx.send(
      {
        status: STATUS_CODE.InternalServerError,
        message: STATUS_TEXT[STATUS_CODE.InternalServerError],
      },
      STATUS_CODE.InternalServerError,
    );
  }
}

export async function createUserHandler(req: HttpRequest, ctx: Context) {
  try {
    const parsedBody = await req.parseBody();
    const user = createUserSchema.parse(parsedBody);

    await createUserService(user);

    return ctx.send(
      {
        status: STATUS_CODE.Created,
        message: STATUS_TEXT[STATUS_CODE.Created],
      },
      STATUS_CODE.Created,
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ctx.send(
        {
          status: STATUS_CODE.BadRequest,
          message: error.errors.map((e) => e.message).join(", "),
        },
        STATUS_CODE.BadRequest,
      );
    }

    console.error("Error creating user:", error);

    return ctx.send(
      {
        status: STATUS_CODE.InternalServerError,
        message: STATUS_TEXT[STATUS_CODE.InternalServerError],
      },
      STATUS_CODE.InternalServerError,
    );
  }
}

export async function updateUserHandler(req: HttpRequest, ctx: Context) {
  try {
    const parsedBody = await req.parseBody();
    const user = updateUserSchema.parse(parsedBody);

    await updateUserService(user as User);

    return ctx.send(
      {
        status: STATUS_CODE.OK,
        message: STATUS_TEXT[STATUS_CODE.OK],
      },
      STATUS_CODE.OK,
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ctx.send(
        {
          status: STATUS_CODE.BadRequest,
          message: error.errors.map((e) => e.message).join(", "),
        },
        STATUS_CODE.BadRequest,
      );
    }

    console.error("Error updating user:", error);

    return ctx.send(
      {
        status: STATUS_CODE.InternalServerError,
        message: STATUS_TEXT[STATUS_CODE.InternalServerError],
      },
      STATUS_CODE.InternalServerError,
    );
  }
}

export async function deleteUserHandler(req: HttpRequest, ctx: Context) {
  const userId = req.params?.userId;
  if (!userId) {
    return ctx.send({
      status: STATUS_CODE.BadRequest,
      message: STATUS_TEXT[STATUS_CODE.BadRequest],
    }, STATUS_CODE.BadRequest);
  }

  await deleteUserService(userId);
  return ctx.send(
    {
      status: STATUS_CODE.OK,
      message: STATUS_TEXT[STATUS_CODE.OK],
    },
    STATUS_CODE.OK,
  );
}
