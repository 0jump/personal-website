# Permission Types

## no_permission

This is when a user does not have access to a task. They cannot see, edit or give others permission to see or edit it.

## read_only

This is when a user can see a task which means they can also run it. They cannot edit it though.

## read_and_edit

This is when a user can see and edit a task. They can change whatever they want in it, add subtasks, delete subtasks etc...

## can_give_permissions

This is when a user can give permissions to other users. They can for example let a user see the task, but not edit it. They can also stop users that could see it from seeing it.

**[Warning]** What should happen when a user tries to set the permission of someone that has the permission `can_give_permissions`?

# Storage in the Database

## Table: task_permissions

| id               | user_id                                       | task_id                                         | permission_type       | creator_user_id                      | date_created                   |
|------------------|-----------------------------------------------|-------------------------------------------------|-----------------------|--------------------------------------|--------------------------------|
| id of the record | id of the user that the permission applies to | id of the task that this permission applies to  | permission type/level | id of user who gave this permission  | date this permission was given |

## Functions On Permissions In The Database

Functions found in the `dbservices.js` library that are responsible for everything related to getting and setting permissions.

**Note:** records of permission setting are never deleted or updated. When a user's permission is going to be changed, a new record is created. The current permission of a user concerning a certain task is the most recent record created.

### setTaskPermissionForUser

```javascript
db.setTaskPermissionForUser(pTaskId, pPermissionGiverId, pPermissionReceiverId, pTypeOfPermission, callback);
```

The `pPermissionGiverId` grants any permission they want to the `pPermissionReceiverId` as long as they themselves have the permission (`can_give_permissions`) to grant permissions of said task (`pTaskId`).

- `pTaskId`: Task that the permission change is concerning
- `pPermissionGiverId`: the user that is giving the permission
- `pPermissionReceiverId`: the user that the permission is concerning, they will be the one that will be able to read, write or give other people permissions
- `pTypeOfPermission`: Permission type that the `pPermissionGiverId` wishes to grant to `pPermissionReceiverId` on the `pTaskId`
- `callback`: callback function, taking as parameters:
  - `err_type`: string
  - `err_desc`: string
  - `isPermissionGiven`: boolean

### getLastPermissionForTaskAndUser

```javascript
db.getLastPermissionForTaskAndUser(pTaskId, pUserId, callback);
```

Get the permission type of `pUserId` concerning `pTaskId`. It gets the most recent record about said user and said task and returns it, because the last record represents the current permission.

- `pTaskId`: Task to get the permission of
- `pUserId`: User to check the permission of
- `callback`: callback function, taking as parameters:
  - `err_type`: string
  - `err_desc`: string
  - `isPermissionGiven`: boolean

### giveOwnerCanGivePermissionsPermission

```javascript
db.giveOwnerCanGivePermissionsPermission(pUserId, pTaskId, callback);
```

Gives the creator of a certain task the permission `can_give_permissions`. Usually used to let the user use and be able to give other users permissions as they please.

- `pTaskId`: Task to add the permission `can_give_permissions` to
- `pUserId`: User who created the task
- `callback`: callback function, taking as parameters:
  - `err_type`: string
  - `err_desc`: string
  - `isPermissionGiven`: boolean

