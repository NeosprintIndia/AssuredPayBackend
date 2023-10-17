function generateReferralCode(username: string, business_mobile: string): string {
    // Ensure business mobile and username have at least 4 characters
    if (username.length < 4 || business_mobile.length < 4) {
        throw new Error(" username must have at least 4 characters.");
    }
    const usernamePrefix: string = username.slice(0, 4);

    const businessMobileSuffix: string = business_mobile.slice(-4);

    const referralCode: string = usernamePrefix + businessMobileSuffix;

    return referralCode;
}

export { generateReferralCode };
