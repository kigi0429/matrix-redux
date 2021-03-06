/*
 * Copyright 2015-present, ZBox Spa.
 * All rights reserved.
 */

'use strict';

import matrixSDK from "matrix-js-sdk";
import {Logger} from "./utils";
import * as MatrixJsonParser from "./matrix_json_parser";
import SyncApi from "matrix-js-sdk";
import _ from "lodash";

export default class MatrixClient {

    /** Create the Matrix Client
     * @param {Object} opts - Options to initialize Matrix Client
     * @param {Object} opts.store If not set, defaults to
     * {@link module:store/memory.MatrixInMemoryStore}.
     * @param {Object} opts.scheduler If not set, defaults to
     * @param {Object} opts.loggerObject - The Logger Objet to use
     * @param {String} opts.logLevel - The log level ['INFO', 'DEBUG', 'NONE']
     * {@link module:scheduler~MatrixScheduler}.
     **/
    static createClient(options) {
        this.LOGGER = Logger(options.loggerObject, options.logLevel);
        if (typeof fetch === 'function' || typeof options.request === 'function') {
          this.LOGGER.debug("Creating Matrix Client with opts: " + options);
          this.client = matrixSDK.createClient(options);
          return this.client;
        }
        throw new Error("You need a fetch Pollify, or initialze MatrixClient with opts.request function")
    }

    static callApi() {
        const args = [].slice.call(arguments);
        const name = args.shift();
        const callback = args.pop();
        if (typeof callback !== 'function')
            throw new Error("A Callback Function is missing!!");

        if (args.length < 1)
            throw new Error("Parameters can't be empty");

        this.client[name](...args)
        .then((res) => {
            callback(null, res);
        })
        .catch((err) => {
            callback(err);
        });
        
    }

    /**
     * Get the HTTP URL for an MXC URI.
     * @param {string} baseUrl The base homeserver url which has a content repo.
     * @param {string} mxc The mxc:// URI.
     * @param {Number} width The desired width of the thumbnail.
     * @param {Number} height The desired height of the thumbnail.
     * @param {string} resizeMethod The thumbnail resize method to use, either
     * "crop" or "scale".
     * @param {Boolean} allowDirectLinks If true, return any non-mxc URLs
     * directly. Fetching such URLs will leak information about the user to
     * anyone they share a room with. If false, will return the emptry string
     * for such URLs.
     * @return {string} The complete URL to the content.
    **/
    static getAvatarUrl(baseUrl, mxc, width, height, resizeMethod, allowDirectLinks) {
        return matrixSDK.ContentRepo.getHttpUriForMxc(baseUrl, mxc, width, height, resizeMethod, allowDirectLinks);
    };

    static logout(callback) {
        this.client.logout((err, data) => {
            if (err) return callback(err);
            return callback(null, data);
        });
    }

    /**
     * This method use the loginWithPassword from Matrix SDK to log
     * a user with a password
     * @param {String} userName - Matrix User Name
     * @param {String} userPassword - Matrix User Password
     * @param {Object} opts - Options to initialize Matrix Client
     * @param {Object} opts.store If not set, defaults to
     * {@link module:store/memory.MatrixInMemoryStore}.
     * @param {Object} opts.scheduler If not set, defaults to
     * {@link module:scheduler~MatrixScheduler}.
     * @param {requestFunction} opts.request If not set, defaults to the function
     * supplied to {@link request} which defaults to the request module from NPM.
     * @param {Function} callback - Callback to call when Finish
     **/
    static loginWithPassword(userName, userPassword, opts, callback) {
        this.createClient(opts);
        this.client.loginWithPassword(userName, userPassword, (err, data) => {
            if (err) return callback(err);
            this._updateMatrixClient(data);
            const formatedData = _.mapKeys(data, function (v, k) {
                return _.camelCase(k);
            });
            callback(null, formatedData);
        });
    }

    static loginWithToken(token, opts, callback) {
        this.createClient(opts);
        this.client.loginWithToken(token, (err, data) => {
            if (err) return callback(err);
            this._updateMatrixClient(data);
            const formatedData = _.mapKeys(data, function (v, k) {
                return _.camelCase(k);
            });
            callback(null, formatedData);
        });
    }

