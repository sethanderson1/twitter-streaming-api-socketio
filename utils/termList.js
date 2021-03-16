


const tempTermList = []

const terms = ["lol", "wtf", "omg"]

terms.forEach(term => {
    tempTermList.push(`"${term}"`)
})

const termList = tempTermList.join(' OR ')

module.exports = {
    terms,
    termList
}
