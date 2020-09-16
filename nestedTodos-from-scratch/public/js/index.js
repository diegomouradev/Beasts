
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
    },
    getIndexFromId: function(e) {
        var todoId = e.target.closest('li').id;
        var todosIndex = app.todos.length;
        

        while (todosIndex--) {
          if (app.todos[todosIndex].id === todoId) {
            return todosIndex;
          }
        }
    },
    buildPathPush: function(parentId, arr) {
        var indexes = [];

        for( let i = 0; i < arr.length; i++) {
        
            if(parentId === arr[i].id) {
                return i;

            } else if( arr[i].hasChildren === true) {
                indexes.push([i]);
                utilities.buildPathPush(parentId, arr[i].children);
                indexes.push([i]);
            };

        }   
        
        return indexes;
    }
};
var app = {
    initialize: function() {
        this.todos = utilities.storageManager('todos');
        eventHandler.setupEventListeners();
        templateBuilder.todoItems();
    },
    addTodo: function(inputValue){
        
        this.todos.push({
            id: utilities.idGenerator(),
            value: inputValue,
            completed: false,
            hasChildren: false,
            children: []
        });
        
        templateBuilder.todoItems();
    },
    addSubtask: function(path, subtaskValue) {

        this.todos[path[0]].children[path[1]].children.push({
            id: utilities.idGenerator(),
            parentLocation: 'collection-' + this.todos[path[0]].children[path[1]].id,
            value: subtaskValue,
            completed: false,
            hasChildren: false,
            children: []
        });
        
        if(this.todos[path[0]].children[path[1]].hasChildren === false){
            this.todos[path[0]].children[path[1]].hasChildren = !this.todos[path[0]].children[path[1]].hasChildren;
        };
        
        templateBuilder.todoItems();

    }
};
var eventHandler = {
    setupEventListeners: function() {
        var addTodoBtn = document.querySelector(".add-todo__btn")
        addTodoBtn.addEventListener('click', this.addTodo.bind(this));

        var todosCollection = document.querySelector('.todos-collection');
        todosCollection.addEventListener('click', function(e){
            if(e.target.className === "subtask-adding-view__btn") {
                renderInterface.subtaskAddView(e);
            } else if(e.target.className === "add-subtask__btn") {
                eventHandler.addSubtask(e);
            } else if(e.target.className === "subtask-remove-view__btn"){
                renderInterface.subtaskRemoveView(e);
            };
        });

    },
    addTodo: function(e) {
        var todoInput = document.querySelector('[name=todo-input]');
        var inputValue = todoInput.value.trim();
        app.addTodo(inputValue);
    },
    addSubtask: function(e) {
        var parentLi = e.target.closest('li');
        var parentId = parentLi.id;
        var path = utilities.buildPathPush(parentId, app.todos);

        var subtaskInput = parentLi.querySelector('[name=subtask-input]');
        var subtaskValue = subtaskInput.value.trim();
        
        app.addSubtask(path, subtaskValue);
    },
};

var templateBuilder = {
    todoItems: function() {
        var template = app.todos.map( function(todo,i) {

            if(todo.hasChildren === true) {
                var templateSubtask = templateBuilder.subtaskItems(todo);
            }

            return templateTodo = `
            <li id="${todo.id}">
                <div class="todo-view">
                    <input type="checkbox" data-index="${todo.id + i}" id="toggle-${i} ${todo.completed ? "checked" : ""}"/>
                    <label for="toggle-${todo.id + i}"> ${todo.value} </label>
                    <input type="button" value="+ Subtask" class="subtask-adding-view__btn">
                </div>

                <div class="subtask-adding-view">
                    <input type="text" name="subtask-input" class="subtask-input" placeholder="Your Subtask goes here!" autofocus>
                    <input type="submit" value="Save Subtask" class="add-subtask__btn">
                    <input type="submit" value="Cancel" class="subtask-remove-view__btn">
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
            <li id="${todo.id}">
                <div class="todo-view">
                    <input type="checkbox" data-index="${todo.id + i}" id="toggle-${i} ${todo.completed ? "checked" : ""}"/>
                    <label for="toggle-${todo.id + i}"> ${todo.value} </label>
                    <input type="button" value="+ Subtask" class="subtask-adding-view__btn">
                </div>

                <div class="subtask-adding-view">
                    <input type="text" name="subtask-input" class="subtask-input" placeholder="Your Subtask goes here!" autofocus>
                    <input type="submit" value="Save Subtask" class="add-subtask__btn">
                    <input type="submit" value="Cancel" class="subtask-remove-view__btn">
                </div>
                <ul id="collection-${todo.id}" class="subtask-collection"> ${templateSubtaskOthers}</ul>
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
    todoItems: function(template) {
        var todosCollection = document.querySelector('.todos-collection');
        todosCollection.innerHTML = '';
        todosCollection.insertAdjacentHTML("beforeend",template);
        
        this.resetInput();
        utilities.storageManager('todos', app.todos);
    },
    resetInput: function() {
        var todoInput = document.querySelector('[name=todo-input]');
        todoInput.value = '';
    }
};
app.initialize();




