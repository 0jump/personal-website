let loginBox = _('login-box');

const dPopup = _('popup');
const dPopupExitBtn = _('exit-popup');
const dOverlay = _('overlay');

const dSignInTab = _('login-tab');
const dSignUpTab = _('signup-tab');
const dPromocodeTab = _('promocode-tab');

let clickedTab = '';

// Sign in Tab
dSignInTab.onclick = () => {
    
    if (clickedTab != 'signin'){
        loginBox.innerHTML = `<div class="title-desc-container">
            <h2 class="login-page-title">
                Sign in
            </h2>
            <p class="login-page-desc">
                Sign in to access your web apps.
            </p>
        </div>
        <div class="form-ctr">
            <form action="" method="post">
                <input class="input-field" id="email-input-field" type="text" placeholder="Email Address">

                <input class="input-field" id="pass-input-field" type="password" placeholder="Password">

                <input class="submit-btn" type="button" value="Sign in">
                
            </form>
            <div class="forgot-pass-btn-ctr">
                <button id="forgot-pass-btn">Forgot your password?</button>
            </div>
        </div>`;

        let dForgotPassBtn = _('forgot-pass-btn');
        dForgotPassBtn.onclick = () => {
            dPopup.style.display = 'block';
            dOverlay.style.display = 'block';
        };

        dSignInTab.classList.add('selected-tab');
        dSignUpTab.classList.remove('selected-tab');
        dPromocodeTab.classList.remove('selected-tab');

        clickedTab = 'signin';
    }
}

// Sign Up Tab
dSignUpTab.onclick = () => {
    if (clickedTab != 'signup'){
        loginBox.innerHTML = `<div class="title-desc-container">
            <h2 class="login-page-title">
                Sign up
            </h2>
            <p class="login-page-desc">
                Sign up to access your web apps.
            </p>
        </div>
        <div class="form-ctr">
            <form action="" method="post">
                <div class="dbl-field-ctr">
                    <input class="input-field dbl-field-left" id="first-name-input-field" type="text" placeholder="First Name">
                    <input class="input-field dbl-field-right" id="last-name-input-field" type="text" placeholder="Last Name">
                </div>
                <input class="input-field" id="email-input-field" type="text" placeholder="Email Address">
                <div class="dbl-field-ctr">
                    <input class="input-field dbl-field-left" id="pass-input-field" type="password" placeholder="Password">
                    <input class="input-field dbl-field-right" id="conf-pass-input-field" type="password" placeholder="Confirm Password">
                </div>
                <input class="submit-btn" type="button" value="Sign up">
            </form>
        </div>`;

        dSignInTab.classList.remove('selected-tab');
        dSignUpTab.classList.add('selected-tab');
        dPromocodeTab.classList.remove('selected-tab');
        
        clickedTab = 'signup';
    }
}

// Promo Code Tab
dPromocodeTab.onclick = () => {
    console.log('clicked on promo code tab!');
    if (clickedTab != 'promocode'){
        loginBox.innerHTML = `<div class="title-desc-container">
            <h2 class="login-page-title">
                Welcome
            </h2>
            <p class="login-page-desc">
                Please enter your promocode
            </p>
        </div>
        <div class="form-ctr">
            <form action="" method="post">
                <input class="input-field dbl-field-left" id="first-name-input-field" type="text" placeholder="Promocode">

                <input class="submit-btn" type="button" value="Submit">
            </form>
        </div>`;

        dSignInTab.classList.remove('selected-tab');
        dSignUpTab.classList.remove('selected-tab');
        dPromocodeTab.classList.add('selected-tab');

        clickedTab = 'promocode';
    }
}


// Show popup on "forgot password" button click
/* dForgotPassBtn.onclick = () => {
    dPopup.style.display = 'block';
    dOverlay.style.display = 'block';
}; */

dPopupExitBtn.onclick= () => {
    dPopup.style.display = 'none';
    dOverlay.style.display = 'none';
}