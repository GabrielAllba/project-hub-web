import { Link } from "react-router-dom"
import { FeaturesTabs } from "../components/landing/features-tabs"
import { Navigation } from "../components/landing/navigation"

export const LandingPage = () => {
    return (
        <div className="min-h-screen bg-white">
            <Navigation />

            {/* Hero Section */}
            <section className="bg-white text-center py-24 px-4 sm:px-8 relative overflow-hidden">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                        Plan and track your task<br />
                        with <span className="text-[#1868DB]">Project Hub</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                        A complete Scrum workspace to manage boards, plan timelines, track reports,
                        and collaborate with your team — all in one place.
                    </p>
                    <div className="mt-10">
                        <Link to="/register" className="text-2xl bg-[#1868DB] cursor-pointer hover:bg-[#1868DB] rounded-full text-white font-semibold px-8 py-3">
                            Get started
                        </Link>
                    </div>
                </div>
            </section>


            {/* Feature Tabs */}
            <FeaturesTabs />
        </div>
    )
}
