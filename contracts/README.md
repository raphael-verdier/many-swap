# Many swap smart contract

## Technical approach

The pool is based on two main smart contracts:
- ManySwapPair: It is the owner of all the tokens in the pool. It also acts as an ERC20 token to store the ownership of liquidity.
- Router: It is used by the user to interact witht the pair. Its main 

## Differences with UniSwap

The overall approach and the basis for some function directly come from Uniswap. However there are lots of differences:
- Only core functionalities are left: this allows to have a simpler code to understand the basic concepts behind liquidity pools.
- Using solidity 0.8: Better for security purposes. I don't understand fully yet all the implications on my code of overflows being impossible now, however this allowed to remove some pieces of logic dedicated to that. 
- Using Open Zepplin: This provides some big pieces of logic upon which we are able to lay the foundations of our contract. The code is audited and maintain regularly, this would improve future scalability and security.
- Tests: My tests coverage is greatly reduced compared to Uniswap's test coverage. However I find my tests clearer to understand, better organized and more scalable.   

## Tests

Those tests are integration tests which make sure all are use cases are working well.

The test file with the best coverage is ManySwapPair.js. However it's still missing some tests around:
- Errors
- Emitted events
- Some edge cases

I tried to follow some of the best practices I apply to my tests:
- Tests should easily show what fails exactly. This means we have one test for one precise piece of logic.
- Tests should be easy to read and used as a way of documenting your code. This means we have clear test names and we use meaningful helper functions.
- Tests should be scalable. This means we need to use helper functions instead of copy pasting instruction in every test. This seems particularly important in the context of smart contracts.

## Future improvements

- Better tests: better coverage and better helper functions structure.
- More functionalities

