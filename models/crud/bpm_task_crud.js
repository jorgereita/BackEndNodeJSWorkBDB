var mongoose = require('mongoose');
var fs = require('fs');
var msg_error = JSON.parse(fs.readFileSync('msg_error.json')).id_msg;
var tareaSchema = mongoose.Schema({
    usr_cod: String,
    percentil: Number,
    select: Boolean,
    bitacora: Number,
    eebpm_sub_task: [{
            usr_cod: String,
            percentil: Number,
            select: Boolean,
            bitacora: Number,
            wiid: Number,
            cwiid: Number,
            task__name: String,
            task__name2: String,
            task__inst: String,
            task__ddt: String,
            task__tst: String,
            task__pct: Number,
            task_docs: Boolean,
            task_stk: Boolean,
            task_cxh: Boolean,
            task_link: Boolean,
            task__collaborator: String,
            response: String,
            task__type: String,
            id_task__type: Number,
            escalation_type: Number,
            priority: String,
            duration: Number,
            dataslot_access: Number,
            editName: Boolean,
            isadhoc: Boolean
        }],
    task__name: String,
    task__name2: String,
    proc__name: String,
    inst__name: String,
    inst__name2: String,
    task__usr: String,
    task__usr2: String,
    task__id: String,
    task_docs: Boolean,
    task_stk: Boolean,
    task_cxh: Boolean,
    task_link: Boolean,

    task_dom: String,
    tyb_act: String,
    usr_cod_f: String,
    task__dpr: String,
    task__crt: String,
    task__des: String,
    task__type: String,
    task_collab_name: String,
    screen__name: String,
    maneja__doc: Boolean,
    task__ddt: String,
    task__tst: String,
    task__pct: Number,
    id_task__type: Number,
    wiid: Number,
    cwiid: Number,
    id_light: Number,
    response: String,
    task_ProcessTemplateName: String,
    task_tipo_tarea: Number,
    isCollaborativeTask: Boolean,
    isReassignable: Boolean,
    priority: String,
    piindicador: Number,
    editDesc: Boolean,
    editName: Boolean,
    isadhoc: Boolean
});

mongoose.Promise = global.Promise;
/**
 * metodo crud para crear un registro en la tabla bpm_task
 bpm_task_crud.save(data.urlMongo,data).then((successMessage) => {
 socket.emit('notificacion',successMessage);
 });
 * @param {*} urlMongo  parametro donde va la url de la base de datos a la cual se va a conectar
 * @param {*} data el objeto que va a ingresar a la tabla
 */
module.exports.save = function (urlMongo, data) {
    return new Promise((resolve, reject) => {

        var tarea = mongoose.model(data.usr_cod + "_bpm_task", tareaSchema);
        if (mongoose.connection.readyState === 1) {
            console.log("Conectado a Base de datos Mongo crud save: " + urlMongo);
        } else {
            console.log("No se logro conectarse a la  Base de datos Mongo crud save: " + urlMongo)
        }
        var newTarea = new tarea({
            usr_cod: data.usr_cod || data.usr__cod,
            percentil: data.percentil,
            select: data.select,
            bitacora: data.bitacora,

            eebpm_sub_task: data.eebpm_sub_task,
            task__name: data.task__name,
            task__name2: data.task__name2,
            proc__name: data.proc__name,
            inst__name: data.inst__name,
            inst__name2: data.inst__name2,
            task__usr: data.task__usr,
            task__usr2: data.task__usr2,
            task__id: data.task__id,
            task__dpr: data.task__dpr,
            task__crt: data.task__crt,
            task__des: data.task__des,
            task__type: data.task__type,
            task_docs: data.task_docs,
            task_stk: data.task_stk,
            task_cxh: data.task_cxh,
            task_link: data.task_link,
            task_collab_name: data.task_collab_name,
            screen__name: data.screen__name,
            maneja__doc: data.maneja__doc,
            task__ddt: data.task__ddt,
            task__tst: data.task__tst,
            task__pct: data.task__pct,
            
            task_dom: data.task_dom,
            tyb_act: data.tyb_act,
            usr_cod_f: data.usr_cod_f,
            
            id_task__type: data.id_task__type,
            wiid: data.wiid,
            id_light: data.id_light,
            response: data.response,
            // usr__cod: data.usr__cod||data.usr_cod,
            task_ProcessTemplateName: data.task_ProcessTemplateName,
            task_tipo_tarea: data.task_tipo_tarea,
            isCollaborativeTask: data.isCollaborativeTask,
            isReassignable: data.isReassignable,
            priority: data.priority,
            piindicador: data.piindicador,
            editDesc: false,
            editName: false,
            isadhoc: data.isadhoc,
        });
        newTarea.save(function (err, tareaEnv) {
            if (err) {
                console.log('No se conectó  en save base_task_crud:' + err);
                reject();
            } else {
                console.log('Modificación exitosa en save base_task_crud')
                resolve(tareaEnv);
            }
        });

    }).catch(err => {
        console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
        setTimeout(connect, 5000)
    });
}

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
        var tarea = mongoose.model(data.usr_cod + "_bpm_task", tareaSchema);
        if (mongoose.connection.readyState === 1) {
            console.log("Conectado a Base de datos Mongo crud find: " + urlMongo);
        } else {
            console.log("No se logro conectarse a la  Base de datos Mongo crud find: " + urlMongo)
        }
        tarea.find(objFind,
                function (err, tareaEnv) {
                    if (err) {
                        console.log('No se conectó  en find base_task_crud:' + err);
                        reject();
                    } else {
                        console.log('Busqueda exitosa en find base_task_crud*****')
                        if (tareaEnv.length !== 0) {
                            resolve(tareaEnv);
                        } else {
                            resolve([{mensaje: msg_error[6], usr_cod: data.usr_cod}])
                        }
                    }
                });
    });
}


