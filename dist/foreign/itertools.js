function* range(from, to, by = 1) {
    let i = from;
    while ((by > 0 && i < to) || (by < 0 && i > to)) {
        yield i;
        i += by;
    }
}
function toArray(iter) {
    let arr = [];
    for (let element of iter)
        arr.push(element);
    return arr;
}
function* enumerate(arr) {
    let i = 0;
    for (let el of arr) {
        yield [i++, el];
    }
}
function* reverse(arr) {
    if (arr.constructor !== Array)
        arr = toArray(arr);
    let a = arr;
    for (let i = a.length - 1; i >= 0; i--) {
        yield a[i];
    }
}
function* clumps(arr, size) {
    let clump = [];
    for (let i = 0; i < arr.length; i += size) {
        for (let j = 0; j < size; j++) {
            clump[j] = arr[j + i];
        }
        yield clump;
    }
}
