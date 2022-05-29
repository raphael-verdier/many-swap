// contracts/ManySwapPair.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './ManySwapPair.sol';
import './ERC20.sol';
import "@openzeppelin/contracts/utils/math/Math.sol";

contract Router {
  using SafeMath  for uint;
  ManySwapPair[] public allPairs;
  mapping(address => mapping(address => address)) public getPair;

  function getAllPairsLength() public view returns (uint256 _allPairsLength) {
    _allPairsLength = allPairs.length;
  }

  function createPair(address tokenA, address tokenB)
    external
    returns (ManySwapPair _newPair)
  {
    _newPair = new ManySwapPair(tokenA, tokenB);
    getPair[tokenA][tokenB] = address(_newPair);
    allPairs.push(_newPair);
  }

  function addLiquidity(
    address token0,
    address token1,
    uint256 amount0,
    uint256 amount1
  ) external returns (uint256 liquidity) {
    address pair = getPair[token0][token1];
    require(pair != address(0), 'ManySwap: PAIR_NOT_FOUND');
    ERC20(token0).transferFrom(msg.sender, address(pair), amount0);
    ERC20(token1).transferFrom(msg.sender, address(pair), amount1);
    liquidity = ManySwapPair(pair).mint(msg.sender);
  }

  function removeLiquidity(
      address pair,
      uint liquidity
  ) public returns (uint amount0, uint amount1) {
      ManySwapPair(pair).transferFrom(msg.sender, pair, liquidity); // send liquidity to pair
      (amount0, amount1) = ManySwapPair(pair).burn(msg.sender);
  }

  function getAmountOut(
    address tokenIn,
    address pair,
    uint256 amountIn
  ) internal view returns (uint256 amountOut) {
    (uint256 reserve0, uint256 reserve1, ) = ManySwapPair(
      pair
    ).getReserves();
    address token0 = ManySwapPair(pair).token0();
    (uint256 reserveIn, uint256 reserveOut) = tokenIn == token0
      ? (reserve0, reserve1)
      : (reserve1, reserve0);

    require(amountIn > 0, 'ManySwap: INSUFFICIENT_INPUT_AMOUNT');
    require(
      reserveIn > 0 && reserveOut > 0,
      'ManySwap: INSUFFICIENT_LIQUIDITY'
    );
    uint256 amountInWithFee = amountIn.mul(997);
    uint256 numerator = amountInWithFee.mul(reserveOut);
    uint256 denominator = reserveIn.mul(1000).add(amountInWithFee);
    amountOut = numerator / denominator;
  }

  function swap(
    address token0,
    address token1,
    uint256 amount0In,
    uint256 amount1In
  ) external {
    address pair = getPair[token0][token1];
    require(pair != address(0), 'ManySwap: PAIR_NOT_FOUND');
    require(!(amount0In > 0 && amount1In > 0), 'ManySwap: BOTH_AMOUNTS_ARE_SET');
    uint256 amount0Out = 0;
    uint256 amount1Out = 0;
    if (amount0In > 0) {
      ERC20(token0).transferFrom(msg.sender, address(pair), amount0In);
      amount1Out = getAmountOut(token1, pair, amount0In);
    } else if (amount1In > 0) {
      ERC20(token1).transferFrom(msg.sender, address(pair), amount1In);
      amount0Out = getAmountOut(token0, pair, amount1In);
    }
    ManySwapPair(pair).swap(amount0Out, amount1Out, msg.sender);
  }
}
