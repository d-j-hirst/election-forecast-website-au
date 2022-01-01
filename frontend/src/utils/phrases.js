
// Boolean value in the second list element tells whether the sentence should be
// "XXX is <LIKELY> to YYY" (for false)
// or "It is <LIKELY> for XXX to YYY" (for true)
export const getProbPhrase = (prob) => {
    if (prob >= 99.95) return ["almost certain", false];
    if (prob >= 99.5) return ["extremely likely", false];
    if (prob >= 95) return ["very likely", false];
    if (prob >= 85) return ["quite likely", false];
    if (prob >= 72) return ["moderately likely", false];
    if (prob >= 60) return ["more likely than not", false];
    if (prob >= 50) return ["slightly more likely than not", false];
    if (prob >= 40) return ["slightly less likely than not", false];
    if (prob >= 28) return ["less likely than not", false];
    if (prob >= 15) return ["moderately unlikely", false];
    if (prob >= 5) return ["quite unlikely", false];
    if (prob >= 0.5) return ["very unlikely", false];
    if (prob >= 0.05) return ["extremely unlikely", false];
    return ["almost impossible", true];
}

export const getIsPhrase = forecast => forecast.reportMode === "RF" || forecast.reportMode === "LF" ? "is" : "would be";
export const getWillPhrase = forecast => forecast.reportMode === "RF" || forecast.reportMode === "LF" ? "will" : "would";