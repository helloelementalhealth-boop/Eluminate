import { createApplication } from "@specific-dev/framework";
import * as appSchema from './db/schema.js';
import * as authSchema from './db/auth-schema.js';
import * as journalRoutes from './routes/journal.js';
import * as nutritionRoutes from './routes/nutrition.js';
import * as workoutRoutes from './routes/workouts.js';
import * as meditationRoutes from './routes/meditation.js';
import * as activitiesRoutes from './routes/activities.js';
import * as goalsRoutes from './routes/goals.js';
import * as dashboardRoutes from './routes/dashboard.js';
import * as quotesRoutes from './routes/quotes.js';
import * as themesRoutes from './routes/themes.js';
import * as visualsRoutes from './routes/visuals.js';
import * as preferencesRoutes from './routes/preferences.js';
import * as adminContentRoutes from './routes/admin-content.js';
import * as adminCategoriesRoutes from './routes/admin-categories.js';
import * as adminSubscriptionsRoutes from './routes/admin-subscriptions.js';
import * as adminAiRoutes from './routes/admin-ai.js';
import * as adminUploadRoutes from './routes/admin-upload.js';
import * as adminAuthRoutes from './routes/admin-auth.js';
import * as sleepToolsRoutes from './routes/sleep-tools.js';

// Combine schemas
const schema = { ...appSchema, ...authSchema };

// Create application with schema for full database type support
export const app = await createApplication(schema);

// Export App type for use in route files
export type App = typeof app;

// Enable Better Auth
app.withAuth();

// Register all route modules
journalRoutes.register(app, app.fastify);
nutritionRoutes.register(app, app.fastify);
workoutRoutes.register(app, app.fastify);
meditationRoutes.register(app, app.fastify);
activitiesRoutes.register(app, app.fastify);
goalsRoutes.register(app, app.fastify);
dashboardRoutes.register(app, app.fastify);
quotesRoutes.register(app, app.fastify);
themesRoutes.register(app, app.fastify);
visualsRoutes.register(app, app.fastify);
preferencesRoutes.register(app, app.fastify);
adminContentRoutes.register(app, app.fastify);
adminCategoriesRoutes.register(app, app.fastify);
adminSubscriptionsRoutes.register(app, app.fastify);
adminAiRoutes.register(app, app.fastify);
adminUploadRoutes.register(app, app.fastify);
adminAuthRoutes.register(app, app.fastify);
sleepToolsRoutes.register(app, app.fastify);

await app.run();
app.logger.info('Application running');
