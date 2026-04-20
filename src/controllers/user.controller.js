import { registerUserService } from '../services/user.service.js'
import { AsyncHandler } from '../utils/AsyncHandler.js'
import { ApiResponse } from '../utils/ApiResponse.js'

export const registerUser = AsyncHandler(async (req, res) => {

    const user = await registerUserService(req.body, req.file);


    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            user,
            "User registered successfully"
        )
    )
})