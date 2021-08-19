export const prefix = "org";
export const prefixWithPeriods = "memereum.org";
export const longPrefix = "a".repeat(100);
export const extremelyLongPrefix = "a".repeat(10000);
export const numberOfLevels = 100;

export const rootDomain = { id: 0, name: "" };
export const publicDomain = { id: 1, name: "org", prefix: "org" };
export const privateDomain = {
  id: 2,
  name: "ethereum.org",
  prefix: "ethereum",
};
export const anotherPrivateDomain = {
  id: 3,
  prefix: "app",
  name: "app.ethereum.org",
};
export const missingDomain = { id: 1337, name: "meme.coins" };

export const erc20InterfaceId = "0x36372b07";
export const erc165InterfaceId = "0x01ffc9a7";
export const erc721InterfaceId = "0x80ac58cd";
export const erc777InterfaceId = "0xe58e113c";
export const domainRegistryInterfaceId = "0xc7848984";
export const unknownInterfaceId = "0x12345678";

export const supportedInterfaceIds = [
  erc165InterfaceId,
  erc721InterfaceId,
  domainRegistryInterfaceId,
];
export const unsupportedInterfaceIds = [
  erc20InterfaceId,
  erc777InterfaceId,
  unknownInterfaceId,
];
