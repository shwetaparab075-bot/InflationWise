const sanitizeUser = (user) => {
  if (!user) return null;
  const obj = typeof user.toJSON === 'function' ? user.toJSON() : { ...user };
  return {
    id: obj._id || obj.id,
    fullName: obj.name || obj.fullName,
    name: obj.name || obj.fullName,
    email: obj.email,
    role: obj.role,
    phone: obj.phone || '',
    dateOfBirth: obj.dateOfBirth || '',
    occupation: obj.occupation || '',
    avatar: obj.avatar || '',
    currency: obj.currency || 'INR',
    notificationPreferences: obj.notificationPreferences || {
      budgetAlerts: true,
      goalAlerts: true,
      emailAlerts: false,
    },
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
};

module.exports = { sanitizeUser };
