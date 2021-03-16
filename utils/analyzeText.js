const { terms } = require('./termList')


const analyzeText = (text) => {
    const hasTermObj = {}
    for (let term of terms) {
        if (text.toLowerCase().includes(term)) {
            hasTermObj[term] = true;
        }
    }
    
    // console.log('text', text)
    // console.log('hasTermObj', hasTermObj)
    return hasTermObj;
}

module.exports = analyzeText;