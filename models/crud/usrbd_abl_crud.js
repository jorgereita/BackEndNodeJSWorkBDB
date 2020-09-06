var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var Usrbd_abl = require("../../models/base/usrbd_abl");
/**
 * metodo crud para crear un registro en la tabla Usrbd_abls
 	Usrbd_abls_crud.save(data.urlMongo,data).then((successMessage) => {
      socket.emit('notificacion',successMessage);
    });
 * @param {*} urlMongo  parametro donde va la url de la base de datos a la cual se va a conectar
 * @param {*} data el objeto que va a ingresar a la tabla
 */
module.exports.save = function (urlMongo, data) {
	return new Promise((resolve, reject) => {
		var newUsr = new Usrbd_abl({
			usrId: data.usrId,
			onClick: "",
			onClose: "",
			onLoad: "",
			texto: data.texto,
			titulo: data.titulo,
			token: data.token,
			salas : [],
		});
		var connect = mongoose.connect(urlMongo, function (err, db) {
			if (err) {
				console.log('No se conectó crud save:' + err);
				// throw err;
			} else {
				console.log("Conectado a Base de datos Mongo crud save: " + urlMongo);
				//aca va micodigo de consulta a la base dedatos// 
				/////////////////////////////////////////////////
				newUsr.save(function (err, usrEnv) {
					console.log("enviando usuariodesde crud: " + usrEnv.socket);
					resolve(usrEnv);
				});
				/////////////////////////fin//////////////////////////
				db.close;
			}
		}).catch(err=>{
			console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
			// setTimeout(connect, 5000)
		  });
	});
}
/**
 * metodo para consultar todos los registros o documentos que hay en la tabla Usrbd_abls segun el filtro
 * Usrbd_abls_crud.find(data.urlMongo,{ usrId: data.usrId }).then((usr) => {
 * 		//lo que hace con la data
 * });
 * @param {*} urlMongo parametro donde va la url de la base de datos a la cual se va a conectar
 * @param {*} objFind el objeto que va a ingresar a la tabla con el cual hace el filtro para la busqueda
 */
module.exports.find = function (urlMongo, objFind) {
	return new Promise((resolve, reject) => {
		var connect = mongoose.connect(urlMongo, function (err, db) {
			if (err) {
				console.log('No se conectó crud find:' + err);
				// throw err;
			} else {
				console.log("Conectado a Base de datos Mongo crud find: " + urlMongo);
				//aca va micodigo de consulta a la base dedatos// 
				/////////////////////////////////////////////////
				Usrbd_abl.find(objFind, 
					function (err, usr) {
						resolve(usr);
					});
				/////////////////////////fin//////////////////////////
				db.close;
			}
		}).catch(err=>{
			console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
			// setTimeout(connect, 5000)
		  });
	});
}
/**
 * metodo para cambiar un registro en la tabla o colleccion Usrbd_abls
 * Usrbd_abls_crud.update(data.urlMongo,
                  { usrId: data.usrId },
                  {token: data.token, socket: socket.id}
                ).then((successMessage) => {
					///codigo que hace despues del cambio
				});
 * @param {*} urlMongo parametro donde va la url de la base de datos a la cual se va a conectar
 * @param {*} objFind objeto para hacer el filtro
 * @param {*} objUpdate objeto con los nodos que van a cambiar
 */
module.exports.update = function (urlMongo, objFind ,objUpdate) {
	return new Promise((resolve, reject) => {
		var connect = mongoose.connect(urlMongo, function (err, db) {
			if (err) {
				console.log('No se conectó crud update:' + err);
				// throw err;
			} else {
				console.log("Conectado a Base de datos Mongo crud update: " + urlMongo);
				//aca va micodigo de consulta a la base dedatos// 
				/////////////////////////////////////////////////
				Usrbd_abl.update(objFind, objUpdate, { upsert: true },
					function (err, usr) {
						resolve(usr);
					});
				/////////////////////////fin//////////////////////////
				db.close;
			}
		}).catch(err=>{
			console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
			// setTimeout(connect, 5000)
		  });
	});
}
/**
 * metodo para remover un registro o una documento en la tabla o colecion Usrbd_abls
 * Usrbd_abls_crud.remove(data.urlMongo,{ token: data.token }).then((usr) => {
	  console.log(usr);
	}); 
 * @param {*} urlMongo parametro donde va la url de la base de datos a la cual se va a conectar
 * @param {*} objFind obje para hacer el filtro de la consulta
 */
module.exports.remove = function (urlMongo, objFind) {
	return new Promise((resolve, reject) => {
		var connect = mongoose.connect(urlMongo, function (err, db) {
			if (err) {
				console.log('No se conectó crud remove:' + err);
				// throw err;
			} else {
				console.log("Conectado a Base de datos Mongo crud remove: " + urlMongo);
				//aca va micodigo de consulta a la base dedatos// 
				/////////////////////////////////////////////////
				Usrbd_abl.remove(objFind,
					function (err, usr) {
						resolve(usr);
					});
				/////////////////////////fin//////////////////////////
				db.close;
			}
		}).catch(err=>{
			console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
			// setTimeout(connect, 5000)
		  });
	});
}

