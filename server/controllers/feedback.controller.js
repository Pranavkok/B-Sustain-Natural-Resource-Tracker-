import FeedbackModel from "../models/feedback.model.js";

export async function addFeedback(req,res){
    try {
        const userid = req.userId 
        const {message} = req.body

        if(!message){
            return res.status(400).json({
                message : "Write a Feedback",
                success : false ,
                error : true
            })
        }

        const payload = {
            userId : userid ,
            feedbackText : message
        }

        const newFeedback = new FeedbackModel(payload)
        const save = await newFeedback.save()

        return res.redirect('/api/user/profile')

        // return res.json({
        //     message : "Feedback posted Successfully",
        //     success : true ,
        //     error : false 
        // })

    } catch (error) {
        return res.status(500).json({
            message : error.message || error ,
            success : false ,
            error : true 
        })
    }
}

export async function getFeedback(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit;

        const result = await FeedbackModel.aggregate([
            { $sort: { createdAt: -1 } }, // Sort latest feedback first
            {
                $lookup: {
                    from: "users", // Your users collection
                    localField: "userId",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $unwind: "$userDetails" // Convert array to object
            },
            {
                $facet: {
                    paginatedResults: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                feedbackText: 1,
                                createdAt: 1,
                                userName: "$userDetails.name" // Extract user name
                            }
                        }
                    ],
                    totalCount: [{ $count: "count" }]
                }
            }
        ]);

        const feedbacks = result[0].paginatedResults;
        const totalCount = result[0].totalCount[0]?.count || 0;
        const totalPages = Math.ceil(totalCount / limit);

        return res.json({
            message: "Feedback fetched successfully",
            success: true,
            error: false,
            data: feedbacks,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalFeedback: totalCount
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
