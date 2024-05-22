const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/auth/User");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE;
const JWT_ISSUER = process.env.JWT_ISSUER;
//配置本地策略
passport.use(User.createStrategy());
//配置JWT策略
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};
passport.use(
  new JwtStrategy(jwtOptions, (payload, done) => {
    return done(null, payload);
  })
);
// 配置github策略
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/api/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 构造用户对象
        const user = {
          githubId: profile.id,
          githubUrl: profile.profileUrl,
          nickname: profile.username,
          avatar:
            profile.photos && profile.photos.length > 0
              ? profile.photos[0].value
              : "",

          isOnline: true,
        };
        let existingUser = await User.findOne({ githubId: user.githubId });
        if (!existingUser) {
          existingUser = new User(user);
          await existingUser.save();
        }
        const token = jwt.sign(
          {
            userId: existingUser._id,
            username: existingUser.nickname,
            issuer: JWT_ISSUER,
          },
          JWT_SECRET,
          {
            expiresIn: JWT_EXPIRE,
          }
        );
        return done(null, token);
      } catch (error) {
        console.error("Error finding or creating user:", error);
        return done(error);
      }
    }
  )
);

module.exports = passport;
