const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/keyring');
const { stringToU8a } = require('@polkadot/util');
// import BN from 'bn.js';

let api = null;

// https://substrate.dev/docs/en/tutorials/tcr/building-a-ui-for-the-tcr-runtime
// https://polkadot.js.org/api/api/#registering-custom-types
// https://github.com/substrate-developer-hub/substrate-tcr-ui/blob/master/src/services/tcrService.js

const init = async wsp => {
  const provider = new WsProvider(wsp);
  if (api) {
    console.log("api initialized already");
    return;
  }

  api = await ApiPromise.create({
    types: {
      ContentHash: "Hash",
      NodeType: "u32",
      Node: {
        id: "ContentHash",
        node_type: "NodeType",
        sources: "Vec<ContentHash>"
      },
      GeId: "u64",
      ActionId: "u64",
      TcxId: "u64",
      GovernanceEntity: {
        threshold: "u64",
        min_deposit: "Balance",
        apply_stage_len: "Moment",
        commit_stage_len: "Moment"
      },
      Challenge: {
        amount: "Balance",
        voting_ends: "Moment",
        resolved: "bool",
        reward_pool: "Balance",
        total_tokens: "Balance",
        owner: "AccountId"
      },
      ChallengeId: "u64",
      ListingId: "u64",
      Listing: {
        id: "ListingId",
        node_id: "ContentHash",
        amount: "Balance",
        application_expiry: "Moment",
        whitelisted: "bool",
        challenge_id: "ChallengeId",
        owner: "AccountId"
      },
      Poll: {
        votes_for: "Balance",
        votes_against: "Balance",
        passed: "bool"
      },
      Tcx: {
        tcx_type: "u64"
      },
      TcxType: "u64",
      Link: {
        source: "u32",
        target: "u32"
      },
      VecContentHash: "Vec<ContentHash>",
      Quota: "Balance"
    },
    provider
  });

  // api.rpc.chain.subscribeNewHeads(header => {
  //   console.log(`Chain is at #${header.number}`)
  // });
};

const getBalance = async address => {
  if (!api) {
    await init();
  }
  const currentBalance = await api.query.balances.freeBalance(address);
  return currentBalance.toString();
};

const getBalances = async addresses => {
  if (!api) {
    await init();
  }
  const currentBalances = await api.query.balances.freeBalance.multi(addresses);
  const balancesMap = {};
  currentBalances.forEach((item, index) => {
    balancesMap[addresses[index]] = item.toString();
  });
  return balancesMap;
};

const transfer = async (keyring, addressFrom, addressTo, amount) => {
  if (!api) {
    await init();
  }
  const fromPair = keyring.getPair(addressFrom);
  api.tx.balances
    .transfer(addressTo, amount)
    .signAndSend(fromPair, ({ status }) => {
      if (status.isFinalized) {
        console.log(
          `Completed at block hash #${status.asFinalized.toString()}`
        );
      } else {
        console.log(`Current transfer status: ${status.type}`);
      }
    })
    .catch(e => {
      console.log(":( transaction failed");
      console.error("ERROR:", e);
    });
};

const getKeysFromSeed = _seed => {
  if (!_seed) {
    throw new Error("Seed not valid.");
  }

  const keyring = new Keyring({ type: "sr25519" });
  const paddedSeed = _seed.padEnd(32);
  return keyring.addFromSeed(stringToU8a(paddedSeed));
};

const getKeysFromUri = uri => {
  if (!uri) {
    throw new Error("Uri not valid.");
  }

  const keyring = new Keyring({ type: "sr25519" });
  return keyring.addFromUri(uri);
};

const connect = async () => {
  if (!api) {
    await init();
  }
  const [chain, name, version] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.system.name(),
    api.rpc.system.version()
  ]);

  const connected = `You are connected to chain ${chain} using ${name} v${version}`;
  console.log(connected);
  return { chain, name, version };
};

const getTcxListingsCount = async tcxId => {
  if (!api) {
    await init();
  }
  let count = await api.query.tcx.tcxListingsCount(tcxId);
  console.log(count.toString());
  return count;
};

const getTcxListingsIndexHash = async (tcxId, listingIndex) => {
  if (!api) {
    await init();
  }
  console.log(api.query.tcx);
  let nodeId = await api.query.tcx.tcxListingsIndexHash([tcxId, listingIndex]);
  console.log(nodeId.toString());
  return nodeId;
};

const getTcxListing = async (tcxId, nodeId) => {
  if (!api) {
    await init();
  }
  let listing = await api.query.tcx.tcxListings([tcxId, nodeId]);
  return listing;
};

const getListings = async tcxId => {
  if (!api) {
    await init();
  }
  let listingCount = await getTcxListingsCount(tcxId);
  let listings = [];
  for (let i = 1; i <= listingCount; i++) {
    let nodeId = await getTcxListingsIndexHash(tcxId, i);
    let listing = await getTcxListing(tcxId, nodeId);

    if (listing.whitelisted.isTrue) {
      let node = await getNode(nodeId);
      listings.push(node.unwrap());
    }
  }
  return listings;
};

const getNode = async nodeId => {
  if (!api) {
    await init();
  }

  let node = await api.query.node.nodes(nodeId);
  if (node.isNone) {
    return null;
  }
  return node.unwrap();
};

module.exports = {
  init,
  getBalance,
  getBalances,
  transfer,
  getKeysFromSeed,
  getKeysFromUri,
  // ------- tcr
  connect,
  getListings,
  getNode
};
