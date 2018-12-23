## Login page

### Display

#### Sign up
  
  - Validate User info
    1. Password must contain special characters & numbers
    2. Email and Password Specifics (length and '@')
    3. ~~Add user if doesn't already exist~~
  - ~~Secure Password storage~~
    1. ~~Hash passwords~~
    2. ~~Create Salt~~
    3. ~~Add hashed pass and salt to db~~
  - Error description boxes
  - Make user get in if no problem with sign up

#### Sign in
  
  - ~~Take info from form~~
  - ~~Build ajax functions to send sign in data~~
  - Service for it server-side
    1. ~~Receive and respond with simple status~~
    2. Validate email and password (length and '@')
    3. ~~Compare them in DB~~
    4. Create & send token
    5. Redirect to another page
  - Error description boxes
  
#### Promocode

  - ~~Take info from form~~
  - ~~Build ajax functions to send promocode data~~
  - Service for it server-side
    1. ~~Receive and respond with simple status~~
    2. Compare them in DB
    3. Redirect to another page
  - Error description
  
### Authentication

  - ~~Password Hash and salt~~
  - DB for tokens
  - ~~Be able to authenticate user when they login~~
  (Give user a token they can use)
    1. ~~Email and pass sent by client~~
    2. ~~they are processed and matched~~
    3. ~~If they were correctly matched send back:~~
      1. ~~an auth object JWT with user_id inside it~~
      2. ~~store it in localStorage in the client and redirect to tts-main-menu~~
      3. ~~get token and userId from localStorage and use it to request tts main menu items~~
  - Database for permissions
  - Refresh Tokens
  - Protect Routes
    1. ~~tts-main-menu~~
    2. ~~tts-details~~
    3. ~~tts-timer~~

### Dashboard
  - Main menu
  
### TTS
  - Main menu
    1. ~~Mockup html~~
      - ~~Create new~~
      - ~~Delete~~
      - ~~Edit~~
    2. ~~Convert to js~~
    3. Replace •stopped with duration (bottom left)

  - Edit TTS
    1. Time setting UX
      - ~~when selected if i press anywhere on the screen it should deselect~~
      - ~~Make keyboard show up on mobile devices~~
      - Support times like 99h99m99s (they do not work at the moment)
    2. Make Design nice
    3. Drag and drop to change order
    4. Delete TTS
      - Ask in a popup if sure
      - ajax delete function
  
### Other Issues

  - Add secret information to environment variables (and not in a stored file)
  - make https work instead of http
  - DB storage of ip addresses (in home_page_visits) is using `varchar(16)`, can be optimized
  - All forms do not submit when I press enter, bcs input is `type="button"` and not `type="submit"`
  - Hashing & Salting password on signup is done synchronously (might slow the server)
  - Verification of JWT can be done as middleware instead of running verify in each route (maybe)
  - In DB I do not update the duration of the whole tts when i change one of the tasks' duration individually
  - I do not check with every request if the user has the right to change the tts or tts task, which would require multiple MySQL requests every time I update a task description or another minor detail (Ask pap for his opinion)