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

  - Password Hash and salt
  - DB for tokens
  - Be able to authenticate user when they login
  (Give user a token they can use)
  - Database for permissions
  
  
### Other Issues

  - All forms do not submit when I press enter, bcs input is `type="button"` and not `type="submit"`
  - Hashing & Salting password on signup is done synchronously (might slow the server)
  
  
