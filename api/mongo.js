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
    .collection("nodes")
    .find({}, { projection: { _id: 0 } })
    .toArray();
  return result;
}

mongo.nodesShow = async function(nodeId) {
  if (!conn) {
    await mongo.connect();
  }

  let result = await db
    .collection("nodes")
    .findOne({ nodeId: nodeId }, { projection: { _id: 0 } });

  return result;
}

mongo.nodesForAccount = async function(accountId) {
  if (!conn) {
    await mongo.connect();
  }
  let result = await db
    .collection("nodes")
    .find({ owner: accountId }, { projection: { _id: 0 } })
    .toArray();

  return result;
};

mongo.gesAll = async function() {
  if (!conn) {
    await mongo.connect();
  }
  let result = await db
    .collection("ges")
    .find({}, { projection: { _id: 0 } })
    .toArray();
  return result;
};

mongo.gesShow = async function(geId) {
  if (!conn) {
    await mongo.connect();
  }

  // let result = await db
  //   .collection("ges")
  //   .findOne({ geId: geId }, { projection: { _id: 0 } });
  let result = await db
    .collection("ges")
    .aggregate([
      {
        $lookup: {
          from: "tcxs",
          localField: "tcxIds",
          foreignField: "tcxId",
          as: "tcxs"
        }
      },
      { $match: { geId: geId } }
    ])
    .toArray();

  return result[0];
};

mongo.gesForAccount = async function(accountId) {
  if (!conn) {
    await mongo.connect();
  }
  let result = await db
    .collection("ges")
    .find(
      {
        $or: [
          { [`members.${accountId}.invested`]: { $gt: 0 } },
          { [`members.${accountId}.staked`]: { $gt: 0 } }
        ]
      },
      { projection: { _id: 0 } }
    )
    .toArray();
  // TODO: ge for account

  return result;
};

mongo.tcxsAll = async function() {
  if (!conn) {
    await mongo.connect();
  }
  let result = await db
    .collection("tcxs")
    .find({}, { projection: { _id: 0 } })
    .toArray();
  return result;
};

mongo.tcxsShow = async function(tcxId) {
  if (!conn) {
    await mongo.connect();
  }

  // let result = await db
  //   .collection("tcxs")
  //   .findOne({ tcxId: tcxId }, { projection: { _id: 0 } });

  let result = await db.collection("tcxs").aggregate([
    {
      $lookup: {
        from: "nodes",
        localField: "nodeIds",
        foreignField: "nodeId",
        as: "nodes"
      }
    },
    { $match: { tcxId: tcxId } }
  ]).toArray();

  return result[0];
};

mongo.tcxsForGe = async function(geId) {
  if (!conn) {
    await mongo.connect();
  }
  // let result = await db
  //   .collection("tcxs")
  //   .find({ owner:geId }, { projection: { _id: 0 } })
  //   .toArray();
  let result = await db
    .collection("tcxs")
    .aggregate([
      {
        $lookup: {
          from: "nodes",
          localField: "nodeIds",
          foreignField: "nodeId",
          as: "nodes"
        }
      },
      { $match: { owner: geId } }
    ])
    .toArray();

  return result;
};

mongo.accountsAll = async function() {
  return null;
};

mongo.accountsShow = async function(tcxId) {
  return null;
};

mongo.explorerShower = async function(nodeId, limit) {
  if (!conn) {
    await mongo.connect();
  }

  // TODO
};

mongo.tasksForAccount = async function(accountId) {
  let ges = await mongo.gesForAccount(accountId); 
  let tcxIds = [];
  ges.forEach((ge) => {
    console.log(ge);
    tcxIds.push(...ge.tcxIds)
  })

  console.log(tcxIds);
  let result = await db
    .collection("proposals")
    .find({ tcxId: { $in: tcxIds } })
    .sort({ _id: -1 })
    .toArray();

  return result;
};

mongo.tasksForGe = async function(geId) {
  let ge = await db.collection("ges").findOne({ geId });
  let tcxIds = ge.tcxIds;
  let result = await db
    .collection("proposals")
    .find({ tcxId: { $in: tcxIds } })
    .sort({ _id: -1 })
    .toArray();

  return result;
};

mongo.tasksForTcx = async function(tcxId) {
  let result = await db
    .collection("proposals")
    .find({ tcxId: tcxId }, { projection: { _id: 0 } })
    .sort( { _id: -1 })
    .toArray();
  return result
};

module.exports = mongo;
