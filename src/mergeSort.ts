// from https://stackoverflow.com/questions/1427608/fast-stable-sorting-algorithm-implementation-in-javascript

export default function mergeSort<T>(arr: T[], compare: (a: T, b: T) => number): T[] {
    if (arr.length < 2) {
        return arr;
    }

    let middle = arr.length / 2;
    let left = arr.slice(0, middle);
    let right = arr.slice(middle, arr.length);

    return merge(mergeSort(left, compare), mergeSort(right, compare), compare);
}

function merge<T>(left: T[], right: T[], compare: (a: T, b: T) => number): T[] {
    let result: T[] = [];

    while (left.length && right.length) {
        if (compare(left[0], right[0]) <= 0) {
            result.push(left.shift()!);
        } else {
            result.push(right.shift()!);
        }
    }

    while (left.length) {
        result.push(left.shift()!);
    }

    while (right.length) {
        result.push(right.shift()!);
    }

    return result;
}
