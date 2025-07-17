import express from 'express';
import { Workspace } from '../models/Question.model.js';
import { QuizModel } from '../models/quiz.models.js';
import { SummaryModel } from '../models/summary.model.js';
import { Subtitlemain } from '../helpers/scrapecaption.js';
import extractVideoId from '../helpers/extractVidId.js';
import { generateWorkspace } from '../helpers/generateWorkspace.js';
import { User } from '../models/user.model.js';
import { authMiddleware } from '../helpers/authenticatejwt.js';

const workspaceRouter = express.Router();

workspaceRouter.post('/addworkspace',authMiddleware, async (req, res) => {
    try {
        const { videoUrl, type, count } = req.body;
        const userId = req.user.id;

        // Extract video ID from URL
        const videoId = extractVideoId(videoUrl)
        if (!videoId) {
            return res.status(400).json({ message: 'Invalid video URL' });
        }

        // Get video subtitles
        const subtitles = await Subtitlemain(videoId);
        if (!subtitles) {
            return res.status(404).json({ message: 'No subtitles found for this video' });
        }

        // Create main workspace document
        const workspaceDoc = await Workspace.create({
            videoId,
            videoLink: videoUrl,
            videoTitle: "Video Title", // You might want to fetch this from YouTube API
            type
        });

        // Generate workspace content using AI
        const workspace = await generateWorkspace(subtitles, type, count);

        if (type === 'mcq') {
            // Create quiz questions in database
            await QuizModel.create(
                workspace.questions.map(q => ({
                    question: q.question,
                    options: q.options,
                    correctIndex: q.correctIndex,
                    workspaceId: workspaceDoc._id
                }))
            );
        } else if (type === 'summarize') {
            // Create summary entry
            await SummaryModel.create({
                videoId,
                videoLink: videoUrl,
                summary: workspace.summary,
                workspaceId: workspaceDoc._id
            });
        }

        // Add workspace to user's workspaces array
        await User.findByIdAndUpdate(
            userId,
            { $push: { workspaces: workspaceDoc._id } }
        );

        res.status(201).json({
            message: 'Workspace created successfully',
            workspaceId: workspaceDoc._id
        });

    } catch (error) {
        console.error('Workspace creation error:', error);
        res.status(500).json({ message: 'Failed to create workspace' });
    }
});

workspaceRouter.get('/workspace/:id', authMiddleware, async (req, res) => {
    try {
        const workspaceId = req.params.id;
        const workspace = await Workspace.findById(workspaceId);
        
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        let content;
        if (workspace.type === 'mcq') {
            content = await QuizModel.find({ workspaceId });
        } else if (workspace.type === 'summarize') {
            content = await SummaryModel.findOne({ workspaceId });
        }

        res.json({
            videoId: workspace.videoId,
            videoTitle: workspace.videoTitle,
            type: workspace.type,
            ...(workspace.type === 'summarize' 
                ? { summary: content?.summary } 
                : { questions: content })
        });

    } catch (error) {
        console.error('Error fetching workspace:', error);
        res.status(500).json({ message: 'Failed to fetch workspace' });
    }
});

workspaceRouter.post('/workspace/:id/submit', authMiddleware, async (req, res) => {
    try {
        const workspaceId = req.params.id;
        const userId = req.user.id;
        const { userAnswers } = req.body;

        // Get correct answers
        const questions = await QuizModel.find({ workspaceId });
        if (!questions.length) {
            return res.status(404).json({ message: 'Questions not found' });
        }

        // Calculate score
        let correctCount = 0;
        const results = questions.map((q, index) => {
            const isCorrect = userAnswers[index] === q.correctIndex;
            if (isCorrect) correctCount++;
            return {
                isCorrect,
                correctIndex: q.correctIndex
            };
        });

        const currentScore = Math.round((correctCount / questions.length) * 100);

        // Get user's previous stats
        const user = await User.findById(userId);
        const newTotalTestCount = user.totalTestCount + 1;
        const newTotalScore = user.previousTotalScore + currentScore;
        const newAverageScore = Math.round(newTotalScore / newTotalTestCount);

        // Update user stats
        await User.findByIdAndUpdate(userId, {
            previousTotalScore: newTotalScore,
            totalTestCount: newTotalTestCount,
            score: newAverageScore
        });

        res.json({
            results,
            currentScore,
            newAverageScore
        });

    } catch (error) {
        console.error('Error submitting answers:', error);
        res.status(500).json({ message: 'Failed to submit answers' });
    }
});

export { workspaceRouter };