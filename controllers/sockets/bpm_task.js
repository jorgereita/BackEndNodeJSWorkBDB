
/**
 *  modulo para obtener los mensajes asociados a una sala o usuario
 * @param {*} socket instancia a la que se conecta, ojo depende de donde se llame es una instancia diferent  
 * @param {*} secret clave de seguridad en caso de que se adicione este parametro en los servicios
 * @param {*} jwt 
 * @param {*} fs para los archivos
 * @param {*} msg_error json de mensajes de error por si los necesita
 * @param {*} SIRsic_param servicio que llama para obtener la url de la conexion a bd mongo
 * @param {*} removeDupli metodo para eliminar los duplicados
 * @param {*} base_usrs_crud modelo para agregar los usuarios a la bd mongo
 * @param {*} base_bita_crud modelo para adicionar el mensaje de la bd mongo
 */
module.exports = function (socket, io, secret, jwt, fs, msg_error, SIRsic_param, removeDupli, base_usrs_crud) {
    ////////////////////////parametros para todos los servicios/////////////////////////////////////////
    var bpm_task_crud = require("../../models/crud/bpm_task_crud");
    function parametros(req) {
        try {
            var body = {
                "dsSIRsic_param": {
                    "eeDatos": req.dsMongo.eeDatos,
                    "eeSIRsic_param": [{
                        "picparam__id": "urlMongo"
                    }]
                }
            };
            var obj = req.dsMongo.eeSIRbpm_task[0];
            obj.usr_cod = obj.usr_cod || obj["usr-cod"] || obj["usr__cod"] || obj["usr--cod"];
            var result = {
                "token": req.dsMongo.eeConfig[0].idWeb || req.query.idWeb || req.headers['idWeb'],
                // "socketi":req.app.get('io'),
                "arrayserv": req.dsMongo.eeSIRbpm_task,
                "url": req.dsMongo.eeConfig[0].serv_ip + 'rest/Parameters/SIRsic_param',
                "qs": { idWeb: req.dsMongo.eeConfig[0].idWeb || req.query.idWeb || req.headers['idWeb'] },
                "body": body
            }
            console.log(req.dsMongo.eeConfig[0].serv_ip + 'rest/Parameters/SIRsic_param')
            return result;
        } catch (e) {
            console.log(e)
            throw e;
        }
    }
    socket.on('serSIRbpm_task_sock', function (data) {
        try {
            var result = parametros(data);
            SIRsic_param.SIRsic_param("post", result.url, result.qs, result.body).then((urlMongo) => {
                try {
                    if ((urlMongo === 4)) {
                        throw msg_error[4].Estado;
                    }
                    console.log(urlMongo)
                    if ((urlMongo.eeEstados[0].Returnid !== 0) || (urlMongo === "Servicio invalido o desconectado")) {
                        throw urlMongo.eeEstados[0].Estado;
                    } else {
                        urlMongo = urlMongo.eesic_param[0].param__val;
                    }
                    if ((result.arrayserv === undefined)) {
                        throw msg_error[1];
                    }
                    if (result.arrayserv.length !== 0) {
                        bpm_task_crud.find(urlMongo, { usr_cod: result.arrayserv[0].usr_cod }, result.arrayserv[0]).then((respFind) => {
                            if (respFind[0].mensaje !== undefined) {
                                socket.emit("rooms:" + respFind[0].usr_cod).emit('cliSIRbpm_task', []);
                            } else {
                                socket.emit("rooms:" + respFind[0].usr_cod).emit('cliSIRbpm_task', respFind);
                            }
                        }).catch(err => {
                            console.log(err)
                            socket.emit('alerta', err);
                            console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
                            console.log('Error en all_collections find del servicio:  socket serUbpm_taskBitacora put bpm_task.js')
                        });
                    }
                } catch (e) {
                    console.log(e);
                    socket.emit('alerta', e);
                }
            }).catch(err => {
                console.log(err)
                socket.emit('alerta', err);
                console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
                console.log('Error en SIRsic_param find del servicio:  socket serUbpm_taskBitacora put sir_bpm_task.js')
            });
        } catch (e) {
            console.log(e);
            socket.emit('alerta', e);
        }
    });

    socket.on('serCUbpm_task_sock', function (data) {
        try {
            var result = parametros(data);
            
            
            SIRsic_param.SIRsic_param("post", result.url, result.qs, result.body).then((urlMongo) => {
                try {
                    if ((urlMongo === 4)) {
                        throw msg_error[4].Estado;
                    }
                    console.log(urlMongo)
                    if ((urlMongo.eeEstados[0].Returnid !== 0) || (urlMongo === "Servicio invalido o desconectado")) {
                        throw urlMongo.eeEstados[0].Estado;
                    } else {
                        urlMongo = urlMongo.eesic_param[0].param__val;
                    }
                    if ((result.arrayserv === undefined)) {
                        throw msg_error[1];
                    }
                    if (result.arrayserv.length !== 0) {
                        for (var i = 0; i < result.arrayserv.length; i++) {
                            let ultimo=false;
                            if(result.arrayserv.length-1===i){
                              ultimo=true;
                            } 
                            //puede crearse un update recursivo y al fina el find para que no actualiza tantas veces
                            bpm_task_crud.update(urlMongo, { task__id: result.arrayserv[i].task__id, wiid: result.arrayserv[i].wiid }, result.arrayserv[i], result.arrayserv[i]).then((response) => {
                              if (response.respuesta.ok !== 1) {
                                throw msg_error[7].Estado
                              } else {
                                 
                                if(ultimo){
                                  bpm_task_crud.find(urlMongo, { usr_cod: response.data.usr_cod }, response.data).then((tareas) => {
                                    if (tareas.mensaje !== undefined) {
                                      result.socketi.to("rooms:" + tareas[0].usr_cod).emit('cliSIRbpm_task', []);
                                    } else {
                                      result.socketi.to("rooms:" + tareas[0].usr_cod).emit('cliSIRbpm_task', tareas);
                                    }
                                    // mongoose.connection.close();
                                  }).catch(err=>{
                                    console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
                                    console.log('Error en find del servicio: serCUDbpm_task put bpm_task.js')
                                    });
                                }
                              }
                            }).catch(err=>{
                                console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
                                console.log('Error en update del servicio: serCUDbpm_task put bpm_task.js')
                                });
                            }
                    }
                } catch (e) {
                    console.log(e);
                    socket.emit('alerta', e);
                }
            }).catch(err => {
                console.log(JSON.stringify(err))
                socket.emit('alerta', err);
                console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
                console.log('Error en SIRsic_param find del servicio:  socket serUbpm_taskBitacora put sir_bpm_task.js')
            });
        } catch (e) {
            console.log(e);
            socket.emit('alerta', e);
        }
    });
}