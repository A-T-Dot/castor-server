const Koa = require("koa");
const route = require("koa-route");
const websockify = require("koa-websocket"); // https://github.com/kudos/koa-websocket
const chain = require("./api/chain");
const mongo = require("./api/mongo");

require("dotenv").config();

mongo.connect();
const app = websockify(new Koa());

// let WS = null;

// const provider = `ws://${process.env.SUBSTRATE_HOST}:${process.env.SUBSTRATE_PORT}`;

// function run() {
//   console.log("Start.");
//   // get balance or other function
//   const demoAddr = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";
//   chain.getBalance(demoAddr, balance => {
//     console.log(`${demoAddr} balance: ${balance}`);
//   });
// }

// function subscribe(header, WS) {
//   // TODO save to db
//   WS.send(`{"data": "Chain is at #${header.number}"}`);
//   console.log(`Chain is at #${header.number}`);
// }

app.use(async (ctx, next) => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set("Access-Control-Allow-Headers", "*");
  ctx.set("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
  ctx.set("Cache-Control", "no-cache");
  await next();
});

// app.ws.use(
//   route.all("/ws", ctx => {
//     // TODO query from db, ws push
//     WS = ctx.websocket;
//     WS.send('{"data": "Hello Castor"}');
//     chain.init(provider, run, subscribe, WS);

//     WS.on("message", function(message) {
//       console.log(message);
//     });
//   })
// );

// JSON Success Format
// {
//   "data": {
//     "id": 1001,
//     "name": "Wing"
//   }
// }
// JSON Error Format
// {
//   "error": {
//     "code": 404,
//     "message": "ID not found"
//   }
// }

const error = {
  error: {
    code: 404,
    message: "not found"
  }
}

const nodes = {
  all: async ctx => {
    let data = await mongo.nodesAll();
    ctx.body = data ? { data } : error;
  },

  show: async (ctx, id) => {
    let data = await mongo.nodesShow(id);
    ctx.body = data ? { data } : error;
  },

  forAccount: async (ctx, id) => {
    let data = await mongo.nodesForAccount(id);
    ctx.body = data ? { data } : error;
  },
};

const ges = {
  all: async ctx => {
    let data = await mongo.gesAll();
    ctx.body = data ? { data } : error;
  },

  show: async (ctx, id) => {
    let data = await mongo.gesShow(id);
    ctx.body = data ? { data } : error;
  },

  forAccount: async (ctx, id) => {
    ctx.body = data ? { data } : error;
  },
};

const tcxs = {
  all: async ctx => {
    let data = await mongo.tcxsAll();
    ctx.body = data ? { data } : error;
  },

  show: async (ctx, id) => {
    let data = await mongo.tcxsShow(id);
    ctx.body = data ? { data } : error;
  },

  forGe: async (ctx, id) => {
    let data = await mongo.tcxsForGe(id);
    ctx.body = data ? { data } : error;
  },
};

const accounts = {
  all: async ctx => {
    ctx.body = { data: "account all" };
  },

  show: async (ctx, id) => {
    ctx.body = { data: "show account:" + id };
  }
};

// nodes
app.use(route.get("/api/v1/nodes", nodes.all));
app.use(route.get("/api/v1/nodes/:id", nodes.show));

// ges
app.use(route.get("/api/v1/ges", ges.all));
app.use(route.get("/api/v1/ges/:id", ges.show));
app.use(route.get("/api/v1/ges/:id/tcxs", tcxs.forGe));

// tcx
app.use(route.get("/api/v1/tcxs", tcxs.all));
app.use(route.get("/api/v1/tcxs/:id", tcxs.show));

// account
app.use(route.get("/api/v1/accounts", accounts.all));
app.use(route.get("/api/v1/accounts/:id", accounts.show));
app.use(route.get("/api/v1/accounts/:id/nodes", nodes.forAccount));
app.use(route.get("/api/v1/accounts/:id/ges", ges.forAccount));


app.listen(7000);