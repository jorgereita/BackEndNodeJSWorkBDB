var mongoose = require('mongoose');
var fs = require('fs');
var msg_error = JSON.parse(fs.readFileSync('msg_error.json')).id_msg;

var msgSchema = mongoose.Schema({
    usr_cod: String,//usuario "origen"
    sal_cod: String,//codigo de sala
    sal_par_ing: String,//fecha de ingreso del usuario a la sala
    sal_par_sal: String,//fecha de salida del usuario de la sala
    sal_msg_msg: String,//valor del mensaje
    sal_msg_fec: String,//fecha del mensaje
    usr_cod_org: String,//persona que envió el mensaje "destino"
    sal_msg_adj: String,//mensaje adjunto
    sal_msg_vis: String,//fecha en la que fue visto el mensaje (si fue visto)
    sal_msg_type: String,
    sal_usr_name: String,
    sal_msg_url: String, //url del documento
    sal_msg_adj_name: String,//nombre del documento adjunto
    sal_msg_aslt:Boolean,//campo para enviar notificacion en caso de no ser recibido
    msg_time: { type: Date},//fecha del mensaje
    msg_time_text: { type: String, default:  new Date().toString() },   //fecha en formato texto
        sal_msg_est:Boolean,
    });
    
    mongoose.Promise = global.Promise;
    /**
     * metodo crud para crear un registro en la tabla base_usrs
     base_usrs_crud.save(data.urlMongo,data).then((successMessage) => {
      socket.emit('notificacion',successMessage);
    });
     * @param {*} urlMongo  parametro donde va la url de la base de datos a la cual se va a conectar
     * @param {*} data el objeto que va a ingresar a la tabla
     */
    module.exports.save = function (urlMongo, data) {
        return new Promise((resolve, reject) => {
            
            var Msg_bit = mongoose.model(data.usr_cod + "_mensajes", msgSchema);
            if (mongoose.connection.readyState === 1) { console.log("Conectado a Base de datos Mongo crud save: " + urlMongo); }
            else { console.log("No se logro conectarse a la  Base de datos Mongo crud save: " + urlMongo) }
            data.msg_time = new Date();
            var newUsr = new Msg_bit({
                usr_cod: data.usr_cod,
                sal_cod: data.sal_cod,
                sal_par_ing: data.sal_par_ing,
                sal_par_sal: data.sal_par_sal,
                sal_msg_msg: data.sal_msg_msg,
                sal_msg_fec: data.sal_msg_fec,
                usr_cod_org: data.usr_cod_org,
                sal_msg_adj: data.sal_msg_adj,
                sal_msg_vis: data.sal_msg_vis,
                sal_msg_type: data.sal_msg_type,
                sal_usr_name: data.sal_usr_name,
                sal_msg_url: data.sal_msg_url,
                sal_msg_adj_name: data.sal_msg_adj_name,
                sal_msg_aslt:data.sal_msg_aslt,
                msg_time:new Date(),
                msg_time_text:new Date().toString(),
                sal_msg_est:false,
            });
            newUsr.save(function (err, usrEnv) {
                if (err) {
                    console.log('No se conectó  en safe base_bita_crud:' + err);
                    //   throw err;
                } else {
                    console.log('Modificación exitosa en safe base_bita_crud')
                    console.log(data)
                    resolve(data);
                }
            });
        });
    }
    /**
     * metodo para consultar todos los registros o documentos que hay en la tabla base_usrs segun el filtro
     * base_usrs_crud.find(data.urlMongo,{ usrId: data.usrId }).then((usr) => {
     * 		//lo que hace con la data
     * });
     * @param {*} urlMongo parametro donde va la url de la base de datos a la cual se va a conectar
     * @param {*} objFind el objeto que va a ingresar a la tabla con el cual hace el filtro para la busqueda
     */
    module.exports.find = function (urlMongo, objFind, data) {
        return new Promise((resolve, reject) => {
            var Msg_bit = mongoose.model(data.usr_cod + "_mensajes", msgSchema);
            if (mongoose.connection.readyState === 1) { console.log("Conectado a Base de datos Mongo crud find: " + urlMongo); }
            else { console.log("No se logro conectarse a la  Base de datos Mongo crud find: " + urlMongo) }
            Msg_bit.find(objFind,
            function (err, usr) {
                if (err) {
                    console.log('No se conectó  en find base_bita_crud:' + err);
                    //   throw err;
                } else {
                    console.log('Busqueda exitosa en find base_bita_crud')
                    if (usr.length !== 0) {
                        resolve(usr);
                    } else {
                        resolve([{ mensaje: msg_error[6].Estado, usr_cod: data.usr_cod }])
                    }
                }
            });
            /////////////////////////fin//////////////////////////
        });
    }
    /**
     * metodo para cambiar un registro en la tabla o colleccion base_usrs
     * base_usrs_crud.update(data.urlMongo,
                  { usrId: data.usrId },
                  {token: data.token, socket: socket.id}
                ).then((successMessage) => {
                    ///codigo que hace despues del cambio
                });
     * @param {*} urlMongo parametro donde va la url de la base de datos a la cual se va a conectar
     * @param {*} objFind objeto para hacer el filtro
     * @param {*} objUpdate objeto con los nodos que van a cambiar
     */
    module.exports.update = function (urlMongo, objFind, objUpdate, data) {
        return new Promise((resolve, reject) => {
            var Msg_bit = mongoose.model(data.usr_cod + "_mensajes", msgSchema);
            if (mongoose.connection.readyState === 1) { console.log("Conectado a Base de datos Mongo crud update: " + urlMongo); }
            else { console.log("No se logro conectarse a la  Base de datos Mongo crud update: " + urlMongo) }
            Msg_bit.update(objFind, objUpdate, { upsert: true },
            function (err, usr) {
                if (err) {
                    console.log('No se conectó  en update base_bita_crud:' + err);
                    //   throw err;
                } else {
                    console.log('Actualizacion exitosa en update base_bita_crud')
                    resolve(data);
                }
            });
        });
    }
    /**
     * metodo para remover un registro o una documento en la tabla o colecion base_usrs
     * base_usrs_crud.remove(data.urlMongo,{ token: data.token }).then((usr) => {
      console.log(usr);
    }); 
     * @param {*} urlMongo parametro donde va la url de la base de datos a la cual se va a conectar
     * @param {*} objFind obje para hacer el filtro de la consulta
     */
    module.exports.remove = function (urlMongo, objFind, data) {
        return new Promise((resolve, reject) => {
            
            var Msg_bit = mongoose.model(data.usr_cod + "_mensajes", msgSchema);
            if (mongoose.connection.readyState === 1) { console.log("Conectado a Base de datos Mongo crud remove: " + urlMongo); }
            else { console.log("No se logro conectarse a la  Base de datos Mongo crud remove: " + urlMongo) }
            Msg_bit.remove(objFind,
            function (err, usr) {
                if (err) {
                    console.log('No se conectó  en remove base_bita_crud:' + err);
                    reject();
                } else {
                    console.log('Eliminación exitosa en remove base_bita_crud')
                    resolve(data);
                }
            });
        });
    }
    
    /**
     * metodo para consultar todos los mensajes de las salas  Agrupados por el sal_cod
     * base_usrs_crud.group(data.urlMongo,{ usrId: data.usrId }).then((usr) => {
     * 		//lo que hace con la data
     * });
     * @param {*} urlMongo parametro donde va la url de la base de datos a la cual se va a conectar
     * @param {*} objFind el objeto que va a ingresar a la tabla con el cual hace el filtro para la agrupacion 
     */
    module.exports.group = function (urlMongo, objFind, data) {
        return new Promise((resolve, reject) => {
            var Msg_bit = mongoose.model(data.usr_cod + "_mensajes", msgSchema);
            if (mongoose.connection.readyState === 1) { console.log("Conectado a Base de datos Mongo crud find: " + urlMongo); }
            else { console.log("No se logro conectarse a la  Base de datos Mongo crud find: " + urlMongo) }
            
            Msg_bit.aggregate(objFind,
            function (err, usr) {
                
                if (err) {
                    console.log('No se conectó  en find base_bita_crud:' + err);
                    //   throw err;
                } else {
                    console.log('Busqueda exitosa en find base_bita_crud')
                    if (usr.length !== 0) {
                        resolve(usr);
                    } else {
                        resolve([{ mensaje: msg_error[6].Estado, usr_cod: data.usr_cod }])
                    }
                }
            });
            /////////////////////////fin//////////////////////////
        });
    }
    
    ////-----
    module.exports.updateMany = function (urlMongo, objFind, objUpdate, data) {
        return new Promise((resolve, reject) => {
            var Msg_bit = mongoose.model(data.usr_cod + "_mensajes", msgSchema);
            if (mongoose.connection.readyState === 1) { console.log("Conectado a Base de datos Mongo crud update: " + urlMongo); }
            else { console.log("No se logro conectarse a la  Base de datos Mongo crud update: " + urlMongo) }
            console.log("Paso por updateMany......");
            console.log( JSON.stringify(objFind));
            console.log( JSON.stringify(objUpdate));
            console.log( JSON.stringify(data));
            Msg_bit.updateMany(objFind,objUpdate,
            function (err, usr) {
                if (err) {
                    console.log('No se conectó  en update base_bita_crud:' + err);
                    reject(err);
                } else {
                    console.log('Actualizacion exitosa en update base_bita_crud')
                    console.log(usr)
                    resolve(data);
                }
            });
        });
    }
    ////-----ORDERNAR POR FECHA
    module.exports.findSort = function (urlMongo, objFind, data) {
        return new Promise((resolve, reject) => {
            var Msg_bit = mongoose.model(data.usr_cod + "_mensajes", msgSchema);
            if (mongoose.connection.readyState === 1) { console.log("Conectado a Base de datos Mongo crud find: " + urlMongo); }
            else { console.log("No se logro conectarse a la  Base de datos Mongo crud find: " + urlMongo) }
            Msg_bit.find(objFind,
            function (err, usr) {
                if (err) {
                    console.log('No se conectó  en find base_bita_crud:' + err);
                    //   throw err;
                } else {
                    console.log('Busqueda exitosa en find base_bita_crud')
                    if (usr.length !== 0) {
                        resolve(usr);
                    } else {
                        resolve([{ mensaje: msg_error[6].Estado, usr_cod: data.usr_cod }])
                    }
                }
            }).sort({msg_time: -1});
            /////////////////////////fin//////////////////////////
        });
    }