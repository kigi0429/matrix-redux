"use strict";

import _ from 'lodash';
import jsonschema from 'jsonschema';
import {createStoreHelper, expect, clearMatrixClient,
  logTestUser, userFixture, loginStore, randomElement, validateSchema
} from "./helper";
import * as Actions from "../src/actions/";
import MatrixClient from "../src/utils/client";
import {makeTxnId} from "../src/utils/utils";

let store = {};
let state;
const machosRoomId = "!YbkEIQjnehrBrvscpm:zboxapp.com";

const testUserName = userFixture.testUserName;
const testUserId = userFixture.testUserId;
const testUserPassword = userFixture.testUserPassword;
const clientOptions = userFixture.clientOptions;
const homeServerName = userFixture.homeServerName;

// describe('Sync Actions', function () {
//   this.timeout(10000);
//     beforeEach(function(done){
//         loginStore(function(err, data){
//             if (err) console.error(err);
//             store = data;
//             done();
//         });
//     });

//     afterEach(function(done) {
//       MatrixClient.client.stopClient();
//       MatrixClient.client.store.setSyncToken(null);
//       MatrixClient.client.store.rooms = {};
//       done();
//     });

//     it('1. Sync Start Should Update Sync State', function (done) {
//         this.timeout(40000);
//         const opts = {syncToken: 's85330_1452578_11378_81510_139_24_33'};
//         store.dispatch(Actions.clientStart());
//         const message = 'Prueba desde Redux: ' + makeTxnId();
//         MatrixClient.client.on("sync", (syncState, prevState, data) => {
//             state = store.getState();
//             if(syncState === 'SYNCING' && state.sync.initialSyncComplete) {
//                 console.log("---- START ----");
//                 state = store.getState();
//                 const size = state.rooms.byIds[machosRoomId].timeline.length;
//                 const eventId = state.rooms.byIds[machosRoomId].timeline[size - 1];
//                 console.log(state.events.byIds[eventId]);
//                 console.log("---- END ----");
//             }
//         });
//         setTimeout(function(){
//             store.dispatch(Actions.callApi("sendTextMessage", machosRoomId, message, (err, data) => {
//                 if (err) console.error(err);
                
//                 // console.log("SUCESS: " + data.event_id);
//                 // // state = store.getState();
//                 // console.log(state.events.byIds[data.event_id].synced)
//             }));
//         }, 3000);
//     });
// });

//     // it('2. Stop Should set isRunning to False', function (done) {
//     //     this.timeout(10000);
//     //     const opts = {pollTimeout: 1000};
//     //     store.dispatch(SyncActions.start(opts));
//     //     store.dispatch(SyncActions.stop());
//     //     setTimeout(function(){
//     //       state = store.getState();
//     //       expect(state.sync.isRunning).to.be.false;
//     //       done();
//     //     }, 1000);
//     // });

    

//     // it('4. Sync should update the state', function(done) {
//     //     this.timeout(20000);
//     //     MatrixClient.client.on("sync", function(syncState, prevState, data) {
//     //         const syncStatus = MatrixClient.getSyncState();
//     //         if (state.sync && state.sync.initialSyncComplete && syncStatus) {
//     //             state = store.getState();
//     //             // console.log(state);
//     //             MatrixClient.client.stopClient();
//     //             ['room', 'user', 'event'].forEach(function(resource) {
//     //                 const reducer = resource + 's';
//     //                 const randomId = _.sample(state[reducer].byIds)
//     //                 const randomResource = state[reducer].byIds[randomId];
//     //                 let validationResult = validateSchema(randomResource, resource);
//     //                 if (validationResult.errors.length > 0) {
//     //                     console.log(randomResource);
//     //                     console.log(validationResult.errors);
//     //                     console.log(validationResult.instance);
//     //                 }
//     //                 if (randomResource) expect(validationResult.errors).to.be.empty;
//     //             });
//     //             done();
//     //         }
//     //     });
//     //     store.dispatch(SyncActions.start());
//     // });

//     // it('5. After initial sync it should update on events', function(done){
//     //     this.timeout(20000);
//     //     MatrixClient.client.on("event", function(event) {
//     //         state = store.getState();
//     //         if (state.sync && state.sync.initialSyncComplete) {
//     //             console.log("--- START ---");
//     //             console.log(state.users.byIds['@pbruna:zboxapp.com']);
//     //             // console.log(MatrixClient.client._reduxRawResponse.rooms.join);
//     //             console.log("--- END ---");
//     //         }
//     //     });
//     //     store.dispatch(SyncActions.start());
//     // });

// });
