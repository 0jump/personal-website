const dForgotPassBtn = _('forgot-pass-btn');
const dPopup = _('popup');
const dPopupExitBtn = _('exit-popup');
const dOverlay = _('overlay');
// Show popup on "forgot password" button click
dForgotPassBtn.onclick = () => {
    dPopup.style.display = 'block';
    dOverlay.style.display = 'block';
};

dPopupExitBtn.onclick= () => {
    dPopup.style.display = 'none';
    dOverlay.style.display = 'none';
}