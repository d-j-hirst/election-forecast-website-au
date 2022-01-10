
export const getSeatUrl = (seatName) => {
    return seatName
            .toLowerCase()
            .replace(/\. /g, "-")
            .replace(/ /g, "-");
}

export const getIndexFromSeatUrl = (names_array, seatUrlName) => {
    for (let index = 0; index < names_array.length; ++index) {
        if (getSeatUrl(names_array[index]) === seatUrlName) return index;
    }
    return -1;
}