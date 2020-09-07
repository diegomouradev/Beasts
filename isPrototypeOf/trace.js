let obj = {a: 'a'}; // when we use bracktes to create objects, the prototype is set automatically to the default object prototype.
Object.prototype.isPrototypeOf(obj) // true
Object.isPrototypeOf(obj) // because it was not created with the constructor function.
let obj2 = new Object(obj);
obj2.isPrototypeOf(obj); // False - Because if we use 'new Object(value)' and the value is an object already, it will return the value.
obj2; // return {a: 'a'}, proving obj2 is not based on obj, but a copy of it.
obj2.name = 'shallow'
obj; // return { a: 'a', name: 'shallow' }, showing a shallow copy of obj was made, and changes on obj2 affect obj.
Object.prototype.isPrototypeOf(obj2) // true
Object.getPrototypeOf(obj2); // returns {}
console.log('-----------------------------------------------------------------')
let dog = {
  bark: function() {
    console.log('Woof! Woof!');
  }
};
let dogMia = Object.create(dog);
dogMia.likes = 'sticks';
dogMia.bark(); // dogMia has access to the method on dog.
dog.likes == 'sticks'; // the other way around is not true, dog doen'st have access to the method likes on dogMia.
dog.isPrototypeOf(dogMia) //true - Second link of the prototype chain.
Object.prototype.isPrototypeOf(dog) // true - First link of the prototype chain.
Object.getPrototypeOf(Object.prototype) // null - Base of the prototype chain.
console.log('-----------------------------------------------------------------')
typeof Object.prototype
typeof Object
typeof obj
typeof Object.create
console.log('-----------------------------------------------------------------')
function Dog2(name) { // constructor function, where this is set to the function name.
    this.name = name,
    this.bark = 'Woof!'
};
let dogRamdon = new Dog2(); // new object created using the constructor function.
dogRamdon.bark; // inherits the methods on the object inside the constructor.
dogRamdon;
dogRamdon.legs = 2;
dogRamdon.isAngry = function() {
console.log('bite!')
}
dogRamdon.isAngry();
dogRamdon.name = 'Toto';
dogRamdon;
Object.getPrototypeOf(dogRamdon);
typeof Dog2;
Object.getPrototypeOf(Dog2); // is the default prototype object.
Object.prototype.isPrototypeOf(Dog2); // proving the statement above, not sure why it returns [Function] ???
Object.getPrototypeOf(Dog2.prototype) // it returns the default Object.prototype.
Dog2.prototype.isPrototypeOf(dogRamdon); // If the object is created with a function 
console.log('-----------------------------------------------------------------')
let lulu = new Dog2('Lulu'); // creating new objects passing arguments to the constructor function
lulu;
Object.getPrototypeOf(lulu);