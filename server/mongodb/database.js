const MongoClient = require('mongodb').MongoClient;

const databaseName = 'web-project';
const playersCollectionName = 'players';
const matchesCollectionName = 'matches';
const cardsCollectionName = 'cards';

const crypto = require('crypto');

function cryptPassword(password) {
    return crypto.createHash('md5').update(password).digest('hex');
}

class Database {
    constructor() {
        //this.mongoClient = new MongoClient('mongodb://localhost:27017/', { useUnifiedTopology: true });
    }
    static addPlayer(player) {
        let mongoClient = new MongoClient('mongodb://localhost:27017/', { useUnifiedTopology: true });
        let pid = undefined;
        mongoClient.connect(function(err, client){
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
                return pid;
            });
        });
    }
    static getPlayerData(name, password) {
        let mongoClient = new MongoClient('mongodb://localhost:27017/', { useUnifiedTopology: true });
        let player = undefined;
        mongoClient.connect(function(err, client){

            if(err){
                return console.log(err);
            }
            const db = client.db(databaseName);
            const collection = db.collection(playersCollectionName);
            console.log(`Getting data of player ${name} with password ${password}`);
            collection.findOne({name: name, password: cryptPassword(password)}, function (err, result) {
                if (err) console.log(err);
                console.log(result);
                player = result;
                client.close();
                return player;
            });
        });
    }
}

module.exports = Database;