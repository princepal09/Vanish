import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { createNote } from "../services/note.service.js";
import ApiResponse from "../utils/ApiResponse.js";



export const createNoteController = asyncHandler(async (req:Request, res:Response) => {
  const {secret, expiry, passphrase} = req.body;

  if(!secret || typeof secret !== "string"){
    throw new ApiError(400, "Secret is required")
  }

  if(!expiry){
    throw new ApiError(400, "Expiry is required")
  }

  const allowedExpires = ["5m", "1h", "24d", "7d"];
  
  if(!allowedExpires.includes(expiry)){
    throw new ApiError(400, "Invalid Expiry Option")
  }

  const note = await createNote({
    secret, expiry, passphrase
  })


  return res.status(201).json(
    new ApiResponse(201, {
        token : note.token,
        expiresAt : note.expiresAt,
        url : `/api/notes/${note.token}`
    }, "Secret Note Created Successfully")
  )

})