


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
//  terms = ["phoenix"]
 console.log("process.argv", process.argv)
terms = [...process.argv.slice(2)] || ["phoenix"]


terms.forEach(term => {
    tempTermList.push(`"${term}"`)
})

const termList = tempTermList.join(' OR ')

module.exports = {
    terms,
    termList
}
