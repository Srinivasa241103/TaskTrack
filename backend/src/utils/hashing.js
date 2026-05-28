import bcrypt from "bcrypt";


export const generateHash = (string) => {
    const saltRounds = 10;
    const hash = bcrypt.hash(string, saltRounds);
    return hash;
}

export const compareHash = (string, hash) => {
    return bcrypt.compare(string, hash);
}

