const MongoClient = require('mongodb').MongoClient;
const dbURL = require('../config.js').dbURL;
const databaseName = 'web-project';
const playersCollectionName = 'players';
const matchesCollectionName = 'matches';
const cardsCollectionName = 'cards';
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
            let cryptedPassword = cryptPassword(player.password);
            player.password = cryptedPassword;
            collection.insertOne(player,function (err, result) {
                if (err) console.log(err);
                pid = result.insertedId;
                client.close();
                callback(pid);
            });
        });
    }
    static getPlayerData(query, callback) {
        let player = undefined;
        let db = undefined;
        let collection = undefined;
        let client = undefined;
        MongoClient.connect(dbURL).then(cl => {
            client = cl;
            db = client.db(databaseName);
            collection = db.collection(playersCollectionName);
            console.log(`Getting data of player ${JSON.stringify(query)}`);
            return collection.findOne(query);
        }).then(res => {
            player = res;
            if (player === null) console.log(`Player ${JSON.stringify(query)} is not found`);
            else console.log(`Found player ${player.name} with id ${player._id}`);
            client.close();
            callback(player);
        }).catch(err => {
            console.log(err);
        });
    }
}

module.exports.DatabaseClient = DatabaseClient;