const { z } = require("zod");

const registrationValidator = z.object({
  name: z.string().trim().min(2, "Name must be at least two characters").max(50),
  email: z.string().trim().email("Please enter a valid email"),
  phone: z
    .string()
    .trim()
    .regex(/^(\+234|0)(70|80|81|90|91)\d{8}$/, "Phone number is invalid"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/,
      "Password must include an uppercase letter, lowercase letter, number and special character"
    ),
});

module.exports = registrationValidator;