
function generateReferralCode(username, business_mobile) {
    // Ensure bussiness mobile and username have atleast 4 char
    if (username.length < 4 || business_mobile.length < 4) {
        throw new Error("Both username and businessMobile must have at least 4 characters.");
    }

    // Take the first 4 characters of the username
    const usernamePrefix = username.slice(0, 4);

    // Take the last 4 characters of the businessMobile
    const businessMobileSuffix = business_mobile.slice(-4);

    // Concatenate the two parts to generate the referral code
    const referralCode = usernamePrefix + businessMobileSuffix;

    return referralCode;
}

module.exports = { generateReferralCode };