/**
 * metodo para consultar todos los registros o documentos que hay en la tabla bpm_task segun el filtro
 * bpm_task_crud.find(data.urlMongo,{ usrId: data.usrId },data).then((usr) => {
 * 		//lo que hace con la data
 * });
 * @param {*} urlMongo parametro donde va la url de la base de datos a la cual se va a conectar
 * @param {*} objFind el objeto que va a ingresar a la tabla con el cual hace el filtro para la busqueda
 */

module.exports.find2 = function (urlMongo, objUsr, f, result, res, bpm_task_crud) {
    if (objUsr.length + 1 !== f + 1) {
        objUsr[f].usr_cod = objUsr[f].usr_cod || objUsr[f].usr__cod
        var tarea = mongoose.model(objUsr[f].usr_cod + "_bpm_task", tareaSchema);
        if (mongoose.connection.readyState === 1) {
            console.log("Conectado a Base de datos Mongo crud find2: " + urlMongo);
        } else {
            console.log("No se logro conectarse a la  Base de datos Mongo crud find2: " + urlMongo)
        }
        var find = {"usr_cod": objUsr[f].usr_cod}
        tarea.find(find,
                function (err, tareaEnv) {
                    if (err) {
                        console.log('No se conectó  en find base_task_crud:' + err);
                        reject();
                    } else {
                        if (tareaEnv.length !== 0) {
                            for (var j = 0; j < tareaEnv.length; j++) {
                                result.push(tareaEnv[j]);
                            }
                            resul2 = bpm_task_crud.find2(urlMongo, objUsr, f + 1, result, res, bpm_task_crud)
                            return resul2;
                        } else {
                            for (var j = 0; j < tareaEnv.length; j++) {
                                result.push(tareaEnv[j]);
                            }
                            resul2 = bpm_task_crud.find2(urlMongo, objUsr, f + 1, result, res, bpm_task_crud)
                            return resul2;
                        }
                    }
                });
    } else {
        res.json({
            "dsSIRbpm_task": {
                "eeEstados": [msg_error[0]],
                "eebpm_task": result
            }
        });
        res.end();
        return result;
    }
}
/**
 * metodo para consultar todos los registros o documentos que hay en la tabla bpm_task segun el filtro
 * bpm_task_crud.find(data.urlMongo,{ usrId: data.usrId },data).then((usr) => {
 * 		//lo que hace con la data
 * });
 * @param {*} urlMongo parametro donde va la url de la base de datos a la cual se va a conectar
 * @param {*} objFind el objeto que va a ingresar a la tabla con el cual hace el filtro para la busqueda
 */

