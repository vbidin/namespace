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

    function containsCharacter(string calldata s, bytes1 c)
        internal
        pure
        returns (bool)
    {
        bytes calldata array = bytes(s);
        for (uint256 i = 0; i < array.length; i++)
            if (array[i] == c) return true;
        return false;
    }

    function isEmpty(string calldata s) internal pure returns (bool) {
        return bytes(s).length == 0;
    }
}
