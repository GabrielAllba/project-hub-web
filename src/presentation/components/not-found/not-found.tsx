import { Frown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";

export function NotFoundPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
            <div className="space-y-6">
                <Frown className="mx-auto h-20 w-20 text-primary animate-bounce-slow" /> {/* Larger icon, animated */}

                <h1 className="text-7xl font-bold tracking-tight text-foreground sm:text-9xl">
                    404
                </h1>
                <p className="text-xl font-medium text-muted-foreground sm:text-2xl">
                    Page Not Found
                </p>
                <p className="max-w-md text-base text-gray-500 dark:text-gray-400 mx-auto">
                    Oops! The page you're looking for doesn't exist or has been moved.
                    Please check the URL or navigate back to the dashboard.
                </p>
                <div className="mt-8 flex justify-center">
                    <Button asChild size="lg"> {/* Larger button */}
                        <Link to="/dashboard/project">
                            Go to Dashboard
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}