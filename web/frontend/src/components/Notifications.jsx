import { Check, Square } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Notifications({ notifications, onNotificationClick }) {

    const handleClick = (n) => {
        if (!n.read) {
            onNotificationClick(n.id);
        }
    };
    
    return (
        <div>
            {notifications.length === 0 ? (
                <p>No notifications</p>
            ) : (
                <ul>
                    {notifications.map((n) => (
                        <li 
                            className="dark:bg-gray-700 dark:text-white bg-gray-300 rounded-md p-2 my-2 cursor-pointer flex items-center" 
                            key={n.id} 
                            onClick={() => handleClick(n)}
                        >
                           <Link to='/buddy-requests'>
                            <div className="mr-3">
                                {n.read ? (
                                    <Check size={20} className="text-green-500" />
                                ) : (
                                    <Square size={20} className="text-gray-500" />
                                )}
                            </div>
                            <div>
                                {n.body} <br />
                                <hr />
                                {new Date(n.created_at).toLocaleString()}
                            </div>
                           </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}