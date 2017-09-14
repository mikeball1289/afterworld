declare function range(from: number, to: number, by?: number): IterableIterator<number>;
declare function toArray<T>(iter: Iterable<T>): T[];
declare function enumerate<T>(arr: T[] | Iterable<T>): Iterable<[number, T]>;
declare function reverse<T>(arr: T[] | Iterable<T>): IterableIterator<T>;
declare function clumps<T>(arr: T[], size: 2): Iterable<[T, T]>;
declare function clumps<T>(arr: T[], size: 3): Iterable<[T, T, T]>;
declare function clumps<T>(arr: T[], size: 4): Iterable<[T, T, T, T]>;
declare function clumps<T>(arr: T[], size: 5): Iterable<[T, T, T, T, T]>;
