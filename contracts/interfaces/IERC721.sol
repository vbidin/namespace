// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IERC165.sol";
import "./IERC721Receiver.sol";

/// @title Interface of the ERC-721 standard.
/// @dev See https://eips.ethereum.org/EIPS/eip-721
interface IERC721 is IERC165 {
    /// @notice Emitted when the `domainId` domain is transferred from `sender` to `recipient`.
    /// @dev This event is emitted when ownership of any domain changes by any mechanism.
    /// This includes when domains are registered (`sender` == 0) and if they are public (`recipient` == 0).
    /// @param sender The address the domain is being transferred from.
    /// @param recipient The address the domain is being transferred to.
    /// @param domainId The domain identifier.
    event Transfer(
        address indexed sender,
        address indexed recipient,
        uint256 indexed domainId
    );

    /// @notice Emitted when `owner` enables `approved` to manage the `domainId` domain.
    /// @dev This event is emitted when the `approved` address for a domain changes or is reaffirmed.
    /// A zero address indicates the `approved` address has been reset.
    /// @param owner The domain owner.
    /// @param approved The approved third party.
    /// @param domainId The domain identifier.
    event Approval(
        address indexed owner,
        address indexed approved,
        uint256 indexed domainId
    );

    /// @notice Emitted when `owner` enables or disables `operator`.
    /// @dev The `operator` can manage all domains of the `owner`.
    /// @param owner The domain owner.
    /// @param operator The approved third party.
    /// @param approved Indicates if the operator is enabled or disabled.
    event ApprovalForAll(
        address indexed owner,
        address indexed operator,
        bool approved
    );

    /// @notice Transfers the `domainId` domain from `sender` to `recipient`.
    /// @dev Emits a {Transfer} event.
    /// Throws an exception if:
    /// - `sender` is the zero address or is not the current owner.
    /// - `recipient` is the zero address.
    /// - `domainId` domain does not exist.
    /// - `msg.sender` is not the current owner, an operator, or an approved address.
    /// @param sender The address the domain is being transferred from.
    /// @param recipient The address the domain is being transferred to.
    /// @param domainId The domain identifier.
    function transferFrom(
        address sender,
        address recipient,
        uint256 domainId
    ) external;

    /// @notice Safely transfers the `domainId` domain from `sender` to `recipient`.
    /// @dev Equivalent to calling {transferFrom} but throws an exception if
    /// - `recipient` is not a smart contract (code size != 0) or does not implement `onERC721Received`
    /// - `onERC721Received` returns an invalid value (value != '0x150b7a02').
    /// @param sender The address the domain is being transferred from.
    /// @param recipient The address the domain is being transferred to.
    /// @param domainId The domain identifier.
    /// @param data Additional data with no specified format.
    function safeTransferFrom(
        address sender,
        address recipient,
        uint256 domainId,
        bytes calldata data
    ) external;

    /// @notice Safely transfers the `domainId` domain from `sender` to `recipient`.
    /// @dev Equivalent to calling {safeTransferFrom} but with empty `data`.
    /// @param sender The address the domain is being transferred from.
    /// @param recipient The address the domain is being transferred to.
    /// @param domainId The domain identifier.
    function safeTransferFrom(
        address sender,
        address recipient,
        uint256 domainId
    ) external;

    /// @notice Gives permission to `approved` to transfer the `domainId` domain to another account.
    /// @dev Only a single address can be approved at any given time.
    /// The approved address is set to zero after the transfer.
    /// Emits an {Approval} event.
    /// Throws an exception if:
    /// - `approved` is the zero address.
    /// - `domainId` domain does not exist.
    /// - `msg.sender` is not the owner or approved operator of the `domainId` domain.
    /// @param approved The third party account.
    /// @param domainId The domain identifier.
    function approve(address approved, uint256 domainId) external;

    /// @notice Add or remove `operator` as an operator for the caller.
    /// @dev Operators can call {transferFrom} or {safeTransferFrom} for any domain owned by the caller.
    /// Emits an {ApprovalForAll} event.
    /// Throws an exception if the operator is the zero address or the caller.
    /// @param operator The third party account.
    /// @param approved If the `operator` is allowed to manage all of the domains of the caller.
    function setApprovalForAll(address operator, bool approved) external;

    /// @notice Returns the owner of the `domainId` domain.
    /// @dev Throws an exception if the `domainId` domain does not exist.
    /// @param domainId The domain identifier.
    /// @return owner The owner of the `domainId` domain.
    function ownerOf(uint256 domainId) external view returns (address owner);

    /// @notice Returns the number of domains the `owner` owns.
    /// @param owner The owner address.
    /// Throws an exception if `owner` is the zero address.
    /// @return balance The number of domains the `owner` owns.
    function balanceOf(address owner) external view returns (uint256 balance);

    /// @notice Returns the account approved for the `domainId` domain.
    /// @param domainId Identifier of the domain.
    /// Throws an exception if the `domainId` domain does not exist.
    /// @return approved The account approved for the `domainId` domain.
    function getApproved(uint256 domainId)
        external
        view
        returns (address approved);

    /// @notice Checks if the `operator` is allowed to manage all of the domains of `owner`.
    /// @dev Throws an exception if the `owner` or `operator` is the zero address.
    /// Throws an exception if the `owner` and `operator` are the same address.
    /// @param owner The owner account.
    /// @param operator The third party account.
    /// @return isOperator Whether the `operator` is allowed to manage all of the domains of `owner`.
    function isApprovedForAll(address owner, address operator)
        external
        view
        returns (bool isOperator);
}
