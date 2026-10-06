const {z} = require("zod");

const loginValidator = z.object({
    email : z.string().trim().email("please enter a valid email"),
    password : z.string().min(1, "Password is required"),
});

module.exports = loginValidator;