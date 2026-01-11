document.addEventListener('DOMContentLoaded', async () => {
    console.log('Header script loaded.');
    const loggedIn = window.isLoggedIn();
    console.log('Is logged in:', loggedIn);

    if (loggedIn) {
        const admin = await window.isAdmin();
        console.log('Is admin:', admin);
        if (admin) {
            const headerIcons = document.querySelector('.header-icons');
            if (headerIcons) {
                console.log('Adding admin button to header.');
                const adminLink = document.createElement('span');
                adminLink.className = 'material-symbols-rounded';
                adminLink.textContent = 'admin_panel_settings';
                adminLink.style.cursor = 'pointer';
                adminLink.onclick = () => { window.location.href = 'admin.html'; };
                
                const personIcon = headerIcons.querySelector('span[onclick*="profile.html"]');
                if(personIcon) {
                    headerIcons.insertBefore(adminLink, personIcon);
                } else {
                     headerIcons.appendChild(adminLink);
                }
            }
        }
    }
});
