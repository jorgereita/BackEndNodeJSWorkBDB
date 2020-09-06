/**
 * modulo rest Api para enviar mensajes
 * @param {*} router 
 * @param {*} io instancia socket clientye a la que se va a conectar
 * @param {*} fs 
 * @param {*} msg_error json de errores
 * @param {*} SIRsic_param servicio abl para obtener la url de bd mongo a la que se va a conectar 
 */
module.exports = function (router, io, fs, msg_error, SIRsic_param) {
    var base_bita_crud = require("../crud/base_bita_crud");
    var all_collections = require("../all_collections");
    ////////////////////////parametros para todos los servicios/////////////////////////////////////////
    function parametros(req, res) {
        var body = {
            "dsSIRsic_param": {
                "eeDatos": req.body.dsMongo.eeDatos,
                "eeSIRsic_param": [{
                        "picparam__id": "urlMongo"
                    }]
            }
        };        
        
        var myurl;
        if(req.body.dsMongo.eeConfig[0].serv_ip.startsWith("http")){
            myurl = req.body.dsMongo.eeConfig[0].serv_ip + '/rest/Parameters/SIRsic_param'
        }else{
            myurl = 'http://' + req.body.dsMongo.eeConfig[0].serv_ip + '/rest/Parameters/SIRsic_param'
        }
        
        var result = {
            "token": req.body.idWeb || req.query.idWeb || req.headers['idWeb'],
            "socketi": req.app.get('io'),
            "arrayserv": req.body.dsMongo.env_msg_sock,
            "url": myurl,
            "qs": { idWeb: req.body.idWeb || req.query.idWeb || req.headers['idWeb'] },
            "body": body
        }
        return result;
    }
    /**
     * servicio para crear mensaje
     */
    router.route('/serCUDenv_msg_sock').post(function (req, res) {
        try {
            var result = parametros(req, res);
            SIRsic_param.SIRsic_param("post", result.url, result.qs, result.body).then((urlMongo) => {
                try {
                    if ((urlMongo === 4)) {
                        throw urlMongo;
                    }
                    if ((urlMongo.eeEstados[0].Returnid !== 0) || (urlMongo === "Servicio invalido o desconectado")) {
                        throw urlMongo;
                    } else {
                        urlMongo = urlMongo.eesic_param[0].param__val;
                    }
                    if ((result.arrayserv === undefined)) {
                        throw msg_error[1];
                    }
                    if (result.arrayserv.length !== 0) {
                        
                        for (var i = 0; i < result.arrayserv.length; i++) {
                            base_bita_crud.save(urlMongo, result.arrayserv[i]).then((response) => {
                                result.socketi.to("rooms:" + response.usr_cod).emit('bitacora', response);
                                result.socketi.to("rooms:" + response.usr_cod).emit('cliSIRmsg_bit', response);
                                // base_bita_crud.find(urlMongo, { usr_cod: response.usr_cod },response).then((respFind) => {
                                //   if(respFind.mensaje===msg_error[6].Estado){
                                //     result.socketi.to("rooms:" + respFind[0].usr_cod).emit('bitacora', []);
                                //   }else{
                                //     // socketi.to("rooms:" +response.destino).emit('notificacion', req.body);
                                //     result.socketi.to("rooms:" + respFind[0].usr_cod).emit('bitacora', respFind);
                                //   }
                                // });
                            }).catch(err => {
                                console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
                                console.log('Error en save del servicio: serCUDenv_msg_sock post env_msg_sock.js')
                            });
                        }
                    }
                    res.json({ eeEstados: [msg_error[0]], Body: req.body });
                } catch (e) {
                    res.json(e);
                    throw e;
                }
                res.end();
            }).catch(err => {
                res.json(err);
                res.end();
                console.log(err);
            });
        } catch (e) {
            console.log(e);
            res.json(e);
        }
    });
    /**
     * servicio delete para borrar de Mensajes
     */
    router.route('/serCUDenv_msg_sock').delete(function (req, res) {
        try {
            var result = parametros(req, res);
            SIRsic_param.SIRsic_param("post", result.url, result.qs, result.body).then((urlMongo) => {
                try {
                    if ((urlMongo === 4)) {
                        throw urlMongo;
                    }
                    if ((urlMongo.eeEstados[0].Returnid !== 0) || (urlMongo === "Servicio invalido o desconectado")) {
                        throw urlMongo;
                    } else {
                        urlMongo = urlMongo.eesic_param[0].param__val;
                    }
                    if ((result.arrayserv === undefined)) {
                        throw msg_error[1];
                    }
                    if (result.arrayserv.length !== 0) {
                        for (var i = 0; i < result.arrayserv.length; i++) {
                            console.log(result.arrayserv[i])
                            base_bita_crud.remove(urlMongo, { sal_msg_msg : result.arrayserv[i].sal_msg_msg  }, result.arrayserv[i]).then((response) => {
                                
                                base_bita_crud.find(urlMongo, { usr_cod: response.usr_cod }, response).then((respFind) => {
                                    if (respFind.mensaje === undefined) {
                                        result.socketi.to("rooms:" + respFind[0].usr_cod).emit('bitacora', []);
                                    } else {
                                        result.socketi.to("rooms:" + respFind[0].usr_cod).emit('bitacora', respFind);
                                    }
                                }).catch(err=>{
                                    console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
                                    console.log('Error en find del servicio: serCUDenv_msg_sock delete env_msg_sock.js')
                                });
                                
                            }).catch(err=>{
                                console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
                                console.log('Error en remove del servicio: serCUDenv_msg_sock delete env_msg_sock.js')
                            });
                        }
                    }
                    res.json({ eeEstados: [msg_error[0]], Body: req.body });
                } catch (e) {
                    res.json(e);
                    throw e;
                }
                res.end();
            }).catch(err => {
                res.json(err);
                res.end();
                console.log(err);
            });
        } catch (e) {
            console.log(e);
            res.json(e);
        }
    });
    /**
     * Servicio update para actualizar Mensaje
     */
    router.route('/serCUDenv_msg_sock').put(function (req, res) {
        try {
            var result = parametros(req, res);
            SIRsic_param.SIRsic_param("post", result.url, result.qs, result.body).then((urlMongo) => {
                try {
                    if ((urlMongo === 4)) {
                        throw urlMongo;
                    }
                    if ((urlMongo.eeEstados[0].Returnid !== 0) || (urlMongo === "Servicio invalido o desconectado")) {
                        throw urlMongo;
                    } else {
                        urlMongo = urlMongo.eesic_param[0].param__val;
                    }
                    if ((result.arrayserv === undefined)) {
                        throw msg_error[1];
                    }
                    if (result.arrayserv.length !== 0) {
                        for (var i = 0; i < result.arrayserv.length; i++) {
                            base_bita_crud.update(urlMongo, { sal_msg_msg: result.arrayserv[i].sal_msg_msg }, result.arrayserv[i], result.arrayserv[i]).then((response) => {
                                
                                base_bita_crud.find(urlMongo, { usr_cod: response.usr_cod }, response).then((respFind) => {
                                    if (respFind.mensaje !== undefined) {
                                        result.socketi.to("rooms:" + respFind[0].usr_cod).emit('bitacora', []);
                                    } else {
                                        result.socketi.to("rooms:" + respFind[0].usr_cod).emit('bitacora', respFind);
                                    }
                                }).catch(err=>{
                                    console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
                                    console.log('Error en find del servicio: serCUDenv_msg_sock put env_msg_sock')
                                });
                                
                            }).catch(err=>{
                                console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
                                console.log('Error en update del servicio: serCUDenv_msg_sock put env_msg_sock.js')
                            });
                        }
                    }
                    res.json({ eeEstados: [msg_error[0]], Body: req.body });
                } catch (e) {
                    res.json(e);
                    throw e;
                }
                res.end();
            }).catch(err => {
                res.json(err);
                res.end();
                console.log(err);
            });
        } catch (e) {
            console.log(e);
            res.json(e);
        }
    });
    /**
     * lista de Mensajes
     */
    router.route('/serSIRenv_msg_sock').post(function (req, res) {
        try {
            var result = parametros(req, res);
            SIRsic_param.SIRsic_param("post", result.url, result.qs, result.body).then((urlMongo) => {
                try {
                    if ((urlMongo === 4)) {
                        throw urlMongo;
                    }
                    if ((urlMongo.eeEstados[0].Returnid !== 0) || (urlMongo === "Servicio invalido o desconectado")) {
                        throw urlMongo;
                    } else {
                        urlMongo = urlMongo.eesic_param[0].param__val;
                    }
                    if ((result.arrayserv === undefined)) {
                        throw msg_error[1];
                    }
                    if (result.arrayserv.length !== 0) {
                        for (var i = 0; i < result.arrayserv.length; i++) {
                            base_bita_crud.find(urlMongo, { sal_cod: result.arrayserv[i].sal_cod }, result.arrayserv[i]).then((respFind) => {
                                if (respFind.mensaje !== undefined) {
                                    result.socketi.to("rooms:" + respFind[0].usr_cod).emit('cliSIRmsg_bitAll', []);
                                } else {
                                    result.socketi.to("rooms:" + respFind[0].usr_cod).emit('cliSIRmsg_bitAll', respFind);
                                }
                            }).catch(err=>{
                                console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
                                console.log('Error en find del servicio: serSIRenv_msg_sock post env_msg_sock.js')
                            });
                        }
                    }
                    res.json({ eeEstados: [msg_error[0]], Body: req.body });
                } catch (e) {
                    res.json(e);
                    throw e;
                }
                res.end();
            }).catch(err => {
                res.json(err);
                res.end();
                console.log(err);
            });
        } catch (e) {
            console.log(e);
            res.json(e);
        }
    });
    
    router.post('/env_msg_sock', function (req, res) {
        try {
            // console.log(req);
            var token = req.body.idWeb || req.query.idWeb || req.headers['idWeb'];
            var socketi = req.app.get('io');
            var transmision = req.body.dsMongo.eeConfig[0].transmision;
            var respuestaServ = 'mensaje enviado a: ';
            var arrayserv = req.body.dsMongo.env_msg_sock;
            var method = 'POST';
            
            var url;
            if(req.body.dsMongo.eeConfig[0].serv_ip.startsWith("http")){
                url = req.body.dsMongo.eeConfig[0].serv_ip + '/rest/Parameters/SIRsic_param'
            }else{
                url = 'http://' + req.body.dsMongo.eeConfig[0].serv_ip + '/rest/Parameters/SIRsic_param'
            }
            
            var qs = { idWeb: token };
            var body = {
                "dsSIRsic_param": {
                    "eeDatos": req.body.dsMongo.eeDatos,
                    "eeSIRsic_param": [{
                            "picparam__id": "urlMongo"
                        }]
                }
            };
            SIRsic_param.SIRsic_param(method, url, qs, body).then((urlMongo) => {
                try {
                    if (transmision === "multicast") {
                        if ((urlMongo === 4)) {
                            throw urlMongo;
                        }
                        if ((urlMongo.eeEstados[0].Returnid !== 0) || (urlMongo === "Servicio invalido o desconectado")) {
                            throw urlMongo;
                        } else {
                            urlMongo = urlMongo.eesic_param[0].param__val;
                        }
                        if ((arrayserv === undefined)) {
                            throw msg_error[1];
                        }
                        if (arrayserv.length !== 0) {
                            console.log('paso por /env_msg_sock')
                            console.log(JSON.stringify(arrayserv))
                            for (var i = 0; i < arrayserv.length; i++) {
                                var bita_crud = require("../crud/base_bita_crud");
                                bita_crud.save(urlMongo, arrayserv[i]).then((response) => {
                                    // socketi.to("rooms:" +response.destino).emit('notificacion', req.body);
                                    // socketi.to("rooms:" + response.usr_cod).emit('bitacora', response);
                                    socketi.to("rooms:" + response.usr_cod).emit('cliSIRmsg_bit', response);
                                    
                                }).catch(err=>{
                                    console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
                                    console.log('Error en save del servicio: env_msg_sock post env_msg_sock.js')
                                });
                            }
                        }
                    }
                    res.json({ eeEstados: [msg_error[0]], Body: req.body });
                } catch (e) {
                    res.json({ eeEstados: e });
                    throw e;
                }
                res.end();
            }).catch(err => {
                res.json(err);
                res.end();
                console.log(err);
            });
        } catch (e) {
            console.log(e);
            res.json({ eeEstados: e });
        }
    });
    
    /**
     * servicio delete para borrar de Mensajes por el nodo que quiera
     */
    router.route('/serCUDenv_msg_sock_all').delete(function (req, res) {
        try {
            var result = parametros(req, res);
            SIRsic_param.SIRsic_param("post", result.url, result.qs, result.body).then((urlMongo) => {
                try {
                    if ((urlMongo === 4)) {
                        throw urlMongo;
                    }
                    if ((urlMongo.eeEstados[0].Returnid !== 0) || (urlMongo === "Servicio invalido o desconectado")) {
                        throw urlMongo;
                    } else {
                        urlMongo = urlMongo.eesic_param[0].param__val;
                    }
                    if ((result.arrayserv === undefined)) {
                        throw msg_error[1];
                    }
                    if (result.arrayserv.length !== 0) {
                        
                        all_collections.find(urlMongo, "_mensajes").then((msn) => {
                            var objCollections = [];
                            for (var i = 0; i < msn.length; i++) {
                                var arreglo = JSON.stringify(result.arrayserv[0]);
                                arreglo = JSON.parse(arreglo);
                                arreglo.usr_cod = msn[i].split("_mensajes")[0];
                                objCollections.push(arreglo)
                            }
                            var queryFind = {};
                            result.arrayserv = objCollections;
                            for (var i = 0; i < result.arrayserv.length; i++) {
                                var iarray = i;
                                base_bita_crud.remove(urlMongo, result.arrayserv[i], result.arrayserv[i]).then((response) => {
                                    base_bita_crud.find(urlMongo, { usr_cod: result.arrayserv[iarray].usr_cod }, result.arrayserv[iarray]).then((respFind) => {
                                        if (respFind.mensaje === undefined) {
                                            result.socketi.to("rooms:" + respFind[0].usr_cod).emit('bitacora', []);
                                        } else {
                                            result.socketi.to("rooms:" + respFind[0].usr_cod).emit('bitacora', respFind);
                                        }
                                    }).catch(err=>{
                                        console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
                                        console.log('Error en find del servicio: env_msg_sock delete env_msg_sock.js')
                                    });
                                    
                                }).catch(err=>{
                                    console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
                                    console.log('Error en remove del servicio: env_msg_sock delete env_msg_sock.js')
                                });
                            }
                        }, function (error) {
                            console.log(error + "serCUDenv_msg_sock_all"); // Stacktrace
                        });
                        
                    }
                    res.json({ eeEstados: [msg_error[0]], Body: req.body });
                } catch (e) {
                    res.json(e);
                    throw e;
                }
                res.end();
            }).catch(err => {
                res.json(err);
                res.end();
                console.log(err);
            });
        } catch (e) {
            console.log(e);
            res.json(e);
        }
    });
    router.route('/serSir_msg_sock_group_sala').post(function (req, res) {
        try {
            var result = parametros(req, res);
            SIRsic_param.SIRsic_param("post", result.url, result.qs, result.body).then((urlMongo) => {
                try {
                    if ((urlMongo === 4)) {
                        throw urlMongo;
                    }
                    if ((urlMongo.eeEstados[0].Returnid !== 0) || (urlMongo === "Servicio invalido o desconectado")) {
                        throw urlMongo;
                    } else {
                        urlMongo = urlMongo.eesic_param[0].param__val;
                    }
                    if ((result.arrayserv === undefined)) {
                        throw msg_error[1];
                    }
                    if (result.arrayserv.length !== 0) {
                        for (var i = 0; i < result.arrayserv.length; i++) {
                            base_bita_crud.group(urlMongo, [
                                {
                                    $group: {
                                        _id: '$sal_cod',  
                                        count: {$sum: 1},
                                        "message": { "$last": "$sal_msg_msg" },
                                        "message1": { "$last": "$usr_cod_org" },
                                    }
                                }
                            ], result.arrayserv[i]).then((respFind) => {
                                res.json(respFind);
                                res.end();
                                if (respFind.mensaje !== undefined) {
                                    res.json(respFind);
                                    res.end();
                                    result.socketi.to("rooms:" + respFind[0].usr_cod).emit('cliSIRmsg_bitAll', []);
                                } else {
                                    result.socketi.to("rooms:" + respFind[0].usr_cod).emit('cliSIRmsg_bitAll', respFind);
                                }
                            }).catch(err=>{
                                console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
                                console.log('Error en find del servicio: serSIRenv_msg_sock post env_msg_sock.js')
                            });
                        }
                    }
                
                    //                res.json({ eeEstados: [msg_error[0]], Body: req.body });
               
                } catch (e) {
                    res.json(e);
                    throw e;
                }
                //            res.end();
            }).catch(err => {
                res.json(err);
                res.end();
                console.log(err);
            });
        } catch (e) {
            console.log(e);
            res.json(e);
        }
    });
    
    
    
}

