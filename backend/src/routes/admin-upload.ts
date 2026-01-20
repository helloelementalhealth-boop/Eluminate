import type { FastifyInstance } from 'fastify';
import type { App } from '../index.js';
import * as fs from 'fs';
import * as path from 'path';

// Helper function to check admin status
async function requireAdmin(app: App, requireAuth: any, request: any, reply: any) {
  const session = await requireAuth(request, reply);

  if (!session || !session.user) {
    app.logger.warn({}, 'Unauthorized: No authenticated user');
    return reply.code(401).send({ error: 'Unauthorized' });
  }

  if (session.user.role !== 'admin') {
    app.logger.warn({ userId: session.user.id }, 'Forbidden: User is not admin');
    return reply.code(403).send({ error: 'Forbidden: Admin access required' });
  }

  return session;
}

export function register(app: App, fastify: FastifyInstance) {
  const requireAuthFunc = app.requireAuth();
  // POST /api/admin/upload/image - Upload image file
  fastify.post('/api/admin/upload/image', async (request, reply) => {
    const session = await requireAdmin(app, requireAuthFunc, request, reply);
    if (!session) return;

    app.logger.info({}, 'Processing image upload');
    try {
      const data = await request.file();

      if (!data) {
        app.logger.warn({}, 'No file provided for upload');
        return reply.code(400).send({ error: 'No file provided' });
      }

      // Get file buffer
      let buffer: Buffer;
      try {
        buffer = await data.toBuffer();
      } catch (err) {
        app.logger.error({ err }, 'File size limit exceeded');
        return reply.code(413).send({ error: 'File size limit exceeded' });
      }

      // Validate file type
      const filename = data.filename;
      const ext = path.extname(filename).toLowerCase();
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

      if (!validExtensions.includes(ext)) {
        app.logger.warn({ filename }, 'Invalid file type uploaded');
        return reply.code(400).send({ error: 'Invalid file type. Only images are allowed.' });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const newFilename = `${timestamp}-${randomStr}${ext}`;

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Save file
      const filePath = path.join(uploadsDir, newFilename);
      fs.writeFileSync(filePath, buffer);

      // Generate URL (assuming files are served from /uploads endpoint)
      const url = `/uploads/${newFilename}`;

      app.logger.info({ filename: newFilename, size: buffer.length }, 'Image uploaded successfully');
      return {
        url,
        filename: newFilename,
      };
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to upload image');
      throw error;
    }
  });

  // GET /uploads/:filename - Serve uploaded images
  fastify.get('/uploads/:filename', async (request, reply) => {
    const { filename } = request.params as { filename: string };

    try {
      const filePath = path.join(process.cwd(), 'uploads', filename);

      // Security: prevent directory traversal
      if (!path.resolve(filePath).startsWith(path.resolve(path.join(process.cwd(), 'uploads')))) {
        app.logger.warn({ filename }, 'Directory traversal attempt detected');
        return reply.code(403).send({ error: 'Forbidden' });
      }

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        app.logger.warn({ filename }, 'File not found');
        return reply.code(404).send({ error: 'File not found' });
      }

      // Determine content type
      const ext = path.extname(filename).toLowerCase();
      let contentType = 'application/octet-stream';
      if (ext === '.jpg' || ext === '.jpeg') {
        contentType = 'image/jpeg';
      } else if (ext === '.png') {
        contentType = 'image/png';
      } else if (ext === '.gif') {
        contentType = 'image/gif';
      } else if (ext === '.webp') {
        contentType = 'image/webp';
      }

      const file = fs.readFileSync(filePath);
      reply.type(contentType).send(file);

      app.logger.info({ filename }, 'Image served successfully');
    } catch (error) {
      app.logger.error({ err: error, filename }, 'Failed to serve image');
      throw error;
    }
  });
}
