import type { UserPointsData } from "@/domain/entities/sprint-report"
import { BarChart3 } from "lucide-react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"

interface PointsDistributionChartProps {
    userPointsData: UserPointsData[]
}

export const PointsDistributionChart = ({ userPointsData }: PointsDistributionChartProps) => {
    return (
        <Card className="rounded-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Points Distribution by Team Member
                </CardTitle>
                <CardDescription>Story points assigned to each team member in this sprint</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={userPointsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip
                            formatter={(value: number, name: string) => {
                                const labels: { [key: string]: string } = {
                                    completedPoints: "Completed Points",
                                    inProgressPoints: "In Progress Points",
                                    todoPoints: "Todo Points",
                                    totalPoints: "Total Points",
                                }
                                return [value, labels[name] || name]
                            }}
                        />
                        <Bar dataKey="completedPoints" stackId="a" fill="#22c55e" name="completedPoints" />
                        <Bar dataKey="inProgressPoints" stackId="a" fill="#3b82f6" name="inProgressPoints" />
                        <Bar dataKey="todoPoints" stackId="a" fill="#6b7280" name="todoPoints" />
                    </BarChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                        <span className="text-sm">Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                        <span className="text-sm">In Progress</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-500 rounded-sm"></div>
                        <span className="text-sm">Todo</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
