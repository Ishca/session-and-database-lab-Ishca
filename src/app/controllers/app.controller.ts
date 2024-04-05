import { Request, Response, Router } from "express";
import { pino } from 'pino';
import { UserService } from "../services/user.services";

export class AppController {
  [x: string]: any;
  public router: Router = Router();
  private log: pino.Logger = pino();
  private userService = new UserService();

  constructor() {
    this.initializeRouter();
  }

  private initializeRouter() {

    this.router.get("/login", (req: Request, res: Response) => {
      res.render("login");
    });

    this.router.post("/login", async (req: any, res: Response) => {
      const user = await this.userService.authenticateUser(req.body.username, req.body.password);
      if (user) {
        req.session.user = user;
        res.redirect("/");
      } else {
        res.render("login", { error: "Invalid username or password" });
      }
    });

    this.router.get("/logout", (req: Request, res: Response) => {
      req.session.destroy(() => {
        res.redirect("/");
      });
    });

    this.router.get("/signup", (req: Request, res: Response) => {
      res.render("signup");
    });



    this.router.post("/signup", async (req: any, res) => {
      const user = await this.userService.createUser(req.body.username, req.body.email, req.body.password);
      req.session.user = user;
      res.redirect("/login");
    });

    // Handle login form submissions
    this.router.post("/processLogin", async (req: any, res) => {
      try {
        const user = await this.userService.authenticateUser(req.body.username, req.body.password);
        if (user) {
          req.session.user = user;
          res.render("/");
        } else {
          res.status(401).send("Invalid username or password");
        }
      } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred");
      }
    });
    
    

    // Enforce security
    this.router.use((req: any, res, next) => {
      // If the user is set in the session,
      // pass them on
      if (req.session.user) {
        next();
      } else {
        res.render("login", {
          error: "You need to log in first",
        });
      }
    });

    // Serve the home page
    this.router.get("/", (req: any, res: Response) => {
      try {
        // Render the "home" template as HTML
        res.render("home", {
          username: req.session.user
        });
      } catch (err) {
        this.log.error(err);
      }
    });
  }
}