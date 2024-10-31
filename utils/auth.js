import connectToDatabase from "./db";
import { verify } from "jsonwebtoken";
import FeedbackTask from "@/models/FeedbackTask";
import Feedback from "@/models/Feedback";

export const authorizeUsername = async (token, username) => {
    let user = verify(token, process.env.AUTH_SECRET);
    console.log('user is ', user);
    if (user.user.username !== username) {
        return false;
    }
    return true;
}

export const authorizeFeedbackId = async (token, feedbackId) => {
    let user = verify(token, process.env.AUTH_SECRET);
    console.log('user is ', user);

    if (feedbackId.length !== 24) {
        return false;
    }
    const feedbackObj = await Feedback.findOne({
        _id: feedbackId
    });

    if (!feedbackObj) {
        return false;
    }

    if (feedbackObj.given_by !== user.user.username) {
        return false;
    }
    return true;
}

export const authorizeTaskId = async (token, taskId) => {
    let user = verify(token, process.env.AUTH_SECRET);
    console.log('user is ', user);

    if (taskId.length !== 24) {
        return false;
    }

    const feedbackTaskObj = await FeedbackTask.findOne({
        _id: taskId
    });

    if (!feedbackTaskObj) {
        return false;
    }

    if (feedbackTaskObj.created_by !== user.user.username) {
        return false;
    }
    return true;
}
