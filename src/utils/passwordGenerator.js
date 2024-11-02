module.exports = function passwordGenerator() {
    let result = [];

	// list of normal characters
	let characters = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$%^&)><?'\"@ ";

    // Get the length of `characters` string
	let charactersLength = characters.length;

	// For loop to randomly select a random character from characters and add it to the result. You can change the length, (Default: 12)
	for (let i = 0; i < 12; i++) {
		result.push(
			characters.charAt(Math.floor(Math.random() * charactersLength))
		);
	}

	// return the password
	return result.join("");
}