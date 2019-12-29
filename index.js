import "dotenv/config";
import twoCaptcha from "@infosimples/node_two_captcha";
import accounts from "./accounts";
import { saveAccount, formatEmail, generateBirthday } from "./classes/utils";
import { createAccount, getTheatres } from "./classes/graphql";
import commander from "commander";

// Initialize 2captcha API wrapper with our 2captcha key
const captchaClient = new twoCaptcha(process.env.CAPTCHA_KEY, {
  // 60 seconds
  timeout: 60000,
  // 5 seconds
  polling: 5000,
  throwErrors: false
});

const main = async () => {
  commander
    .requiredOption("-e, --email <type>", "The gmail prefix you are using")
    .requiredOption(
      "-p, --password <type>",
      "The password you will use for your accounts"
    )
    .requiredOption("-f, --first-name <type>", "Your first name")
    .requiredOption("-l, --last-name <type>", "Your last name")
    .requiredOption("-z, --zip-code <type>", "Your zip-code")
    .requiredOption("-a, --amount <number>", "Amount of accounts to create", 1);

  commander.parse(process.argv);

  // Get theatreId
  const theatreId = (await getTheatres(commander.zipCode))[0].node.theatreId;
  // Get account number to use
  const accountNum = accounts[accounts.length - 1].accountNum + 1 || 0;

  // Loop through amount of accounts and create them
  for (let i = 0; i < commander.amount; i++) {
    const accountInfo = {
      accountNum,
      email: formatEmail(commander.email, accountNum, "@gmail.com"),
      password: commander.password,
      firstName: commander.firstName,
      lastName: commander.lastName,
      theatreId,
      birthDate: generateBirthday()
    };

    console.log(
      `Creating account ${i + 1} with info ${JSON.stringify(
        accountInfo,
        null,
        2
      )}`
    );

    const captcha = await captchaClient.decodeRecaptchaV3({
      action: "createAccount",
      min_score: "0.3",
      googlekey: "6LfIALUUAAAAANFDCluzb-m1FLbBKkQwvsYbglIS",
      pageurl: "https://www.amctheatres.com"
    });

    const accountCreated = await createAccount(accountInfo, captcha.text);

    if (accountCreated) {
      console.log(`Account ${i + 1} with email ${accountInfo.email} created!`);
      saveAccount(accountInfo, accounts);
    } else console.error("Failed to create account");
  }
};

main();
