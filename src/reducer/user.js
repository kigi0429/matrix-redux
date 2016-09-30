import * as ActionTypes from '../actions/user';
import * as SyncActionTypes from '../actions/sync';

const initialState = {
    isLoading: false,
    isLogged: false,
    accessToken: null,
    homeServer: null,
    userId: null,
    refreshToken: null,
    deviceId: null,
    baseUrl: null,
    credentials: null,
    displayName: null,
    avatarUrl: null,
    roomsIds: [],
    store: {},
    matrixClientData: { }
};

const user = function (state = initialState, action) {
    let newState = null;
    switch (action.type) {
        case ActionTypes.USER_REQUEST:
        case ActionTypes.USER_FAILURE:
            newState = {...state, ['isLoading']: action.payload.isLoading};
            return newState;
            break;
        case ActionTypes.USER_SUCCESS:
            action.payload.isLoading = false;
            newState = {...state, ...action.payload};
            return newState;
            break;
        case SyncActionTypes.SYNC_TOKEN:
            const matrixClientData = {...state.matrixClientData, ['store']: {syncToken: action.payload.syncToken}};
            newState = {...state, matrixClientData};
            return newState;
            break
        default:
            return state;
            break;
    }
};

export default user;
