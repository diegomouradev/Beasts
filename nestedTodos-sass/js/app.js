function nestedTodoApp(){
  var ENTER_KEY = 13;
  var ESCAPE_KEY = 27;

  const addTodos = document.querySelector(".new-todo-form")
  var todosCollection = document.querySelector(".todos-collection");

  
  const deleteCompletedTodos = document.querySelector(".footer");

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
      const template = App.todos.map(function(todo) {
        return `<li id="${todo.id}" ${todo.isTodoCompleted ? 'class="completed"' : ""}>
          <div class="todo-container">
            <input class="toggle-todo" type="checkbox" ${todo.isTodoCompleted === true ? "checked" : ""}>
            <label class="todo-value">${todo.todoValue}</label>
            <button class="add-todo"></button>
            <button  class="delete-todo"></button>
          </div>
          <form class="nested-todo-form">
            <input type="text" class="new-nested-todo" name="${todo.id}" placeholder="Let's break it into smaller pieces!" autofocus required>
            <input type="submit" value="+ Add Subtask">
          </form>
          <form class="edit-form">
            <input type="text" class="edit-input-field" name="edit-input" value="${todo.todoValue}" autofocus>
            <input type="submit" value="Updated">
            <input type="submit" value="Never mind!">
          </form>
          <ul id="nested-todo-collection--${todo.id}" class="nested-collection">
          ${todo.haschildren ? '' + Build.todoTemplate(todo.children) + '' : ''}
          </ul>
        </li>`;}).join('');

      todosCollection.insertAdjacentHTML('beforeend', template);
      utilities.localStorageManager("todos", this.todos);
    },
    childrenTemplate: function(todo, todoUlDOMElement) {
    
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
      `<span id="todo-count" class="todoapp-footer__counter">
      <strong>${footerInfo.todosPerCompleteCount}</strong> ${footerInfo.todosPerCompleteWord} left
    </span>
    <ul id="filters" class="todoapp-footer__filters">
      <li> <a ${footerInfo.filter === "all" ? 'class="selected"' : ""} href="#/all">All</a></li>
      <li><a ${footerInfo.filter === "active" ? 'class="selected"' : ""} href="#/active">Active</a></li>
      <li><a ${footerInfo.filter === "completed" ? 'class="selected"' : ""} href="#/completed">Completed</a></li>
    </ul>
    ${footerInfo.completedTodosTotal > 0 ? '<button id="clear-completed">Clear completed</button>' : "" }`;

      footerDomElement.insertAdjacentHTML("beforeend", footerTemplate);
      App.setupEvents();
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

      addTodos.addEventListener('submit', this.createNewTodo.bind(this));

      deleteCompletedTodos.addEventListener('click', function(e) {
        if (e.target.id.toLowerCase() === 'clear-completed') App.deleteCompletedTodos(e);
      });

      todosCollection.addEventListener('change', function(e) {
        if (e.target.className.toLowerCase() === ".toggle-todo") App.toggleTodoCompleted(e);
      });

      todosCollection.addEventListener('dblclick', function(e) {
        if (e.target.tagName.toLowerCase() === 'label' && e.detail === 2) App.setUpdateTodoInterface(e);
      });

      todosCollection.addEventListener('click', function(e) {
        if (e.target.closest(".delete-todo") && e.detail === 1)  App.deleteTodo(e);
      });

      todosCollection.addEventListener("keyup", function(e) {
       if (e.target.className.toLowerCase() === "nested-input-field nested-input-field-on") App.createNewNestedTodo(e);
      });

      todosCollection.addEventListener('submit', function(e) {
        if (e.target.closest(".add-todo") && e.detail === 1)  App.setupNewNestedTodo(e);
      });

      todosCollection.addEventListener('keyup', this.setUpdateEventAttribute.bind(this));

      todosCollection.addEventListener('focusout', function(e) {
        if (e.target.className.toLowerCase() === 'edit-input-field') App.updateTodo(e);
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
        footerDomElement.style.display = "grid";
      } else {
        footerDomElement.style.display = "none";
      }
    },
    createNewTodo: function(e) {
      e.preventDefault();
      const todoInput = document.querySelector('[name=new-todo]');
      var inputValue = todoInput.value;
      
      this.todos.push({
        id: utilities.idGenerator(),
        todoValue: inputValue,
        isTodoCompleted: false,
        hasChildren: false,
        children: []
      });

      Build.todoTemplate();
      document.querySelector('new-todo-form').reset();
      this.renderTodosTemplate();
    },
    setupNewNestedTodo: function(e) {
      var liElement = e.target.closest("li");
      var nestedTodoInputField = liElement.querySelector(".nested-input-field");
      nestedTodoInputField.classList.add("nested-input-field-on");
      
      parentTodo = this.todos[utilities.matchTodoIdWithTodoIndex(e)];
      return;
    },
    createNewNestedTodo: function(e) {
      e.preventDefault();
      const todoInput = document.querySelector('[name=' + '' + new-todo]');
      var inputValue = todoInput.value;
      
      if (e.which !== ENTER_KEY || !nestedTodoValue) {
        return;
      }

      parentTodo.children.push({
        id: utilities.idGenerator(),
        todoValue: nestedTodoValue,
        isTodoCompleted: false,
        hasChildren: false,
        children: []
      });
      
      parentTodo.hasChildren = true;

      nestedTodoInputField.value = '';
      nestedTodoInputField.classList.remove('nested-input-field-on');
      
      this.renderTodosTemplate();
    },
    setUpdateTodoInterface: function(e) {
      var liElement = e.target.closest("li");
      liElement.classList.add("editing-mode-on");
      var updateInputField = liElement.querySelector(".edit-input-field");
      updateInputField.focus();
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
      var todoEditInputElement = e.target;
      var editInputValue = todoEditInputElement.value.trim();

      if (!editInputValue && todoEditInputElement === ".edit-input-field") {
        this.deleteTodo(e);
        return;
      }

      if (todoEditInputElement.getAttribute("abort") === true) {
        todoEditInputElement.setAttribute("abort", false);
      } else {
        this.todos[utilities.matchTodoIdWithTodoIndex(e)].todoValue = editInputValue;
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