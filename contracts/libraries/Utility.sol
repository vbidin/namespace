// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library Utility {
    function isContract(address a) internal view returns (bool) {
        uint32 size;
        assembly {
            size := extcodesize(a)
        }
        return size > 0;
    }

    function isZero(uint256 n) internal pure returns (bool) {
        return n == 0;
    }

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
