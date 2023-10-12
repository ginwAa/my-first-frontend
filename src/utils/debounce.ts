async function debounce(func, delay) {
    let timer;
    console.log("start timer");
    return async function(...args) {
        return new Promise((resolve) => {
            timer = setTimeout(async () => {
                const result = await func.apply(this, args);
                resolve(result);
            }, delay);
        });
    }
}
export default debounce;