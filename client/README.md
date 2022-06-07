# many-swap-client

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Run your unit tests
```
yarn test:unit
```

### Lints and fixes files
```
yarn lint
```

## Technical approach and best practices

### Stack

The client application is based on the following libraries:
- Vue.js: Lightweight and efficient. It can be useful on smaller or bigger projects, on this app I tried to stay simple with it (no Vuex, no router etc...).
- Vuetify: Material design implementation on Vue.js. Really useful for prototyping with a good UX.
- Ethers.js: Client to interact with Metamask and the Smart contracts. Seems are bit more stable and lightweight than web3.js, however both are good options.

### Services

The following services have different roles:
- metamask: Handles signing into Metamask and store the provider and signer.
- routerContract: Handles all basic routerContract operations.
- accountBalances: Used to get ERC20 balances (currently only pair liquidities).


### Tests

The file SwappingTool.spec.js is the example of a complete set of tests for a component. Other components and services should be tested too but they aren't yet due to time constraints.

When testing components, it's important to keep to the following best practices:
- The component is the black box being unit tested. This means you only test for inputs coming from outside the black box (user actions, props, services data, events...). The same way, you only test outputs that manifest outside the component (UI consequences, props, service calls, events...). This means you never modifity internal component variables of test internal methods. They are the equivalent of private variables and functions when testing classic JS public function. 
- Clear code: Unit tests are useful to document your code and they should scale easily to reduce long term costs. This means the tests should use helper functions to abstract the most common DOM or stubs interactions. This also means we need to have clear tests names.

