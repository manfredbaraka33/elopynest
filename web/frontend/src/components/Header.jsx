

import { useState, useEffect, useRef } from 'react';
import { Sun, Moon, X, Menu, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import { useApi } from '../hooks/useApi'; 
import Notifications from './Notifications'; 
import { requestForToken } from "../firebase";

const Header = () => {
    const { username, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { getData, postData } = useApi();
    const [notifications, setNotifications] = useState([]);

    const [isNotifModalOpen, setNotifModalOpen] = useState(false);
    const dialogRef = useRef(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            return localStorage.getItem('theme') === 'dark';
        }
        return false;
    });

    async function fetchNotifications() {
        try {
            const data = await getData('/notifications/');
            setNotifications(data);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    }  

    const handleMarkAllAsRead = async () => {
        try {
            await postData('/notifications/mark-all-read/');
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark all notifications as read', error);
        }
    };

    const handleNotificationClick = async (notificationId) => {
        try {
            await postData('/notifications/mark-selected-read/', { notification_id: notificationId });
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    };

    useEffect(() => {
        requestForToken();
    }, []);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    useEffect(() => {
        fetchNotifications();
    }, []);

    useEffect(() => {
        if (isNotifModalOpen) {
            dialogRef.current.showModal();
        } else {
            if (dialogRef.current.open) dialogRef.current.close();
        }
    }, [isNotifModalOpen]);

    return (
        <>
            <header
                className="fixed top-0 left-0 w-full bg-gradient-to-r via-yellow-700 from-blue-900 to-indigo-900
                text-white dark:from-gray-800 dark:to-black shadow-md z-[150]"
            >
                <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex flex-col">
                        <Link to="/">
                            <h1 className="text-xl sm:text-2xl font-bold flex items-center">
                                <img
                                    src="/E.png"
                                    alt="ElopyNest Logo"
                                    className="h-9 w-9 rounded-full mr-2 object-cover"
                                />
                                ElopyNest
                            </h1>
                        </Link>
                        <p className="text-sm dark:text-gray-400 text-white">
                            Welcome, {username} 👋
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setNotifModalOpen(true)}
                            aria-label="Open notifications"
                            className="relative"
                        >
                            <Bell size={24} />
                            {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 transition-colors duration-200"
                            aria-label="Toggle dark mode"
                        >
                            {darkMode ? (
                                <Sun size={18} className="text-yellow-400" />
                            ) : (
                                <Moon size={18} className="text-gray-800" />
                            )}
                        </button>
                        <button
                            className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 transition-colors duration-200"
                            onClick={toggleSidebar}
                            aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                        >
                            {isSidebarOpen ? (
                                <X size={24} className="text-black dark:text-white" />
                            ) : (
                                <Menu size={24} className="text-black dark:text-white" />
                            )}
                        </button>
                    </div>
                </div>
            </header>
            <Sidebar
                className="z-[100]"
                onClose={toggleSidebar}
                isSidebarOpen={isSidebarOpen}
                logout={logout}
            />
            <dialog
                ref={dialogRef}
                className="rounded-lg w-96 max-w-full p-0"
                onClose={() => setNotifModalOpen(false)}
                onClick={e => {
                    if (e.target === dialogRef.current) {
                        dialogRef.current.close();
                    }
                }}
            >
                <div className="p-4 relative dark:bg-gray-950 dark:text-white">
                    <button
                        onClick={() => dialogRef.current.close()}
                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        aria-label="Close notifications"
                    >
                        <X size={20} />
                    </button>
                    <h2 className="text-xl font-semibold mb-2">Notifications</h2>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200 mb-4"
                        >
                            Mark All as Read
                        </button>
                    )}
                    <Notifications notifications={notifications} onNotificationClick={handleNotificationClick} />
                </div>
            </dialog>
        </>
    );
};

export default Header;
