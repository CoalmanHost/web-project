const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const dbURL = require('../config.js').dbURL;
const databaseName = 'web-project';
const playersCollectionName = 'players';
const cryptPassword = require('../logic/encrypting').cryptPassword;

class DatabaseClient {
    static addPlayer(player, callback) {
        let pid = undefined;
        MongoClient.connect(dbURL, function(err, client){
            if(err){
                return console.log(err);
            }
            const db = client.db(databaseName);
            const collection = db.collection(playersCollectionName);
            player.password = cryptPassword(player.password);
            DatabaseClient.getPlayerData(player, (result) => {
                if (result === null) {
                    collection.insertOne(player,function (err, result) {
                        if (err) console.log(err);
                        else pid = result.insertedId;
                        client.close();
                        callback(undefined, pid);
                    });
                }
                else {
                    client.close();
                    callback('Player already exists', pid);
                }
            });
        });
    }
    static getPlayerData(query, callback) {
        let player = undefined;
        let db = undefined;
        let collection = undefined;
        let client = undefined;

        MongoClient.connect(dbURL, function(err, client){
            if(err){
                console.log(err);
                callback(err, null);
                client.close();
                return;
            }
            const db = client.db(databaseName);
            const collection = db.collection(playersCollectionName);
            if (query._id) query._id = ObjectId(query._id);
            collection.findOne(query, (err, result) => {
                if (err) {
                    console.log(err);
                }
                else {
                    player = result;
                }
                client.close();
                callback(err, player);
            });
        });
    }
}

module.exports.DatabaseClient = DatabaseClient;