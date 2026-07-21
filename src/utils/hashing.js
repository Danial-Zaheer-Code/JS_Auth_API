import bcrypt from 'bcrypt'

const saltRounds = 10;

export async function hash(password) {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}

export async function compare(inputPassword, storedHashedPassword) {
	return await bcrypt.compare(inputPassword, storedHashedPassword);
}