export const intMap = (map, val, default_result=0) => {
    const found = map.find(el => el[0] === val);
    if (found === undefined) return default_result;
    return found[1];
};

export const intMapReverse = (map, val, default_result=0, restrict=undefined) => {
    const found = map.find(el => el[1] === val && (restrict === undefined || restrict(el[0])));
    if (found === undefined) return default_result;
    return found[0];
};