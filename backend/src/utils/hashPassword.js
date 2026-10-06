require('dotenv').config();
const bcrypt = require('bcrypt');
const env = require('../../config/env');

const hashPassword = async (password) => bcrypt.hash(password, env.saltRounds);

const comparePassword = async (password, hash) => bcrypt.compare(password, hash);

const hashToken = async (token) => bcrypt.hash(token, 10);

const compareToken = async (token, hash) => bcrypt.compare(token, hash);

module.exports = { hashPassword, comparePassword, hashToken, compareToken };
