import { createApi } from "@reduxjs/toolkit/query/react";
import { basequery } from "../../app/basequery";
import type { PaginatedWeatherResponse, WeatherFilters } from "./types";

export const weatherApi = createApi({
  reducerPath: "weatherApi",
  baseQuery: basequery,
  tagTypes: ["Weather"],
  endpoints: (builder) => ({
    getWeather: builder.query<PaginatedWeatherResponse, WeatherFilters>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters.page) params.append("page", filters.page.toString());
        if (filters.itemsPerPage)
          params.append("itemsPerPage", filters.itemsPerPage.toString());
        if (filters.startDate) params.append("startDate", filters.startDate);
        if (filters.endDate) params.append("endDate", filters.endDate);

        return {
          url: `/weather?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Weather"],
    }),
  }),
});

export const { useGetWeatherQuery, useLazyGetWeatherQuery } = weatherApi;
