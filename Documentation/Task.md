# Philosophy
## One Type Of Task
A **task** is like a folder: it can hold other tasks inside of it, and it can be inside of other tasks. It is represented in the browser with a class: `Task`. This means that a tree of parents, siblings and children tasks is how they are stored.

Each task knows which other task is after it, which one is before it and which task is its parent 

## Root of the Tree: One root task per user
Everything starts with the **root task** of the user. Each user has only one root task. Which is a task that is a parent to all eventual tasks this user. The root task is no different than other tasks in the code. The only difference is that it has no parent task.

The root task is created upon creation of the first ever task. When the user creates a task for the first time, a root task is created for them and the new task is added inside. The root task is never deleted after that, even if the user has deleted every task inside of it.

## Top of the Tree: Actionable Tasks [To be Expanded on]
The Tasks that have no tasks inside of them are meant to hold
1. Title
2.  Resources
3. Action/Completion Trigger

### 2. Resources
Resources can be text and/or media (videos, images, gifs) that are usually used to help the user do the task or explain to them how to do it. (They can be used for any purpose really)

**Example: Gym Routine, Task: *Push Ups***
In this case, it would be useful to have a video where a trainer reminds the user to keep their shoulders pressed together, tighten their abdominal muscles and their glutes.

### 3. Action/Completion Trigger
Every Task has to be done to move on to the next one until there are no more tasks to do. The **completion trigger** is what indicates that the task is done, to move on to the next one. The completion trigger can be:
1. A Simple **"Done"**button
2. The running out of a **countdown**
3. A conditional **"Done"** button
4. A **Skip** button

###### 1. A Simple Done Button
This is just a button that when pressed, indicates the task is done, no conditions apply. 

###### 2. The running out of a countdown
This means the completion of the task depends on a set countdown. This type of completion trigger is used for tasks that have a set amount of time.

###### 3. A conditional Done Button
This Idea is not very well explored. Essentially a conditional button can only be pressed when certain conditions have been fulfilled. 
**Example: Gym Routine, Task *Bench Press***
In this case the user is required to enter the number of repetitions, and the weight they used while performing this exercise. Typically the user has to enter the required information before they can move on to the next task.

###### 4. A Skip Button
This button is there to skip a certain task. Which means that a task was not completed in the way it was supposed to be completed, the user has decided they do not want to do this Task.
**Example: Gym Routine, Task *Bench Press***
In this case the user is required to enter the number of repetitions, and the weight they used while performing this exercise. The user has an injured shoulder and does not want to do the bench press today, they will click on the "skip" button to indicate that this task was not completed in the way it was supposed to.

## The Task Tree
All tasks are part of the **task tree**. Each user has their unique task tree with their **Root Task** at the root, the *file-like* **Actionable Tasks** at the ends of the branches and everything in between is normal *folder-like* **tasks**.

### Order throughout the tree
The tasks are ordered inside the tree. Each Task knows its **previous sibling**, its **next sibling** and its **parent** task. This means that tasks inside a parent task have a certain order. The *first*  task is the task that **does not** a previous sibling. Similarly, the *last* task is the one that **does not** have a next sibling. Knowing that, a sequence is quickly formed where there is a first task, then its next sibling, which has a next sibling of its own... and this keeps going until we arrive at the last task.

