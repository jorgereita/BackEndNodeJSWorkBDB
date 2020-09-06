var mongoose = require('mongoose');
var db = require('../../models/connect/db.js')
var usrSchema = {
    socket:String,
    usrId: String , 
    onClick : String,
    onClose : String,
    onLoad : String,
    texto : String,
    titulo : String,
    token : String,
    fuente : String,
    time: { type: Date, default: Date.now }

  };

module.exports = db.model('base_usr', usrSchema);
