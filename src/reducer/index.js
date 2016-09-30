/*
 * Copyright 2015-present, ZBox Spa.
 * All rights reserved.
 */

"use strict";

import {combineReducers} from "redux";
import {routerReducer as routing} from "react-router-redux";
import login from './login';
import error from './error';
import rooms from './rooms';
import currentUser from './currentUser';
import sync from './sync';
// uncommented this to use it
import {intlReducer as intl} from "react-intl-redux";

const rootReducer = combineReducers({
    intl,
    routing,
    sync,
    login,
    error,
    rooms,
    currentUser
});

export default rootReducer;
