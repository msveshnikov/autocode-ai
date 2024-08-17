const fibonacci = (n) => {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
};

const generateFibonacciNumbers = (count) => {
    const fibNumbers = [];
    for (let i = 0; i < count; i++) {
        fibNumbers.push(fibonacci(i));
    }
    return fibNumbers;
};

const main = () => {
    const count = 10;
    const fibonacciNumbers = generateFibonacciNumbers(count);
    console.log(`First ${count} Fibonacci numbers:`);
    console.log(fibonacciNumbers.join(", "));
};

main();
