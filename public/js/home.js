let loginBox = _('login-box');

const dPopup = _('popup');
const dPopupExitBtn = _('exit-popup');
const dOverlay = _('overlay');

const dSignInTab = _('login-tab');
const dSignUpTab = _('signup-tab');
const dPromocodeTab = _('promocode-tab');

let clickedTab = '';

class LoginBox {
    constructor(parentDiv){
        this.HTML_signin = `<div class="title-desc-container">
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
        </div>`
        this.HTML_signup = `<div class="title-desc-container">
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
        this.HTML_promocode = `<div class="title-desc-container">
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

        this.loginBox = parentDiv;
    }
    displaySignIn(){
        if (clickedTab != 'signin'){
            this.loginBox.innerHTML = this.HTML_signin;
    
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
    displaySignUp(){
        if (clickedTab != 'signup'){
            this.loginBox.innerHTML = this.HTML_signup;
    
            dSignInTab.classList.remove('selected-tab');
            dSignUpTab.classList.add('selected-tab');
            dPromocodeTab.classList.remove('selected-tab');
            
            clickedTab = 'signup';
        }
    }
    displayPromocode(){
        if (clickedTab != 'promocode'){
            this.loginBox.innerHTML = this.HTML_promocode;
    
            dSignInTab.classList.remove('selected-tab');
            dSignUpTab.classList.remove('selected-tab');
            dPromocodeTab.classList.add('selected-tab');
    
            clickedTab = 'promocode';
        }
    }
}

// Initialize as Sign in 
loginBoxObj = new LoginBox(loginBox);

loginBoxObj.displaySignIn();

// Sign in Tab
dSignInTab.onclick = () => {
    loginBoxObj.displaySignIn();
}

// Sign Up Tab
dSignUpTab.onclick = () => {
    loginBoxObj.displaySignUp();

}

// Promo Code Tab
dPromocodeTab.onclick = () => {
    loginBoxObj.displayPromocode();
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