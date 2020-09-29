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
        this.todos = utilities.storageManager('todos');
        eventHandler.setupEventListeners();
        templateBuilder.header();

        new Router({
            "/:filter": function(filter) {
              this.filter = filter;
              renderInterface.tasksList();
            }.bind(this)
          }).init("/all");

    },
    addTask: function(inputValue){
        this.todos.push({
            id: utilities.idGenerator(),
            value: inputValue,
            completed: false,
            hasChildren: false,
            children: []
        });
    },
    addSubtask: function(arr, parentObjId, subtaskValue) {
        for ( var i = 0; i < arr.length; i++) {
            var todo = arr[i];
            if (todo.id === parentObjId) {
                todo.children.push({
                    id: utilities.idGenerator(),
                    value: subtaskValue,
                    completed: false,
                    hasChildren: false,
                    children: []
                });
                todo.hasChildren = true;
                break;
            } else if (todo.hasChildren) {
                var children = todo.children;
                this.addSubtask(children, parentObjId, subtaskValue);
            };
        };
    },
    deleteTask: function(arr, parentObjId) {  
        for(var i = 0; i < arr.length; i++) {
            var todo = arr[i];
            if (todo.id === parentObjId) {
                var indexToDelete = arr.indexOf(todo);
                arr = arr.splice(indexToDelete, 1);
            } else if (todo.hasChildren) {
                var children = todo.children;
                this.deleteTask(children, parentObjId);
            };
        };
    },
    editTask: function(arr, parentObjId, editedValue) {
        
        for (var i = 0; i < arr.length; i++) {
            var todo = arr[i];
            if ( todo.id === parentObjId) {
                todo.value = editedValue;
            } else if (todo.hasChildren) {
                var children  = todo.children;
                this.editTask(children, parentObjId, editedValue);
            };
        }
        
    },
    toggleCompleted: function (arr, parentObjId) {
        for (var i = 0; i < arr.length; i++) {
            var todo = arr[i];
            if(todo.id === parentObjId) {
                todo.completed = !todo.completed;
                var parentStatus = todo.completed;
                if(todo.hasChildren) {
                    var children = todo.children;
                    this.toggleChildren(children, parentStatus);
                }
            } else if(todo.hasChildren) {
                var children = todo.children;
                this.toggleCompleted(children, parentObjId);
            };
        };
    },
    toggleChildren: function (children, parentStatus) {
        children.map( function(todo) {
            todo.completed = parentStatus;
            if(todo.hasChildren){
                var children = todo.children;
                App.toggleChildren(children, parentStatus); 
            };
        });
    },
    getFilteredTasks: function () {
        var arr = this.todos;
        
        if (this.filter === 'active') {
            return this.getTasksTodo(arr);
        }

        if (this.filter === 'completed') {
            return this.getCompletedTasks(arr);
        }

        return this.todos;
    },
    getTasksTodo: function (arr) {
        return arr.reduce(function filter(acc, todo) {
            if (!todo.completed) {
                if (todo.hasChildren) {
                    var todoNoChildren = {};
                    Object.assign(todoNoChildren, todo);
                    todoNoChildren.children = [];
                    acc.push(todoNoChildren);

                    var arr = todo.children;
                    var hasToDoChild = arr.some( function (childTodo) {
                        return !childTodo.completed;
                    });

                    if(hasToDoChild) {
                        acc.push(App.getTasksTodo(arr));
                    }
                    
                } else {
                    acc.push(todo);
                }
            } 
            return acc.flat();
        }, []);
    },
    getCompletedTasks: function (arr) {
        return arr.reduce(function filter(acc, todo) {
            if (todo.completed) {
                acc.push(todo);
            } else if (!todo.completed && todo.hasChildren) {
                var arr = todo.children;
                var hasCompletedChild = arr.some (function(childTodo){
                    return childTodo.completed;
                });
                if(hasCompletedChild){
                    acc.push(App.getCompletedTasks(arr));
                }
            }
            return acc;
        }, []);
    },
};
var eventHandler = {
    setupEventListeners: function() {
        var addTaskBtn = document.querySelector(".add-todo__btn")
        addTaskBtn.addEventListener('click', this.addTask.bind(this));
        
        var todosCollection = document.querySelector('.todos-collection');
        todosCollection.addEventListener('click', function(e){
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
        var todoInput = parentContainer.querySelector('[name=todo-input]');
        var inputValue = todoInput.value.trim();
        App.addTask(inputValue);
        renderInterface.resetInput()
        renderInterface.tasksList();
    },
    addSubtask: function(e) {
        var parentLi = e.target.closest('li');
        var parentObjId = parentLi.id;
        var subtaskInput = parentLi.querySelector('[name=subtask-input]');
        var subtaskValue = subtaskInput.value.trim();
        var arr = App.todos;
        App.addSubtask(arr, parentObjId, subtaskValue);
        renderInterface.tasksList();
    },
    deleteTask: function(e) {
        var parentLi = e.target.closest('li');
        var parentLiId = parentLi.id;
        var parentObjId = parentLiId;
        var arr = App.todos;
        App.deleteTask(arr, parentObjId);
        renderInterface.tasksList();
    },
    editTask: function(e) {
        var parentLi = e.target.closest('li');
        var parentLiId = parentLi.id;
        var parentObjId = parentLiId;

        var editedValue = parentLi.querySelector('[name=edit-task-input]');
        editedValue = editedValue.value;

        var arr = App.todos;
        App.editTask(arr, parentObjId, editedValue);
        renderInterface.tasksList();
    },
    toggleCompleted: function(e) {
        var parentLi = e.target.closest('li');
        var parentLiId = parentLi.id;
        var parentObjId = parentLiId;
        var arr = App.todos;
        App.toggleCompleted(arr, parentObjId);
        renderInterface.tasksList();

        // LET'S ADD A RENDER TO HIDE THE ADD SUBTASK, AND EDIT ON TOGGLED ELEMENTS
    }
};

var templateBuilder = {
    todoItems: function(tasks) {
        var template = tasks.map( function(todo,i) {

            if(Array.isArray(todo)) {
                todo = todo[0];
            }

            if(todo.hasChildren) {
                var templateSubtask = templateBuilder.subtaskItems(todo);
            }

            return templateTodo = `
            <li id="${todo.id}" class="task-list-item ${todo.completed ? "completed" : ""}">

                <div class="todo-view">
                    <input id="toggle-${todo.id}" type="checkbox" class="toggle" ${todo.completed ? "checked" : ""}/>
                    <label for="toggle-${todo.id}"class="task-value"> ${todo.value} </label>
                    <input type="button" value="+" class="subtask-adding-view__btn">
                    <input type="button" value="x" class="delete-task__btn">
                    <input type="button" value="e" class="edit-task__btn">
                </div>

                <div class="subtask-adding-view">
                    <input type="text" name="subtask-input" class="subtask-input" placeholder="Your Subtask goes here!" autofocus>
                    <input type="submit" value="Save Subtask" class="add-subtask__btn">
                    <input type="submit" value="Cancel" class="subtask-remove-view__btn">
                </div>

                <div class="edit-task-view">
                    <input type="text" name="edit-task-input" class="edit-task" autofocus>
                    <input type="submit" value="Save" class="save-edit-task__btn">
                    <input type="submit" value="Cancel" class="edit-task-remove-view__btn">
                </div>
                
                ${todo.hasChildren ? 
                    `<ul id="collection-${todo.id}" class="subtask-collection">
                        ${templateSubtask}
                    </ul>
                </li>
                ` : "</li>"}
            `
        }); 

        template = template.join('');
        renderInterface.todosCollection(template);

    },
    subtaskItems: function(todo) {
        var templateSubtask = todo.children.map( function(todo,i) {
            if(todo.hasChildren === true) {
                var templateSubtaskOthers = templateBuilder.subtaskItems(todo);
            }
            return `
            <li id="${todo.id}" class="task-list-item ${todo.completed ? "completed" : ""}">
                <div class="todo-view">
                    <input id="toggle-${todo.id}" type="checkbox" class="toggle" ${todo.completed ? "checked" : ""}/>
                    <label for="toggle-${todo.id}" class="task-value"> ${todo.value} </label>
                    <input type="button" value="+" class="subtask-adding-view__btn">
                    <input type="button" value="x" class="delete-task__btn">
                    <input type="button" value="e" class="edit-task__btn">
                </div>

                <div class="subtask-adding-view">
                    <input type="text" name="subtask-input" class="subtask-input" placeholder="Your Subtask goes here!" autofocus>
                    <input type="submit" value="Save Subtask" class="add-subtask__btn">
                    <input type="button" value="Cancel" class="subtask-remove-view__btn">
                </div>

                <div class="edit-task-view">
                    <input type="text" name="edit-task-input" class="edit-task" autofocus>
                    <input type="submit" value="Save" class="save-edit-task__btn">
                    <input type="submit" value="Cancel" class="edit-task-remove-view__btn">
                </div>

                ${todo.hasChildren ? 
                    `<ul id="collection-${todo.id}" class="subtask-collection">
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
            filter: App.filter,
            tasksToDo: tasksToDo,
        }
        var headerTemplate = `
        <h2 class="heading-secondary"> YOU HAVE<span class="tasks-left"> ${headerData.tasksToDo}</span> TASK${ tasksToDo === 1 ? "" : 'S'} LEFT TO DO</h2>
        <ul id="filters">
          <li>
            <a ${headerData.filter === "all" ? 'class="selected"' : ""} href="#/all">All</a>
          </li>
          <li>
            <a ${headerData.filter === "active" ? 'class="selected"' : ""} href="#/active">Active</a>
          </li>
          <li>
            <a ${headerData.filter === "completed" ? 'class="selected"' : ""} href="#/completed">Completed</a>
          </li>
        </ul>
        `
        renderInterface.header(headerTemplate);
    }
};
var renderInterface = {
    tasksList: function () {
        var tasks = App.getFilteredTasks();
        var tasksToDo = App.getTasksTodo(App.todos).length;
        templateBuilder.todoItems(tasks);
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
    todosCollection: function(template) {
        var todosCollection = document.querySelector('.todos-collection');
        todosCollection.innerHTML = '';
        todosCollection.insertAdjacentHTML("beforeend",template);
        this.resetInput();
        utilities.storageManager('todos', App.todos);
    },
    header: function(headerTemplate) {
        var headerElement = document.getElementById('header');
        headerElement.innerHTML = '';
        headerElement.insertAdjacentHTML("beforeend", headerTemplate);
    },
    resetInput: function() {
        var todoInput = document.querySelector('[name=todo-input]');
        if (todoInput.value !== '') {
            todoInput.value = "";
        };

        var editTodoInput = document.querySelectorAll('[name=edit-task-input]');
        if (editTodoInput.value !== '') {
            editTodoInput.value = "";
        };
    }
};
App.initialize();