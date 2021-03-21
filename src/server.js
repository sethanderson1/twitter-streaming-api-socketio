const server = require("./app");
const PORT = process.env.PORT || 8000;
const mongoose = require('mongoose');

// // connect to mongodb

if (process.env.MONGODB_URI) {

    const dbURI = process.env.MONGODB_URI;

    mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then((result) => {
            return server.listen(PORT, () => console.log(`listening on port: ${PORT}`))
        })
        .catch((err) => console.log('err', err))
} else {
    return server.listen(PORT, () => console.log(`listening on port: ${PORT}`))
}

