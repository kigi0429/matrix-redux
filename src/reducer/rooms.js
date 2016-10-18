"use strict";

import _ from "lodash";
import * as ActionTypes from "../actions/rooms";
import * as SyncTypes from "../actions/sync";
import {REHYDRATE} from "redux-persist/constants";

/**
 * @type {Object} items
 * @type {Object} items.room
 * @type {String} items.room.roomId
 * @type {String} items.room.name
 * @type {Array} items.room.timeline
 * @type {Object} items.item.tags
 * @type {Object} items.item.accountData
 * @type {RoomState} items.item.room.oldState
 * @type {RoomState} items.item.room.currentState
 * @type {RoomSumary} items.item.room.summary
 * @type {*} items.item.room.storageToken
 * @type {Array} ids - A list of Rooms Ids
 */
const initialState = {
    currentRoomId: null,
    isLoading: false,
    byIds: {},
};

const Rooms = function (state = initialState, action) {
    let newState = null;
    const payload = action.payload;
    switch (action.type) {
        case ActionTypes.ROOMS_REQUEST:
        case ActionTypes.ROOMS_FAILED:
            newState = {...state, ...payload};
            return newState;
            break;

        case ActionTypes.ROOMS_SUCCESS:
            newState = {...state, ...payload};
            return newState;
            break;

        case ActionTypes.ROOMS_REMOVE:
            newState = {...state};
            delete newState.items[payload.roomId];
            delete newState.publicIds[payload.roomId];
            delete newState.ids[payload.roomId];
            newState.isLoading = false;
            return newState;
            break;

        case SyncTypes.SYNC_INITIAL:
            const rooms = action.payload.data.rooms;
            newState = {...state, ['byIds']: rooms};
            newState.isLoading = false;
            return newState;
            break;

        case SyncTypes.SYNC_SYNCING:
            const resources = action.payload.data.rooms;
            const newIds = _.merge({}, state.byIds, resources);
            newState = {...state, ['byIds']: newIds};
            newState.isLoading = false;
            return newState;
            break;

        case REHYDRATE:
            const savedData = action.payload.rooms || state;
            return {...savedData,};
            break;

        default:
            return state;
            break;
    }
};

const setRoomInLoop = (state, action) => {
    let newState = {...state.rooms};

    action.payload.rooms.chunk.forEach((room) => {
        newState[room.room_id] = room;
    });

    newState = {...state, ['rooms']: {...newState}};

    return newState;
};

export default Rooms;
