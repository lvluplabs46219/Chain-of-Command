// Minimal TypeScript sample for tsc --noEmit stage

interface User {
  id: number;
  name: string;
}

function greet(user: User): string {
  return `Hello, ${user.name}!`;
}

// Intentional type error for the pipeline to catch
function brokenGreet(user: User): number {
  return user.name;  // Type 'string' is not assignable to type 'number'
}

const u: User = { id: 1, name: "Gabriel" };
console.log(greet(u));
