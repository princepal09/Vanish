import rateLimit from "express-rate-limit";

export const noteCreationLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many notes created, Please try again later ",
  },
});