module.exports.find2Query = function (urlMongo, objUsr, f, result, res, bpm_task_crud, objClean) {
    if (objUsr.length + 1 !== f + 1) {
        objUsr[f].usr_cod = objUsr[f].usr_cod || objUsr[f].usr__cod
        var tarea = mongoose.model(objUsr[f].usr_cod + "_bpm_task", tareaSchema);
        if (mongoose.connection.readyState === 1) {
            console.log("Conectado a Base de datos Mongo crud find2Query: " + urlMongo);
        } else {
            console.log("No se logro conectarse a la  Base de datos Mongo crud find2Query: " + urlMongo)
        }
        var find = {"usr_cod": objUsr[f].usr_cod}
        if (objClean !== {}) {
            find = objClean;
        }
        if (find["eebpm_sub_task"]) {
            var find2 = find["eebpm_sub_task"];
            delete find["eebpm_sub_task"];
            tarea.find(find, find2,
                    function (err, tareaEnv) {
                        if (err) {
                            console.log('No se conectó  en find base_task_crud:' + err);
                            reject();
                        } else {
                            if (tareaEnv.length !== 0) {
                                for (var j = 0; j < tareaEnv.length; j++) {
                                    result.push(tareaEnv[j]);
                                }
                                resul2 = bpm_task_crud.find2Query(urlMongo, objUsr, f + 1, result, res, bpm_task_crud, objClean)
                                return resul2;
                            } else {
                                for (var j = 0; j < tareaEnv.length; j++) {
                                    result.push(tareaEnv[j]);
                                }
                                resul2 = bpm_task_crud.find2Query(urlMongo, objUsr, f + 1, result, res, bpm_task_crud, objClean)
                                return resul2;
                            }
                        }
                    });
        } else {
            tarea.find(find,
                    function (err, tareaEnv) {
                        if (err) {
                            console.log('No se conectó  en find base_task_crud:' + err);
                            reject();
                        } else {
                            if (tareaEnv.length !== 0) {
                                for (var j = 0; j < tareaEnv.length; j++) {
                                    result.push(tareaEnv[j]);
                                }
                                resul2 = bpm_task_crud.find2Query(urlMongo, objUsr, f + 1, result, res, bpm_task_crud, objClean)
                                return resul2;
                            } else {
                                for (var j = 0; j < tareaEnv.length; j++) {
                                    result.push(tareaEnv[j]);
                                }
                                resul2 = bpm_task_crud.find2Query(urlMongo, objUsr, f + 1, result, res, bpm_task_crud, objClean)
                                return resul2;
                            }
                        }
                    });
        }
    } else {
        res.json({
            "dsSIRbpm_task": {
                "eeEstados": [msg_error[0]],
                "eebpm_task": result
            }
        });
        res.end();
        return result;
    }
}

/**
 * metodo para consultar todos los registros o documentos que hay en la tabla bpm_task y actualizarlos segun el query del update
 * bpm_task_crud.find(data.urlMongo,{ usrId: data.usrId },data).then((usr) => {
 * 		//lo que hace con la data
 * });
 * @param {*} urlMongo parametro donde va la url de la base de datos a la cual se va a conectar
 * @param {*} objFind el objeto que va a ingresar a la tabla con el cual hace el filtro para la busqueda
 * @param {*} objUpdate el objeto con los nodos que cambian
 */
module.exports.findOneAndUpdate = function (urlMongo, objFind, objUpdate, data) {
    return new Promise((resolve, reject) => {
        var tarea = mongoose.model(objFind.usr_cod + "_bpm_task", tareaSchema);
        if (mongoose.connection.readyState === 1) {
            console.log("Conectado a Base de datos Mongo crud findOneAndUpdate: " + urlMongo);
        } else {
            console.log("No se logro conectarse a la  Base de datos Mongo crud findOneAndUpdate: " + urlMongo)
        }
        tarea.findOneAndUpdate(objFind, {$set: objUpdate}, {upsert: false}, function (err, tareaEnv) {
            if (err) {
                console.log('No se conectó  en findOneAndUpdate base_task_crud:' + err);
                reject();
            } else {
                console.log('Busqueda y Modificación exitosa en update base_task_crud')
                if (tareaEnv === null) {
                    resolve(tareaEnv);
                } else if (tareaEnv.length !== 0) {
                    resolve(tareaEnv);
                } else {
                    resolve([{mensaje: msg_error[6], usr_cod: objFind.usr_cod}])
                }
            }
        });
    });
}
/**
 * metodo para cambiar un registro en la tabla o colleccion bpm_task
 * bpm_task_crud.update(data.urlMongo,
 { usrId: data.usrId },
 {token: data.token, socket: socket.id}, data
 ).then((successMessage) => {
 ///codigo que hace despues del cambio
 });
 * @param {*} urlMongo parametro donde va la url de la base de datos a la cual se va a conectar
 * @param {*} objFind objeto para hacer el filtro
 * @param {*} objUpdate objeto con los nodos que van a cambiar
 */
