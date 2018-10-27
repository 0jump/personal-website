# Rules and Conventions to Follow in this Project

## MYSQL service functions

### Return statement anatomy

Knowing that `dbservices.js` will usually be called by `server.js`, the server needs to know certain things about what happened with the db to be able to send status and messages to the client to be displayed to the user if necessary, for example the server needs to know

1. The process went as planned, which means the db had no problem saving a new user and the server can send a status code of `200` to the client, which can then display to the user that he has successfully signed up

2. If the process did not go as planned, the server needs to know exactly **exactly** what went wrong. This is because based on what went wrong the server will send to the client that information so they can display - or not - to the user what went wrong. Here are 2 simple examples:

    * The server gets a signup request, the database can return an error with finding a certain table or database, this error is suspicious and might be that a hacker is trying to access the database, so a good thing to return to the client is something without any level of detail, like only the status code `500`, so the client will only display a simple "Error creating account" message.

    * On the other hand if the error from the database is that the email address already exists, this is usually something we want to show the user, so the server can send a more detailed message like `already_exists` to the client, which will then be able to display a message in the UI of the page.


##### Example

```js
    return {
        'error':'db_error', // Type of error
        'error_desc': 'Error while adding new user' // Description that is developer friendly
    };
```

### List of Error Types

#### Internal DB error


