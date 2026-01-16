// Utility functions and constants for the application

// Default avatar path constant
const DEFAULT_AVATAR_PATH = '/images/default-avatar.png';

// Get avatar path with fallback to default
const getAvatarPath = (avatarPath) => {
  return avatarPath || DEFAULT_AVATAR_PATH;
};

// Format currency
const formatCurrency = (amount) => {
  return `$${parseFloat(amount).toFixed(2)}`;
};

// Truncate text
const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

module.exports = {
  DEFAULT_AVATAR_PATH,
  getAvatarPath,
  formatCurrency,
  truncateText
};
