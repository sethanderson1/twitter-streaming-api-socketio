


const tempTermList = []

const terms = ["trump"]

terms.forEach(term => {
    tempTermList.push(`"${term}"`)
})

const termList = tempTermList.join(' OR ')

module.exports = termList;