//**** servicio consulta de todas las bitacoras para conversaciones
//
//router.route('/serSir_msg_sock_usr').post(function (req, res) {
//    try {
//        var result = parametros(req, res);
//        SIRsic_param.SIRsic_param("post", result.url, result.qs, result.body).then((urlMongo) => {
//            try {
//                if ((urlMongo === 4)) {
//                    throw urlMongo;
//                }
//                if ((urlMongo.eeEstados[0].Returnid !== 0) || (urlMongo === "Servicio invalido o desconectado")) {
//                    throw urlMongo;
//                } else {
//                    urlMongo = urlMongo.eesic_param[0].param__val;
//                }
//                if ((result.arrayserv === undefined)) {
//                    throw msg_error[1];
//                }
//                if (result.arrayserv.length !== 0) {
//                    for (var i = 0; i < result.arrayserv.length; i++) {
//                        base_bita_crud.find(urlMongo, { sal_cod: result.arrayserv[i].sal_cod }, result.arrayserv[i]).then((respFind) => {
//                            if (respFind.mensaje !== undefined) {
//                                result.socketi.to("rooms:" + respFind[0].usr_cod).emit('cliSIRmsg_bitAll', []);
//                            } else {
//                                result.socketi.to("rooms:" + respFind[0].usr_cod).emit('cliSIRmsg_bitAll', respFind);
//                            }
//                        }).catch(err=>{
//                            console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
//                            console.log('Error en find del servicio: serSIRenv_msg_sock post env_msg_sock.js')
//                        });
//                    }
//                }
//                res.json({ eeEstados: [msg_error[0]], Body: req.body });
//            } catch (e) {
//                res.json(e);
//                throw e;
//            }
//            res.end();
//        }).catch(err => {
//            res.json(err);
//            res.end();
//            console.log(err);
//        });
//    } catch (e) {
//        console.log(e);
//        res.json(e);
//    }
//});
//*****
