//SPDX-License-Identifier: MIT

pragma solidity >=0.5.0;

// Above statement specifies the compatible compiler versions
// Learn more about Solidity here: https://solidity.readthedocs.io

// Declare a contract called HelloWorld
contract Counter {
    // Define a unsigned integer called count, initialize it to 0
    uint256 count = 0;

    // Declare a function called getCount.
    // The 'public' label means the function can be called internally, by transactions or other contracts.
    // The 'view' label indicates that the function does not change the state of the contract.
    // The function returns the value of count variable which is of type uint256
    function getCount() public view returns (uint256) {
        return count;
    }

    // Declare a function called incrementCount
    // The function increments value of count by 1.
    // The 'external' label means the function can only be called from an external source
    function incrementCount() external {
        count += 1;
    }

    // Declare a function called decrementCount
    // The function decrements value of count by 1.
    // The 'external' label means the function can only be called from an external source
    function decrementCount() external {
        require(count > 0, "Count is zero");
        count -= 1;
    }
}
