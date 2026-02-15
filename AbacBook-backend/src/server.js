    import  app from "./app.js";
    import { connectDB } from "./config/db.js";
    import { env } from "./config/env.js";
import mdHiddenRoutes from "./routes/md.hidden.routes.js";



const startServer = async () => {
    await connectDB();
  app.use("/api/md-secret", mdHiddenRoutes);


    app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
    });
    };


    startServer();
    