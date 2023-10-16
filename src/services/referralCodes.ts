function generateReferralCode(username: string, business_mobile: string): string {
    // Ensure business mobile and username have at least 4 characters
    if (username.length < 4 || business_mobile.length < 4) {
        throw new Error(" username must have at least 4 characters.");
    }

    // Take the first 4 characters of the username
    const usernamePrefix: string = username.slice(0, 4);

    // Take the last 4 characters of the businessMobile
    const businessMobileSuffix: string = business_mobile.slice(-4);

    const referralCode: string = usernamePrefix + businessMobileSuffix;

    return referralCode;
}

export { generateReferralCode };
