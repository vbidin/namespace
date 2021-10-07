export enum Contracts {
  DomainRegistry = "DomainRegistry",
  RecordStorage = "RecordStorage",
}

export enum Libraries {}

export enum Events {
  Transfer = "Transfer",
  Refresh = "Refresh",
  Approval = "Approval",
  ApprovalForAll = "ApprovalForAll",
}

export enum Errors {
  AddressIsZero = "AddressIsZero",
  AddressesAreIdentical = "AddressesAreIdentical",

  StringIsEmpty = "StringIsEmpty",
  StringIsInvalid = "StringIsInvalid",

  DomainDoesNotExist = "DomainDoesNotExist",
  DomainAlreadyExists = "DomainAlreadyExists",
  DomainIsPublic = "DomainIsPublic",
  DomainHasNotExpired = "DomainHasNotExpired",
  DomainIsAlreadyOwnedByCaller = "DomainIsAlreadyOwnedByCaller",
  DomainIsNotOwnedByCaller = "DomainIsNotOwnedByCaller",
  DomainIsNotOwnedBySender = "DomainIsNotOwnedBySender",
  DomainCanNotBeTransferredByCaller = "DomainCanNotBeTransferredByCaller",
  DomainCanNotBeApprovedByCaller = "DomainCanNotBeApprovedByCaller",
  DomainTransferFailed = "DomainTransferFailed",
}
