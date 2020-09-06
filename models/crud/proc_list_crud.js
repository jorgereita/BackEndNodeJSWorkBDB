var mongoose = require('mongoose');
var fs = require('fs');
var msg_error = JSON.parse(fs.readFileSync('msg_error.json')).id_msg;
var procesoSchema = mongoose.Schema(
        {  
        "cia__nit":String,
        "proc__name":String,
        "procname2":String,
        "proc__des":String,
        "piidreg":Number,
        "adm":Boolean,
        "admrule":Boolean,
        "screen__name":String,
        "task__name":String,
        "diagram__name":String,
        "can__start":Boolean,
        "usr__cod":String,
        "usr__cod__rule":String,
        "block_cons":Boolean
      }
     


);

mongoose.Promise = global.Promise;

/**
* metodo para consultar todos los registros o documentos que hay en la tabla bpm_task segun el filtro
* bpm_task_crud.find(data.urlMongo,{ usrId: data.usrId },data).then((usr) => {
* 		//lo que hace con la data
* });
* @param {*} urlMongo parametro donde va la url de la base de datos a la cual se va a conectar
* @param {*} objFind el objeto que va a ingresar a la tabla con el cual hace el filtro para la busqueda
*/
module.exports.find = function (urlMongo, objFind, data) {
    return new Promise((resolve, reject) => {
       
        var proceso = mongoose.model(data.usr__cod  , procesoSchema);
        if (mongoose.connection.readyState === 1) { console.log("Conectado a Base de datos Mongo crud find: " + urlMongo); }
        else { console.log("No se logro conectarse a la  Base de datos Mongo crud find: " + urlMongo) }
        
        proceso.find(objFind,
            function (err, tareaEnv) {
               
                if (err) { 
                    console.log('No se conectó  en find base_task_crud:' + err);
                    reject();
                } else {
                    console.log('Busqueda exitosa en find base_task_crud') 
                    if (tareaEnv.length !== 0) {
                         
                        resolve(tareaEnv);
                    } else {
                        resolve([{ mensaje: msg_error[6], usr_cod: data.usr_cod }])
                    }
                    
                    
                    
                }
            });
    });
}
