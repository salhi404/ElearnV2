export function updateObject(to:any,from:any):any {
    for (const key in from) {
        if (from.hasOwnProperty(key)) {
            to[key]=from[key]
        }
    }
    return to;
}