"use strict";

import {expect, clearMatrixClient, userFixture, endTest, sdk, logTestUser} from './helper';
import createStore from '../src/store/store';
import {LoginActions} from '../src/actions/login';
import MatrixClient from '../src/utils/client';

let store = {};
let state;

const testUserName = userFixture.testUserName;
const testUserId = userFixture.testUserId;
const testUserPassword = userFixture.testUserPassword;
const clientOptions = userFixture.clientOptions;
const homeServerName = userFixture.homeServerName;

describe('Login Action Creators Tests', () => {

  beforeEach(() =>{
    store = createStore({});
    state = {};
  });

 it('1. loginWithPassword should Update MatrixClient info', (endTest) => {
   store.dispatch(LoginActions.loginWithPassword(testUserName, testUserPassword, clientOptions)).then(() => {
    ['userId', 'refreshToken', 'deviceId'].forEach((opt) => {
      expect(MatrixClient.client._http.opts[opt]).to.not.be.undefined;
    });
     expect(MatrixClient.client.credentials.userId).to.be.equal(testUserId);
     expect(MatrixClient.client.deviceId).to.not.be.undefined;
     endTest();
   }).catch((err) => {
     endTest(err);
   });
  });

  it('2. loginWithPassword should Update error state', function() {
    return store.dispatch(LoginActions.loginWithPassword(testUserName, 'badPassword', clientOptions)).then((data) => {
      throw new Error('Promise was unexpectedly fulfilled. Result: ' + data);
    }, function rejected(err) {
      state = store.getState();
      expect(state.login.isLogged).to.be.false;
      expect(state.error['login.loginWithPassword']).to.not.be.undefined;
    });
  });

  it('3. loginWithPassword should Update CurrentUser', function(endTest) {
    store.dispatch(LoginActions.loginWithPassword(testUserName, testUserPassword, clientOptions)).then(() => {
      state = store.getState();
      expect(state.currentUser.isLogged).to.be.true;
      expect(state.currentUser.accessToken).to.not.be.undefined;
      expect(state.currentUser.homeServer).to.equal(homeServerName);
      expect(state.currentUser.credentials.userId).to.equal(testUserId);
      expect(state.currentUser.userId).to.equal(testUserId);
      expect(state.login.isLogged).to.be.true;
      endTest();
    }).catch(function(err){
      endTest(err);
    });
  });

  it('4. LoginReducer must have the Auth Data for MatrixClient Constructor', function(endTest) {
    store.dispatch(LoginActions.loginWithPassword(testUserName, testUserPassword, clientOptions)).then((loginData) => {
      state = store.getState();
      expect(state.login.isLogged).to.be.true;
      expect(state.login.isLoading).to.be.false;
      expect(state.login.matrixClientData).to.not.be.undefined;
      expect(state.login.matrixClientData.baseUrl).to.equal(clientOptions.baseUrl);
      expect(state.login.matrixClientData.deviceId).to.not.be.undefined;
      expect(state.login.matrixClientData.credentials.userId).to.equal(testUserId);
      expect(state.login.matrixClientData._http.opts.userId).to.equal(testUserId);
      expect(state.login.matrixClientData._http.opts.refreshToken).to.not.be.undefined;
      expect(state.login.matrixClientData._http.opts.accessToken).to.not.be.undefined;
      expect(state.login.matrixClientData._http.opts.deviceId).to.not.be.undefined;
      expect(state.login.matrixClientData._http.opts.homeServer).to.equal(homeServerName);
      endTest();
    }).catch(function(err){
      endTest(err);
    });
  });

  it('5. restoreSession should update currentUser and login reducers', function(endTest) {
    store.dispatch(LoginActions.loginWithPassword(testUserName, testUserPassword, clientOptions)).then(() => {
      state = store.getState();
      const matrixClientData = state.login.matrixClientData;
      matrixClientData.optsForCreateClient = { baseUrl: matrixClientData.baseUrl };
      clearMatrixClient();
      store.dispatch(LoginActions.restoreSession(matrixClientData));
      state = store.getState();
      expect(state.login.matrixClientData).to.not.be.undefined;
      expect(state.currentUser.accessToken).to.not.be.undefined;
      expect(state.currentUser.isLogged).to.be.true;
      expect(state.login.isLogged).to.be.true;
      expect(MatrixClient.client._http.opts.accessToken).to.equal(matrixClientData._http.opts.accessToken);
      endTest();
    }).catch((err) => { endTest(err) });
  });
});
