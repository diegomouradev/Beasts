// let integerOne = 1.005;
// integerOne.toFixed(2);
// console.log('----------------------------------------------------')
// console.log('----------------Should return "1.01"----------------')
// console.log('----------------------------------------------------')
// console.log('Step 1 = integerOne * 100')
// integerOne = integerOne * 100; 
// console.log('Step 2 = integerOne.toFixed(2)')
// integerOne = integerOne.toFixed(2);
// console.log('Step 3 = Math.round()')
// integerOne = Math.round(integerOne);
// console.log('Step 4 = / 100')
// integerOne = integerOne / 100;
// console.log('Step 5 = .toFixed(2) again')
// integerOne = integerOne.toFixed(2);
// console.log('----------------------------------------------------')
// console.log('---------Return the correct result "1.01"-----------')
// console.log('----------------------------------------------------')
// console.log('----------------------------------------------------')
// console.log('--How to achieve the same with string manupulation?-')
// console.log('----------------------------------------------------')
// let example1 = '1.005';
// let example2 = '0.635';
// let example3 = '10.235';
// // If we observe step 1 to 2 in examples above. What is happening 
// // is just a shift in the decimal notation. 
// // Given the examples above. 
// // If we passed them through the steps, we would have the following:
// // Step 1 = integerOne * 100.
// console.log('Step 1 = integerOne * 100')
// example1 = example1 * 100;
// example2 = example2 * 100;
// example3 = example3 * 100;
// console.log('Step 2 = integerOne.toFixed(2)')
// example1 = example1.toFixed(2);
// example2 = example2.toFixed(2);
// example3 = example3.toFixed(2);
// // What proves that by just moving the decimal notation we eliminate 
// // those calculations and we can achieve the result up to this point 
// // with string manipulation.
// '----------------------------------------------------'
// '---------------------Rounding-----------------------'
// '----------------------------------------------------'
// // If the number to the right of the dot is >= 5.
//     // Increase the number left of the '.' by 1.
//     // And set all number right of the '.' to 0.
// // '101.00'
// // '64.00'
// // '1024.00'
// console.log('Step 3 = Math.round()')
// example1 = Math.round(example1);
// example2 = Math.round(example2);
// example3 = Math.round(example3);
// // The example shows that in addition to setting the numbers right
// // of the '.' to 0, we can also delete them.
//   // '101.'
//   // '64.'
//   // '1024.'  
// // Note that if the number to the right of the dot is < 5.
//     // We can just delete the numbers right of the '.',
//     // and the rounding down will be complete.
// '----------------------------------------------------'
// '----------------Cases where we have 9---------------'
// '----------------------------------------------------'
// // I noticed that the rounding cases above, might behave differentely
// // in case we have 9 to the left of of the '.' and possibily, in 
// // other positions. 
// // Examples:
//   // '109.50' => '110.00'
//   // '69.50' => '70.00'
//   // '1029.50' => '1030.00'
// // In the cases where we have 9 to the left of the '.' the logic 
// // remains the same, but since adding 1 to 9 results in 10. We
// // substitute the 9 for the 0, and increase the number to the
// // left of nine by 1.
// // Example:
//   // '199.50' => '200.00'
// // Note that the nine rule applies as long as we have 9, to 
// // the left of another 9.
// '----------------------------------------------------'
// '-------------Adding the Decimal Notation------------'
// '----------------------------------------------------'
// // Adding back the decimal notation, is a matter to moving the
// // '.' according to the decimal notation specified in the parameters
// // of the function. In this case we assume it's 2.
//   // '1.01'
//   // '.64'
//   // '10.24'
// // Note that in the case of the '.' not ending up in between numbers
// // like in the example2, the 0 must be added before returning the result.
//   // '0.64'
// // Also notice. That if the function is invoke, with the decimal notation > 
// // then the initial value of the integer. 0s will be added to the right of the
// // the last number after the '.', like in the example bellow.
//   // integerOne = integerOne.toFixed(3);
//   // result => '1.010'
'----------------------------------------------------'
'-------------------Implementation-------------------'
'----------------------------------------------------'
// First step: Move the '.' using regexp, replace.
  //Example:
  // /([^\w])(\d{2}(?=\d))/g
let integer = '1.005'.replace(/([^\w])(\d{2}(?=\d))/g, '$2$1');
// Second step:
  // If number to the right of the '.' is > 5
  // and number to the left is < 9
  // Take the number to the left and increase by 1.
      // We can achieve that by creating a function.
function increaseByOne(integer) {
  function increaseMatch(match, p1, p2, p3, p4, offset, string) {
    p1 = (Number(p1) + 1) + '';
    p4 = (Number(p4) - Number(p4)) + '';
    
    if(p4 === '0') {
      return p1 + p2 + p3;
    } else {
      return p1 + p2 + p3 + p4;
    };
  };
return integer.replace(/([0-8]?(?=[^\\w]))([^\\w]?)([5-9]?)([0-9]+)$/g, increaseMatch);
};
let newInteger = increaseByOne('100.5')
newInteger;
// Note that I added the if statement before returning, that will eliminate
// the number to the right of the '.' if it's equal to '0'.

// Third step:
  //is to move the decimal according to the decimalNotation argument.
  // We can achieve that with a little twist to the regexp used on step 1.
  // /(\d)(\d)(\d)([^\w]?(?!\d))/g
// newInteger = newInteger.replace(/(\d)(\d)(\d)([^\w]?(?!\d))/g, '$1$4$2$3')
// Now how can we make this into a dynamic function that would take the 
// decimal Notation and position the '.' correctly?

// Coming from step 2, we know that the '.' is the last character in the string.
function moveDecimal(integer, decimalNotation) {
  // integer = '101.' .length === 3
  // decimalNotation = 2;
  let lastIndexInteger = integer.length - 1
  let positionDecimal = lastIndexInteger - decimalNotation; // position 1
  
  function dynamicPosition(match, p1, p2, p3, p4, string){
    var replacerStr = '';
    for(let i = 0; i < match.length - 1; i++) {
      if (i !== positionDecimal) {
       replacerStr = replacerStr + ('$' + ((i + 1)));
      } else if(i === positionDecimal){
        if(match[i] !== '.') {
         let newP = ('$' + ((i + 1)));
         let newP2 = '$4'
         replacerStr = replacerStr + newP2 + newP;
        }
      }
    }
    return replacerStr;
  }
let returnedStr = integer.replace(/(\d)(\d)(\d)([^\w]?(?!\d))/g, dynamicPosition);
return integer.replace(/(\d)(\d)(\d)([^\w]?(?!\d))/g, returnedStr);
}

moveDecimal('101.', 2);
// While thinking about the function above. I remember there is a way of
// dynamically generate RegExp. 