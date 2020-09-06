var mongoose = require('mongoose')
var LOCATION = process.env["LOCATION"]||"desarrollo";
require('../../secret').varEntorno = require('../../secret').varEntorno||{"desarrollo": { "urlMongo": "mongodb://172.21.24.14:27017/"}};
var url  = require('../../secret').varEntorno[LOCATION].urlMongo||"mongodb://172.21.24.14:27017/";
global.colecciones = []; //utilizada en allconnectiosn.js
const options = {
//     useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    // autoIndex: false, // Don't build indexes 
    // reconnectTries: 1, // Never stop trying to reconnect
    // reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 1, // Maintain up to 10 socket connections
    // // If not connected, return errors immediately rather than waiting for reconnect
    // bufferMaxEntries: 0,
    connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
    socketTimeoutMS: 0, // Close sockets after 45 seconds of inactivity
    // family: 4 // Use IPv4, skip trying IPv6
  };
mongoose.connect(url, options, function(err, db){
    
            if (err) {
                console.log('No se conectó a la base de datos Mongo db.js:' + err);
                throw err;
            } else {
                console.log('mongodb connected-------------------------------------------------------'+url)
                db.db.command({ listCollections: 1.0, authorizedCollections: true, nameOnly: true }).then((response) => {
                    var names= [];
                    Object.keys(response.cursor.firstBatch).forEach(function(k) {
                        names.push(response.cursor.firstBatch[k].name)
                    });
                    colecciones = names;
                });
            }
}).catch((error) => {
    console.log()
//  assert.isNotOk(error,'Promise error');
//  done();
})
module.exports = mongoose