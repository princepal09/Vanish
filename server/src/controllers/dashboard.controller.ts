import { Request, Response } from "express";

import { asyncHandler } from "../utils/asyncHandler.js";

import { getDashboardStats } from "../services/dashboard.service.js";
import ApiResponse from "../utils/ApiResponse.js";

export const getDashboardController = asyncHandler(
  async (_req: Request, res: Response) => {
    const stats = await getDashboardStats();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          stats,
          "Dashboard statistics fetched successfully",
        ),
      );
  },
);
