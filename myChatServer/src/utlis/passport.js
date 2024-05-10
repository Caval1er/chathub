const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/auth/User");
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
      console.log(accessToken, refreshToken, profile);
      const user = {
        githubId: Number(profile.id),
        githubUrl: profile.profileUrl,
      };
      try {
        const existed_user = await User.findOne({
          "profile.github.github_id": user.githubId,
        });
        const info = {
          email: existed_user ? existed_user.email : null,
          profile: user,
          isLinked: Boolean(existed_user),
          accessToken,
          refreshToken,
        };
        console.log(info);
        return done(null, info);
      } catch (error) {
        console.log(error);
        return done(error);
      }
    }
  )
);

module.exports = passport;