module.exports.update = function (urlMongo, objFind, objUpdate, data) {

    return new Promise((resolve, reject) => {
        var tarea = mongoose.model(data.usr_cod + "_bpm_task", tareaSchema);
        if (mongoose.connection.readyState === 1) {
            console.log("Conectado a Base de datos Mongo crud update: " + urlMongo);
        } else {
            console.log("No se logro conectarse a la  Base de datos Mongo crud update: " + urlMongo)
        }
        var objUpdate = {
            usr_cod: data.usr_cod || data.usr__cod,
            percentil: data.percentil,
            select: data.select,
            bitacora: data.bitacora,
            task_docs: data.task_docs,
            task_stk: data.task_stk,
            task_cxh: data.task_cxh,
            task_link: data.task_link,
            eebpm_sub_task: data.eebpm_sub_task,
            task__name: data.task__name,
            task__name2: data.task__name2,
            proc__name: data.proc__name,
            inst__name: data.inst__name,
            inst__name2: data.inst__name2,
            task__usr: data.task__usr,
            task__usr2: data.task__usr2,
            task__id: data.task__id,
            task__dpr: data.task__dpr,
            task__crt: data.task__crt,
            task__des: data.task__des,
            task__type: data.task__type,
            task_collab_name: data.task_collab_name,
            screen__name: data.screen__name,
            maneja__doc: data.maneja__doc,
            task__ddt: data.task__ddt,
            task__tst: data.task__tst,
            task__pct: data.task__pct,
            task_dom: data.task_dom,
            tyb_act: data.tyb_act,
            usr_cod_f: data.usr_cod_f,
            id_task__type: data.id_task__type,
            wiid: data.wiid,
            id_light: data.id_light,
            response: data.response,
            // usr__cod: data.usr__cod||data.usr_cod,
            task_ProcessTemplateName: data.task_ProcessTemplateName,
            task_tipo_tarea: data.task_tipo_tarea,
            isCollaborativeTask: data.isCollaborativeTask,
            isReassignable: data.isReassignable,
            priority: data.priority,
            piindicador: data.piindicador,
            editDesc: false,
            editName: false,
            isadhoc: data.isadhoc,
        };
        tarea.updateMany(objFind, objUpdate, {upsert: true},
                function (err, tareaEnv) {
                    if (err) {
                        console.log('No se conectó  en update base_task_crud:' + err);
                        reject();
                    } else {
                        console.log('Modificación exitosa en update base_task_crud')
                        var respuesta = {
                            respuesta: tareaEnv,
                            data: data
                        }
                        resolve(respuesta);
                    }
                });
    });
}

/**
 * metodo para cambiar un registro en la tabla o colleccion bpm_task sin crear erl nuevo elemento
 * bpm_task_crud.update(data.urlMongo,
 { usrId: data.usrId },
 {token: data.token, socket: socket.id}, data
 ).then((successMessage) => {
 ///codigo que hace despues del cambio
 });
 * @param {*} urlMongo parametro donde va la url de la base de datos a la cual se va a conectar
 * @param {*} objFind objeto para hacer el filtro
 * @param {*} objUpdate objeto con los nodos que van a cambiar
 */
