export const jsonMap = (map, val, default_result=undefined) => {
    const found = map.find(el => el[0] === val);
    if (found === undefined) return default_result;
    return found[1];
};

export const jsonMapReverse = (map, val, default_result=null, restrict=null) => {
    const found = map.find(el => el[1] === val && (restrict === null || restrict(el[0])));
    if (found === undefined) return default_result;
    return found[0];
};