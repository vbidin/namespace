// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library Utilities {
    function isZero(address address_) internal pure returns (bool) {
        return address_ == address(0);
    }

    function isEmpty(string calldata string_) internal pure returns (bool) {
        return bytes(string_).length == 0;
    }

    function containsPeriods(string calldata string_)
        internal
        pure
        returns (bool)
    {
        // iterate through bytes(s) and compare to '.'
        // can there be any false positives with utf-8?
        // TODO
        return false;
    }
}
