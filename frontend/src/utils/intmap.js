export const intMap = (map, val) => {
    const found = map.find(el => el[0] === val);
    return found[1];
};