module.exports.update2 = function (urlMongo, objFind, objUpdate, data) {

    return new Promise((resolve, reject) => {

        var tarea = mongoose.model(data.usr_cod + "_bpm_task", tareaSchema);
        var objUpdate = {
            usr_cod: data.usr_cod || data.usr__cod,
            percentil: data.percentil,
            select: data.select,
            bitacora: data.bitacora,
            task_docs: data.task_docs,
            task_stk: data.task_stk,
            task_cxh: data.task_cxh,
            task_link: data.task_link,
            eebpm_sub_task: data.eebpm_sub_task,
            task__name: data.task__name,
            task__name2: data.task__name2,
            proc__name: data.proc__name,
            inst__name: data.inst__name,
            inst__name2: data.inst__name2,
            task__usr: data.task__usr,
            task__usr2: data.task__usr2,
            task__id: data.task__id,
            task__dpr: data.task__dpr,
            task__crt: data.task__crt,
            task__des: data.task__des,
            task__type: data.task__type,
            task_collab_name: data.task_collab_name,
            screen__name: data.screen__name,
            maneja__doc: data.maneja__doc,
            task__ddt: data.task__ddt,
            task__tst: data.task__tst,
            task__pct: data.task__pct,
            task_dom: data.task_dom,
            tyb_act: data.tyb_act,
            usr_cod_f: data.usr_cod_f,
            id_task__type: data.id_task__type,
            wiid: data.wiid,
            id_light: data.id_light,
            response: data.response,
            // usr__cod: data.usr__cod||data.usr_cod,
            task_ProcessTemplateName: data.task_ProcessTemplateName,
            task_tipo_tarea: data.task_tipo_tarea,
            isCollaborativeTask: data.isCollaborativeTask,
            isReassignable: data.isReassignable,
            priority: data.priority,
            piindicador: data.piindicador,
            editDesc: false,
            editName: false,
            isadhoc: data.isadhoc,
        };
        console.log("Conectado a Base de datos Mongo crud update: " + urlMongo);
        //aca va micodigo de consulta a la base dedatos// 
        tarea.update(objFind, objUpdate, {upsert: false},
                function (err, tareaEnv) {
                    if (err) {
                        console.log('No se conectó  en remove base_task_crud:' + err);
                        reject();
                    } else {
                        console.log('Eliminación exitosa en remove base_task_crud')
                        var respuesta = {
                            respuesta: tareaEnv,
                            data: data
                        }
                        resolve(respuesta);
                    }
                });
    });
}

/**
 * metodo para remover un registro o una documento en la tabla o colecion bpm_task
 * bpm_task_crud.remove(data.urlMongo,{ token: data.token }, data).then((usr) => {
 console.log(usr);
 }); 
 * @param {*} urlMongo parametro donde va la url de la base de datos a la cual se va a conectar
 * @param {*} objFind obje para hacer el filtro de la consulta
 */
module.exports.remove = function (urlMongo, objFind, data) {
    return new Promise((resolve, reject) => {
        var tarea = mongoose.model(data.usr_cod + "_bpm_task", tareaSchema);
        if (mongoose.connection.readyState === 1) {
            console.log("Conectado a Base de datos Mongo crud remove: " + urlMongo);
        } else {
            console.log("No se logro conectarse a la  Base de datos Mongo crud remove: " + urlMongo)
        }
        console.log("Conectado a Base de datos Mongo crud remove: " + urlMongo);
        tarea.remove(objFind,
                function (err, tareaEnv) {
                    if (err) {
                        console.log('No se conectó  en remove base_task_crud:' + err);
                        reject();
                    } else {
                        console.log('Eliminación exitosa en remove base_task_crud')
                        var respuesta = {
                            respuesta: tareaEnv,
                            data: data
                        }
                        resolve(respuesta);
                    }
                });
    });
}

/**
 * metodo para remover todos los registros o documentos  de la tabla o colecion bpm_task
 * bpm_task_crud.removeAll(data.urlMongo,{ token: data.token }, data).then((usr) => {
 console.log(usr);
 }); 
 * @param {*} urlMongo parametro donde va la url de la base de datos a la cual se va a conectar
 * @param {*} objFind obje para hacer el filtro de la consulta
 */
module.exports.removeAll = function (urlMongo, objFind, data) {
    return new Promise((resolve, reject) => {
        console.log(data);
        var tarea = mongoose.model(data.usr_cod + "_bpm_task", tareaSchema);
        if (mongoose.connection.readyState === 1) {
            console.log("Conectado a Base de datos Mongo crud removeAll: " + urlMongo);
        } else {
            console.log("No se logro conectarse a la  Base de datos Mongo crud removeAll: " + urlMongo)
        }
        console.log("Conectado a Base de datos Mongo crud removeAll: " + urlMongo);
        console.log(objFind);
        tarea.deleteMany(objFind,
                function (err, tareaEnv) {
                    if (err) {
                        console.log('No se conectó  en removeAll base_task_crud:' + err);
                        reject();
                    } else {
                        console.log('Eliminación exitosa en removeAll base_task_crud')
                        var respuesta = {
                            respuesta: tareaEnv,
                            data: data
                        }
                        resolve(respuesta);
                    }
                });
    });
}