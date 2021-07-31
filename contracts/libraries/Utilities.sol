// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library Utilities {
    function isZero(address a) internal pure returns (bool) {
        return a == address(0);
    }

    function isEmpty(string calldata s) internal pure returns (bool) {
        return bytes(s).length == 0;
    }

    function containsPeriods(string calldata s) internal pure returns (bool) {
        // TODO: can there be any false positives with utf-8? (probably not)
        bytes calldata array = bytes(s);
        for (uint256 i = 0; i < array.length; i++) {
            if (array[i] == ".") {
                return true;
            }
        }
        return false;
    }
}
