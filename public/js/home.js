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
                    this.signInBtn = CDE('input', [['class', 'submit-btn'], ['type', 'submit'], ['value', 'Sign in']]);
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

            this.lNameInputField = CDE('input', [['class',"input-field dbl-field-right"], ['id',"last-name-input-field"], ['type',"text"], ['placeholder', "Last Name"]]);
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

class LoginBoxPromoCode {
    constructor(parentDiv){
        this.titleDescContainer = CDE('div', [['class','title-desc-container']]);
            this.loginPageTitle = CDE('h2', [['class','login-page-title']]);
                this.loginPageTitle.innerText = 'Promocode';
        this.titleDescContainer.appendChild(this.loginPageTitle);

            this.loginPageDesc = CDE('p', [['class','login-page-desc']]);
            this.loginPageDesc.innerText = 'Please enter your promocode.';
        this.titleDescContainer.appendChild(this.loginPageDesc);
        parentDiv.appendChild(this.titleDescContainer);

        this.formCtr = CDE('div', [['class', 'form-ctr']]);
            this.form = CDE ('form', [['action', ''], ['method', 'post']]);
                this.promocodeInputField = CDE('input', [['class', "input-field"], ['id',"promocode-input-field"], ['type',"text"], ['placeholder','Promocode']]);
            this.form.appendChild(this.promocodeInputField);
            this.promocodeBtn = CDE ('input', [['class',"submit-btn"], ['type',"button"], ['value',"Submit"]]);
            this.form.appendChild(this.promocodeBtn);
        this.formCtr.appendChild(this.form);
        parentDiv.appendChild(this.formCtr);
    }
}

