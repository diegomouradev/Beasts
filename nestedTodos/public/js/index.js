var utilities = {
    idGenerator: function() {
        var i, randomNumber;
        var id = "";
        for (i = 0; i < 19; i++) {
            randomNumber = (Math.random() * 16) | 0;
            if (i === 8 || i === 12 || i === 16 || i === 20) {id += "-";}
            id += (i === 12 ? 4 : i === 16 ? (randomNumber & 3) | 8 : randomNumber).toString(16);
        }
      return id;
    },
    storageManager: function(namespace, data) {
        if (arguments.length > 1) {
            return localStorage.setItem(namespace, JSON.stringify(data));
        } else {
            var store = localStorage.getItem(namespace);
            return (store && JSON.parse(store)) || [];
        }
    }
};
var App = {
    initialize: function() {
        this.tasks = utilities.storageManager('tasks');
        var tasks = this.tasks;
        window.tasks = tasks;

        this.filter = window.location.hash;

        eventHandler.setupEventListeners();
        eventHandler.router();

    },
    addTask: function(inputValue){
        this.tasks.push({
            id: utilities.idGenerator(),
            value: inputValue,
            completed: false,
            hasChildren: false,
            children: []
        });
    },
    addSubtask: function(parentObjId, subtaskValue, ...theArgs) {
        var array = theArgs[0];
        
        for ( var i = 0; i < array.length; i++) {
            var task = array[i];
            if (task.id === parentObjId) {
                task.children.push({
                    id: utilities.idGenerator(),
                    value: subtaskValue,
                    completed: false,
                    hasChildren: false,
                    children: []
                });
                task.hasChildren = true;
                break;
            } else if (task.hasChildren) {
                var children = task.children;
                this.addSubtask(parentObjId, subtaskValue, children);
            };
        };
    },
    deleteTask: function(parentObjId, ...theArgs) {  
        var array = theArgs[0];
        for(var i = 0; i < array.length; i++) {
            var task = array[i];
            if (task.id === parentObjId) {
                var indexToDelete = array.indexOf(task);
                array = array.splice(indexToDelete, 1);
            } else if (task.hasChildren) {
                var children = task.children;
                this.deleteTask(parentObjId, children);
            };
        };
    },
    editTask: function(parentObjId, editedValue, ...theArgs) {
        var array = theArgs[0];
        for (var i = 0; i < array.length; i++) {
            var task = array[i];
            if ( task.id === parentObjId) {
                task.value = editedValue;
            } else if (task.hasChildren) {
                var children  = task.children;
                this.editTask(parentObjId, editedValue, children);
            };
        }
        
    },
    toggleCompleted: function (parentObjId, ...theArgs) {
        var array = theArgs[0];
        for (var i = 0; i < array.length; i++) {
            var task = array[i];
            if(task.id === parentObjId) {
                task.completed = !task.completed;
                var parentStatus = task.completed;
                if(task.hasChildren) {
                    var children = task.children;
                    this.toggleChildren(children, parentStatus);
                }
            } else if(task.hasChildren) {
                var children = task.children;
                this.toggleCompleted(parentObjId, children);
            };
        };
    },
    toggleChildren: function (children, parentStatus) {
        children.map( function(task) {
            task.completed = parentStatus;
            if(task.hasChildren){
                var children = task.children;
                App.toggleChildren(children, parentStatus); 
            };
        });
    },
    getFilteredTasks: function () {
        var tasks = this.tasks;
        if (this.filter === '   ') {
            return this.getTasksTodo(tasks);
        }
        if (this.filter === '#/completed') {
            return this.getCompletedTasks(tasks);
        }
        return this.tasks;
    },
    getTasksTodo: function (tasks) {
        return tasks.reduce(function filter(acc, task) {
            if (!task.completed) {
                if (task.hasChildren) {
                    var taskNoChildren = {};
                    Object.assign(taskNoChildren, task);
                    taskNoChildren.children = [];
                    acc.push(taskNoChildren);

                    var tasks = task.children;
                    var hasTaskChild = tasks.some( function (childTask) {
                        return !childTask.completed;
                    });

                    if(hasTaskChild) {
                        acc.push(App.getTasksTodo(tasks));
                    }
                    
                } else {
                    acc.push(task);
                }
            } 
            return acc.flat();
        }, []);
    },
    getCompletedTasks: function (tasks) {
        return tasks.reduce(function filter(acc, task) {
            if (task.completed) {
                acc.push(task);
            } else if (!task.completed && task.hasChildren) {
                var tasks = task.children;
                var hasCompletedChild = tasks.some (function(childTask){
                    return childTask.completed;
                });
                if(hasCompletedChild){
                    acc.push(App.getCompletedTasks(tasks));
                }
            }
            return acc;
        }, []);
    },
};
var eventHandler = {
    setupEventListeners: function() {
        var addTaskBtn = document.querySelector(".add-task__btn")
        addTaskBtn.addEventListener('click', this.addTask.bind(this));

        window.addEventListener('hashchange', this.router.bind(this));
        
        var tasksCollection = document.querySelector('.tasks-collection');
        tasksCollection.addEventListener('click', function(e){
            if(e.target.className === "subtask-adding-view__btn") {
                renderInterface.subtaskAddView(e);
            } else if(e.target.className === "add-subtask__btn") {
                eventHandler.addSubtask(e);
            } else if(e.target.className === "subtask-remove-view__btn"){
                renderInterface.subtaskRemoveView(e);
            } else if(e.target.className === "delete-task__btn") {
                eventHandler.deleteTask(e);
            } else if(e.target.className === "edit-task__btn") {
                renderInterface.editTaskAddView(e);
            } else if(e.target.className === "save-edit-task__btn") {
                eventHandler.editTask(e);
            } else if(e.target.className === "edit-task-remove-view__btn") {
                renderInterface.editTaskRemoveView(e);
            } else if(e.target.className === 'toggle') {
                eventHandler.toggleCompleted(e);
            }
        });
    },
    addTask: function(e) {
        var parentContainer = e.target.closest('div');
        var taskInput = parentContainer.querySelector('[name=task-input]');
        var inputValue = taskInput.value.trim();
        App.addTask(inputValue);
        renderInterface.resetInput()
        renderInterface.tasksList();
    },
    addSubtask: function(e) {
        var parentLi = e.target.closest('li');
        var parentObjId = parentLi.id;
        var subtaskInput = parentLi.querySelector('[name=subtask-input]');
        var subtaskValue = subtaskInput.value.trim();
        App.addSubtask(parentObjId, subtaskValue, tasks);
        renderInterface.tasksList();
    },
    deleteTask: function(e) {
        var parentLi = e.target.closest('li');
        var parentObjId = parentLi.id;
        App.deleteTask(parentObjId, tasks);
        renderInterface.tasksList();
    },
    editTask: function(e) {
        var parentLi = e.target.closest('li');
        var parentObjId = parentLi.id;
        var editedValue = parentLi.querySelector('[name=edit-task-input]');
        editedValue = editedValue.value;
        App.editTask(parentObjId, editedValue, tasks);
        renderInterface.tasksList();
    },
    toggleCompleted: function(e) {
        var parentLi = e.target.closest('li');
        var parentObjId = parentLi.id;
        App.toggleCompleted(parentObjId, tasks);
        this.router();
    },
    router: function(e) {
        if(arguments[0] === undefined) {
            var newHash = '#/all';
            window.location.hash = newHash;
        } else {
            var newHash = e.newURL.match(/(\#\/.*)/gi);
            window.location.hash = newHash[0];
        }
        
        App.filter = window.location.hash;
        renderInterface.tasksList();
    }
};

var templateBuilder = {
    taskItems: function(tasks) {
        var template = tasks.map( function(task,i) {

            if(Array.isArray(task)) {
                task = task[0];
            }

            if(task.hasChildren) {
                var templateSubtask = templateBuilder.subtaskItems(task);
            }

            return templateTask = `
            <li id="${task.id}" class="task-list-item ${task.completed ? "completed" : ""}">

                <div class="task-view">
                    <input id="toggle-${task.id}" type="checkbox" class="toggle" ${task.completed ? "checked" : ""}/>
                    <label for="toggle-${task.id}"class="task-value"> ${task.value} </label>
                    <input type="button" value="+" class="subtask-adding-view__btn">
                    <input type="button" value="x" class="delete-task__btn">
                    <input type="button" value="e" class="edit-task__btn">
                </div>

                <div class="subtask-adding-view">
                    <input type="text" name="subtask-input" class="subtask-input" placeholder="Your Subtask goes here!" autofocus>
                    <input type="submit" value="Save" class="add-subtask__btn">
                    <input type="submit" value="Cancel" class="subtask-remove-view__btn">
                </div>

                <div class="edit-task-view">
                    <input type="text" name="edit-task-input" class="edit-task" autofocus>
                    <input type="submit" value="Save" class="save-edit-task__btn">
                    <input type="submit" value="Cancel" class="edit-task-remove-view__btn">
                </div>
                
                ${task.hasChildren ? 
                    `<ul id="collection-${task.id}" class="subtask-collection">
                        ${templateSubtask}
                    </ul>
                </li>
                ` : "</li>"}
            `
        }); 

        template = template.join('');
        renderInterface.tasksCollection(template);

    },
    subtaskItems: function(task) {
        var templateSubtask = task.children.map( function(task) {
            if(task.hasChildren === true) {
                var templateSubtaskOthers = templateBuilder.subtaskItems(task);
            }
            return `
            <li id="${task.id}" class="task-list-item ${task.completed ? "completed" : ""}">
                <div class="task-view">
                    <input id="toggle-${task.id}" type="checkbox" class="toggle" ${task.completed ? "checked" : ""}/>
                    <label for="toggle-${task.id}" class="task-value"> ${task.value} </label>
                    <input type="button" value="+" class="subtask-adding-view__btn">
                    <input type="button" value="x" class="delete-task__btn">
                    <input type="button" value="e" class="edit-task__btn">
                </div>

                <div class="subtask-adding-view">
                    <input type="text" name="subtask-input" class="subtask-input" placeholder="Your Subtask goes here!" autofocus>
                    <input type="submit" value="Save" class="add-subtask__btn">
                    <input type="button" value="Cancel" class="subtask-remove-view__btn">
                </div>

                <div class="edit-task-view">
                    <input type="text" name="edit-task-input" class="edit-task" autofocus>
                    <input type="submit" value="Save" class="save-edit-task__btn">
                    <input type="submit" value="Cancel" class="edit-task-remove-view__btn">
                </div>

                ${task.hasChildren ? 
                    `<ul id="collection-${task.id}" class="subtask-collection">
                        ${templateSubtaskOthers}
                    </ul>
                </li>` : "</li>"}
            `
        });
        templateSubtask = templateSubtask.join('');
        return templateSubtask;
    },
    header: function(tasksToDo) {
        var headerData = {
            filter: App.filter === "" ? App.filter = "#/all" : App.filter,
            tasksToDo: tasksToDo
        }
        var headerTemplate = `
        <h2 class="heading-secondary"> YOU HAVE<span class="tasks-left"> ${headerData.tasksToDo}</span> TASK${ tasksToDo === 1 ? "" : 'S'} LEFT TO DO</h2>
        <ul id="filters">
          <li>
            <a ${headerData.filter === "#/all" ? 'class="selected"' : ""} href="#/all">All</a>
          </li>
          <li>
            <a ${headerData.filter === "#/todo" ? 'class="selected"' : ""} href="#/todo">To Do</a>
          </li>
          <li>
            <a ${headerData.filter === "#/completed" ? 'class="selected"' : ""} href="#/completed">Completed</a>
          </li>
        </ul>
        `
        renderInterface.header(headerTemplate);
    }
};
var renderInterface = {
    tasksList: function () {
        var tasks = App.getFilteredTasks();
        var tasksToDo = App.getTasksTodo(tasks).length;
        templateBuilder.taskItems(tasks);
        templateBuilder.header(tasksToDo);
    },
    subtaskAddView: function(e) {
        var parentLi = e.target.closest('li');
        var addingViewElement = parentLi.querySelector(".subtask-adding-view");
        addingViewElement.classList.add('on');
    },
    subtaskRemoveView: function(e) {
        var parentLi = e.target.closest('li');
        var addingViewElement = parentLi.querySelector(".subtask-adding-view");
        addingViewElement.classList.remove('on');
    },
    editTaskAddView: function(e) {
        var parentLi = e.target.closest('li');
        var addingViewElement = parentLi.querySelector(".edit-task-view");
        var valueForEditInput = parentLi.querySelector("label").innerHTML;
        var addingViewInput = parentLi.querySelector("[name=edit-task-input]");
        addingViewInput.value = valueForEditInput;
        addingViewElement.classList.add('on');
        parentLi.classList.add('editing-on');
        
    },
    editTaskRemoveView: function(e) {
        var parentLi = e.target.closest('li');
        var addingViewElement = parentLi.querySelector(".edit-task-view");
        addingViewElement.classList.remove('on');
        parentLi.classList.remove('editing-on');
    },
    tasksCollection: function(template) {
        var tasksCollection = document.querySelector('.tasks-collection');
        tasksCollection.innerHTML = '';
        tasksCollection.insertAdjacentHTML("beforeend",template);
        this.resetInput();
        utilities.storageManager('tasks', tasks);
    },
    header: function(headerTemplate) {
        var headerElement = document.getElementById('header');
        headerElement.innerHTML = '';
        headerElement.insertAdjacentHTML("beforeend", headerTemplate);
    },
    resetInput: function() {
        var taskInput = document.querySelector('[name=task-input]');
        if (taskInput.value !== '') {
            taskInput.value = "";
        };

        var editTaskInput = document.querySelectorAll('[name=edit-task-input]');
        if (editTaskInput.value !== '') {
            editTaskInput.value = "";
        };
    }
};
App.initialize();