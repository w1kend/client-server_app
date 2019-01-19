const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const Mongo = require("mongodb").MongoClient;
const objectID = require("mongodb").ObjectID;


var app = express();
var jsonParser = bodyParser.json();
var mongoClient = new Mongo("/mongodb://localhost:27017/", {useNewUrlParser: true});
let dbClient;
//connect to db
mongoClient.connect((err,client) => {

	if(err) {
		return console.log(err);
	}

	dbClient = client;
	app.locals.collection = client.db("usersdb").collection("users");
	console.log("mongodb is available");
	app.listen(3000 ,() => {
		console.log("Listening 3000 port");
	});

});
// start page 
app.get("/", (req,res) => {
	res.sendFile(__dirname + "/index.html")
});
// get all users
app.get("/api/users", (req,res) => {

	const collection = req.app.locals.collection;
	collection.find({}).toArray( (err,users) => {
		if(err) return console.log(err);
		res.send(users);
		console.log(users);
	})
	/*let users = JSON.parse(fs.readFileSync("users.json","utf8"));
	res.send(users);*/

});
// get user with id
app.get("/api/users/:id", (req,res) => {


	const id = new objectID(req.params.id);
	const collection = req.app.locals.collection;
	collection.findOne({_id: id}, (err,user) => {
		if (err) return console.log(err);
		res.send(user);
	});
	/*let id = req.params.id;
	let users = JSON.parse(fs.readFileSync("users.json","utf8"));
	//let users = JSON.parse(content);
	console.log(users);
	users.map((user) => {
		if(user && user.id == id)
			res.send(user);
	});
	res.sendStatus(404);*/
});
// add new user
app.post("/api/users", jsonParser, (req,res) => {

	if(!req.body) return res.sendStatus(400);

	const user = {name: req.body.name, age: req.body.age};
	console.log(user);
	
	const collection = req.app.locals.collection;
	collection.insertOne(user, (err,result) => {
		if (err) return console.log(err);
		res.send(user);
	});
	/*let data = JSON.parse(fs.readFileSync("users.json","utf8"));
	//новый id = количество юзеров в дате + 1
	user.id = data.length + 1;
	data.push(user);
	fs.writeFileSync("users.json",JSON.stringify(data));
	console.log(JSON.stringify(data));
	res.send(user);*/


});
// delete user with id
app.delete("/api/users/:id", (req,res) => {

	
	const id = new objectID(req.params.id);
	console.log(id);
	const collection = req.app.locals.collection;
	collection.findOneAndDelete({_id: id}, (err,result) => {
		if (err) return console.log(err);
		let user = result.value;
		res.send(user);
	});
	/*let data = JSON.parse(fs.readFileSync("users.json","utf8"));
	let deletedUser = {};
	data = data.filter((user) => {

		if(user.id == id)
			deletedUser = user;
		return user.id != id;
	});
	console.log(deletedUser,"\n-------------",data);
	fs.writeFileSync("users.json",JSON.stringify(data));
	res.send(deletedUser);*/


});

// update user info
app.put("/api/users", jsonParser, (req,res) => {

	if(!req.body) return res.sendStatus(400);
	console.log("update user",req.body);
	const id = new objectID(req.body.id);
    const userName = req.body.name;
    const userAge = req.body.age;

    const collection = req.app.locals.collection;
    collection.findOneAndUpdate({_id: id}, {$set: {age: userAge, name: userName}},
		{returnOriginal: false}, (err,result) => {
			if(err) return console.log(err);     
        	const user = result.value;
        	res.send(user);
		});    	
	/*let data = JSON.parse(fs.readFileSync("users.json","utf8"));
	let err = true;
	data.filter((user) => {

		if(user.id == req.body.id){ 

			user.age = req.body.age;
			user.name = req.body.name;
			res.send(user);
			fs.writeFileSync("users.json",JSON.stringify(data));
			err=false;
			return true;
		}
		
	});
	console.log("put-user",user);
	if(err) return res.sendStatus(404);*/

});

// ctrl-c to close db connection

process.on("SIGINT", ()=> {
	dbClient.close();
	process.exit();
})