// @flow
import { createAction } from "redux-actions";

export const unlock = createAction("APPLICATION_SET_DATA", () => ({ isLocked: false }));
export const lock = createAction("APPLICATION_SET_DATA", () => ({ isLocked: true }));
