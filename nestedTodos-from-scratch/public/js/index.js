var utilities = {
    idGenerator: function() {
        var i, randomNumber;
      var id = "";

      for (i = 0; i < 19; i++) {
        randomNumber = (Math.random() * 16) | 0;
        if (i === 8 || i === 12 || i === 16 || i === 20) {
          id += "-";
        }
        id += (i === 12 ? 4 : i === 16 ? (randomNumber & 3) | 8 : randomNumber).toString(
          16
        );
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
        templateBuilder.todoItems();
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
    editTask: function(arr, parentObjId){

    }
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
            }
        });
    },
    addTask: function(e) {
        var parentContainer = e.target.closest('div');
        var todoInput = parentContainer.querySelector('[name=todo-input]');
        var inputValue = todoInput.value.trim();
        App.addTask(inputValue);
        renderInterface.resetInput()
        templateBuilder.todoItems();
    },
    addSubtask: function(e) {
        var parentLi = e.target.closest('li');
        var parentObjId = parentLi.id;
        var subtaskInput = parentLi.querySelector('[name=subtask-input]');
        var subtaskValue = subtaskInput.value.trim();
        var arr = App.todos;
        App.addSubtask(arr, parentObjId, subtaskValue);
        templateBuilder.todoItems();
    },
    deleteTask: function(e) {
        var parentLi = e.target.closest('li');
        var parentLiId = parentLi.id;
        var parentObjId = parentLiId
        var arr = App.todos;
        App.deleteTask(arr, parentObjId);
        templateBuilder.todoItems();
    },
    editTask: function(e) {
        var parentLi = e.target.closes('li');
        var parentLiId = parentLi.id;
        var parentObjId = parentLiId;
        var arr = App.todos;
        App.editTask(arr, parentObjId);
    }
};

var templateBuilder = {
    todoItems: function() {
        var template = App.todos.map( function(todo,i) {
            if(todo.hasChildren === true) {
                var templateSubtask = templateBuilder.subtaskItems(todo);
            }
            return templateTodo = `
            <li id="${todo.id}" class="task-list-item">
                <div class="todo-view">
                    <input type="checkbox" class="toggle" ${todo.completed ? "checked" : ""}"/>
                    <label class="task-value"> ${todo.value} </label>
                    <input type="button" value="+ Subtask" class="subtask-adding-view__btn">
                    <input type="button" value="Delete Task" class="delete-task__btn">
                    <input type="button" value="Edit Task" class="edit-task__btn">
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

                <ul id="collection-${todo.id}" class="subtask-collection">
                    ${templateSubtask}
                </ul>
            </li>
            `
        }); 
        template = template.join('');
        console.log(template)
        renderInterface.todoItems(template);
    },
    subtaskItems: function(todo) {
        var templateSubtask = todo.children.map( function(todo,i) {
            if(todo.hasChildren === true) {
                var templateSubtaskOthers = templateBuilder.subtaskItems(todo);
            }
            return `
            <li id="${todo.id}" class="task-list-item">
                <div class="todo-view">
                    <input type="checkbox" class="toggle" ${todo.completed ? "checked" : ""}"/>
                    <label class="task-value"> ${todo.value} </label>
                    <input type="button" value="+ Subtask" class="subtask-adding-view__btn">
                    <input type="button" value="Delete Task" class="delete-task__btn">
                    <input type="button" value="Edit Task" class="edit-task__btn">
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

                <ul id="collection-${todo.id}" class="subtask-collection"> 
                    ${templateSubtaskOthers} 
                </ul>
            </li>
            `
        });
        templateSubtask = templateSubtask.join('');
        return templateSubtask;
    }
};
var renderInterface = {
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
    todoItems: function(template) {
        var todosCollection = document.querySelector('.todos-collection');
        todosCollection.innerHTML = '';
        todosCollection.insertAdjacentHTML("beforeend",template);
        this.resetInput();
        utilities.storageManager('todos', App.todos);
    },
    resetInput: function() {
        var todoInput = document.querySelector('[name=todo-input]');
        todoInput.value = '';
    }
};
App.initialize();