export const intMap = (map, val, default_result=0) => {
    const found = map.find(el => el[0] === val);
    if (found === undefined) return default_result;
    return found[1];
};