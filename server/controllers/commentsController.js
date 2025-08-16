import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


export const createComment = async (req,res) => {
    try{
        const { content, isAnonymous } = req.body;

        console.log('Decoded User:', req.user);
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Not authorized, user not found' });
        }

        const userId   = req.user.id;
        console.log('User ID:', req.user.id);

        if (!content || content.trim() === '') {
            return res.status(400).json({ error: 'Comment cannot be empty' });
        }

        const comment = await prisma.comment.create({
            data: {
                content:  content.trim(),
                userId: userId,
                isAnonymous: isAnonymous || false
            },
            include: {
                user: true,
            },
        });

        return res.status(201).json(comment);
    }catch (error) {
        console.error('Error creating comment:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export const getComments = async (req, res) => {

    try {
        const comments = await prisma.comment.findMany({
            include: {
                user: true,
            },
        });

        return res.status(200).json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.user.id;

        const comment = await prisma.comment.findUnique({ where: {id: Number(id) } })
        if (!comment) return res.status(404).json({ error: 'Comment not found' });
        if (comment.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });

        await prisma.comment.delete({ where: { id: Number(id) } });
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting comment:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