class LoginBox {
    constructor(parentDiv){
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

            let userInfo = {};

            this.HTML_signin.signInBtn.onclick = ()=>{
                userInfo.emailAddr = typeof(this.HTML_signin.emailInputField.value) == 'string' && this.HTML_signin.emailInputField.value.trim().length > 0 ? this.HTML_signin.emailInputField.value.trim() : false;
                userInfo.pass = typeof(this.HTML_signin.passInputField.value) == 'string' && this.HTML_signin.passInputField.value.length > 0 ? this.HTML_signin.passInputField.value : false;

                let emptyFields = helpers.checkForKeysWithFalseValues(userInfo);

                // Make all fields display as normal
                let domFields = [this.HTML_signin.emailInputField, this.HTML_signin.passInputField];
                for (let i=0; i < domFields.length; i++){
                    domFields[i].classList.remove('missing');
                }

                // Check for Empty Fields
                if (emptyFields.length != 0){
                    for(let i=0; i < emptyFields.length; i++){
                        switch(emptyFields[i]){
                            case 'emailAddr':
                                // Display that email address is missing
                                console.log('Email is missing');
                                this.HTML_signin.emailInputField.classList.add('missing');
                                break;
                            case 'pass':
                                // Display that password is missing
                                console.log('Password is missing');
                                this.HTML_signin.passInputField.classList.add('missing');
                                break;
                        }
                    }
                } else {
                    // Send User info to server
                    ajax.me.signIn(userInfo.emailAddr, userInfo.pass, (xhr)=> {
                        if (xhr.status == 200){
                            // Save Access token in Local Storage
                            let responseObj = JSON.parse(xhr.response);
                            window.localStorage.setItem('access_token',responseObj.auth.access_token);

                            // Redirect User to tts-main-menu
                            window.location.assign('tts-main-menu');
                        } else {
                            // Display Message According to Status Code and response
                            console.log(xhr.status);
                        }
                    });
                }
            } 
            

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

            this.HTML_signup.signUpBtn.onclick = () => {
                let newUser = {};
                // TODO: Validate this information (e.g. Make sure an email is valid, password conditions etc...)
                newUser.fName = typeof(this.HTML_signup.fNameInputField.value) == 'string' && this.HTML_signup.fNameInputField.value.trim().length > 0 ? this.HTML_signup.fNameInputField.value.trim() : false;
                newUser.lName = typeof(this.HTML_signup.lNameInputField.value) == 'string' && this.HTML_signup.lNameInputField.value.trim().length > 0 ? this.HTML_signup.lNameInputField.value.trim() : false;
                newUser.emailAddr = typeof(this.HTML_signup.emailInputField.value) == 'string' && this.HTML_signup.emailInputField.value.trim().length > 0 ? this.HTML_signup.emailInputField.value.trim() : false;
                newUser.pass = typeof(this.HTML_signup.passInputField.value) == 'string' && this.HTML_signup.passInputField.value.length > 0 ? this.HTML_signup.passInputField.value : false;
                newUser.passConf = typeof(this.HTML_signup.confPassInputField.value) == 'string' && this.HTML_signup.confPassInputField.value.length > 0 ? this.HTML_signup.confPassInputField.value : false;

                // Make sure everything is correct
                // Array to store all invalid fields to send to client to display to the user
                let emptyFields = helpers.checkForKeysWithFalseValues(newUser);
                
                // Make all fields display as normal
                let domFields = [this.HTML_signup.fNameInputField, this.HTML_signup.lNameInputField, this.HTML_signup.emailInputField, this.HTML_signup.passInputField, this.HTML_signup.confPassInputField];
                for (let i=0; i < domFields.length; i++){
                    domFields[i].classList.remove('missing');
                }

                // Check for Empty Fields
                if (emptyFields.length != 0){
                    for(let i=0; i < emptyFields.length; i++){
                        switch(emptyFields[i]){
                            case 'fName':
                                // Display that 1st name is missing
                                console.log('First Name is missing');
                                this.HTML_signup.fNameInputField.classList.add('missing');
                                break;
                            case 'lName':
                                // Display that last name is missing
                                console.log('Last Name is missing');
                                this.HTML_signup.lNameInputField.classList.add('missing');
                                break;
                            case 'emailAddr':
                                // Display that email address is missing
                                console.log('Email is missing');
                                this.HTML_signup.emailInputField.classList.add('missing');
                                break;
                            case 'pass':
                                // Display that password is missing
                                console.log('Password is missing');
                                this.HTML_signup.passInputField.classList.add('missing');
                                break;
                            case 'passConf':                            
                                // Display that passowrd confirmation is missing
                                console.log('Password Confirmation is missing');
                                this.HTML_signup.confPassInputField.classList.add('missing');
                                break;
                        }
                    }
                }else {
                    // Check if password is valid match
                    if(helpers.isValidPassword(newUser.pass)){
                        // Check if password matches confirmation
                        if (newUser.pass == newUser.passConf){
                            ajax.me.createUser(newUser.fName, newUser.lName, newUser.emailAddr, newUser.pass, newUser.passConf, true, (xhr)=>{
                                if (xhr.status == 200){
                                    console.log(xhr.response);
                                } else {
                                    // Display Message According to Status Code and response
                                    console.log(xhr.status);
                                }
                            });
                        } else {
                            // TODO: Msg that pass and conf do not match
                            console.log('Passwords do not Match.');
                            this.HTML_signup.passInputField.classList.add('missing');
                            this.HTML_signup.confPassInputField.classList.add('missing');
                        }
                    } else {
                        // TODO: Msg: 'Make sure your password is 8 characters long.'
                        console.log('Password is less that 8 characters long.');
                        this.HTML_signup.passInputField.classList.add('missing');
                    }
                }
            } 
    
            dSignInTab.classList.remove('selected-tab');
            dSignUpTab.classList.add('selected-tab');
            dPromocodeTab.classList.remove('selected-tab');
            
            clickedTab = 'signup';
        }
    }
    displayPromocode(){
        if (clickedTab != 'promocode'){
            while (this.loginBox.firstChild) {
                this.loginBox.removeChild(this.loginBox.firstChild);
            }
            this.HTML_promocode = new LoginBoxPromoCode(this.loginBox);
            this.HTML_promocode.promocodeBtn.onclick = () => {
                let promocode = typeof(this.HTML_promocode.promocodeInputField.value) == 'string' && this.HTML_promocode.promocodeInputField.value.trim().length > 0 ? this.HTML_promocode.promocodeInputField.value.trim() : false;

                this.HTML_promocode.promocodeInputField.classList.remove('missing');

                if (promocode){
                    // Send Promocode to Server
                    promocode = promocode.toLowerCase(); 

                    ajax.me.submitPromocode(promocode, (xhr) => {
                        if (xhr.status == 200) {
                            console.log(xhr.response);
                        } else {
                            console.log('Status', xhr.status);
                        }
                    });
                } else {
                    this.HTML_promocode.promocodeInputField.classList.add('missing');
                    console.log('Promocode is missing');
                }
            };
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

dPopupExitBtn.onclick= () => {
    dPopup.style.display = 'none';
    dOverlay.style.display = 'none';
}