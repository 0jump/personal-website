const gAccessToken = window.localStorage.getItem('access_token');

const gGymAppDOM = _('gym-app');
const gTtsAppDOM = _('tts-app');


ajax.me.makeSureUserIsAuthorized(gAccessToken,(xhr)=> {
    if(xhr.status == 200){
        // Page is loaded
        gTtsAppDOM.onclick = () => {
            window.location.assign("/tts-main-menu");
        }
    } else {
        //console.log(xhr.status);
        window.location.assign("/");
    }
});

