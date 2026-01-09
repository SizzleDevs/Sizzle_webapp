// Notification banners: show temporary banners sliding from top
(function(){
    const containerId = 'top-notification-container';

    function ensureContainer(){
        let c = document.getElementById(containerId);
        if (!c){
            c = document.createElement('div');
            c.id = containerId;
            document.body.appendChild(c);
        }
        return c;
    }

    function createBanner({type='success', title='', message='', code=null, duration=4000}){
        const c = ensureContainer();
        const banner = document.createElement('div');
        banner.className = 'top-banner ' + (type === 'success' ? 'success' : 'error');

        const icon = document.createElement('span');
        icon.className = 'material-symbols-rounded banner-icon';
        icon.textContent = type === 'success' ? 'check_circle' : 'cancel';

        const textWrap = document.createElement('div');
        textWrap.className = 'banner-text';

        const titleEl = document.createElement('div');
        titleEl.className = 'banner-title';
        titleEl.textContent = title || (type === 'success' ? 'Succes' : 'Fout');

        const msgEl = document.createElement('div');
        msgEl.className = 'banner-message';
        msgEl.textContent = message || '';

        if (code){
            const codeEl = document.createElement('span');
            codeEl.className = 'banner-code';
            codeEl.textContent = ' #' + code;
            titleEl.appendChild(codeEl);
        }

        textWrap.appendChild(titleEl);
        textWrap.appendChild(msgEl);

        banner.appendChild(icon);
        banner.appendChild(textWrap);

        c.appendChild(banner);

        // trigger animation
        requestAnimationFrame(()=> banner.classList.add('visible'));

        const remove = ()=>{
            banner.classList.remove('visible');
            banner.addEventListener('transitionend', ()=> banner.remove(), {once:true});
        };

        // Auto-dismiss after duration; no manual close button or click-to-dismiss
        if (duration > 0) setTimeout(remove, duration);
    }

    // Public helpers
    window.notifySuccess = function(message, title='Succes', duration=4000){
        createBanner({type:'success', title, message, duration});
    };

    window.notifyError = function(message, code=null, title='Fout', duration=6000){
        createBanner({type:'error', title, message, code, duration});
    };

    // Monkeypatch the Notification constructor to use banners instead
    try{
        if ('Notification' in window){
            const Original = window.Notification;
            function BannerNotification(title, options){
                options = options || {};
                const body = options.body || '';
                const data = options.data || {};
                const status = data.status || options.status || null;
                const lowered = (title + ' ' + body).toLowerCase();
                const isError = status || lowered.includes('error') || lowered.includes('fout');
                if (isError){
                    window.notifyError(body || title, status || null, title);
                } else {
                    window.notifySuccess(body || title, title);
                }
                // emulate basic Notification API fields
                this.title = title;
                this.options = options;
            }
            BannerNotification.requestPermission = function(cb){
                if (cb) cb('granted');
                return Promise.resolve('granted');
            };
            BannerNotification.permission = 'granted';
            window.Notification = BannerNotification;
            window.Notification.Original = Original;
        }
    }catch(e){
        // noop
        console.error('Could not override Notification', e);
    }

})();
