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
