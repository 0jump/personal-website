## On Digital Ocean

#### To start server in the background:

1. Go to the folder where server files are stored: `cd ~/personal-website`

2. Start the server with: `pm2 start server.js`

#### To stop the server from running in the background:

1. Make sure you are in the server folder. You can go there by typing `cd ~/personal-website`

2. Stop the server with `pm2 stop server.js`


## MySQL

#### Create User

```sql
ALTER USER 'newuser'@'localhost' IDENTIFIED WITH mysql_native_password BY 'newpassword';
```
We Use `WITH mysql_native_password` to specify the authentication plugin type (which is the old school) because after MySQL 8.04+ the default authentication plugin is `caching_sha2_password` and the problem it is not yet supported by the mysql library for Node Js. 

#### Change user password and/or authentication plugin (to "mysql_native_password")

To change only the password replace `password` with your password and do not put the `WITH mysql_native_password` part in your command.

```sql
ALTER USER 'user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
```

#### Grant all privileges to a user

Grant all privileges (I think rights to read write etc... in db or table

```sql
GRANT ALL PRIVILEGES ON yourdb.yourtable TO 'user'@'localhost';
```
To Grant user all privileges on all databases and tables, replace `yourdb.yourtable` by `* . *`.

```sql
GRANT ALL PRIVILEGES ON * . * TO 'user'@'localhost';
```

#### Always after manipulating users use...

```sql
FLUSH PRIVILEGES;
```

I am not 100% sure what it does, but after being recommended so much especially after privilege-related posts such as when granting privileges to a user and creating users etc, I think that it is some sort of refresh for everything to take effect.

# Certbot

## Renewal

Your cert will expire on `2019-05-31`. 

To obtain a new or tweaked version of this certificate in the future, simply run certbot
again. To non-interactively renew *all* of your certificates, run `certbot renew`