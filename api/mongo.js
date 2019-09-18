const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");

require("dotenv").config();

// Connection URL
const url = `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}`;

// Database Name
const dbName = process.env.MONGO_DB;

let conn = null;
let db = null;

let mongo = {};

mongo.connect = async function(connectionUrl = url) {
  console.log(`MongoDB Connection URL: ${connectionUrl}`);

  let client = new MongoClient(connectionUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  return new Promise((resolve, reject) => {
    client.connect(function(err) {
      if (err) {
        reject(err);
      } else {
        console.log("Connected successfully to server");
        conn = client;
        db = conn.db(dbName);
        resolve(true);
      }
    });
  });
};

mongo.close = function() {
  if (conn) {
    connn.close();
  }
};

mongo.nodesAll = async function() {
  if (!conn) {
    await mongo.connect();
  }
  let result = await db
    .collection("node")
    .find({}, { projection: { _id: 0 } })
    .toArray();
  return result;
}

mongo.nodesShow = async function(nodeId) {
  if (!conn) {
    await mongo.connect();
  }

  let result = await db
    .collection("node")
    .findOne({ nodeId: nodeId }, { projection: { _id: 0 } });

  return result;
}

mongo.nodesForAccount = async function(accountId) {
  if (!conn) {
    await mongo.connect();
  }
  let result = await db
    .collection("node")
    .find({ owner: accountId }, { projection: { _id: 0 } })
    .toArray();

  return result;
};

mongo.gesAll = async function() {
  if (!conn) {
    await mongo.connect();
  }
  let result = await db
    .collection("ge")
    .find({}, { projection: { _id: 0 } })
    .toArray();
  return result;
};

mongo.gesShow = async function(geId) {
  if (!conn) {
    await mongo.connect();
  }

  let result = await db
    .collection("ge")
    .findOne({ geId: geId }, { projection: { _id: 0 } });

  return result;
};

mongo.gesForAccount = async function(accountId) {
  if (!conn) {
    await mongo.connect();
  }
  let result = await db
    .collection("node")
    .find({ owner: accountId }, { projection: { _id: 0 } })
    .toArray();

  return result;
};

mongo.tcxsAll = async function() {
  if (!conn) {
    await mongo.connect();
  }
  let result = await db
    .collection("tcx")
    .find({}, { projection: { _id: 0 } })
    .toArray();
  return result;
};

mongo.tcxsShow = async function(tcxId) {
  if (!conn) {
    await mongo.connect();
  }

  let result = await db
    .collection("tcx")
    .findOne({ tcxId: tcxId }, { projection: { _id: 0 } });

  return result;
};

mongo.tcxsForGe = async function(geId) {
  if (!conn) {
    await mongo.connect();
  }
  let result = await db
    .collection("tcx")
    .find({ owner:geId }, { projection: { _id: 0 } })
    .toArray();

  return result;
};

mongo.accountsAll = async function() {
  return null;
};

mongo.accountsShow = async function(tcxId) {
  return null;
};

module.exports = mongo;
