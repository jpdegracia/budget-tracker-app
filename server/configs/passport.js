import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { User } from '../models/User.js';

// Helper to create a clean username from a display name
const generateUsername = (name) => name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000);

export const configurePassport = () => {

    // --- 1. LOCAL STRATEGY ---
    passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
        try {
            const user = await User.findOne({ email });
            if (!user || user.authProvider !== 'local') {
                return done(null, false, { message: 'Invalid credentials or login method.' });
            }
            const isMatch = await user.comparePassword(password);
            if (!isMatch) return done(null, false, { message: 'Incorrect password.' });
            
            return done(null, user);
        } catch (err) { return done(err); }
    }));

    // --- 2. GOOGLE STRATEGY ---
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback" // Updated to include /api/
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ oauthId: profile.id });
            if (!user) {
                user = await User.create({
                    username: generateUsername(profile.displayName),
                    firstName: profile.name?.givenName || "User",
                    lastName: profile.name?.familyName || "",
                    email: profile.emails[0].value,
                    oauthId: profile.id,
                    authProvider: 'google'
                });
            }
            return done(null, user);
        } catch (err) { return done(err); }
    }));

    // --- 3. FACEBOOK STRATEGY ---
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: "/api/auth/facebook/callback", // Updated to include /api/
        profileFields: ['id', 'displayName', 'name', 'emails'] // Added 'name' for first/last
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ oauthId: profile.id });
            if (!user) {
                user = await User.create({
                    username: generateUsername(profile.displayName),
                    firstName: profile.name?.givenName || "User",
                    lastName: profile.name?.familyName || "",
                    email: profile.emails[0].value,
                    oauthId: profile.id,
                    authProvider: 'facebook'
                });
            }
            return done(null, user);
        } catch (err) { return done(err); }
    }));
};