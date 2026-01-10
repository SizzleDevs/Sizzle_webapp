document.addEventListener('DOMContentLoaded', async () => {
    if (window.isLoggedIn && await window.isAdmin()) {
        const headerIcons = document.querySelector('.header-icons');
        if (headerIcons) {
            const adminLink = document.createElement('span');
            adminLink.className = 'material-symbols-rounded';
            adminLink.textContent = 'admin_panel_settings';
            adminLink.style.cursor = 'pointer';
            adminLink.onclick = () => { window.location.href = 'admin.html'; };
            
            // Insert before the 'person' icon for consistent ordering
            const personIcon = headerIcons.querySelector('span[onclick*="profile.html"]');
            if(personIcon) {
                headerIcons.insertBefore(adminLink, personIcon);
            } else {
                 headerIcons.appendChild(adminLink);
            }
        }
    }
});
