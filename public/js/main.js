// Notification count update
async function updateNotificationCount() {
  try {
    const response = await fetch('/notifications/api/unread-count');
    const data = await response.json();
    const badge = document.getElementById('notification-count');
    if (badge) {
      badge.textContent = data.count;
      badge.style.display = data.count > 0 ? 'block' : 'none';
    }
  } catch (error) {
    console.error('Error updating notification count:', error);
  }
}

// Update notification count on page load
if (document.getElementById('notification-count')) {
  updateNotificationCount();
  // Update every 30 seconds
  setInterval(updateNotificationCount, 30000);
}

// Active navigation highlighting
document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    const href = item.getAttribute('href');
    if (currentPath.startsWith(href) && href !== '/') {
      item.style.backgroundColor = '#2c3e50';
    }
  });
});

// Form validation helpers
function validateForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return true;
  
  const requiredFields = form.querySelectorAll('[required]');
  let isValid = true;
  
  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      isValid = false;
      field.style.borderColor = '#e74c3c';
    } else {
      field.style.borderColor = '#ddd';
    }
  });
  
  return isValid;
}

// Auto-hide alerts after 5 seconds
document.addEventListener('DOMContentLoaded', () => {
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach(alert => {
    setTimeout(() => {
      alert.style.transition = 'opacity 0.5s';
      alert.style.opacity = '0';
      setTimeout(() => alert.remove(), 500);
    }, 5000);
  });
});
