# Rules and Conventions to Follow in this Project

This document dictates the rules and conventions to follow when working on this project.

## MYSQL service functions

### Return statement anatomy

Knowing that `dbservices.js` will usually be called by `server.js`, the server needs to know certain things about what happened with the db to be able to send status and messages to the client to be displayed to the user if necessary, for example the server needs to know

1. The process went as planned, which means the db had no problem saving a new user and the server can send a status code of `200` to the client, which can then display to the user that he has successfully signed up

2. If the process did not go as planned, the server needs to know exactly **exactly** what went wrong. This is because based on what went wrong the server will send to the client that information so they can display - or not - to the user what went wrong. Here are 2 simple examples:

    * The server gets a signup request, the database can return an error with finding a certain table or database, this error is suspicious and might be that a hacker is trying to access the database, so a good thing to return to the client is something without any level of detail, like only the status code `500`, so the client will only display a simple "Error creating account" message.

    * On the other hand if the error from the database is that the email address already exists, this is usually something we want to show the user, so the server can send a more detailed message like `already_exists` to the client, which will then be able to display a message in the UI of the page.


#### Example

```js
    return {
        'error':'db_error', // Type of error
        'error_desc': 'Error while adding new user', // Description that is developer friendly
        'result': true
    };
```

### List of Error Types (Field: 'error': )

#### Internal DB error

In Node.JS it is generated from the sql query request, and as far as I know I do not have any control over it. Might be syntax, might be connection lost etc... (I don't really know)

```js
    connection.query(query_isExist, (err, result, fields)=> {
        if (err){ // <--- This type of error
            console.log(err);
            return {
                'error':'db_error',
                'error_desc': 'Error while cheking if new user\'s email already exists',
                'result':false
                };
        }
        return {
            'error':'',
            'error_desc':'',
            'result':true
        };
    );
```

In this case the error field should be `db_error`.

#### Entry trying to Modify/Add already exists

When Trying to modify/add an entry that already exists, The error field should be: `db_error`.


### Error Descriptions

There are no real constraints as long as they are clear and easily point the developer to the problem.

### Result

The `result` field is for what would have been the return, it varies from a function to the next and there are no constraints on it.








