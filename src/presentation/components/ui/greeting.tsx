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
        dayjs.locale("en");
        const now = dayjs();
        setToday(now.format("dddd, MMMM D"));
        const hour = now.hour();

        if (hour < 11) setGreeting("Good morning");
        else if (hour < 15) setGreeting("Good afternoon");
        else if (hour < 18) setGreeting("Good evening");
        else setGreeting("Good night");

        triggerGetMe();
    }, []);

    return (
        <div className="w-full rounded-xl flex justify-between items-center text-zinc-900 dark:text-white relative overflow-hidden">
            {/* Greeting Text */}
            <div className="space-y-2 z-10">
                <p className="text-sm font-medium text-zinc-800/80 dark:text-white/70">
                    {today}
                </p>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {greeting}, {user?.username?.toLowerCase() ?? "Pengguna"}
                </h1>
            </div>

            {/* Optional Image or illustration (like the hanging shirts) */}
            {/* You can conditionally render this based on a prop or config */}
            <div className="hidden lg:block absolute right-6 top-0 h-full flex items-center z-0 opacity-20 pointer-events-none">
                {/* <img
                    src="/your-illustration.svg" // Replace with actual path if you want to show shirts like in your screenshot
                    alt="Decoration"
                    className="h-full object-contain"
                /> */}
            </div>
        </div>
    );
};
