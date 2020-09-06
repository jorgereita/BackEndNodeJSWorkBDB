
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
module.exports = function (socket, io, secret, jwt, fs, msg_error, SIRsic_param, removeDupli, base_usrs_crud, base_bita_crud) {
    ////////////////////////parametros para todos los servicios/////////////////////////////////////////
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
            var obj = req.dsMongo.env_msg_sock[0];
            obj.usr_cod = obj.usr_cod || obj["usr-cod"] || obj["usr__cod"] || obj["usr--cod"];
            var result = {
                "token": req.dsMongo.eeConfig[0].idWeb || req.query.idWeb || req.headers['idWeb'],
                // "socketi":req.app.get('io'),
                "arrayserv": req.dsMongo.env_msg_sock,
                "url": req.dsMongo.eeConfig[0].serv_ip + 'rest/Parameters/SIRsic_param',
                "qs": { idWeb: req.dsMongo.eeConfig[0].idWeb || req.query.idWeb || req.headers['idWeb'] },
                "body": body
            }
            return result;
        } catch (e) {
            throw msg_error[1];
        }
    }
    socket.on('serSIRenv_msg_sock', function (data) {
        
        try {
            var result = parametros(data);
            SIRsic_param.SIRsic_param("post", result.url, result.qs, result.body).then((urlMongo) => {
                try {
                    
                    if ((urlMongo === 4)) {
                        throw msg_error[4].Estado;
                    }
                    if ((urlMongo.eeEstados[0].Returnid !== 0) || (urlMongo === "Servicio invalido o desconectado")) {
                        throw urlMongo.eeEstados[0].Estado;
                    } else {
                        urlMongo = urlMongo.eesic_param[0].param__val;
                    }
                    if ((result.arrayserv === undefined)) {
                        throw msg_error[1];
                    }
                    if (result.arrayserv.length !== 0) {
                        base_bita_crud.find(urlMongo, { sal_cod: result.arrayserv[0].sal_cod }, result.arrayserv[0]).then((respFind) => {
                            
                            console.log(respFind)
                            if (respFind[0].mensaje !== undefined) {
                                socket.emit("rooms:" + respFind[0].usr_cod).emit('cliSIRmsg_bitAll', []);
                            } else {
                                socket.emit("rooms:" + respFind[0].usr_cod).emit('cliSIRmsg_bitAll', respFind);
                            }
                        }).catch(err=>{
                            console.log(err)
                            socket.emit('alerta', err);
                            console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
                            console.log('Error en SIRsic_param find del servicio:  socket serUbpm_taskBitacora put sir_bpm_task.js')
                        });
                    }
                } catch (e) {
                    console.log(e);
                    socket.emit('alerta', e);
                }
            }, function(error) {
                console.log(error + "serSIRenv_msg_sock"); // Stacktrace
            }).catch(error => {
                console.log(error.message)
                throw error.message
            });
        } catch (e) {
            console.log(e);
            socket.emit('alerta', e);
        }
    });
    socket.on('serSIRenv_msg_sock_group_sala', function (data) {
        
        try {
            var result = parametros(data);
            SIRsic_param.SIRsic_param("post", result.url, result.qs, result.body).then((urlMongo) => {
                try {
                    
                    if ((urlMongo === 4)) {
                        throw msg_error[4].Estado;
                    }
                    if ((urlMongo.eeEstados[0].Returnid !== 0) || (urlMongo === "Servicio invalido o desconectado")) {
                        throw urlMongo.eeEstados[0].Estado;
                    } else {
                        urlMongo = urlMongo.eesic_param[0].param__val;
                    }
                    if ((result.arrayserv === undefined)) {
                        throw msg_error[1];
                    }
                    console.log("Consulta de Group ");
                    if (result.arrayserv.length !== 0) {
                        let contador=0;
                        for (contador = 0; contador < result.arrayserv.length; contador++) {
                            console.log(result.arrayserv[contador]);
                            base_bita_crud.group(urlMongo, [
                                {
                                    $group: {
                                        _id: '$sal_cod',  
                                        "msgTotales": {$sum: 1},
                                        "msgNoleidos": { $sum: { $cond: ["$sal_msg_est", 0, 1] }},
                                        "message": { "$last": "$sal_msg_msg" },
                                        "usrOrg": { "$last": "$usr_cod_org" },
                                        "typeMsg": { "$last": "$sal_msg_type" },
                                        "salCod": { "$last": "$sal_cod" },
                                        "usr_cod": { "$last": "$usr_cod"},
                                        time: { "$last": "$msg_time" }
                                    }
                                }, {
                                    $sort : {time : -1}
                                }
                            ],  result.arrayserv[contador]).then((respFind) => {
                                
                                
                                if (respFind[0].mensaje !== undefined) {
                                    socket.to("rooms:" + respFind[0].usr_cod).emit('cliSIRmsg_list', []);
                                    
                                } else {
                                    socket.to("rooms:" + respFind[0].usr_cod).emit('cliSIRmsg_list', respFind);
                                    socket.emit("rooms:" + respFind[0].usr_cod).emit('cliSIRmsg_list', respFind);
                                    //                          
                                }
                            }).catch(err=>{
                                console.log(err)
                                socket.emit('alerta', err);
                                console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
                                console.log('Error en SIRsic_param find del servicio:  socket serUbpm_taskBitacora put sir_bpm_task.js')
                            });  
                        }
                        
                    }
                } catch (e) {
                    console.log(e);
                    socket.emit('alerta', e);
                }
            }, function(error) {
                console.log(error + "serSIRenv_msg_sock"); // Stacktrace
            }).catch(error => {
                console.log(error.message)
                throw error.message
            });
        } catch (e) {
            console.log(e);
            socket.emit('alerta', e);
        }
    });
    socket.on('serCUDenv_act_sock_sala', function (data) {
        
        try {
            var result = parametros(data);
            SIRsic_param.SIRsic_param("post", result.url, result.qs, result.body).then((urlMongo) => {
                try {
                    
                    if ((urlMongo === 4)) {
                        throw msg_error[4].Estado;
                    }
                    if ((urlMongo.eeEstados[0].Returnid !== 0) || (urlMongo === "Servicio invalido o desconectado")) {
                        throw urlMongo.eeEstados[0].Estado;
                    } else {
                        urlMongo = urlMongo.eesic_param[0].param__val;
                    }
                    if ((result.arrayserv === undefined)) {
                        throw msg_error[1];
                    }
                    
                    if (result.arrayserv.length !== 0) {
                        
                        
                        console.log("Consulta de UpdateMany");
                       
                        base_bita_crud.updateMany(urlMongo , {"sal_cod": result.arrayserv[0].sal_cod},{ $set: { "sal_msg_est" : true} } , result.arrayserv[0] ).then((respFind) => {
                            
                            base_bita_crud.group(urlMongo, [
                                {
                                    $group: {
                                        _id: '$sal_cod',  
                                        "msgTotales": {$sum: 1},
                                        "msgNoleidos": { $sum: { $cond: ["$sal_msg_est", 0, 1] }},
                                        "message": { "$last": "$sal_msg_msg" },
                                        "usrOrg": { "$last": "$usr_cod_org" },
                                        "typeMsg": { "$last": "$sal_msg_type" },
                                        "salCod": { "$last": "$sal_cod" },
                                        "usr_cod": { "$last": "$usr_cod"},
                                        time: { "$last": "$msg_time" }
                                    }
                                }, {
                                    $sort : {time : -1}
                                }
                            ],  result.arrayserv[0]).then((respFind) => {
                                
                                
                                if (respFind[0].mensaje !== undefined) {
                                    socket.to("rooms:" + respFind[0].usr_cod).emit('cliSIRmsg_list', []);
                                    
                                } else {
                                    socket.to("rooms:" + respFind[0].usr_cod).emit('cliSIRmsg_list', respFind);
                                    socket.emit("rooms:" + respFind[0].usr_cod).emit('cliSIRmsg_list', respFind);
                                    //                          
                                }
                            }).catch(err=>{
                                console.log(err)
                                socket.emit('alerta', err);
                                console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
                                console.log('Error en SIRsic_param find del servicio:  socket serUbpm_taskBitacora put sir_bpm_task.js')
                            });  
                        }).catch(err=>{
                            console.log(err)
                            socket.emit('alerta', err);
                            console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
                            console.log('Error en SIRsic_param find del servicio:  socket serUbpm_taskBitacora put sir_bpm_task.js')
                        });  
                    }
                    
                    
                } catch (e) {
                    console.log(e);
                    socket.emit('alerta', e);
                }
            }, function(error) {
                console.log(error + "serSIRenv_msg_sock"); // Stacktrace
            }).catch(error => {
                console.log(error.message)
                throw error.message
            });
        } catch (e) {
            console.log(e);
            socket.emit('alerta', e);
        }
    });
    //---Consulta todos los mensajes en orden cronologico
    socket.on('serSIRenv_sock_all_msg', function (data) {
        
        try {
            var result = parametros(data);
            SIRsic_param.SIRsic_param("post", result.url, result.qs, result.body).then((urlMongo) => {
                try {
                    
                    if ((urlMongo === 4)) {
                        throw msg_error[4].Estado;
                    }
                    if ((urlMongo.eeEstados[0].Returnid !== 0) || (urlMongo === "Servicio invalido o desconectado")) {
                        throw urlMongo.eeEstados[0].Estado;
                    } else {
                        urlMongo = urlMongo.eesic_param[0].param__val;
                    }
                    if ((result.arrayserv === undefined)) {
                        throw msg_error[1];
                    }
                    console.log("Consulta All mensajes");
                    if (result.arrayserv.length !== 0) {

                        base_bita_crud.findSort(urlMongo, {}
                        ,  result.arrayserv[0]).then((respFind) => {

                            if (respFind[0].mensaje !== undefined) {
                                socket.to("rooms:" + respFind[0].usr_cod).emit('cliSIRmsg_allMsg', []);
                                    
                            } else {
                                socket.to("rooms:" + respFind[0].usr_cod).emit('cliSIRmsg_allMsg', respFind);
                                socket.emit("rooms:" + respFind[0].usr_cod).emit('cliSIRmsg_allMsg', respFind);
                                //                          
                            }
                        }).catch(err=>{
                            console.log(err)
                            socket.emit('alerta', err);
                            console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
                            console.log('Error en SIRsic_param find del servicio:  socket serUbpm_taskBitacora put sir_bpm_task.js')
                        });  
                        
                        
                    }
                } catch (e) {
                    console.log(e);
                    socket.emit('alerta', e);
                }
            }, function(error) {
                console.log(error + "serSIRenv_msg_sock"); // Stacktrace
            }).catch(error => {
                console.log(error.message)
                throw error.message
            });
        } catch (e) {
            console.log(e);
            socket.emit('alerta', e);
        }
    });
    socket.on('serSIRenv_filtr_msg', function (data) {
        
        try {
            var result = parametros(data);
            SIRsic_param.SIRsic_param("post", result.url, result.qs, result.body).then((urlMongo) => {
                try {
                    
                    if ((urlMongo === 4)) {
                        throw msg_error[4].Estado;
                    }
                    if ((urlMongo.eeEstados[0].Returnid !== 0) || (urlMongo === "Servicio invalido o desconectado")) {
                        throw urlMongo.eeEstados[0].Estado;
                    } else {
                        urlMongo = urlMongo.eesic_param[0].param__val;
                    }
                    if ((result.arrayserv === undefined)) {
                        throw msg_error[1];
                    }
                    if (result.arrayserv.length !== 0) {
                        console.log(JSON.stringify( data.dsMongo.filter_param[0]) );
                        base_bita_crud.group(urlMongo, [ {
                                $match:data.dsMongo.filter_param[0],
                                
                            },
                            {
                                $group: {
                                    _id: '$sal_cod',  
                                    "msgTotales": {$sum: 1},
                                    "msgNoleidos": { $sum: { $cond: ["$sal_msg_est", 0, 1] }},
                                    "message": { "$last": "$sal_msg_msg" },
                                    "usrOrg": { "$last": "$usr_cod_org" },
                                    "typeMsg": { "$last": "$sal_msg_type" },
                                    "salCod": { "$last": "$sal_cod" },
                                    "usr_cod": { "$last": "$usr_cod"},
                                    time: { "$last": "$msg_time" }
                                }
                            }, {
                                $sort : {time : -1}
                            }
                        ],result.arrayserv[0]).then((respFind) => {
                            
                            console.log(respFind)
                            if (respFind[0].mensaje !== undefined) {
                                socket.to("rooms:" + respFind[0].usr_cod).emit('cliSIRmsg_list', []);
                                    
                            } else {
                                socket.to("rooms:" + respFind[0].usr_cod).emit('cliSIRmsg_list', respFind);
                                socket.emit("rooms:" + respFind[0].usr_cod).emit('cliSIRmsg_list', respFind);
                                //                          
                            }
                        }).catch(err=>{
                            console.log(err)
                            socket.emit('alerta', err);
                            console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
                            console.log('Error en SIRsic_param find del servicio:  socket serUbpm_taskBitacora put sir_bpm_task.js')
                        });
                    }
                } catch (e) {
                    console.log(e);
                    socket.emit('alerta', e);
                }
            }, function(error) {
                console.log(error + "serSIRenv_msg_sock"); // Stacktrace
            }).catch(error => {
                console.log(error.message)
                throw error.message
            });
        } catch (e) {
            console.log(e);
            socket.emit('alerta', e);
        }
    });
}


