export const getNotificationStorageKey = (email) =>
  `supportpilot.notifications.${email || 'guest'}`;

export const readStoredNotifications = (email) => {
  try {
    const stored = localStorage.getItem(getNotificationStorageKey(email));
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Unable to read stored notifications:', error);
    return [];
  }
};

export const writeStoredNotifications = (email, notifications) => {
  localStorage.setItem(
    getNotificationStorageKey(email),
    JSON.stringify(notifications.slice(0, 50)),
  );
};

export const addStoredNotification = (email, notification) => {
  const notifications = readStoredNotifications(email);
  writeStoredNotifications(email, [notification, ...notifications]);
};
