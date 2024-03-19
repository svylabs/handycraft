import express, { Router, Request, Response, NextFunction } from "express";
import { getDatastore } from "../../database";
import axios from "axios";
import { encode } from "url-safe-base64";
import { Session } from "express-session";

const cors = require("cors");
const cookieParser = require("cookie-parser");

export const githubRouter: Router = express.Router();

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://handycraft.io",
    "http://handycraft.io",
    "www.handycraft.io",
    "https://handycraft-415122.oa.r.appspot.com",
  ],
  credentials: true,
};

githubRouter.use(cors(corsOptions));
githubRouter.use(cookieParser());

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

export class HttpError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface User {
  name: string;
  login: string;
  id: number;
  avatar_url: string;
  created_on: string;
}

interface CustomSession extends Session {
  userid?: number;
}

const addUserToSession = (req: Request, res: Response, user: User) => {
  const session = req.session as CustomSession;
  session.userid = user.id;
};

const addUserToDatastore = async (user: User) => {
  const kind = "User";
  const datastore = getDatastore();
  // const key = datastore.key([kind, user.id]);
  const key = datastore.key([kind, user.id.toString()]);
  const entity = {
    key: key,
    data: [
      {
        name: "name",
        value: user.name,
      },
      {
        name: "login",
        value: user.login,
      },
      {
        name: "id",
        value: user.id,
      },
      {
        name: "avatar_url",
        value: user.avatar_url,
      },
      {
        name: "created_on",
        value: new Date().toISOString(),
      },
    ],
  };
  const [existing_user] = await datastore.get(key);
  if (!existing_user) {
    await datastore.save(entity);
  }
};

export const authenticatedUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(req.session);
  const session = req.session as CustomSession;
  if (session.userid !== undefined) {
    const userid = session.userid;
    const datastore = getDatastore();
    const result = await datastore.get(datastore.key(["User", userid]));
    if (result[0]) {
      (req as any).user = result[0];
      return next();
    }
  }
  const error = new HttpError("Unauthorized", 401);
  return next(error);
};

githubRouter.get(
  "/user",
  authenticatedUser,
  async (req: Request, res: Response) => {
    const session = req.session as CustomSession;
    console.log(session);
    if (session.userid !== undefined) {
      const userid = session.userid;
      const datastore = getDatastore();
      const key = datastore.key(["User", userid]);
      const result = await datastore.get(key);
      if (result[0]) {
        res.send(result[0]);
      } else {
        res.status(401).send({ message: "User not found in DB" });
      }
    } else {
      res.status(401).send({ message: "User not found in session" });
    }
  }
);

githubRouter.get("/github/callback", async (req, res, next) => {
  // The req.query object has the query params that were sent to this route.
  const requestToken = req.query.code;
  let result = await axios({
    method: "post",
    url: `https://github.com/login/oauth/access_token?client_id=${GITHUB_CLIENT_ID}&client_secret=${GITHUB_CLIENT_SECRET}&code=${requestToken}`,
    // Set the content type header, so that we get the response in JSON
    headers: {
      accept: "application/json",
    },
  });
  let accessToken = result.data.access_token;
  let userData = await axios({
    method: "get",
    url: `https://api.github.com/user`,
    headers: {
      Authorization: "bearer " + accessToken,
    },
  });
  console.log("user data:-", userData.data);
  const userDetail = {
    name: userData.data.name,
    login: userData.data.login,
    id: userData.data.id,
    avatar_url: userData.data.avatar_url,
    created_on: new Date().toISOString(),
  };
  console.log("user details:-", userDetail);
  try {
    addUserToSession(req, res, userDetail);
    await addUserToDatastore(userDetail);
    // res.redirect("/");
    // res.redirect("https://handycraft-415122.oa.r.appspot.com/converter/Custom%20Components");
    res.redirect("http://localhost:5173/");
  } catch (error) {
    next(error);
  }
});
