/**
 * modulo rest Api para el servicio bpm_task
 * @param {*} router 
 * @param {*} io instancia socket clientye a la que se va a conectar
 * @param {*} fs 
 * @param {*} msg_error json de errores
 * @param {*} SIRsic_param servicio abl para obtener la url de bd mongo a la que se va a conectar 
 */
var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
module.exports = function (router, io, fs, msg_error, SIRsic_param) {
    var bpm_task_crud = require("../crud/bpm_task_crud");
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
            "arrayserv": req.body.dsMongo.eebpm_task,
            // "url":   req.body.dsMongo.eeConfig[0].serv_ip + '/rest/Parameters/SIRsic_param',
            "url": myurl,
            "qs": {idWeb: req.body.idWeb || req.query.idWeb || req.headers['idWeb']},
            "body": body
        }
        return result;
    }
    /**
     * servicio para crear tarea
     */
    router.route('/serCUDbpm_task').post(function (req, res) {
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
                            result.arrayserv[i].usr_cod = result.arrayserv[i].usr__cod || result.arrayserv[i].usr_cod;
                            bpm_task_crud.save(urlMongo, result.arrayserv[i]).then((response) => {
                                bpm_task_crud.find(urlMongo, {usr_cod: response.usr_cod}, response).then((tareas) => {
                                    if (tareas.mensaje === msg_error[6].Estado) {
                                        result.socketi.to("rooms:" + tareas[0].usr_cod).emit('cliSIRbpm_task', []);
                                    } else {
                                        result.socketi.to("rooms:" + tareas[0].usr_cod).emit('cliSIRbpm_task', tareas);
                                    }
                                }).catch(err => {
                                    console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
                                    console.log('Error en find del servicio: serCUDbpm_task post bpm_task.js')
                                });
                                ;
                            }).catch(err => {
                                console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
                                console.log('Error en save del servicio: serCUDbpm_task post bpm_task.js')
                            });
                            ;
                        }
                    }
                    res.json({eeEstados: [msg_error[0]], Body: req.body});
                } catch (e) {
                    res.json(e);
                    throw e;
                }
                res.end();
            }, function (error) {
                res.json(error);
                console.log(error + "serCUDbpm_task"); // Stacktrace
            });
        } catch (e) {
            console.log(e);
            res.json(e);
        }
    });
    /**
     * servicio delete para borrar de Tareas
     */
    router.route('/serCUDbpm_task').delete(function (req, res) {
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
                            result.arrayserv[i].usr_cod = result.arrayserv[i].usr__cod || result.arrayserv[i].usr_cod;
                            bpm_task_crud.remove(urlMongo, {task__id: result.arrayserv[i].task__id, wiid: result.arrayserv[i].wiid}, result.arrayserv[i]).then((response) => {
                                if (response.respuesta.ok !== 1) {
                                    throw msg_error[7].Estado
                                } else {
                                    bpm_task_crud.find(urlMongo, {usr_cod: response.data.usr_cod}, response.data).then((tareas) => {
                                        if (tareas.mensaje !== undefined) {
                                            result.socketi.to("rooms:" + tareas[0].usr_cod).emit('cliSIRbpm_task', []);
                                        } else {
                                            result.socketi.to("rooms:" + tareas[0].usr_cod).emit('cliSIRbpm_task', tareas);
                                        }
                                    }).catch(err => {
                                        console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
                                        console.log('Error en find del servicio: serCUDbpm_task delete bpm_task.js')
                                    });
                                }

                            }).catch(err => {
                                console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
                                console.log('Error en remove del servicio: serCUDbpm_task delete bpm_task.js')
                            });
                        }
                    }
                    res.json({eeEstados: [msg_error[0]], Body: req.body});
                } catch (e) {
                    res.json(e);
                    throw e;
                }
                res.end();
            }, function (error) {
                res.json(error);
                console.log(error + "serCUDbpm_task"); // Stacktrace
            });
        } catch (e) {
            console.log(e);
            res.json(e);
        }
    });
    /**
     * Servicio update para actualizar Tareas
     */
    router.route('/serCUDbpm_task').put(function (req, res) {
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
                        result.arrayserv = [({usr_cod: req.body.dsMongo.eeDatos[0].picusrcod})]
                    }
                    if (result.arrayserv.length !== 0) {
                        result.arrayserv[0].usr_cod = result.arrayserv[0].usr__cod || result.arrayserv[0].usr_cod;
//                        bpm_task_crud.removeAll(urlMongo, {usr_cod: result.arrayserv[0].usr_cod}, result.arrayserv[0]).then((response) => {
                            for (var i = 0; i < result.arrayserv.length; i++) {
                                let ultimo = false;
                                if (result.arrayserv.length - 1 === i) {
                                    ultimo = true;
                                }
                                // sugerencia: puede crearse un update recursivo y al fina el find para que no actualiza tantas veces
                                result.arrayserv[i].usr_cod = result.arrayserv[i].usr__cod || result.arrayserv[i].usr_cod;
                                bpm_task_crud.update(urlMongo, {task__id: result.arrayserv[0].task__id, wiid: result.arrayserv[i].wiid}, result.arrayserv[i], result.arrayserv[i]).then((response) => {
                                    if (response.respuesta.ok !== 1) {
                                        throw msg_error[7].Estado
                                    } else {
                                        if (ultimo) {
                                            bpm_task_crud.find(urlMongo, {usr_cod: result.arrayserv[0].usr__cod}, response.data).then((tareas) => {
                                                if ((tareas[0].mensaje !== undefined)) {
                                                    result.socketi.to("rooms:" + result.arrayserv[0].usr_cod).emit('cliSIRbpm_task', []);
                                                } else {
                                                    result.socketi.to("rooms:" + result.arrayserv[0].usr_cod).emit('cliSIRbpm_task', tareas);
                                                }
                                                // mongoose.connection.close();
                                            }).catch(err => {
                                                console.log(err)
                                                console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
                                                console.log('Error en find del servicio: serCUDbpm_task put bpm_task.js')
                                            });
                                        }
                                    }
                                }).catch(err => {
                                    console.log(err)
                                    console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
                                    console.log('Error en update del servicio: serCUDbpm_task put bpm_task.js')
                                });
                            }
//                        }).catch(err => {
//                            console.log(err)
//                            console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
//                            console.log('Error en removeAll del servicio: serCUDbpm_task put bpm_task.js')
//                        });
                    }
                    res.json({eeEstados: [msg_error[0]], Body: req.body});
                } catch (e) {
                    res.json({eeEstados: [msg_error[e]], Body: req.body});
                    // res.json(e);
                    throw e;
                }
                res.end();
            }, function (error) {
                res.json(error);
                console.log(error + "serCUDbpm_task"); // Stacktrace
            });
        } catch (e) {
            console.log(e);
            res.json(e);
        }
    });


    /**
     * Servicio update para actualizar la bitacora de la tarea
     */
    router.route('/serUbpm_taskBitacora').put(function (req, res) {
        try {
            var result = parametros(req, res);
            var sum = 0;
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

                        all_collections.find(urlMongo, "_bpm_tasks").then((tareas) => {
                            var objCollections = [];
                            for (var i = 0; i < tareas.length; i++) {
                                objCollections.push({"usr_cod": tareas[i].split("_bpm_tasks")[0]})
                            }

                            for (var j = 0; j < objCollections.length; j++) {
                                for (var i = 0; i < result.arrayserv.length; i++) {
                                    bpm_task_crud.findOneAndUpdate(urlMongo, {
                                        usr_cod: objCollections[j].usr_cod,
                                        task__id: result.arrayserv[i].task__id,
                                        wiid: result.arrayserv[i].wiid
                                    }, {bitacora: result.arrayserv[i].bitacora}, result.arrayserv[i]).then((tareas) => {
                                        if (tareas !== null) {
                                            bpm_task_crud.find(urlMongo, {usr_cod: tareas.usr_cod}, tareas).then((tareas) => {
                                                if (tareas.mensaje !== undefined) {
                                                    result.socketi.to("rooms:" + tareas[0].usr_cod).emit('cliSIRbpm_task', []);
                                                } else {
                                                    result.socketi.to("rooms:" + tareas[0].usr_cod).emit('cliSIRbpm_task', tareas);
                                                }
                                            }).catch(err => {
                                                console.log(err)
                                                console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
                                                console.log('Error en find del servicio:  serUbpm_taskBitacora put bpm_task.js')
                                            });
                                        }
                                    }).catch(err => {
                                        console.log(err)
                                        console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
                                        console.log('Error en findOneAndUpdate del servicio:  serUbpm_taskBitacora put bpm_task.js')
                                    });
                                }
                            }
                        }).catch(err => {
                            console.log(err)
                            console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
                            console.log('Error en all_collections find del servicio:  serUbpm_taskBitacora put bpm_task.js')
                        });
                    }
                    res.json({eeEstados: [msg_error[0]], Body: req.body});
                } catch (e) {
                    res.json({eeEstados: [msg_error[e]], Body: req.body});
                    // res.json(e);
                    throw e;
                }
                res.end();
            }, function (error) {
                res.json(error);
                console.log(error + "serCUDbpm_task"); // Stacktrace
            });
        } catch (e) {
            console.log(e);
            res.json(e);
        }
    });
    /**
     * lista de tareas
     */
    router.route('/serSIRbpm_task').post(function (req, res) {
        var mongoose = require('mongoose');
        mongoose.Promise = global.Promise;
        try {
            var result = parametros(req, res);
            SIRsic_param.SIRsic_param("post", result.url, result.qs, result.body).then((urlMongo) => {
                try {
                    if ((urlMongo === 4)) {
                        res.json(urlMongo);
                        throw urlMongo;
                    }
                    if ((urlMongo.eeEstados[0].Returnid !== 0) || (urlMongo === "Servicio invalido o desconectado")) {
                        res.json(urlMongo);
                        throw urlMongo;
                    } else {
                        urlMongo = urlMongo.eesic_param[0].param__val;
                    }
                    if ((result.arrayserv === undefined)) {
                        res.json(urlMongo);
                        throw msg_error[1];
                    }
                    if (result.arrayserv.length !== 0) {
                      console.log("pasa por asdasdasd********"); 
                        bpm_task_crud.find2(urlMongo, result.arrayserv, 0, [], res, bpm_task_crud);
                    }
                } catch (e) {
                    throw e;
                }
            }, function (error) {
                res.json(error);
                console.log(error + "serCUDbpm_task"); // Stacktrace
            });
        } catch (e) {
            console.log(e);
            res.json(e);
        }
    });
    /**
     * lista de tareas de todos los usuarios 
     */
    router.route('/serSIRallTask').post(function (req, res) {
        var mongoose = require('mongoose');
        mongoose.Promise = global.Promise;
        try {
            var result = parametros(req, res);
            SIRsic_param.SIRsic_param("post", result.url, result.qs, result.body).then((urlMongo) => {
                try {
                    if ((urlMongo === 4)) {
                        res.json(urlMongo);
                        throw urlMongo;
                    }
                    if ((urlMongo.eeEstados[0].Returnid !== 0) || (urlMongo === "Servicio invalido o desconectado")) {
                        res.json(urlMongo);
                        throw urlMongo;
                    } else {
                        urlMongo = urlMongo.eesic_param[0].param__val;
                    }
                    all_collections.find(urlMongo, "_bpm_tasks").then((tareas) => {
                        var objCollections = [];
                             console.log("pasa por asdasdasd********"); 
                        for (var i = 0; i < tareas.length; i++) {
                            objCollections.push({"usr_cod": tareas[i].split("_bpm_tasks")[0]})
                        }
                        var queryFind = {};
                        if (req.body.dsMongo.eebpm_task) {
                            queryFind = req.body.dsMongo.eebpm_task[0];
                            Object.keys(queryFind).forEach(function (k) {
                                if (queryFind[k] === "*") {
                                    delete queryFind[k];
                                }
                            });
                        }
                        bpm_task_crud.find2Query(urlMongo, objCollections, 0, [], res, bpm_task_crud, queryFind);
                    }).catch(err => {
                        console.log(err)
                        console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
                        console.log('Error en all_collections find del servicio:  serSIRallTask post bpm_task.js')
                    });
                } catch (e) {
                    throw e;
                }
            }, function (error) {
                res.json(error);
                console.log(error + "serCUDbpm_task"); // Stacktrace
            });
        } catch (e) {
            console.log(e);
            res.json(e);
        }
    });
};

