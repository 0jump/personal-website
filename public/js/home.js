const dForgotPassBtn = _('forgot-pass-btn');
const dPopup = _('popup');
const dPopupExitBtn = _('exit-popup');

// Show popup on "forgot password" button click
dForgotPassBtn.onclick = () => {
    dPopup.style.display = 'block';
};

dPopupExitBtn.onclick= () => {
    dPopup.style.display = 'none';
}