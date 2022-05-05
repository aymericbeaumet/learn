---
assert:
  firstname: "John"
  lastname: "Doe"
  fullname: "John Doe"
---

# Variables: Strings

Ok, so we've just seen how to create a variable. But it's empty, or undefined
as we call it more formally. That's great but it's not very exciting. Let's
see how we can push it one step further by storing text into our variables.

Text in JavaScript is expressed as sequences of characters which are called
strings. Strings are delimited by 'single quotes' or "double quotes".

You can use the + operator to join strings together (this operation is called
concatenation).

To assign a string to a variable, use the = sign. You can change a value of a
variable after its declaration.

```js
// Declaring a variable `animal` containing the string "dog"
let animal = "dog";

// Declaring a variable `sentence` containing the string "I'm a dog person!"
let sentence = "I'm a " + animal + " person!";

// Re-assigning the variable `animal` to "cat"
animal = "cat";
```

1. Create a new variable named `firstname` with the value "John"
2. Create a new variable named `lastname` with the value "Doe"
3. Concatenate `firstname` and `lastname` separated by a space into a variable
   named `fullname`
