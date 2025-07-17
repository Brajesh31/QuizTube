import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
    question:{
        type:String,
        required:true
    },
    options:[{
        type:String,
        required:true
    }],
    correctIndex:{
        type:Number,
        required:true
    },
    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true
    }
},{timestamps: true});

const QuizModel = mongoose.model("Quiz", quizSchema);

export { QuizModel };