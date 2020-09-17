/* REQUIREMENTS

It should have a way of adding todos
The user must have a place to type the todo => input field
The user must signal when he/she is finished composing the todo => button
The app must be able to listen to the users signal
The app must be able to get the value of the input the user provided
It should have a way of adding nested todos
It should have a way to cancel the creation of a nested todo
It should have a place to store the added todos => Like an array.
It should be able to store todos in local storage.
It should have a place to store the added nested todo with its parent.
It should be able to display the todos
it should be able to display the nested todo in a way that the is clear who is its parent.
if any pair of parentTodo and childTodo is visible. It should have a way of collapsing all families to their base, and show only the todo who originated the family.
It should be able to hide the nested todos under its parent.
if any parent todo has children hidden under itself. It should have a way of displaying all hidden nested todos.
It should be able to edit a todo
It should be able to edit the nested todo
It should be able to delete a todo
It should be able to delete the nested todo
If the deleted todo has nested todos, it should deleted the nested todos as well
It should be able to mark a todo as completed
It should be able to mark a nested todo completed
If the marked todo has nested todos, it should mark completed the nested todos as well
It should have a way of hidding all todos marked as completed
It should be able to display all the hidden todos
It should have a way of differentiating todos by Id => dynamicaly generated IDs.

*/

tests({
    'It should store todos in an array.': function () {
        var todosArr = App.todos;
        eq(todosArr, App.todos);
        eq(Array.isArray(todosArr), true);
    },
    'It should have a place to input root todo values.': function () {
        var inputRootTodo = document.getElementsByClassName('input-todo');
        eq(typeof inputRootTodo, 'object');
    },
    'It should have a button to initiate the saving process': function () {
        var addBtn = document.getElementsByClassName('add-todo__btn')
        eq();
    },
    'The app must be able to listen to the users signal': function () {
        fail();
        eq();
    },
    'The app must be able to get the value of the input the user provided': function () {
        fail();
        eq();
    },
    'It should have a way of adding nested todos': function () {
        fail();
        eq();
    },
    'It should have a way to cancel the creation of a nested todo': function () {
        fail();
        eq();
    },
    'It should have a place to store the added todos => Like an array.': function () {
        fail();
        eq();
    },
    'It should be able to store todos in local storage.': function () {
        fail();
        eq();
    },
    'It should have a place to store the added nested todo with its parent.': function () {
        fail();
        eq();
    },
    'It should be able to display the todos': function () {
        fail();
        eq();
    },
    'it should be able to display the nested todo in a way that the is clear who is its parent.': function () {
        fail();
        eq();
    },
    'if any pair of parentTodo and childTodo is visible. It should have a way of collapsing all families to their base, and show only the todo who originated the family.': function () {
        fail();
        eq();
    },
    'It should be able to hide the nested todos under its parent.': function () {
        fail();
        eq();
    },
    'if any parent todo has children hidden under itself. It should have a way of displaying all hidden nested todos.': function () {
        fail();
        eq();
    },
    'It should be able to edit a todo': function () {
        fail();
        eq();
    },
    'It should be able to edit the nested todo': function () {
        fail();
        eq();
    },
    'It should be able to delete a todo': function () {
        fail();
        eq();
    },
    'It should be able to delete the nested todo': function () {
        fail();
        eq();
    },
    'If the deleted todo has nested todos, it should deleted the nested todos as well': function() {
        fail();
        eq();
    },
    'It should be able to mark a todo as completed': function() {
        fail();
        eq();
    },
    'It should be able to mark a nested todo completed': function() {
        fail();
        eq();
    },
    'If the marked todo has nested todos, it should mark completed the nested todos as well': function() {
        fail();
        eq();
    },
    'It should have a way of hidding all todos marked as completed': function() {
        fail();
        eq();
    },
    'It should be able to display all the hidden todos': function() {
        fail();
        eq();
    },
    'It should have a way of differentiating todos by Id => dynamicaly generated IDs.': function() {
        fail();
        eq();
    }
});