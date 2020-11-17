const fs = require('fs');
const axios = require("axios");

const input = JSON.parse(fs.readFileSync('inputData.json', 'utf8'));

function checkFirstnameLength(firstname) {
    return (firstname.length > 2);
}

function checkLastnameLength(lastname) {
    return (lastname.length > 2);
}

function checkAlphaRate(email) {
    let user = email.split("@")[0];
    let charArray = user.split("");
    let rateCounter = { "alphanumeric": 0, "other": 0 };
    charArray.forEach(char => {
        if (char.match(/^[0-9a-z]+$/)) {
            rateCounter.alphanumeric = rateCounter.alphanumeric + 1;
        } else {
            rateCounter.other = rateCounter.other + 1;
        }
    });
    let rate = rateCounter.alphanumeric / charArray.length * 100;
    return rate > 70 ? true : false;
}

function checkNumberRate(email) {
    let user = email.split("@")[0];
    let charArray = user.split("");
    let rateCounter = { "numeric": 0, "other": 0 };
    charArray.forEach(char => {
        if (char.match(/^[0-9]+$/)) {
            rateCounter.numeric = rateCounter.numeric + 1;
        } else {
            rateCounter.other = rateCounter.other + 1;
        }
    });
    let rate = rateCounter.numeric/ charArray.length * 100;
    return rate < 30 ? true : false;
}

function checkBlacklistCall(licencePlate) {
    const url = "http://localhost:3000/checkBlacklist?licencePlate=" + licencePlate;
    return axios.get(url).then(response => response.data);
}

function checkPriceCall(vehicle) {
    const url = "http://localhost:3000/checkQuotation";
    return axios.post(url, vehicle).then(response => response.data);
}

function validateAd(input) {

    Promise.all([checkBlacklistCall(input.vehicle.registerNumber), checkPriceCall(input.vehicle)]).then(responses => {

        let checkBlacklist = responses[0].blacklisted ? false : true;

        let checkPrice = (Math.abs(responses[1].quotation - input.price)/responses[1].quotation*100) <=20 ? true: false;

        let checks = {
            firstnameLength: checkFirstnameLength(input.contacts.firstName),
            lastnameLength: checkLastnameLength(input.contacts.lastName),
            alphaRate: checkAlphaRate(input.contacts.email),
            numberRate: checkNumberRate(input.contacts.email),
            registerNumberBlacklist: checkBlacklist,
            priceQuotationRate: checkPrice
        }


        let response = {
            "reference": input.reference,
            "scam": false,
            "rules": []
        };

        Object.entries(checks).forEach(entry => {
            const [key, value] = entry;
            if (!value) {
                response.rules.push(key);
                response.scam = true;
            }
          });

        console.log("Scam detector response: ", response);
    });
}

validateAd(input);
