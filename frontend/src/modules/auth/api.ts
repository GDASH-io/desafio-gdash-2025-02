import { createApi } from "@reduxjs/toolkit/query/react";
import { basequery } from "../../app/basequery";
import type { LoginFormValues } from "@/pages/login/schema";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: basequery,
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    login: builder.mutation<void, LoginFormValues>({
      query: (body) => ({ url: "/auth/login", method: "POST", body: body }),
      invalidatesTags: ["Auth"],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation } = authApi;
