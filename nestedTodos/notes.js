'----------------------------------------------------'
'-------------------Nested Todos---------------------'
'----------------------------------------------------'
// Our todo list in todoMVC is composed of one <ul> element
// that stores our todos in <li> elements.
// We could represent it like so:

// todoCollection <ul>
  // Work <li>
  // Fun <li>
  
// Note that in the todoMVC implementation we only have one
// todoCollection, what makes for its naming or differentiation
// irrelevant.
  
// If we want to add a layer of nesting to the tasks above,
// we would follow the same structure, and have the following:

// todoCollection <ul>
  // Work <li>
    // todoCollection <ul>
      // Give feedback to clients <li>
  // Fun <li>
    // todoCollection <ul>
      // Call Sarah about Dinner <li>
      
// Note that different from the first example. The nested <ul>,
// also need differentiation as they may be multiple. So, the example
// above would look like this:

// todoCollectionMainTodos <ul>
  // Work <li>
    // todoCollectionWork <ul>
      // Give feedback to clients <li>
  // Fun <li>
    // todoCollectionFun <ul>
      // Call Sarah about Dinner <li>
      

// Differentiating the <ul> makes sense, as by nature the tasks
// inside them in <li>s, directly relate to the the <ul> element.
// We could keep adding nested <ul>s with their respective <li> items
// for as much as it's needed.
'----------------------------------------------------'
'-------------------Todo APP-------------------------'
'--------------------Store---------------------------'
// If we look at the very first thing the App does when loaded,
// it's running the method Init, and calling the method store.

store: function(namespace, data) {
    // the first part of the method save new todos in localStorage.
    if (arguments.length > 1) {
      return localStorage.setItem(namespace, JSON.stringify(data));
      // the second part retrieves todos from LocalStorage on Init.
    } else {
     var store = localStorage.getItem(namespace);
      return (store && JSON.parse(store)) || [];
    }
}

// Let's dissect the second part, as if we are starting the app for the first
// time, or returning to the page, that's the part that will be runned by 
// when store is called by Init.

  // Since the method is called only with the argument 'namespace'
    // it sets the var store, who will store the item from LocalStorage
    // if there are any items stored. It also JSON.parse(store), to turn 
    // it back into an Object, and returns it.
    // If no items are find it returns an empty array, for us to fill
    // with todos. (see first part)
  
// Let's dissect the first part. When is it triggered?

// User create a todo by pressing Enter
  // Triggers the event listener 'onKeyUp', which is set up on the bindEvents 
  // method, who then calls on the create method.
    // Create checks to see if the ket is indeed Enter, and push a new object,
    // to the returned store or empty array.
    // Inside the object, on the parameter id the method uuid() from the
    // object util is called, and return a random string of numbers and letters
    // to serve as the unique identification for this todo task. Last, create calls 
    // the render method to update the DOM. (Note that up until here, the todo task 
    // is not on local storage.)
      // The render method perform many operations not relevant to this part we 
      // dissect here, and in it's last line is when render calls util.store,
      // passing the namespace, and the object created by create to be stored on 
      //local storage.

// User edit a todo by double-clicking the item

// User delete a todo by clicking the delete button
'----------------------------------------------------'
'-------------------Todo APP-------------------------'
'--------------------Workflowy-------------------------'

// onStart input field is focused.
  // Type the task and hit enter to save it.
    // The <li> created takes the place of the input field,
    // and the input field is pushed below, empty and focused,
    // waiting for the task number 2.

// We could represent the above, like so.

// onStart
  // todoCollection <ul>
  // <empty>
  // todoCollection </ul>
  // (    ) <input field>

// The above representation shows that the input field is always
// positioned below the <ul>, what changes, is that it gets displayed 
// when it's populated with tasks. Maybe a simple matter of using, flexbox +
// column orientation + position the input field at flex-end.

// Task typed and saved
  // todoCollection <ul>
  // <li> Work </li>
  // todoCollection </ul>
  // (    ) <input field>
 
// If we hit TAB while an <li> task is focused, it would trigger the creation
// of a new collection nested under that <li>. Like so:

  // todoCollection <ul>
  // Work <li>
    // todoCollection <ul>
    // <li> Call clients </li>
    // todoCollection </ul>
    // (    ) <input field>
      // </li>
  // todoCollection </ul>
  // (    ) <button addTodo>

// PLAYING WITH LOCALSTORAGE ON THE CONSOLE

var task1 = {id: 'task1', value: 'I am on storage 1', completed: false}
var task2 = {id: 'task2', value: 'I am on storage 2', completed: false};

var todosStorage1 = [];
var todosStorage2 = [];

todosStorage1.push(task1);
todosStorage2.push(task2);

function storageManager(namespace, data) {
  if(arguments > 1) {
    return localStorage.setItem(namespace, JSON.stringify(data));
  } else {
    var storeTodos = localStorage.getItem(namespace);
    return (storeTodos && JSON.parse(storeTodos)) || [];
  }
  
}
storageManager('mainTodos', todosStorage1);
storageManager('nestedTodos', todosStorage2);


var todosFromStorage1 = storageManager('mainTodos');
// "[object Object]"
// It only accepts strings. That's why we have to stringfy.