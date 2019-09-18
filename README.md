# castor-server
- Restful api for castor.network
- relies on castor-event-listener

## Setup
```
yarn install
```

## Run
```
1. Start MongoDB
2. Run Castor Event Listener
3. Run substrate castor
4. yarn start (default port: 7000)
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