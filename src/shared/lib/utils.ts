import type { BaseResponse } from "@/domain/dto/base-response";
import axios from "axios";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function convertAxiosErrorToBaseResponse<T>(
  err: unknown,
  fallbackMessage = "Request failed"
): BaseResponse<T> {
  let message = fallbackMessage;

  if (axios.isAxiosError(err)) {
    const errorResponse = err.response?.data as { message?: string };
    message = errorResponse?.message ?? err.message;
  }

  return {
    status: 500,
    message,
    data: {} as T,
  };
}
