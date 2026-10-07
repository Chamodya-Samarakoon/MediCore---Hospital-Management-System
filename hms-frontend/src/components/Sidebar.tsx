import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Role } from '../types';
import {
    LayoutDashboard,
    Users,
    UserCheck,
    Building2,
    Calendar,
    FileText,
    FlaskConical,
    Pill,
    CreditCard,
    Bed,
    UserCog,
    ShieldAlert,
    LogOut
} from 'lucide-react';
import medicoreLogo from '../assets/medicoreLogo.jpg';

interface SidebarProps {
    userRole: Role;
}

interface NavItem {
    label: string;
    path: string;
    icon: React.ReactNode;
    allowedRoles: Role[];
}

export const Sidebar: React.FC<SidebarProps> = ({ userRole }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const navItems: NavItem[] = [
        {
            label: 'Dashboard',
            path: '/dashboard',
            icon: <LayoutDashboard size={18} />,
            allowedRoles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB_STAFF', 'PHARMACIST', 'ACCOUNTANT']
        },
        {
            label: 'Patients',
            path: '/patients',
            icon: <Users size={18} />,
            allowedRoles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB_STAFF', 'ACCOUNTANT']
        },
        {
            label: 'Doctors',
            path: '/doctors',
            icon: <UserCheck size={18} />,
            allowedRoles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB_STAFF', 'PHARMACIST', 'ACCOUNTANT']
        },
        {
            label: 'Departments',
            path: '/departments',
            icon: <Building2 size={18} />,
            allowedRoles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB_STAFF', 'PHARMACIST', 'ACCOUNTANT']
        },
        {
            label: 'Appointments',
            path: '/appointments',
            icon: <Calendar size={18} />,
            allowedRoles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'ACCOUNTANT']
        },
        {
            label: 'Medical Records',
            path: '/medical-records',
            icon: <FileText size={18} />,
            allowedRoles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB_STAFF', 'PHARMACIST']
        },
        {
            label: 'Laboratory',
            path: '/laboratory',
            icon: <FlaskConical size={18} />,
            allowedRoles: ['ADMIN', 'DOCTOR', 'NURSE', 'LAB_STAFF', 'ACCOUNTANT']
        },
        {
            label: 'Pharmacy',
            path: '/pharmacy',
            icon: <Pill size={18} />,
            allowedRoles: ['ADMIN', 'DOCTOR', 'NURSE', 'PHARMACIST', 'ACCOUNTANT']
        },
        {
            label: 'Billing & Invoices',
            path: '/billing',
            icon: <CreditCard size={18} />,
            allowedRoles: ['ADMIN', 'RECEPTIONIST', 'LAB_STAFF', 'PHARMACIST', 'ACCOUNTANT']
        },
        {
            label: 'Admissions',
            path: '/admissions',
            icon: <Bed size={18} />,
            allowedRoles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB_STAFF', 'ACCOUNTANT']
        },


        {
            label: 'Staff Management',
            path: '/staff',
            icon: <UserCog size={18} />,
            allowedRoles: ['ADMIN', 'ACCOUNTANT', 'RECEPTIONIST']
        },
        {
            label: 'Reports & Analytics',
            path: '/reports',
            icon: <FileText size={18} />,
            allowedRoles: ['ADMIN', 'ACCOUNTANT', 'RECEPTIONIST']
        },
        {
            label: 'Audit Logs',
            path: '/audit-logs',
            icon: <ShieldAlert size={18} />,
            allowedRoles: ['ADMIN']
        }
    ];

    const visibleItems = navItems.filter((item) => item.allowedRoles.includes(userRole));

    return (
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed inset-y-0 left-0 z-20">
            {/* Sidebar Brand Header */}
            <Link
                to="/login"
                className="flex items-center gap-3 px-6 py-5 border-b border-slate-800 hover:bg-slate-800/50 transition cursor-pointer"
            >
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10 border border-white/10 p-0.5 flex items-center justify-center shadow-sm shrink-0">
                    <img
                        src={medicoreLogo}
                        alt="MediCore Logo"
                        className="w-full h-full object-contain rounded-lg"
                    />
                </div>
                <div>
                    <h1 className="text-sm font-bold text-white tracking-wide">MediCore HMS</h1>
                    <p className="text-[11px] text-slate-400">Hospital Central Ops</p>
                </div>
            </Link>

            {/* Nav Menu */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {visibleItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition ${isActive
                                ? 'bg-sky-600 text-white font-semibold'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`
                        }
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Sign Out */}
            <div className="p-3 border-t border-slate-800">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition cursor-pointer"
                >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};