export function contains(object, arr) {
    for (let i = 0; i < arr.length; i++) {
        if (object.name == arr[i].name) {
            return true;
        }
    }
    return false;
}
