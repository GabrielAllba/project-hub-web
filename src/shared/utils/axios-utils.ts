import type { BaseResponse } from "@/domain/dto/base-response";
import axios from "axios";

export function convertAxiosErrorToBaseResponse<T>(
    err: unknown,
): BaseResponse<T> {
    let message = ""

    if (axios.isAxiosError(err)) {
        const errorResponse = err.response?.data as { message?: string };
        message = errorResponse?.message ?? err.message;
    }

    return {
        status: "error",
        message,
        data: {} as T,
    };
}