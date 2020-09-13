function nestedTodoApp(){
  var ENTER_KEY = 13;
  var ESCAPE_KEY = 27;
  var inputNewTodo = document.getElementById("new-todo");
  var inputNewNestedTodo = document.getElementById('new-nested-todo');
  var parentTodo;
  var toggleAllTodosCompleted = document.getElementById("toggle-all");
  var deleteCompletedTodos = document.getElementById("footer");
  var todosCollection = document.getElementById("todo-list");
  var footerDomElement = document.getElementById("footer");

  var utilities = {
    idGenerator: function() {
      var i, randomNumber;
      var id = "";

      for (i = 0; i < 32; i++) {
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
    localStorageManager: function (storageName, storageData) {
      if (arguments.length > 1) {
        return localStorage.setItem(storageName, JSON.stringify(storageData));
      } else {
        var storedTodo = localStorage.getItem(storageName);
        return (storedTodo && JSON.parse(storedTodo)) || [];
      }
    },
    matchTodoIdWithTodoIndex: function(e) {
      var todoId = e.target.closest('li').id;
      var todoIndex = App.todos.length;

      while (todoIndex--) {
        if (App.todos[todoIndex].id === todoId) {
          return todoIndex;
        }
      }
    }
  };

  var Build = {
    todoTemplate: function() {
      todosCollection.innerHTML = '';
      App.todos.forEach( function(todo) {
        if(todo.hasChildren === true) {
          var todoTemplate = 
          `<li id="${todo.id}" ${todo.isTodoCompleted ? 'class="completed"' : ""}>
            <div class="view">
              <div class="toggle-container">
              
              <input id="toggle" class="toggle" type="checkbox" ${todo.isTodoCompleted ? "checked" : ""}>
              
              </div>
              <label class="todo-value">${todo.todoValue}</label>
              
              <button class="add-nested-todo"></button>
              <button class="destroy"></button>
            </div>
            <input class="edit" value="${todo.todoValue}">
          </li>`;
          todosCollection.insertAdjacentHTML("beforeend", todoTemplate);
          var todoChildren = Object.entries(todo.children);
          builtChildrenTemplate = 
          todoChildren.forEach(function (child){
            for(let i = 0; i < child.length; i++) {
              if(typeof child[i] === Object) {
                var todoChildrenTemplate = 
                `<li id="${child[i].id}" ${child[i].isTodoCompleted ? 'class="completed"' : ""}>
                <div class="view">
                  <div class="toggle-container">
                  
                  <input id="toggle" class="toggle" type="checkbox" ${child[i].isTodoCompleted ? "checked" : ""}>
                  
                  </div>
                  <label class="todo-value">${child[i].todoValue}</label>
                  
                  <button class="add-nested-todo"></button>
                  <button class="destroy"></button>
                </div>
                <input class="edit" value="${child[i].todoValue}">
              </li>`;
              return todoChildrenTemplate;
              };
            };
            
            todosCollection.insertAdjacentHTML("beforeend", todoChildrenTemplate);
          });
        } else {
          var todoTemplate = 
          `<li id="${todo.id}" ${todo.isTodoCompleted ? 'class="completed"' : ""}>
            <div class="view">
              <div class="toggle-container">
              
              <input id="toggle" class="toggle" type="checkbox" ${todo.isTodoCompleted ? "checked" : ""}>
              
              </div>
              <label class="todo-value">${todo.todoValue}</label>
              
              <button class="add-nested-todo"></button>
              <button class="destroy"></button>
            </div>
            <input class="edit" value="${todo.todoValue}">
          </li>`;
          todosCollection.insertAdjacentHTML("beforeend", todoTemplate);
        }

      });
    },
    footerTemplate: function() {
      var totalTodosCount = App.todos.length;
      var todosPerCompleteCount = App.getTodosPerComplete().length;
      var footerInfo = {
        todosPerCompleteCount: todosPerCompleteCount,
        todosPerCompleteWord: Build.pluralizeTodoCount(todosPerCompleteCount, "item"),
        completedTodosTotal: totalTodosCount - todosPerCompleteCount,
        filter: App.filter
      };

      footerDomElement.innerHTML = "";

      var footerTemplate = 
      `<span id="todo-count"><strong>${footerInfo.todosPerCompleteCount}</strong> ${footerInfo.todosPerCompleteWord} left</span>
        <ul id="filters">
          <li>
            <a ${footerInfo.filter === "all" ? 'class="selected"' : ""} href="#/all">All</a>
          </li>
          <li>
            <a ${footerInfo.filter === "active" ? 'class="selected"' : ""} href="#/active">Active</a>
          </li>
          <li>
            <a ${footerInfo.filter === "completed" ? 'class="selected"' : ""} href="#/completed">Completed</a>
          </li>
        </ul>
          ${footerInfo.completedTodosTotal > 0 ? '<button id="clear-completed">Clear completed</button>' : "" }`;

      footerDomElement.insertAdjacentHTML("beforeend", footerTemplate);
    },
    pluralizeTodoCount: function(todosPerCompleteCount, word) {
      return todosPerCompleteCount === 1 ? word : word + "s";
    }
  };

  var App = {
    initializer: function() {
      this.todos = utilities.localStorageManager('mainTodos');
      
      if(this.todos.length > 0) {
        Build.todoTemplate();
        this.setupEvents();
      } else {
        this.setupEvents();
      };
      
      new Router({
        "/:filter": function(filter) {
          this.filter = filter;
          this.renderTodosTemplate();
        }.bind(this)
      }).init("/all");

    },
    setupEvents: function() {
      inputNewTodo.addEventListener("keyup", this.createNewTodo.bind(this));
      inputNewNestedTodo.addEventListener("keyup", this.createNewNestedTodo.bind(this));
      toggleAllTodosCompleted.addEventListener("change", this.toggleAllTodosCompleted.bind(this));
      deleteCompletedTodos.addEventListener('click', function(e) {
        if (e.target.id.toLowerCase() === 'clear-completed') App.deleteCompletedTodos(e);
      });

      todosCollection.addEventListener('change', function(e) {
        if (e.target.className.toLowerCase() === "toggle") App.toggleTodoCompleted(e);
      });
      todosCollection.addEventListener('click', function(e) {
        if (e.target.className === "destroy" && e.detail === 1)  App.deleteTodo(e);
      });

      todosCollection.addEventListener('click', function(e) {
        if (e.target.className === "add-nested-todo" && e.detail === 1)  App.setupNewNestedTodo(e);
      });

      todosCollection.addEventListener('dblclick', function(e) {
        if (e.target.tagName.toLowerCase() === 'label' && e.detail === 2) App.setUpdateTodoInterface(e);
      });
      todosCollection.addEventListener('keyup', this.setUpdateEventAttribute.bind(this));

      todosCollection.addEventListener('focusout', function(e) {
        if (e.target.className.toLowerCase() === 'edit') App.updateTodo(e);
      });
  
    },
    renderTodosTemplate: function() {
      var allTodos = this.getTodosByCompletionStats();
      var mainDOMElement = document.getElementById("main");
      var toggleAllTodosCompleted = document.getElementById("toggle-all");

      Build.todoTemplate();
      Build.footerTemplate();

      if (allTodos.length > 0) {
        mainDOMElement.style.display = "grid";
      } else {
        mainDOMElement.style.display = "none";
      }
  
      if (this.getTodosPerComplete().length === 0) {
        toggleAllTodosCompleted.checked = true;
      } else {
        toggleAllTodosCompleted.checked = false;
      }
  
      this.renderFooterTemplate();
      inputNewTodo.focus();
    },
    renderFooterTemplate: function() {
      var todosTotalCount = this.todos.length;

      if (todosTotalCount > 0) {
        footerDomElement.style.display = "block";
      } else {
        footerDomElement.style.display = "none";
      }
    },
    createNewTodo: function(e) {
      var newTodoInputField = e.target;
      var newTodoValue = newTodoInputField.value;
      
      if (e.which !== ENTER_KEY || !newTodoValue) {
        return;
      }

      this.todos.push({
        id: utilities.idGenerator(),
        todoValue: newTodoValue,
        isTodoCompleted: false,
        hasChildren: false,
        children: {}
      });

      inputNewTodo.value = '';
      utilities.localStorageManager("todos", this.todos);
      this.renderTodosTemplate();
    },
    setupNewNestedTodo: function(e) {
      inputNewNestedTodo.classList.add("input-nested-todo-editing")
      parentTodo = this.todos[utilities.matchTodoIdWithTodoIndex(e)];
      
    },
    createNewNestedTodo: function(e) {
      var newNestedTodoInputField = e.target;
      var newNestedTodoValue = newNestedTodoInputField.value;
      
      if (e.which !== ENTER_KEY || !newNestedTodoValue) {
        return;
      }

      var newNestedTodo = {
        id: utilities.idGenerator(),
        todoValue: newNestedTodoValue,
        isTodoCompleted: false,
        hasChildren: false,
        children: {}
      }
      parentTodo.children.newNestedTodo = newNestedTodo;
      parentTodo.hasChildren = true;

      inputNewNestedTodo.value = '';
      inputNewNestedTodo.classList.remove('input-nested-todo-editing');
      utilities.localStorageManager("todos", this.todos);
      this.renderTodosTemplate();
    },
    setUpdateTodoInterface: function(e) {
      var todoDOMElement = e.target.closest("li");
      todoDOMElement.classList.add("editing");
      var todoDOMElementInputField = todoDOMElement.querySelector(".edit");
      todoDOMElementInputField.focus();
    },
    setUpdateEventAttribute: function(e) {
      if (e.which === ENTER_KEY) {
        e.target.blur();
      }
  
      if (e.which === ESCAPE_KEY) {
        var setUpdateEventAttribute = e.target;
        setUpdateEventAttribute.setAttribute("abort", true);
        setUpdateEventAttribute.blur();
      }
    },
    updateTodo: function(e) {
      var todoDOMElement = e.target;
      var todoDOMElementValue = todoDOMElement.value.trim();

      if (!todoDOMElementValue && todoDOMElement === "input.edit") {
        this.deleteTodo(e);
        return;
      }

      if (todoDOMElement.getAttribute("abort") === true) {
        todoDOMElement.setAttribute("abort", false);
      } else {
        this.todos[utilities.matchTodoIdWithTodoIndex(e)].todoValue = todoDOMElementValue;
      }

      this.renderTodosTemplate();
    },
    deleteTodo: function(e) {
      this.todos.splice(utilities.matchTodoIdWithTodoIndex(e), 1);
      this.renderTodosTemplate();
    },
    toggleTodoCompleted: function(e) {
      var todoIndex = utilities.matchTodoIdWithTodoIndex(e);
      this.todos[todoIndex].isTodoCompleted = !this.todos[todoIndex].isTodoCompleted;
      this.renderTodosTemplate();
    },
    toggleAllTodosCompleted: function(e) {
      var toggleAllChecked = e.target.checked;

      this.todos.forEach(function(todo) {
        todo.isTodoCompleted = toggleAllChecked;
      });

      this.renderTodosTemplate();
    },
    getTodosPerComplete: function() {
      return this.todos.filter(function(todo) {
        return !todo.isTodoCompleted;
      });
    },
    getCompletedTodos: function() {
      return this.todos.filter(function(todo) {
        return todo.isTodoCompleted;
      });
    },
    getTodosByCompletionStats: function() {
      if (this.filter === "active") {
        return this.getTodosPerComplete();
      }
  
      if (this.filter === "completed") {
        return this.getCompletedTodos();
      }
  
      return this.todos;
    },
    deleteCompletedTodos: function() {
      this.todos = this.getTodosPerComplete();
      this.filter = "all";
      this.renderTodosTemplate();
    }
  };
  App.initializer();
};  
nestedTodoApp();