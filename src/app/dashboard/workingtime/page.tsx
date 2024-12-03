"use client";
import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { FiClock, FiUsers, FiTrendingUp } from "react-icons/fi";
import useSWR from 'swr'
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface Employee {
    id: string;
    name: string;
}

const WorkingTimeDashboard: React.FC = () => {
    const [selectedEmploye, setSelectedEmployee] = useState<string>("all");
    const [isMonth, setMonth] = useState<Date>(new Date());

    const COLORS = ["#4F46E5", "#818CF8", "#6366F1", "#A5B4FC"];

    const handleMonthChange = (date: Date | null) => {
        if (date) {
            setMonth(date);
        }
    };

    const formatDateToISO = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    const GetListCheckIn = (url: string) => fetch(url).then(res => res.json()).then(data => {
        return data;
    });

    const { data: dataWorkingTime, error: errorWorkingTime, mutate: mutateWorkingTime, isLoading: loadWorkingTime } = useSWR<DataFetchWoringTime>(
        `http://127.0.0.1:5000/workingtime/${selectedEmploye}/${formatDateToISO(isMonth)}`,
        GetListCheckIn);

    const GetUniquePeoples = (url: string) => fetch(url).then(res => res.json()).then(data => {
        data.unshift({
            id: "all",
            name: "Tất cả nhân viên"
        });
        return data;
    });

    const { data: uniqueNames, error: errorUniqueNames, mutate: mutateUniqueNames, isLoading: loadUniqueNames } = useSWR<Employee[]>(
        `http://127.0.0.1:5000/namespeople`,
        GetUniquePeoples, {
    });

    const handleEmployeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedEmployee(event.target.value);
    };

    interface OvertimeDistributionDataPoint {
        name: string;
        value: number;
    }

    const overtimeDistribution: OvertimeDistributionDataPoint[] = [
        { name: "Giờ làm việc thông thường", value: Number(dataWorkingTime?.actual_working_hours) || 0 },
        { name: "Giờ làm thêm", value: Number(dataWorkingTime?.over_time_hours) || 0 },
    ];

    interface StatCardProps {
        icon: React.ComponentType<{ className?: string }>;
        title: string;
        value: string | number;
        change: number;
    }

    const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, change }) => (
        <div className="bg-white p-6 rounded-lg shadow-md transition-transform hover:scale-105" role="region" aria-label={title}>
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-indigo-100 rounded-full">
                    <Icon className="w-6 h-6 text-indigo-600" />
                </div>
                <span className={`text-sm ${change >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {change >= 0 ? "+" : ""}{change}%
                </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
    );

    if (loadUniqueNames || loadWorkingTime) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="w-20 h-20 rounded-full animate-spin border-y-8 border-solid border-indigo-500 border-t-transparent shadow-md"></div>
            </div>
        )
    }

    return (
        <div className="py-6 px-10 2xl:px-40 xl:px-20 lg:px-10 md:px-10 sm:px-10 bg-gray-50" role="main">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Phân tích thời gian làm việc</h1>

            <div className="flex justify-between items-center mb-8">
                <select
                    value={selectedEmploye}
                    onChange={handleEmployeChange}
                    className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-700 shadow-sm"
                    aria-label="Select Employee"
                >
                    {uniqueNames?.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                            {employee.name}
                        </option>
                    ))}
                </select>
                <div>
                    <DatePicker className="border rounded-lg px-4 py-2"
                        selected={isMonth}
                        onChange={handleMonthChange}
                        dateFormat="MMMM yyyy"
                        showMonthYearPicker
                        showFullMonthYearPicker={true}
                        maxDate={new Date()}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard
                    icon={FiClock}
                    title="Giờ làm việc"
                    value={dataWorkingTime?.actual_working_hours ?? "0"}
                    change={dataWorkingTime?.increase_actual_working_hours ?? 0}
                />
                <StatCard
                    icon={FiUsers}
                    title="Hiệu suất của nhân viên"
                    value={dataWorkingTime?.work_performance ? `${dataWorkingTime.work_performance}%` : "0%"}
                    change={dataWorkingTime?.increase_work_performance ?? 0}
                />
                <StatCard
                    icon={FiTrendingUp}
                    title="Tỷ lệ làm thêm giờ"
                    value={dataWorkingTime?.over_time_percent ? `${dataWorkingTime.over_time_percent}%` : "0%"}
                    change={dataWorkingTime?.increase_over_time_hours ?? 0}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Giờ làm việc hàng tháng</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dataWorkingTime?.graph_data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="averageHours" fill="#4F46E5" name="Giờ làm việc thông thường" />
                                <Bar dataKey="overtime" fill="#818CF8" name="Giờ làm thêm" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold">Phân phối giờ làm thêm</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={overtimeDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {overtimeDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}; export default WorkingTimeDashboard;