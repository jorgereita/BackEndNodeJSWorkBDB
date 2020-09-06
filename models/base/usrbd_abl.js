var mongoose = require('mongoose');

var usrSchema = mongoose.Schema({
    usrId: String , 
    onClick : String,
    onClose : String,
    onLoad : String,
    texto : String,
    titulo : String,
    token : String,
    salas : [],
    time: { type: Date, default: Date.now }
  });

module.exports = mongoose.model('usrbd_abl', usrSchema);