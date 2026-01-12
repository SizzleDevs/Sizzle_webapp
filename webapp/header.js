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

    // Ensure AI Chef icon exists on every header (don't duplicate)
    const headerIcons = document.querySelector('.header-icons');
    if (headerIcons && !headerIcons.querySelector('span[onclick*="ai-chef.html"]')) {
        const aiLink = document.createElement('span');
        aiLink.className = 'material-symbols-rounded';
        aiLink.textContent = 'auto_awesome';
        aiLink.style.cursor = 'pointer';
        aiLink.onclick = () => { window.location.href = 'ai-chef.html'; };
        // Prefer inserting before the About/Info icon when present
        const infoIcon = headerIcons.querySelector('span[onclick*="about.html"]');
        const personIcon2 = headerIcons.querySelector('span[onclick*="profile.html"]');
        if (infoIcon) {
            headerIcons.insertBefore(aiLink, infoIcon);
        } else if (personIcon2) {
            headerIcons.insertBefore(aiLink, personIcon2);
        } else {
            headerIcons.appendChild(aiLink);
        }
    }

    // Set/reset the active 'filled' state for the AI icon so it highlights like other header icons
    if (headerIcons) {
        const aiIcon = headerIcons.querySelector('span[onclick*="ai-chef.html"]') || Array.from(headerIcons.querySelectorAll('span.material-symbols-rounded')).find(s => s.textContent.trim() === 'auto_awesome');
        if (aiIcon) {
            if (window.location.href.includes('ai-chef.html') || window.location.pathname.endsWith('/ai-chef.html')) {
                aiIcon.classList.add('filled');
            } else {
                aiIcon.classList.remove('filled');
            }
        }
    }
});
