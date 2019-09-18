# castor-server
Castor Server: Restful api for castor.network

## Setup
```
yarn install
```

## Run
```
1. Start MongoDB
1. Run Castor Event Listener and start mongodb
2. Run substrate castor
3. yarn start (default port: 7000)
```

### Rest API
```
# nodes
/api/v1/nodes
/api/v1/nodes/:id

# ges
/api/v1/ges
/api/v1/ges/:id
/api/v1/ges/:id/tcxs

# tcx
/api/v1/tcxs
/api/v1/tcxs/:id

# account
/api/v1/accounts
/api/v1/accounts/:id
/api/v1/accounts/:id/nodes
/api/v1/accounts/:id/ges
```