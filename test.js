
const optionalObj = false;

const obj = {
    test:1234,
    [ optionalObj ? 'test2' : '']: optionalObj ?? 2
}

console.log(obj);