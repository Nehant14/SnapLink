const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { ConflictError, UnauthorizedError } = require('../utils/error');

class AuthService {

    constructor(userRepository, urlRepository, { jwtSecret, jwtExpiresIn, bcryptSaltRounds }){

        this.userRepository = userRepository;   // MongoUserRepo instance
        this.urlRepository = urlRepository;     // MongoUrlRepo instance — needed to migrate anon links on signup
        this.jwtSecret = jwtSecret;
        this.jwtExpiresIn = jwtExpiresIn;
        this.bcryptSaltRounds = bcryptSaltRounds;

    }

    signToken(user){

        return jwt.sign(
            { id: user._id.toString(), email: user.email },
            this.jwtSecret,
            { expiresIn: this.jwtExpiresIn }
        );

    }

    verifyToken(token){

        return jwt.verify(token, this.jwtSecret);

    }

    // anonSessionId is the visitor's anon-session cookie value, if any —
    // passed in by the signup controller. Migration only ever happens here,
    // on account creation. login() never touches anonymous links, so
    // logging back into an existing account from a browser that has since
    // created new anonymous links leaves those links alone.
    async signup({ email, password, name, anonSessionId }){

        const existing = await this.userRepository.findByEmail(email);

        if(existing){
            throw new ConflictError(`An account with email ${email} already exists`);
        }

        const passwordHash = await bcrypt.hash(password, this.bcryptSaltRounds);

        const user = await this.userRepository.create({ email, passwordHash, name });

        if(anonSessionId){

            try {

                const result = await this.urlRepository.migrateAnonToUser(anonSessionId, user._id);
                console.log(`[SIGNUP] migrated ${result.modifiedCount} anon link(s) from session "${anonSessionId}" to user ${user._id}`);

            } catch (err) {

                // never let a migration hiccup block account creation —
                // the account is already created at this point.
                console.error('[SIGNUP] anon link migration failed:', err);
            }

        }

        const token = this.signToken(user);

        return { user, token };

    }

    async login({ email, password }){

        const user = await this.userRepository.findByEmail(email);

        if(!user){
            throw new UnauthorizedError('Invalid email or password');
        }

        const matches = await bcrypt.compare(password, user.passwordHash);

        if(!matches){
            throw new UnauthorizedError('Invalid email or password');
        }

        // Deliberately no anon-link migration here — logging into an
        // existing account never touches this browser's anonymous history.

        const token = this.signToken(user);

        return { user, token };

    }

}

module.exports = AuthService;
