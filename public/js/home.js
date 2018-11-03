let loginBox = _('login-box');

const dPopup = _('popup');
const dPopupExitBtn = _('exit-popup');
const dOverlay = _('overlay');

const dSignInTab = _('login-tab');
const dSignUpTab = _('signup-tab');
const dPromocodeTab = _('promocode-tab');

let clickedTab = '';

class LoginBoxSignIn {
    constructor(parentDiv){
            this.titleDescContainer = CDE('div', [['class','title-desc-container']]);
                this.loginPageTitle = CDE('h2', [['class','login-page-title']]);
                    this.loginPageTitle.innerText = 'Sign in';
            this.titleDescContainer.appendChild(this.loginPageTitle);

                this.loginPageDesc = CDE('p', [['class','login-page-desc']]);
                this.loginPageDesc.innerText = 'Sign in to access your web apps.';
            this.titleDescContainer.appendChild(this.loginPageDesc);
        parentDiv.appendChild(this.titleDescContainer);
            this.formCtr = CDE('div', [['class', 'form-ctr']]);
                this.form = CDE ('form', [['action', ''], ['method', 'post']]);
                    this.emailInputField = CDE('input', [['class', 'input-field'], ['id','email-input-field'], ['type', 'text'], ['placeholder', 'Email Address']]);
                this.form.appendChild(this.emailInputField);
                    this.passInputField = CDE('input', [['class', 'input-field'], ['id','pass-input-field'], ['type', 'password'], ['placeholder', 'Password']]);
                this.form.appendChild(this.passInputField);
                    this.signInBtn = CDE('input', [['class', 'submit-btn'], ['type', 'button'], ['value', 'Sign in']]);
                this.form.appendChild(this.signInBtn);    
                this.formCtr.appendChild(this.form);

                this.forgotPassBtnCtr = CDE('div', [['class', 'forgot-pass-btn-ctr']]);
                    this.forgotPassBtn = CDE('button', [['id','forgot-pass-btn']]);
                        this.forgotPassBtn.innerText = 'Forgot your password?';
                    this.forgotPassBtnCtr.appendChild(this.forgotPassBtn);
                this.formCtr.appendChild(this.forgotPassBtnCtr);
            
        parentDiv.appendChild(this.formCtr);
    }
}

class LoginBoxSignUp {
    constructor(parentDiv){
        this.titleDescContainer = CDE('div', [['class','title-desc-container']]);
        this.loginPageTitle = CDE('h2', [['class','login-page-title']]);
            this.loginPageTitle.innerText = 'Sign up';
    this.titleDescContainer.appendChild(this.loginPageTitle);

        this.loginPageDesc = CDE('p', [['class','login-page-desc']]);
        this.loginPageDesc.innerText = 'Sign up to access your web apps.';
    this.titleDescContainer.appendChild(this.loginPageDesc);
    parentDiv.appendChild(this.titleDescContainer);

    this.formCtr = CDE('div', [['class', 'form-ctr']]);
    this.form = CDE ('form', [['action', ''], ['method', 'post']]);
        this.dblFieldCtrNames = CDE('div', [['class', 'dbl-field-ctr']]);
            this.fNameInputField = CDE('input', [['class',"input-field dbl-field-left"], ['id',"first-name-input-field"], ['type',"text"] ,['placeholder',"First Name"]]);
            this.dblFieldCtrNames.appendChild(this.fNameInputField);

            this.lNameInputField = CDE('input' [['class',"input-field dbl-field-right"], ['id',"last-name-input-field"], ['type',"text"], ['placeholder', "Last Name"]]);
            this.dblFieldCtrNames.appendChild(this.lNameInputField);
        this.form.appendChild(this.dblFieldCtrNames);

        this.emailInputField = CDE('input', [['class', "input-field"], ['id',"email-input-field"], ['type',"text"], ['placeholder',"Email Address"]]);
        this.form.appendChild(this.emailInputField);

        this.dblFieldCtrPasswords = CDE('div' ,[['class', "dbl-field-ctr"]]);
            this.passInputField = CDE('input', [['class',"input-field dbl-field-left"], ['id',"pass-input-field"], ['type',"password"], ['placeholder',"Password"]]);
            this.dblFieldCtrPasswords.appendChild(this.passInputField);

            this.confPassInputField = CDE('input', [['class', "input-field dbl-field-right"], ['class',"input-field dbl-field-right"],['id',"conf-pass-input-field"], ['type',"password"], ['placeholder',"Confirm Password"]]);
            this.dblFieldCtrPasswords.appendChild(this.confPassInputField);
        this.form.appendChild(this.dblFieldCtrPasswords);

        this.signUpBtn = CDE ('input', [['class',"submit-btn"], ['type',"button"], ['value',"Sign up"]])
        this.form.appendChild(this.signUpBtn);
    this.formCtr.appendChild(this.form);

    parentDiv.appendChild(this.formCtr);
    }
}
class LoginBox {
    constructor(parentDiv){
        
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
            while (this.loginBox.firstChild) {
                this.loginBox.removeChild(this.loginBox.firstChild);
            }

            this.HTML_signin = new LoginBoxSignIn(this.loginBox);

            this.HTML_signin.forgotPassBtn.onclick = () => {
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
            while (this.loginBox.firstChild) {
                this.loginBox.removeChild(this.loginBox.firstChild);
            }

            this.HTML_signup = new LoginBoxSignUp(this.loginBox);
    
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

    ajax.me.createUser('Gerard', 'Antoun', 'gerard.antoun@yahoo.com', '127yhd90', '127yhd90', true, (xhr)=>{
        if (xhr.status == 200){
            console.log(xhr.response);
        } else {
            console.log(xhr.status);
        }
    });

}

// Promo Code Tab
dPromocodeTab.onclick = () => {
    loginBoxObj.displayPromocode();
}

dPopupExitBtn.onclick= () => {
    dPopup.style.display = 'none';
    dOverlay.style.display = 'none';
}