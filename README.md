# Many Swap

This project is a demo of a simple liquidity pool DApp. It's heavily based on Uniswap's approach but it's a simpler version more built to understand different liquidity pool concepts rather than be used in real life.

You can have a look in each folder for a more precise look on each service.

Because of time constraints I couldn't finish all the functionalities that I wanted or polish perfectly the existing ones. However I tried to list all the possible improvements in the readme file of each service.


## Features

### Features implemented

- Liquidity pools for ERC20 tokens on the ethereum network
- Connecting metamask to the app and loading some contract data
- Adding liquidity to the pool with a UI
- Swapping tokens with a UI
- Creating pairs

### Possible project improvements

High priority:

- More data validation and security checks
- Providing a working price oracle on the UI
- Using events on the UI to have real time data
- Support ETH in pools
- More tests everywhere

Other improvements:

- Displaying token balances
- Implementing fees for the maintainers of the project
- Lots of more advanced features in the smart contracts to provide a better UX


## Projects

### Contracts

The two main contracts are the Router and the ManySwapPair. The Router acts as a factory and a wrapper to use the pair contract. Each pair contract represents a liquidity pool between two tokens.

### Client

The client allows a the user to easily interact witht the Router contract to have a seamless experience without needing the details on how to use the smart contracts. It is made to connect to Metamask, fetch the current states of the contracts and submit the appropriate transactions. 

### Server

As it is right now, the server is somewhat useless since it only gives basic information about the tokens. However, it is a good example of how a service can be useful to transmit data to the UI that doesn't need to be on the blockchain. For example, that could be news about the project or any other kind of data that can improve the UX.

