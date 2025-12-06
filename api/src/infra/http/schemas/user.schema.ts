import z from "zod";

const createUserInputSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "user"]).optional(),
});

export const createUserSchema = createUserInputSchema.transform((data) => ({
  name: data.name,
  email: data.email,
  password: data.password,
  role: (data.role ?? "user") as "admin" | "user",
}));

export type CreateUserSchema = {
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
};

export const updateUserSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["admin", "user"]).optional(),
});

export type UpdateUserSchema = z.infer<typeof updateUserSchema>;

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().optional(),
});

export type ListUsersQuerySchema = z.infer<typeof listUsersQuerySchema>;
