// useNotifications - Custom hook for managing real-time notifications
import { useState, useEffect, useCallback, useRef } from 'react';
import io from 'socket.io-client';
import API_URL from '../config/api';

let socket = null;

export const useNotifications = (userEmail, token) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const pollIntervalRef = useRef(null);

  // Initialize socket connection and listen for notifications
  useEffect(() => {
    if (!userEmail || !token) return;

    // Connect to socket server
    const socketUrl = API_URL.replace('/api', '');
    if (!socket) {
      socket = io(socketUrl, {
        auth: { token },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling']
      });

      console.log('🔌 Socket.io instance created');
    }

    // Join notification room for this user
    const joinRoom = () => {
      if (socket && socket.connected) {
        socket.emit('join-notification-room', userEmail);
        console.log(`✅ Emitted join-notification-room for: ${userEmail}`);
      } else {
        console.log('⏳ Socket not connected yet, retrying...');
        setTimeout(joinRoom, 1000);
      }
    };

    // Listen for incoming notifications
    const handleReceiveNotification = (notification) => {
      console.log('🔔 New notification received via Socket.io:', notification);
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Optional: Show toast notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`${notification.senderName}`, {
          body: notification.message,
          icon: '/favicon.ico'
        });
      }
    };

    // Handle socket connection
    const handleConnect = () => {
      console.log('✅ Socket connected');
      setIsConnected(true);
      joinRoom();
    };

    const handleDisconnect = () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    };

    const handleConnectError = (error) => {
      console.error('❌ Socket connection error:', error);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('receive-notification', handleReceiveNotification);

    // If already connected, join room immediately
    if (socket.connected) {
      console.log('🔄 Socket already connected, joining room...');
      joinRoom();
    }

    // Fetch existing notifications on mount
    fetchNotifications();

    // Start polling as fallback (every 10 seconds)
    // This ensures notifications appear even if Socket.io fails
    const startPolling = () => {
      console.log('📡 Starting notification polling (fallback)...');
      pollIntervalRef.current = setInterval(() => {
        fetchNotifications();
      }, 10000); // Poll every 10 seconds
    };

    startPolling();

    return () => {
      // Cleanup: Stop polling
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }

      // Don't disconnect socket here as it might be used elsewhere
      // Just stop listening to specific events
      if (socket) {
        socket.off('receive-notification', handleReceiveNotification);
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
        socket.off('connect_error', handleConnectError);
      }
    };
  }, [userEmail, token]);

  // Fetch all notifications for the user
  const fetchNotifications = useCallback(async () => {
    if (!userEmail) return;
    
    try {
      const response = await fetch(
        `/api/notifications/${encodeURIComponent(userEmail)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();

      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
        console.log(`📥 Fetched ${data.notifications.length} notifications (${data.unreadCount} unread)`);
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
    }
  }, [userEmail, token]);

  // Mark a notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      console.log(`📍 Marking notification as read: ${notificationId}`);
      
      const response = await fetch(`/api/notifications/read/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Notification marked as read:', data);
        
        // Update local state with the updated notification
        setNotifications(prev => {
          const updated = prev.map(notif =>
            notif._id === notificationId ? { ...notif, isRead: true } : notif
          );
          
          // Calculate new unread count
          const newUnreadCount = updated.filter(n => !n.isRead).length;
          setUnreadCount(newUnreadCount);
          console.log(`📊 New unread count: ${newUnreadCount}`);
          
          return updated;
        });
      } else {
        console.error('❌ Failed to mark notification as read:', response.status);
      }
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  }, [token]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch(`/api/notifications/read-all/${encodeURIComponent(userEmail)}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('❌ Error marking all as read:', error);
    }
  }, [userEmail, token]);

  // Delete a notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev =>
          prev.filter(notif => notif._id !== notificationId)
        );
      }
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
    }
  }, [token]);

  return {
    notifications,
    unreadCount,
    isConnected,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
};

// Function to send a notification (from any component)
export const sendNotificationToUser = async (recipientEmail, type, senderEmail, senderName, entityId, message) => {
  try {
    const response = await fetch('/api/notifications/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipientEmail,
        type,
        senderEmail,
        senderName,
        entityId,
        message
      })
    });

    if (response.ok) {
      console.log('✅ Notification sent');
      return true;
    }
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    return false;
  }
};

export default useNotifications;
