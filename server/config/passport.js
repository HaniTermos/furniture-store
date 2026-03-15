// ═══════════════════════════════════════════════════════════════
//  config/passport.js — Passport.js Strategy Configuration
//  Local + Google OAuth 2.0 + JWT
// ═══════════════════════════════════════════════════════════════

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');

// ─── Serialize / Deserialize ─────────────────────────────────
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// ─── Local Strategy (Email + Password) ──────────────────────
passport.use(
    new LocalStrategy(
        { usernameField: 'email', passwordField: 'password' },
        async (email, password, done) => {
            try {
                const user = await User.findByEmail(email);
                if (!user) {
                    return done(null, false, { message: 'Invalid email or password.' });
                }

                if (!user.is_active) {
                    return done(null, false, { message: 'Account has been deactivated.' });
                }

                // Check lockout
                if (user.locked_until && new Date(user.locked_until) > new Date()) {
                    const minutesLeft = Math.ceil(
                        (new Date(user.locked_until) - new Date()) / (1000 * 60)
                    );
                    return done(null, false, {
                        message: `Account locked. Try again in ${minutesLeft} minute(s).`,
                    });
                }

                const isMatch = await User.comparePassword(password, user.password_hash);
                if (!isMatch) {
                    // Increment failed attempts
                    await User.incrementFailedLogin(user.id);
                    const attempts = (user.failed_login_attempts || 0) + 1;
                    if (attempts >= 5) {
                        await User.lockAccount(user.id, 15); // 15 minutes
                        return done(null, false, {
                            message: 'Too many failed attempts. Account locked for 15 minutes.',
                        });
                    }
                    return done(null, false, { message: 'Invalid email or password.' });
                }

<<<<<<< HEAD
                // Success — reset counters
                await User.resetFailedLogin(user.id);
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    )
);

// ─── JWT Strategy (for API / mobile clients) ────────────────
passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET,
        },
        async (payload, done) => {
            try {
                const user = await User.findById(payload.id);
                if (!user || !user.is_active) {
                    return done(null, false);
                }
                return done(null, user);
            } catch (error) {
=======
                // Reset failed attempts on successful login
                await User.resetFailedLogin(user.id);
                return done(null, user);
            } catch (error) {
>>>>>>> d1d77d0 (dashboard and variants edits)
                return done(error, false);
            }
        }
    )
);

<<<<<<< HEAD
=======
// ─── JWT Strategy ────────────────────────────────────────────
if (process.env.JWT_SECRET) {
    passport.use(
        new JwtStrategy(
            {
                jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
                secretOrKey: process.env.JWT_SECRET,
            },
            async (jwtPayload, done) => {
                try {
                    const user = await User.findById(jwtPayload.id);
                    if (!user) {
                        return done(null, false);
                    }
                    if (!user.is_active) {
                        return done(null, false);
                    }
                    return done(null, user);
                } catch (error) {
                    return done(error, false);
                }
            }
        )
    );
}

>>>>>>> d1d77d0 (dashboard and variants edits)
// ─── Google OAuth 2.0 Strategy ──────────────────────────────
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL:
                    process.env.GOOGLE_CALLBACK_URL ||
                    '/api/auth/google/callback',
                scope: ['profile', 'email'],
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const email =
                        profile.emails && profile.emails[0]
                            ? profile.emails[0].value
                            : null;
                    if (!email) {
                        return done(null, false, {
                            message: 'No email found in Google profile.',
                        });
                    }

                    // Check if user exists by Google ID
                    let user = await User.findByGoogleId(profile.id);
<<<<<<< HEAD

=======
>>>>>>> d1d77d0 (dashboard and variants edits)
                    if (user) {
                        return done(null, user);
                    }

                    // Check if user exists by email (link accounts)
                    user = await User.findByEmail(email);
                    if (user) {
                        // Link Google account to existing user
                        user = await User.update(user.id, {
                            google_id: profile.id,
                            avatar_url:
                                user.avatar_url ||
                                (profile.photos && profile.photos[0]
                                    ? profile.photos[0].value
                                    : null),
                            email_verified: true,
                        });
                        return done(null, user);
                    }

                    // Create new user via Google
                    user = await User.createFromGoogle({
                        email,
                        name: profile.displayName,
                        google_id: profile.id,
                        avatar_url:
                            profile.photos && profile.photos[0]
                                ? profile.photos[0].value
                                : null,
                    });
                    return done(null, user);
                } catch (error) {
                    return done(error, false);
                }
            }
        )
    );
}

module.exports = passport;
