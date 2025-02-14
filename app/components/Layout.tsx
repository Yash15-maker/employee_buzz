"use client"
import React, { Suspense, useState } from 'react';
import {
    LayoutGrid,
    Users,
    Calendar,
    FileText,
    Settings,
    HelpCircle,
    Bell,
    ChevronDown,
    Menu
} from 'lucide-react';
import EmployeeDashboard from './EmplyeeDashboard';

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState('');

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const menuItems = [
        {
            icon: <LayoutGrid className="h-5 w-5" />,
            label: 'Dashboard',
            active: true
        },
        {
            icon: <Users className="h-5 w-5" />,
            label: 'Employees',
            hasDropdown: true
        },
        {
            icon: <Calendar className="h-5 w-5" />,
            label: 'Schedule',
            hasDropdown: true
        },
        {
            icon: <FileText className="h-5 w-5" />,
            label: 'Reports'
        },
        {
            icon: <Settings className="h-5 w-5" />,
            label: 'Settings'
        },
        {
            icon: <HelpCircle className="h-5 w-5" />,
            label: 'Help'
        }
    ];

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <div className="flex h-screen bg-gray-100">
                <aside className={`fixed top-0 left-0 z-40 h-screen w-64 bg-[#1a1f2b] text-white transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-64'} sm:translate-x-0`}>
                    <div className="px-6 py-6 border-b border-gray-700 flex justify-between items-center">
                        <h1 className="text-xl font-bold">Dashboard</h1>
                        <button className="lg:hidden text-gray-300" onClick={toggleSidebar}>✕</button>
                    </div>
                    <nav className="mt-4 px-4">
                        {menuItems.map((item, index) => (
                            <div key={index} className="mb-1">
                                <button
                                    className={`
                  w-full flex items-center justify-between px-4 py-3 rounded-lg
                  ${item.active ? 'bg-blue-600' : 'hover:bg-gray-700'}
                  transition-colors duration-200
                `}
                                >
                                    <div className="flex items-center gap-3">
                                        {item.icon}
                                        <span className="text-sm font-medium">{item.label}</span>
                                    </div>
                                    {item.hasDropdown && (
                                        <ChevronDown className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        ))}
                    </nav>
                </aside>
                <div className="flex-1 lg:ml-64">
                    <header className="bg-white h-16 flex items-center justify-between px-4 sm:px-8 shadow-sm">
                        <button className="sm:hidden p-2" onClick={toggleSidebar}>
                            <Menu className="h-6 w-6 text-gray-500" />
                        </button>
                        <div className="flex items-center gap-3">
                            <LayoutGrid className="h-5 w-5 text-blue-600" />
                            <h1 className="text-xl font-semibold text-gray-900">
                                Employee Management Dashboard
                            </h1>
                        </div>
                        <div className="relative">
                            <button className="p-2 hover:bg-gray-100 rounded-full">
                                <Bell className="h-6 w-6 text-gray-500" />
                                <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full"></span>
                            </button>
                        </div>
                    </header>
                    <main className="p-4 sm:p-8">
                        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                            <EmployeeDashboard />
                        </div>
                    </main>
                </div>
            </div>
        </Suspense>
    );
};

export default DashboardLayout;
