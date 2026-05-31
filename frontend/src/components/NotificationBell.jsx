// NotificationBell - Component to display notifications
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import useNotifications from '../hooks/useNotifications';

function NotificationBell({ userEmail, token }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications(userEmail, token);
  const [showDropdown, setShowDropdown] = useState(false);
  const [localUnreadCount, setLocalUnreadCount] = useState(0);

  // Update local unread count when notifications change
  useEffect(() => {
    const count = notifications.filter(notif => !notif.isRead).length;
    setLocalUnreadCount(count);
  }, [notifications]);

  // Request browser notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Handle marking notification as read when clicked
  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await markAsRead(notif._id);
    }
  };

  return (
    <div className="relative">
      {/* Bell icon button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-700 hover:text-blue-600 transition"
        title="Notifications"
      >
        <span className="text-xl">🔔</span>
        
        {/* Unread count badge */}
        {localUnreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {localUnreadCount > 9 ? '9+' : localUnreadCount}
          </span>
        )}
      </button>

      {/* Notifications dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-blue-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
            <h3 className="font-bold">Notifications</h3>
            {localUnreadCount > 0 && (
              <button
                onClick={() => {
                  markAllAsRead();
                  toast.success('All marked as read');
                }}
                className="text-sm bg-blue-700 hover:bg-blue-800 px-2 py-1 rounded"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications list */}
          {notifications.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {notifications.map(notif => (
                <div
                  key={notif._id}
                  className={`p-4 hover:bg-gray-50 transition cursor-pointer ${
                    notif.isRead ? 'bg-white' : 'bg-blue-50'
                  }`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  {/* Notification content */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">
                        {notif.senderName}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {/* Unread indicator */}
                    {!notif.isRead && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-1 flex-shrink-0"></div>
                    )}

                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif._id);
                      }}
                      className="text-gray-400 hover:text-red-600 text-lg flex-shrink-0"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>No notifications yet</p>
            </div>
          )}

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-2 rounded-b-lg text-center border-t">
            <button
              onClick={() => setShowDropdown(false)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
