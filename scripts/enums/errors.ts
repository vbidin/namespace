export enum Errors {
  AddressIsZero = "AddressIsZero",
  AddressesAreIdentical = "AddressesAreIdentical",

  StringIsEmpty = "StringIsEmpty",
  StringContainsPeriods = "StringContainsPeriods",

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
