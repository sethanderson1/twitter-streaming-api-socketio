


const tempTermList = []

// const terms = [
//     // "lol",
//     // "lmao",
//     // "ffs",
//     // "lmfao",
//     // "rofl",
//     // "omg",
//     // "wtf",
//     // "stfu",
//     // "ffs",
//     // "fml",
// ]

//  terms = ["I wonder"]
//  terms = ["cuomo"]
 terms = ["idiot"]

terms.forEach(term => {
    tempTermList.push(`"${term}"`)
})

const termList = tempTermList.join(' OR ')

module.exports = {
    terms,
    termList
}
