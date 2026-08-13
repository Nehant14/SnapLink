const { ConflictError } = require("../utils/error")
const User = require("../models/user.model")


class MongoUserRepo {

    constructor(model = User) {
        this.model = model;
    }

    async create({ email, passwordHash, name }) {

        try {

            const doc = await this.model.create({ email, passwordHash, name: name || null });
            return doc.toObject();

        } catch (err) {

            if (err.code === 11000) {
                throw new ConflictError(`An account with email ${email} already exists`);
            }
            throw err;
        }

    }

    async findByEmail(email) {

        return this.model.findOne({ email: email.toLowerCase().trim() });
        // NOT .lean() here — auth.service needs the doc's _id as an ObjectId
        // and callers only ever read a couple of fields off it, so the
        // small overhead of a hydrated document is fine.
    }

    async findById(id) {

        return this.model.findById(id).lean();

    }

}

module.exports = MongoUserRepo;
