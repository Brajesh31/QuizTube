import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema({
    videoId: {
        type: String,
        required: true
    },
    videoLink: {
        type: String,
        required: true
    },
    videoTitle: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['mcq', 'summarize'],
        required: true
    }
}, { timestamps: true });

const Workspace = mongoose.model("Workspace", workspaceSchema);

export { Workspace };