import type { IaData, WeatherData } from "@/models/types";
import { atom } from "jotai"

export type User = { name: string, email: string, isAdmin: boolean }

const saved = localStorage.getItem("user")
let initialValue: User | null;
try {
  initialValue = saved ? JSON.parse(saved) : null
} catch (err) {
  console.log(err)
  initialValue = null;
}

export const userAtom = atom<User | null>(initialValue)

export const weatherDataAtom = atom<WeatherData|null>(null)

export const IaDataAtom = atom<IaData|null>(null);