const inquirer = require("inquirer");
const fs = require("fs");
const util = require("util");
const generateHTML = require("./generateHTML");
const axios = require("axios");
const puppeteer = require("puppeteer");

const writeFileAsync = util.promisify(fs.writeFile);

// Asks the user for their GitHub username
function promptUser() {
    const username = inquirer.prompt({
        type: "input",
        message: "What is your GitHub username?",
        name: "username" 
    })
     return username;
}

// Asks the user for their preferred favorite color
function promptColor() {
    const color = inquirer.prompt({
        name: "color",
        type: "list",
        message: "What is your favorite color?",
        choices: ["red", "blue", "green", "pink",]
    })
    return color;
}

// Axios grabs user's name and JSON data.
function gitUser(username) {
    const data = axios.get(`https://api.github.com/users/${username}`);
    return data
}

function gitStars(username) {
  const stars = axios.get(`https://api.github.com/users/${username}/starred`);
  return stars
}

// Function to generate HTML and create PDF file.
async function init() {
  try {
    let {username} = await promptUser();
    const {color} = await promptColor();
    let starCountData = await gitStars(username);
    let {data} = await gitUser(username);
    let starCount = starCountData.data.length;
    data.color = color;
    data.starCount = starCount;
    profile = username;

    const html = generateHTML(data);
    writeFileAsync("index.html", html).then(function(){
      console.log("Sucessfully wrote to index.html")
    });
    
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(html);
    await page.emulateMedia("screen")
    await page.pdf({
      path: `${username}.pdf.pdf`,
      format: "A3",
      printBackground: true
    });
    console.log("Successfully created PDF file.")
    await browser.close();
    process.exit();
  } catch(err){
    console.log(err);
  }
}

  init();
