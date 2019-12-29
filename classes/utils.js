import { createWriteStream, readFileSync } from "fs";

export const getAccounts = () => {
  try {
    return JSON.parse(readFileSync("./accounts.json"));
  } catch (err) {
    if (err.code === "ENOENT") {
      console.error(
        "Error: You didn't rename accounts.json.example to accounts.json"
      );
    } else {
      console.error(err);
    }
    process.exit(1);
  }
};

export const saveAccount = (account, accounts) => {
  accounts.push(account);

  const writeStream = createWriteStream("./accounts.json");
  writeStream.write(JSON.stringify(accounts, null, 2));
};

export const formatEmail = (prefix, number, domain) =>
  `${prefix}+${number}${domain}`;

const getRandomArbitrary = (min, max) =>
  Math.floor(Math.random() * (max - min) + min);

export const generateBirthday = () => {
  const currentMonth = new Date().getMonth() + 1;

  return `${getRandomArbitrary(1930, 2001)}-${
    currentMonth === 12 ? 1 : currentMonth + 2
  }-${getRandomArbitrary(1, 28)}`;
};
