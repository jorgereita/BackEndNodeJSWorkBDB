var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var Base_usr = require("../models/base/base_usrs");

module.exports.find = function (urlMongo) {

    return new Promise((resolve, reject) => {
                Base_usr.aggregate([
                    { $group: { 
                        _id: "socket",
                         dups: { $push: "$_id" },
                          count: { $sum: 1 } } },
                    { $match: { count: { $gt: 1 } } }
                ], function (err, result) {
                });
    });
}