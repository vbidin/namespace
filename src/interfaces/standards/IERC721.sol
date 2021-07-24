// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IERC165.sol";

/// @title Interface of the ERC-721 standard
/// @dev See https://eips.ethereum.org/EIPS/eip-721
interface IERC721 is IERC165 {
    /// @notice Emitted when the `id` domain is transferred from `from` to `to`.
    /// @dev This event is emitted when ownership of any domain changes by any mechanism.
    /// This includes when domains are registered (`from` == 0) and released (`to` == 0).
    /// @param from The address the domain is being transferred from.
    /// @param to The address the domain is being transferred to.
    /// @param id The domain identifier.
    event Transfer(
        address indexed from,
        address indexed to,
        uint256 indexed id
    );

    /// @notice Emitted when `owner` enables `approved` to manage the `id` domain.
    /// @dev This event is emitted when the `approved` address for a domain changes or is reaffirmed.
    /// A zero address indicates the `approved` address has been reset.
    /// @param owner The domain owner.
    /// @param approved The approved third party.
    /// @param id The domain identifier.
    event Approval(
        address indexed owner,
        address indexed approved,
        uint256 indexed id
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

    /// @notice Transfers the `id` domain from `from` to `to`.
    /// @dev Emits a {Transfer} event.
    /// Throws an exception if:
    /// - `from` is the zero address or is not the current owner.
    /// - `to` is the zero address.
    /// - `id` domain does not exist.
    /// - `msg.sender` is not the current owner, an operator, or an approved address.
    /// @param from The address the domain is being transferred from.
    /// @param to The address the domain is being transferred to.
    /// @param id The domain identifier.
    function transferFrom(
        address from,
        address to,
        uint256 id
    ) external;

    /// @notice Safely transfers the `id` domain from `from` to `to`.
    /// @dev Equivalent to calling {transferFrom} but throws an exception if
    /// - `to` is not a smart contract (code size != 0) or does not implement `onERC721Received`
    /// - `onERC721Received` returns an invalid value (value != '0x150b7a02').
    /// @param from The address the domain is being transferred from.
    /// @param to The address the domain is being transferred to.
    /// @param id The domain identifier.
    /// @param data Additional data with no specified format.
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        bytes calldata data
    ) external;

    /// @notice Safely transfers the `id` domain from `from` to `to`.
    /// @dev Equivalent to calling {safeTransferFrom} but with empty `data`.
    /// @param from The address the domain is being transferred from.
    /// @param to The address the domain is being transferred to.
    /// @param id The domain identifier.
    function safeTransferFrom(
        address from,
        address to,
        uint256 id
    ) external;

    /// @notice Gives permission to `approved` to transfer the `id` domain to another account.
    /// @dev Only a single address can be approved at any given time.
    /// The approved address is set to zero after the transfer.
    /// Emits an {Approval} event.
    /// Throws an exception if:
    /// - `approved` is the zero address.
    /// - `id` domain does not exist.
    /// - `msg.sender` is not the owner or approved operator of the `id` domain.
    /// @param approved The third party account.
    /// @param id The domain identifier.
    function approve(address approved, uint256 id) external;

    /// @notice Add or remove `operator` as an operator for the caller.
    /// @dev Operators can call {transferFrom} or {safeTransferFrom} for any domain owned by the caller.
    /// Emits an {ApprovalForAll} event.
    /// Throws an exception if the operator is the zero address or the caller.
    /// @param operator The third party account.
    /// @param approved If the `operator` is allowed to manage all of the domains of the caller.
    function setApprovalForAll(address operator, bool approved) external;

    /// @notice Returns the owner of the `id` domain.
    /// @dev Throws an exception if the `id` domain does not exist.
    /// @param id The domain identifier.
    /// @return The owner of the `id` domain.
    function ownerOf(uint256 id) external view returns (address);

    /// @notice Returns the number of domains the `owner` owns.
    /// @param owner The owner address.
    /// Throws an exception if `owner` is the zero address.
    /// @return The number of domains the `owner` owns.
    function balanceOf(address owner) external view returns (uint256);

    /// @notice Returns the account approved for the `id` domain.
    /// @param id Identifier of the domain.
    /// Throws an exception if the `id` domain does not exist.
    /// @return The account approved for the `id` domain.
    function getApproved(uint256 id) external view returns (address);

    /// @notice Checks if the `operator` is allowed to manage all of the domains of `owner`.
    /// @param owner The owner of the domains.
    /// @param operator The third party account.
    /// @return Whether the `operator` is allowed to manage all of the domains of `owner`.
    function isApprovedForAll(address owner, address operator)
        external
        view
        returns (bool);
}
