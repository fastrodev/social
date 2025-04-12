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

export async function getUserByUserIdHandler(req: HttpRequest, ctx: Context) {
  const userId = req.params?.userId;
  if (!userId) {
    return ctx.send({
      status: STATUS_CODE.BadRequest,
      message: STATUS_TEXT[STATUS_CODE.BadRequest],
    }, STATUS_CODE.BadRequest);
  }

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
}

export async function createUserHandler(req: HttpRequest, ctx: Context) {
  try {
    const user = await req.parseBody<User>();

    if (!user.user_name) {
      return ctx.send(
        {
          status: STATUS_CODE.BadRequest,
          message: "user_name is required",
        },
        STATUS_CODE.BadRequest,
      );
    }
    if (!user.password) {
      return ctx.send(
        {
          status: STATUS_CODE.BadRequest,
          message: "password is required",
        },
        STATUS_CODE.BadRequest,
      );
    }
    if (!user.first_name) {
      return ctx.send(
        {
          status: STATUS_CODE.BadRequest,
          message: "first_name is required",
        },
        STATUS_CODE.BadRequest,
      );
    }
    if (!user.email) {
      return ctx.send(
        {
          status: STATUS_CODE.BadRequest,
          message: "email is required",
        },
        STATUS_CODE.BadRequest,
      );
    }
    if (!user.mobile) {
      return ctx.send(
        {
          status: STATUS_CODE.BadRequest,
          message: "mobile is required",
        },
        STATUS_CODE.BadRequest,
      );
    }

    await createUserService(user);

    return ctx.send(
      {
        status: STATUS_CODE.Created,
        message: STATUS_TEXT[STATUS_CODE.Created],
      },
      STATUS_CODE.Created,
    );
  } catch (error) {
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
    const user = await req.parseBody<User>();

    if (!user.id) {
      return ctx.send(
        {
          status: STATUS_CODE.BadRequest,
          message: "id is required",
        },
        STATUS_CODE.BadRequest,
      );
    }
    if (!user.user_name) {
      return ctx.send(
        {
          status: STATUS_CODE.BadRequest,
          message: "user_name is required",
        },
        STATUS_CODE.BadRequest,
      );
    }
    if (!user.email) {
      return ctx.send(
        {
          status: STATUS_CODE.BadRequest,
          message: "email is required",
        },
        STATUS_CODE.BadRequest,
      );
    }
    if (!user.mobile) {
      return ctx.send(
        {
          status: STATUS_CODE.BadRequest,
          message: "mobile is required",
        },
        STATUS_CODE.BadRequest,
      );
    }

    await updateUserService(user);

    return ctx.send(
      {
        status: STATUS_CODE.OK,
        message: STATUS_TEXT[STATUS_CODE.OK],
      },
      STATUS_CODE.OK,
    );
  } catch (error) {
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
