import React from 'react';

const LeaderboardList = ({ data, activeTab }) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
        return (
            <div className="text-center text-gray-500 p-6">
                No leaderboard data to display.
            </div>
        );
    }

    return (
        <ul className="space-y-4">
            {data.map((item, index) => (
                <li key={item.id} className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <span className="text-xl font-bold w-8 text-center">{index + 1}</span>
                        <span className="text-lg font-semibold">{item.user?.username}</span>
                    </div>
                    
                    <span className="text-xl font-bold text-blue-600">
                        {activeTab === 'general'
                            ? `${item.xp} XP`
                            : item.streak === 0
                                ? 'No Streak'
                                : item.streak === 1
                                    ? `${item.streak} Day`
                                    : `${item.streak} Days`
                        }
                    </span>
                </li>
            ))}
        </ul>
    );
};

export default LeaderboardList;