
(function() {
    const pref = localStorage.getItem('theme') || 'light';


    const applyPref = (p) => {
        if (p === 'system' && window.matchMedia) {
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        } else if (p === 'system') {

            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', p);
        }
    };

    applyPref(pref);


    if (pref === 'system' && window.matchMedia) {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        mq.addEventListener('change', () => applyPref('system'));
    }


    window.setPreferredTheme = (p) => {
        localStorage.setItem('theme', p);
        applyPref(p);


        if (p === 'system' && window.matchMedia) {
            const mq2 = window.matchMedia('(prefers-color-scheme: dark)');
            mq2.addEventListener('change', () => applyPref('system'));
        }
    };

    window.getPreferredTheme = () => localStorage.getItem('theme') || 'light';
})();


