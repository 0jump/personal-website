# Permission Types

## no_permission

This is when a user does not have access to a task. They cannot see, edit or give others permission to see or edit it.

## read_only

This is when a user can see a task which means they can also run it. They cannot edit it though.

## read_and_edit

This is when a user can see and edit a task. They can change whatever they want in it, add subtasks, delete subtasks etc...

## can_give_permissions

This is when a user can give permissions to other users. They can for example let a user see the task, but not edit it. They can also stop users that could see it from seeing it.

**[Warning]** What should happen when a user tries to set the permission of someone that has the permission `can_give_permissions`? (For now it is possible to set the permission of a user who also has `can_give_permissions` permission)

## owner

This is the highest level of permission, granted when a **User Root Task** is created. Which means every task descendant from that is owned by the user who owns the User Root Task by inheritance.

# Explicit vs. Implicit Permission

The **Task Tree** is a hierarchical structure, so descendants of a certain task have the same *or more* permissions. You cannot have a task with worse permission as a descendant of a task with a relatively better permission.

**For example**: Task *A* has `can_edit` permission, while task *B* has `read_only` permission for a certain user. (`can_edit` > `read_only`)
- A is a descendant of B: **Valid**
- B is a descendant of A: **Invalid**

## Explicit Permission

An **"Explicit"** permission is a permission given explicitly by the user to a task. 

#### Example

User **A** wants to share a task with user **B**, **A** gives **B** an *explicit permission* on that task. Now **B** can view/edit (depending on the permission given) this task.

## Implicit/Inherited Permission

An **"Implicit"** or **"Inherited"** permission is the default state of most tasks (except the **User Root Task** that is usually given explicit `owner` permission on creation). This means that when a task is created inside another task, it automatically takes the permission of its **closest ancestor that has an explicit permission**.

#### Example

User **A** wants to share task **T** with user **B**. User **A** gives permission `can_edit` to user **B** on Task **T**. Now any of the two users can add new tasks to task **T**. Any new task created as a subtask of **T** has an **implicit/inherited** permission which is that of the **closest ancestor that has an explicit permission** which in this case is **T** with the permission `can_edit`. 

# Storage in the Database

## Table: task_permissions

| id               | user_id                                       | task_id                                         | permission_type       | creator_user_id                      | date_created                   |
|------------------|-----------------------------------------------|-------------------------------------------------|-----------------------|--------------------------------------|--------------------------------|
| id of the record | id of the user that the permission applies to | id of the task that this permission applies to  | permission type/level | id of user who gave this permission  | date this permission was given |

## Explicit vs. Implicit Permissions

An **explicit permission** is stored as a record in the database. When this explicit permission is to be removed, the record is erased from the table. 

An **implicit permission** is not stored in the database. It is gathered from the **closest ancestor** that has in explicit permission.

**Warning:** this is not the best way to this because there will be no storage of history of actions on permissions. This might be something to look into..

## Functions On Permissions In The Database

Functions found in the `dbservices.js` library that are responsible for everything related to getting and setting permissions.

**Note:** records of permission setting are never deleted or updated. When a user's permission is going to be changed, a new record is created. The current permission of a user concerning a certain task is the most recent record created.

### removePermissionRecord

```javascript
removePermissionRecord(pUserId, pTaskId, callback)
```

Removes record of permission (given to a certain user on a certain task) from the database.

- `pPermissionReceiverId`: Id of the user who is the receiver of the permission
- `pTaskId`: Id of the task that the permission is concerning
- `callback`:

##### Returns (in callback)

`bool isRecordRemoved` that is true if record is succesfully removed and false if not.

### getExplicitTaskPermissionForTaskAndUser

```javascript
getExplicitTaskPermissionForTaskAndUser(pTaskId, pUserId, callback)
```

Gets explicit permission of a specific task for a specific user.

- `pUserId`: Id of the user who is the receiver of the permission
- `pTaskId`: Id of the task that the permission is concerning
- `callback`:

##### Returns (in callback)

`string permissionType` is the type of permission that that task has for that user.  It can be `null` if that task does not have an explicit permission for that user.

### getTaskWithPermissions

```javascript
getTaskWithPermissions(pUserId, pTaskId, callback)
```

Gets the task object (as json object) with its permission type for a specific user.

- `pUserId`: Id of the user who is the receiver of the permission
- `pTaskId`: Id of the task that the permission is concerning
- `callback`:

##### Returns (in callback)

`object taskAndPermissionObj` is an object that has all the attributes of a task (like it is stored in the database, `id`, `next_sibling_id`, `parent_id`, etc...) in addition to the attribute `permission_type` that holds the permission type of that task. This attribute will be `null` if the task has no explicit permission for the user.

### getClosestAncestorWithExplicitPermissionTaskObj

```javascript
getClosestAncestorWithExplicitPermissionTaskObj(pUserId, pTaskId, callback)
```

Gets the task object (as json object) of the closest ancestor that possesses an explicit permission for a specific task and a specific user. The closest ancestor is the task itself if it has an explicit permission for the user.

- `pUserId`: Id of the user who is the receiver of the permission
- `pTaskId`: Id of the task that the permission is concerning
- `callback`:

##### Returns (in callback)

`object taskAndPermissionObj` is an object that has all the attributes of a task (like it is stored in the database, `id`, `next_sibling_id`, `parent_id`, etc...) in addition to the attribute `permission_type` that holds the permission type of that task. This function will return `null` if the task has no ancestors that have an explicit permission for the user.

### getClosestAncestorExplicitPermission

```javascript
getClosestAncestorExplicitPermission(pUserId, pTaskId, callback)
```

Gets only the permission of the closest ancestor that possesses an explicit permission for a specific task and a specific user. The closest ancestor is the task itself if it has an explicit permission for the user.

- `pUserId`: Id of the user who is the receiver of the permission
- `pTaskId`: Id of the task that the permission is concerning
- `callback`:

##### Returns (in callback)

`string permissionType` is the type of permission that that task has for that user.  It can be `null` if that task does not have an explicit permission for that user.

### checkIfUserCanGivePermission

```javascript
checkIfUserCanGivePermission(pUserId, pTaskId, callback)
```

Checks if a certain user can give permission on a certain task. Looks at the closest ancestor that has an explicit permission to see if they have the permission to give permissions to other users.

- `pUserId`: Id of the user who is being checked
- `pTaskId`: Id of the task that the permission is concerning
- `callback`:

##### Returns (in callback)

`bool canGivePermissions` that is true if user can give permission and is false if they cannot.


























------------------------------

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

