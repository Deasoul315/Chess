export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function reverse<T>(arr: T[]): T[] {
  let left = 0;
  let right = arr.length - 1;

  while (left < right) {
    [arr[left], arr[right]] = [arr[right], arr[left]];
    left++;
    right--;
  }
  return arr;
}

export function timeFormatter(time: number) {
  const hours = Math.floor(time / (60 * 60 * 1000));
  const minutes = Math.floor((time % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor(((time % (60 * 60 * 1000)) % (60 * 1000)) / 1000);

  let res = "";

  res.slice(0, -1);
  // return { hours, minutes, seconds };
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
