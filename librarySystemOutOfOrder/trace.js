// libraryStorage = {
//   workBlurb: {
//     name: [''],
//     company: [''],
//     callback: function (name, company) {
//       return name + company;
//     }  
//   },
//   name: ['Gordon'],
//   company: ['W&C']
// };

// libraryStorage.workBlurb;


// libraryStorage.workBlurb.name = libraryStorage.name
// libraryStorage.workBlurb.company = libraryStorage.company
// libraryStorage.workBlurb.callback(libraryStorage.workBlurb.name,libraryStorage.workBlurb.company)

// dependencyArr = [];
// let initialValue = 'name';
// let currentValue = 'Gordon';
// dependencyArr.push(currentValue);
// libraryStorage[initialValue] = dependencyArr.reduce( function(initialValue, currentValue) {
//     return currentValue;
// }, initialValue);
// let libraryStorage = {};

// let arr = ['diego','moura'];
// let libName = 'name';
// let callback = function callback(){};

// arr[0]

// let name = {
//     callback: callback,
// }
// name.push(arr[0])

// newName = Object.create(name);
  
// newName.callback;




// libraryStorage.name
// libraryStorage.workBlurb.name = libraryStorage.name
// libraryStorage.workBlurb.name

// IF LIBRARIES ARE LOADED OUT OF ORDER (BEFORE DEPENDENCIES)
(function() {

    var libraryStorage = {};

    function librarySystemOutOfOrder(libName, dependencyArr, callback) {

        if (arguments.length === 1){

            let storedLib = libraryStorage[libName];
            let libNameKeys = Object.getOwnPropertyNames(libraryStorage[libName]);
            let loadedStoredDependency = [];
            libNameKeys.forEach(function(key) {
                if(libraryStorage[key]) {
                    storedLib[key] = libraryStorage[key];
                    loadedStoredDependency.push(storedLib[key]);
                };
            });
            return storedLib.callback.apply(this, loadedStoredDependency);
    
        } else {

            // Check for dependency on dependencyArr.
            // If arguments.length > 1, dependencyArr === true and dependencyArr.length === 0, 
                // Create new dependency parameter on libraryStorage where parameter === callback value.
            if (dependencyArr.length === 0) {
                let initialValue = libName;
                let currentValue = callback();
                dependencyArr.push(currentValue);
                return libraryStorage[libName] = dependencyArr.reduce( function(initialValue, currentValue) {
                    return currentValue;
                }, initialValue);

            } else {
                // Check if all dependencyArr[i] in libraryStorage === true.
                    // If dependencyArr[i] in libraryStorage => loadedDependencyArr.push(libraryStorage[dependencyArr[i]]).
                    // apply loaded dependencies to callback and create loaded library => return libraryStorage[libName] = callback.apply( this, loadedDependencyArr);
                let loadedDependencyArr = [];
                let libNameObj = {};

                for( let i = 0; i < dependencyArr.length; i++){
                    if(!libraryStorage[dependencyArr[i]]) {
                        // If dependencyArr[i] NOT in libraryStorage => create a library object with properties for each of the dependencies.
                        libNameObj[dependencyArr[i]] = dependencyArr[i];
                    }  else {
                        loadedDependencyArr.push(libraryStorage[dependencyArr[i]]);
                    }  ;
                };

                if(loadedDependencyArr.length > 0){
                    return libraryStorage[libName] = callback.apply(this, loadedDependencyArr);
                } else {
                    libNameObj['callback'] = callback;
                    return libraryStorage[libName] = libNameObj;
                };
            };
        };
    };
    window.librarySystemOutOfOrder = librarySystemOutOfOrder;
})();

librarySystemOutOfOrder('workBlurb', ['name', 'company'], function(name, company) {
    return name + ' works at ' + company;
});

librarySystemOutOfOrder('name', [], function() {
    return 'Gordon';
});

 librarySystemOutOfOrder('company', [], function() {
    return 'Watch and Code';
});

librarySystemOutOfOrder('workBlurb');

// IF LIBRARIES ARE LOADED IN ORDER (AFTER DEPENDENCIES)

// librarySystemOutOfOrder('name', [], function() {
//     return 'Gordon';
// });

//  librarySystemOutOfOrder('company', [], function() {
//     return 'Watch and Code';
// });


// let isEqual = librarySystemOutOfOrder('workBlurb', ['name', 'company'], function(name, company) {
//     return name + ' works at ' + company;
// });

// isEqual;

// let iAmEqual = librarySystemOutOfOrder('workBlurb');

// iAmEqual;

// isEqual === iAmEqual