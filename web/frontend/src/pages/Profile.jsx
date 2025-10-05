import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header';

const Profile = () => {
    const {username}=useAuth();
  return (
    <div className='pt-14 p-6  mt-7 dark:bg-gray-800 dark:text-white'>
        <Header />
        <h1>My profile</h1>
            <div>
                <span>Username: </span><span>{username}</span>
            </div>
        </div>
  )
}

export default Profile