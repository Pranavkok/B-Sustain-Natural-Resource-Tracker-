import userModel from "../models/user.model.js";

export async function GetLeaderBoard(req,res){
    try {
        const page = parseInt(req.query.page) || 1 ;
        const limit = 8 ;
        const skip = (page - 1)*limit ;

        const result = await userModel.aggregate([
            { 
                $sort : {points : -1}
            },
            {
                $facet : {
                    paginationResult : [
                        {$skip : skip},
                        {$limit : limit},
                        {$project : {name : 1 ,points : 1}}
                    ],
                    totalCount : [
                        {$count : "count"}
                    ]
                }
            }
        ]);
        const users = result[0].paginationResult
        const totalUsers = result[0].totalCount[0]?.count || 0
        const totalPages = Math.ceil(totalUsers / limit)

        return res.json({
            message: "Leaderboard fetched successfully",
            success: true,
            error: false,
            data: users,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalUsers: totalUsers
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            success: false,
            error: true
        });
    }
}

export async function GetTopUsers(req,res){
    try {
        const topUsers = await userModel.aggregate([
            {
                $sort : {points : -1}
            },
            {
                $limit : 3
            },
            {
                $project : {
                    name : 1 ,
                    points : 1
                }
            }
        ]);

        return res.json({
            message : "Here are our Top 3 Players ",
            data : topUsers,
            success : true ,
            error : false 
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            success: false,
            error: true
        });
    }
}

export async function GetUserRank(req,res){
    try {
        const userid = req.userId 
        const user = await userModel.findById(userid,{ points: 1, name: 1 })

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
                error: true
            });
        }

        const higherUsers = await userModel.countDocuments({points : {$gt : user.points}});
        const userRank = higherUsers + 1 

        return res.json({
            message : "Your Rank is Fetched",
            data : {
                userId : user._id,
                name : user.name ,
                points : user.points ,
                rank : userRank
            },
            success : true ,
            error : false
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            success: false,
            error: true
        });
    }
}