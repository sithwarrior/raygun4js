/* globals describe, beforeEach, it, expect, browser, window */

var _ = require('underscore');
var common = require('../common');

var _entriesEndpoint = 'https://api.raygun.io/entries';

describe("Payload functional validation tests for V1 manual send", function() {

  it("performs an XHR to /entries when Raygun.send() is called", function () {
    browser.url('http://localhost:4567/fixtures/v1/manualSend.html');

    browser.pause(6000);

    var inFlightXhrs = browser.execute(function () {
      return window.__inFlightXHRs;
    });

    var didPerformRequest = _.any(inFlightXhrs, function (req) {
      return req.url.indexOf(_entriesEndpoint) === 0;
    });

    expect(didPerformRequest).toBe(true);
});

  it("doesn't performs an XHR to /entries when the API key isn't set", function () {
    browser.url('http://localhost:4567/fixtures/v1/manualSendNoApiKey.html');

    browser.pause(4000);

    var inFlightXhrs = browser.execute(function () {
      return window.__inFlightXHRs;
    });

    var didPerformRequest = _.any(inFlightXhrs, function (req) {
      return req.url.indexOf(_entriesEndpoint) === 0;
    });

    expect(didPerformRequest).toBe(false);
  });

  it("has the error message in the payload set", function () {
    browser.url('http://localhost:4567/fixtures/v1/manualSend.html');

    browser.pause(4000);

    var requestPayloads = browser.execute(function () {
      return window.__requestPayloads;
    });

    var passes = _.any(requestPayloads, function (payload) {
      return payload.Details.Error.Message === 'Manual send' || payload.Details.Error.Message === 'Script error';
    });

    expect(passes).toBe(true);
  });

  it("has the classname in the payload set", function () {
    browser.url('http://localhost:4567/fixtures/v1/manualSend.html');

    browser.pause(4000);

    var requestPayloads = browser.execute(function () {
      return window.__requestPayloads;
    });

    var passes = _.any(requestPayloads, function (payload) {
      return payload.Details.Error.ClassName === 'Error';
    });

    if (!common.isOldIE()) {
      expect(passes).toBe(true);
    }
  });

  it("has the filename in the stacktrace payload set", function () {
    var pageUrl = 'http://localhost:4567/fixtures/v1/manualSend.html';

    browser.url(pageUrl);

    browser.pause(4000);

    var requestPayloads = browser.execute(function () {
      return window.__requestPayloads;
    });

    var passes = _.any(requestPayloads, function (payload) {
      var stackTrace = payload.Details.Error.StackTrace[0];
      return stackTrace && stackTrace.FileName === pageUrl;
    });

    if (!common.isOldIE()) {
      expect(passes).toBe(true);
    }
  });

  it("has tags in the payload when tags are passed in", function () {
    var pageUrl = 'http://localhost:4567/fixtures/v1/manualSendTag.html';

    browser.url(pageUrl);

    browser.pause(4000);

    var requestPayloads = browser.execute(function () {
      return window.__requestPayloads;
    });

    var passes = _.any(requestPayloads, function (payload) {
      return payload.Details.Tags[0] === 'my_tag';
    });

    expect(passes).toBe(true);
  });

  it("has custom data in the payload when custom data is passed in", function () {
    var pageUrl = 'http://localhost:4567/fixtures/v1/manualSendCustomData.html';

    browser.url(pageUrl);

    browser.pause(4000);

    var requestPayloads = browser.execute(function () {
      return window.__requestPayloads;
    });

    var passes = _.any(requestPayloads, function (payload) {
      return payload.Details.UserCustomData.myCustomKey === 'myCustomValue';
    });

    expect(passes).toBe(true);
  });

  it("has correct user payload when Raygun.setUser() is called", function () {
    var pageUrl = 'http://localhost:4567/fixtures/v1/manualSendUser.html';

    browser.url(pageUrl);

    browser.pause(4000);

    var requestPayloads = browser.execute(function () {
      return window.__requestPayloads;
    });

    var passes = _.any(requestPayloads, function (payload) {
      return payload.Details.User.Identifier === 'user_email_address@localhost.local' &&
        payload.Details.User.IsAnonymous === false &&
        payload.Details.User.FirstName === 'Foo' &&
        payload.Details.User.FullName === 'Foo Bar' &&
        payload.Details.User.UUID === 'BAE62917-ACE8-ab3D-9287-B6A33B8E8C55';
    });

    expect(passes).toBe(true);
  });

  it("has correct version in payload when Raygun.setVersion() is called", function () {
    var pageUrl = 'http://localhost:4567/fixtures/v1/manualSendVersion.html';

    browser.url(pageUrl);

    browser.pause(4000);

    var requestPayloads = browser.execute(function () {
      return window.__requestPayloads;
    });

    var passes = _.any(requestPayloads, function (payload) {
      return payload.Details.Version === '1.0.0.0';
    });

    expect(passes).toBe(true);
  });

});