    static sendTextMessage(roomId, body, txnId, callback) {
        return this.client.sendTextMessage(roomId, body, txnId, callback);
    }

    /**
     * Method to restore the Matrix Client with credentials
     * stored offline, like `localStorage` or `DB`.
     * @param {Object} opts  - Options to restore the client
     * @param {Object} opts.optsForCreateClient - Object with data for `matrixSDK.createClient`
     * @param {String} opts.optsForCreateClient.baseUrl - The URL of Matrix Home Server
     * @param {Function} opts.optsForCreateClient.request - Function used to make the request
     * @param {String} opts.baseUrl - The URL of Matrix Home Server
     * @param {String} opts.deviceId - The Device Id returned for Home Server for this Device
     * @param {Object} opts.credentials
     * @param {String} opts.credentials.userId - The Full Matrix userId
     * @param {Object} opts._http
     * @param {Object} opts._http.opts
     * @param {String} opts._http.opts.userId
     * @param {String} opts._http.opts.refreshToken
     * @param {String} opts._http.opts.accessToken
     * @param {String} opts._http.opts.deviceId
     * @param {String} opts._http.opts.homeServer
     * @return nothing, but updates the `MatrixClient.client` Object
     **/
    static restoreSession(opts) {
        this.createClient(opts.optsForCreateClient);
        delete opts.optsForCreateClient;
        _.merge(this.client, opts);
    }

    /**
     * High level helper method to call initialSync, emit the resulting events,
     * and then start polling the eventStream for new events. To listen for these
     * events, add a listener for {@link module:client~MatrixClient#event:"event"}
     * via {@link module:client~MatrixClient#on}.
     * @param {Object=} opts Options to apply when syncing.
     * @param {Number=} opts.initialSyncLimit The event <code>limit=</code> to apply
     * to initial sync. Default: 8.
     * @param {Boolean=} opts.includeArchivedRooms True to put <code>archived=true</code>
     * on the <code>/initialSync</code> request. Default: false.
     * @param {Boolean=} opts.resolveInvitesToProfiles True to do /profile requests
     * on every invite event if the displayname/avatar_url is not known for this user ID.
     * Default: false.
     *
     * @param {String=} opts.pendingEventOrdering Controls where pending messages
     * appear in a room's timeline. If "<b>chronological</b>", messages will appear
     * in the timeline when the call to <code>sendEvent</code> was made. If
     * "<b>detached</b>", pending messages will appear in a separate list,
     * accessbile via {@link module:models/room#getPendingEvents}. Default:
     * "chronological".
     *
     * @param {Number=} opts.pollTimeout The number of milliseconds to wait on /events.
     * Default: 30000 (30 seconds).
     **/

    static getSyncState() {
        return this.client.getSyncState();
    }

    static startClient(opts) {
      this.client.startClient(opts);
      this.client._syncApi._processSyncResponse = patchProcessSyncResponse(this.client._syncApi);
    }

    static newEvents() {
        const json = JSON.parse(this.client._reduxRawResponse)
        const userId = this.client._http.opts.userId;
        const homeServer = this.client._http.opts.homeServer;
        return MatrixJsonParser.processMatrixJson(json, userId, homeServer);
    };

    static stopClient() {
      return new Promise((resolve) => {
        this.client.stopClient();
        resolve();
      });
    }

    /**
     * Update the MatrixClient.client with session information
     * @param {Object}  loginResult - Object returned after a successful login
     */
    static _updateMatrixClient(loginResult) {
        this.client._http.opts.userId = loginResult.user_id;
        this.client._http.opts.refreshToken = loginResult.refresh_token;
        this.client._http.opts.accessToken = loginResult.access_token;
        this.client._http.opts.deviceId = loginResult.device_id;
        this.client._http.opts.homeServer = loginResult.home_server;
        this.client.credentials.userId = loginResult.user_id;
        this.client.deviceId = loginResult.device_id;
    }
};

const patchProcessSyncResponse = function(syncApiObject) {
  const oldProcessSyncResponse = syncApiObject._processSyncResponse;
  const newProcessSyncResponse = function(syncToken, data) {    
    syncApiObject.client._reduxRawResponse = JSON.stringify(data);
    return oldProcessSyncResponse.apply(this, arguments);
  }
  return newProcessSyncResponse;
}
