import { InferRouterInputs, InferRouterOutputs } from '@orpc/server';

import accountRouter from './routers/account';
import configRouter from './routers/config';
import genreRouter from './routers/genre';
import leaveRouter from './routers/leave';
import userRouter from './routers/user';

export type Router = typeof router;
export type Inputs = InferRouterInputs<typeof router>;
export type Outputs = InferRouterOutputs<typeof router>;
export const router = {
  account: accountRouter,
  genre: genreRouter,
  user: userRouter,
  config: configRouter,
  leave: leaveRouter,
};
