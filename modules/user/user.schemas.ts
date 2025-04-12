// filepath: /home/dev/project/social/modules/user/user.schemas.ts
import { z } from "zod";

export const createUserSchema = z.object({
  user_name: z.string().min(1, "user_name is required"),
  password: z.string().min(1, "password is required"),
  first_name: z.string().min(1, "first_name is required"),
  email: z.string().email("Invalid email format"),
  mobile: z.string().min(1, "mobile is required"),
});

export const updateUserSchema = z.object({
  id: z.string().min(1, "id is required"),
  user_name: z.string().min(1, "user_name is required"),
  email: z.string().email("Invalid email format"),
  mobile: z.string().min(1, "mobile is required"),
});
