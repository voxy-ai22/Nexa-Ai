/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useState, useEffect} from 'react';
import Auth from './components/Auth';
import ChatWindow from './components/Chat/ChatWindow';

export default function App() {
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('nexa_current_user');
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const handleLogin = (username: string) => {
    setUser(username);
    localStorage.setItem('nexa_current_user', username);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('nexa_current_user');
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return <ChatWindow currentUser={user} onLogout={handleLogout} />;
}
