import { useEffect, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/id";

import type { User } from "@/domain/entities/user";
import { useGetMe } from "@/shared/hooks/use-get-me";

export const GreetingSection = () => {
    const [today, setToday] = useState<string>("");
    const [greeting, setGreeting] = useState<string>("");

    const { triggerGetMe, triggerGetMeResponse } = useGetMe();
    const user: User | undefined = triggerGetMeResponse?.data;

    useEffect(() => {
        dayjs.locale("id");
        const now = dayjs();
        setToday(now.format("dddd, DD MMMM YYYY"));

        const hour = now.hour();
        if (hour < 11) setGreeting("Selamat pagi");
        else if (hour < 15) setGreeting("Selamat siang");
        else if (hour < 18) setGreeting("Selamat sore");
        else setGreeting("Selamat malam");

        triggerGetMe();
    }, []);

    return (
        <>
            <p className="text-sm text-muted-foreground">{today}</p>
            <h1 className="text-3xl font-semibold">
                {greeting}, {user?.username ?? "Pengguna"}
            </h1>
        </>
    );
};
