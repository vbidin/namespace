// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library UtilityLibrary {
    function isContract(address a) internal view returns (bool) {
        uint32 size;
        assembly {
            size := extcodesize(a)
        }
        return size > 0;
    }

    function isEmpty(string calldata s) internal pure returns (bool) {
        return bytes(s).length == 0;
    }
}
