/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/atoa/atoa.js":
/*!***********************************!*\
  !*** ./node_modules/atoa/atoa.js ***!
  \***********************************/
/***/ ((module) => {

module.exports = function atoa (a, n) { return Array.prototype.slice.call(a, n); }


/***/ }),

/***/ "./node_modules/contra/debounce.js":
/*!*****************************************!*\
  !*** ./node_modules/contra/debounce.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var ticky = __webpack_require__(/*! ticky */ "./node_modules/ticky/ticky-browser.js");

module.exports = function debounce (fn, args, ctx) {
  if (!fn) { return; }
  ticky(function run () {
    fn.apply(ctx || null, args || []);
  });
};


/***/ }),

/***/ "./node_modules/contra/emitter.js":
/*!****************************************!*\
  !*** ./node_modules/contra/emitter.js ***!
  \****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var atoa = __webpack_require__(/*! atoa */ "./node_modules/atoa/atoa.js");
var debounce = __webpack_require__(/*! ./debounce */ "./node_modules/contra/debounce.js");

module.exports = function emitter (thing, options) {
  var opts = options || {};
  var evt = {};
  if (thing === undefined) { thing = {}; }
  thing.on = function (type, fn) {
    if (!evt[type]) {
      evt[type] = [fn];
    } else {
      evt[type].push(fn);
    }
    return thing;
  };
  thing.once = function (type, fn) {
    fn._once = true; // thing.off(fn) still works!
    thing.on(type, fn);
    return thing;
  };
  thing.off = function (type, fn) {
    var c = arguments.length;
    if (c === 1) {
      delete evt[type];
    } else if (c === 0) {
      evt = {};
    } else {
      var et = evt[type];
      if (!et) { return thing; }
      et.splice(et.indexOf(fn), 1);
    }
    return thing;
  };
  thing.emit = function () {
    var args = atoa(arguments);
    return thing.emitterSnapshot(args.shift()).apply(this, args);
  };
  thing.emitterSnapshot = function (type) {
    var et = (evt[type] || []).slice(0);
    return function () {
      var args = atoa(arguments);
      var ctx = this || thing;
      if (type === 'error' && opts.throws !== false && !et.length) { throw args.length === 1 ? args[0] : args; }
      et.forEach(function emitter (listen) {
        if (opts.async) { debounce(listen, args, ctx); } else { listen.apply(ctx, args); }
        if (listen._once) { thing.off(type, listen); }
      });
      return thing;
    };
  };
  return thing;
};


/***/ }),

/***/ "./node_modules/crossvent/src/crossvent.js":
/*!*************************************************!*\
  !*** ./node_modules/crossvent/src/crossvent.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var customEvent = __webpack_require__(/*! custom-event */ "./node_modules/custom-event/index.js");
var eventmap = __webpack_require__(/*! ./eventmap */ "./node_modules/crossvent/src/eventmap.js");
var doc = __webpack_require__.g.document;
var addEvent = addEventEasy;
var removeEvent = removeEventEasy;
var hardCache = [];

if (!__webpack_require__.g.addEventListener) {
  addEvent = addEventHard;
  removeEvent = removeEventHard;
}

module.exports = {
  add: addEvent,
  remove: removeEvent,
  fabricate: fabricateEvent
};

function addEventEasy (el, type, fn, capturing) {
  return el.addEventListener(type, fn, capturing);
}

function addEventHard (el, type, fn) {
  return el.attachEvent('on' + type, wrap(el, type, fn));
}

function removeEventEasy (el, type, fn, capturing) {
  return el.removeEventListener(type, fn, capturing);
}

function removeEventHard (el, type, fn) {
  var listener = unwrap(el, type, fn);
  if (listener) {
    return el.detachEvent('on' + type, listener);
  }
}

function fabricateEvent (el, type, model) {
  var e = eventmap.indexOf(type) === -1 ? makeCustomEvent() : makeClassicEvent();
  if (el.dispatchEvent) {
    el.dispatchEvent(e);
  } else {
    el.fireEvent('on' + type, e);
  }
  function makeClassicEvent () {
    var e;
    if (doc.createEvent) {
      e = doc.createEvent('Event');
      e.initEvent(type, true, true);
    } else if (doc.createEventObject) {
      e = doc.createEventObject();
    }
    return e;
  }
  function makeCustomEvent () {
    return new customEvent(type, { detail: model });
  }
}

function wrapperFactory (el, type, fn) {
  return function wrapper (originalEvent) {
    var e = originalEvent || __webpack_require__.g.event;
    e.target = e.target || e.srcElement;
    e.preventDefault = e.preventDefault || function preventDefault () { e.returnValue = false; };
    e.stopPropagation = e.stopPropagation || function stopPropagation () { e.cancelBubble = true; };
    e.which = e.which || e.keyCode;
    fn.call(el, e);
  };
}

function wrap (el, type, fn) {
  var wrapper = unwrap(el, type, fn) || wrapperFactory(el, type, fn);
  hardCache.push({
    wrapper: wrapper,
    element: el,
    type: type,
    fn: fn
  });
  return wrapper;
}

function unwrap (el, type, fn) {
  var i = find(el, type, fn);
  if (i) {
    var wrapper = hardCache[i].wrapper;
    hardCache.splice(i, 1); // free up a tad of memory
    return wrapper;
  }
}

function find (el, type, fn) {
  var i, item;
  for (i = 0; i < hardCache.length; i++) {
    item = hardCache[i];
    if (item.element === el && item.type === type && item.fn === fn) {
      return i;
    }
  }
}


/***/ }),

/***/ "./node_modules/crossvent/src/eventmap.js":
/*!************************************************!*\
  !*** ./node_modules/crossvent/src/eventmap.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var eventmap = [];
var eventname = '';
var ron = /^on/;

for (eventname in __webpack_require__.g) {
  if (ron.test(eventname)) {
    eventmap.push(eventname.slice(2));
  }
}

module.exports = eventmap;


/***/ }),

/***/ "./node_modules/custom-event/index.js":
/*!********************************************!*\
  !*** ./node_modules/custom-event/index.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var NativeCustomEvent = __webpack_require__.g.CustomEvent;

function useNative () {
  try {
    var p = new NativeCustomEvent('cat', { detail: { foo: 'bar' } });
    return  'cat' === p.type && 'bar' === p.detail.foo;
  } catch (e) {
  }
  return false;
}

/**
 * Cross-browser `CustomEvent` constructor.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent.CustomEvent
 *
 * @public
 */

module.exports = useNative() ? NativeCustomEvent :

// IE >= 9
'undefined' !== typeof document && 'function' === typeof document.createEvent ? function CustomEvent (type, params) {
  var e = document.createEvent('CustomEvent');
  if (params) {
    e.initCustomEvent(type, params.bubbles, params.cancelable, params.detail);
  } else {
    e.initCustomEvent(type, false, false, void 0);
  }
  return e;
} :

// IE <= 8
function CustomEvent (type, params) {
  var e = document.createEventObject();
  e.type = type;
  if (params) {
    e.bubbles = Boolean(params.bubbles);
    e.cancelable = Boolean(params.cancelable);
    e.detail = params.detail;
  } else {
    e.bubbles = false;
    e.cancelable = false;
    e.detail = void 0;
  }
  return e;
}


/***/ }),

/***/ "./node_modules/dragula/classes.js":
/*!*****************************************!*\
  !*** ./node_modules/dragula/classes.js ***!
  \*****************************************/
/***/ ((module) => {

"use strict";


var cache = {};
var start = '(?:^|\\s)';
var end = '(?:\\s|$)';

function lookupClass (className) {
  var cached = cache[className];
  if (cached) {
    cached.lastIndex = 0;
  } else {
    cache[className] = cached = new RegExp(start + className + end, 'g');
  }
  return cached;
}

function addClass (el, className) {
  var current = el.className;
  if (!current.length) {
    el.className = className;
  } else if (!lookupClass(className).test(current)) {
    el.className += ' ' + className;
  }
}

function rmClass (el, className) {
  el.className = el.className.replace(lookupClass(className), ' ').trim();
}

module.exports = {
  add: addClass,
  rm: rmClass
};


/***/ }),

/***/ "./node_modules/dragula/dragula.js":
/*!*****************************************!*\
  !*** ./node_modules/dragula/dragula.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var emitter = __webpack_require__(/*! contra/emitter */ "./node_modules/contra/emitter.js");
var crossvent = __webpack_require__(/*! crossvent */ "./node_modules/crossvent/src/crossvent.js");
var classes = __webpack_require__(/*! ./classes */ "./node_modules/dragula/classes.js");
var doc = document;
var documentElement = doc.documentElement;

function dragula (initialContainers, options) {
  var len = arguments.length;
  if (len === 1 && Array.isArray(initialContainers) === false) {
    options = initialContainers;
    initialContainers = [];
  }
  var _mirror; // mirror image
  var _source; // source container
  var _item; // item being dragged
  var _offsetX; // reference x
  var _offsetY; // reference y
  var _moveX; // reference move x
  var _moveY; // reference move y
  var _initialSibling; // reference sibling when grabbed
  var _currentSibling; // reference sibling now
  var _copy; // item used for copying
  var _renderTimer; // timer for setTimeout renderMirrorImage
  var _lastDropTarget = null; // last container item was over
  var _grabbed; // holds mousedown context until first mousemove

  var o = options || {};
  if (o.moves === void 0) { o.moves = always; }
  if (o.accepts === void 0) { o.accepts = always; }
  if (o.invalid === void 0) { o.invalid = invalidTarget; }
  if (o.containers === void 0) { o.containers = initialContainers || []; }
  if (o.isContainer === void 0) { o.isContainer = never; }
  if (o.copy === void 0) { o.copy = false; }
  if (o.copySortSource === void 0) { o.copySortSource = false; }
  if (o.revertOnSpill === void 0) { o.revertOnSpill = false; }
  if (o.removeOnSpill === void 0) { o.removeOnSpill = false; }
  if (o.direction === void 0) { o.direction = 'vertical'; }
  if (o.ignoreInputTextSelection === void 0) { o.ignoreInputTextSelection = true; }
  if (o.mirrorContainer === void 0) { o.mirrorContainer = doc.body; }

  var drake = emitter({
    containers: o.containers,
    start: manualStart,
    end: end,
    cancel: cancel,
    remove: remove,
    destroy: destroy,
    canMove: canMove,
    dragging: false
  });

  if (o.removeOnSpill === true) {
    drake.on('over', spillOver).on('out', spillOut);
  }

  events();

  return drake;

  function isContainer (el) {
    return drake.containers.indexOf(el) !== -1 || o.isContainer(el);
  }

  function events (remove) {
    var op = remove ? 'remove' : 'add';
    touchy(documentElement, op, 'mousedown', grab);
    touchy(documentElement, op, 'mouseup', release);
  }

  function eventualMovements (remove) {
    var op = remove ? 'remove' : 'add';
    touchy(documentElement, op, 'mousemove', startBecauseMouseMoved);
  }

  function movements (remove) {
    var op = remove ? 'remove' : 'add';
    crossvent[op](documentElement, 'selectstart', preventGrabbed); // IE8
    crossvent[op](documentElement, 'click', preventGrabbed);
  }

  function destroy () {
    events(true);
    release({});
  }

  function preventGrabbed (e) {
    if (_grabbed) {
      e.preventDefault();
    }
  }

  function grab (e) {
    _moveX = e.clientX;
    _moveY = e.clientY;

    var ignore = whichMouseButton(e) !== 1 || e.metaKey || e.ctrlKey;
    if (ignore) {
      return; // we only care about honest-to-god left clicks and touch events
    }
    var item = e.target;
    var context = canStart(item);
    if (!context) {
      return;
    }
    _grabbed = context;
    eventualMovements();
    if (e.type === 'mousedown') {
      if (isInput(item)) { // see also: https://github.com/bevacqua/dragula/issues/208
        item.focus(); // fixes https://github.com/bevacqua/dragula/issues/176
      } else {
        e.preventDefault(); // fixes https://github.com/bevacqua/dragula/issues/155
      }
    }
  }

  function startBecauseMouseMoved (e) {
    if (!_grabbed) {
      return;
    }
    if (whichMouseButton(e) === 0) {
      release({});
      return; // when text is selected on an input and then dragged, mouseup doesn't fire. this is our only hope
    }

    // truthy check fixes #239, equality fixes #207, fixes #501
    if ((e.clientX !== void 0 && Math.abs(e.clientX - _moveX) <= (o.slideFactorX || 0)) &&
      (e.clientY !== void 0 && Math.abs(e.clientY - _moveY) <= (o.slideFactorY || 0))) {
      return;
    }

    if (o.ignoreInputTextSelection) {
      var clientX = getCoord('clientX', e) || 0;
      var clientY = getCoord('clientY', e) || 0;
      var elementBehindCursor = doc.elementFromPoint(clientX, clientY);
      if (isInput(elementBehindCursor)) {
        return;
      }
    }

    var grabbed = _grabbed; // call to end() unsets _grabbed
    eventualMovements(true);
    movements();
    end();
    start(grabbed);

    var offset = getOffset(_item);
    _offsetX = getCoord('pageX', e) - offset.left;
    _offsetY = getCoord('pageY', e) - offset.top;

    classes.add(_copy || _item, 'gu-transit');
    renderMirrorImage();
    drag(e);
  }

  function canStart (item) {
    if (drake.dragging && _mirror) {
      return;
    }
    if (isContainer(item)) {
      return; // don't drag container itself
    }
    var handle = item;
    while (getParent(item) && isContainer(getParent(item)) === false) {
      if (o.invalid(item, handle)) {
        return;
      }
      item = getParent(item); // drag target should be a top element
      if (!item) {
        return;
      }
    }
    var source = getParent(item);
    if (!source) {
      return;
    }
    if (o.invalid(item, handle)) {
      return;
    }

    var movable = o.moves(item, source, handle, nextEl(item));
    if (!movable) {
      return;
    }

    return {
      item: item,
      source: source
    };
  }

  function canMove (item) {
    return !!canStart(item);
  }

  function manualStart (item) {
    var context = canStart(item);
    if (context) {
      start(context);
    }
  }

  function start (context) {
    if (isCopy(context.item, context.source)) {
      _copy = context.item.cloneNode(true);
      drake.emit('cloned', _copy, context.item, 'copy');
    }

    _source = context.source;
    _item = context.item;
    _initialSibling = _currentSibling = nextEl(context.item);

    drake.dragging = true;
    drake.emit('drag', _item, _source);
  }

  function invalidTarget () {
    return false;
  }

  function end () {
    if (!drake.dragging) {
      return;
    }
    var item = _copy || _item;
    drop(item, getParent(item));
  }

  function ungrab () {
    _grabbed = false;
    eventualMovements(true);
    movements(true);
  }

  function release (e) {
    ungrab();

    if (!drake.dragging) {
      return;
    }
    var item = _copy || _item;
    var clientX = getCoord('clientX', e) || 0;
    var clientY = getCoord('clientY', e) || 0;
    var elementBehindCursor = getElementBehindPoint(_mirror, clientX, clientY);
    var dropTarget = findDropTarget(elementBehindCursor, clientX, clientY);
    if (dropTarget && ((_copy && o.copySortSource) || (!_copy || dropTarget !== _source))) {
      drop(item, dropTarget);
    } else if (o.removeOnSpill) {
      remove();
    } else {
      cancel();
    }
  }

  function drop (item, target) {
    var parent = getParent(item);
    if (_copy && o.copySortSource && target === _source) {
      parent.removeChild(_item);
    }
    if (isInitialPlacement(target)) {
      drake.emit('cancel', item, _source, _source);
    } else {
      drake.emit('drop', item, target, _source, _currentSibling);
    }
    cleanup();
  }

  function remove () {
    if (!drake.dragging) {
      return;
    }
    var item = _copy || _item;
    var parent = getParent(item);
    if (parent) {
      parent.removeChild(item);
    }
    drake.emit(_copy ? 'cancel' : 'remove', item, parent, _source);
    cleanup();
  }

  function cancel (revert) {
    if (!drake.dragging) {
      return;
    }
    var reverts = arguments.length > 0 ? revert : o.revertOnSpill;
    var item = _copy || _item;
    var parent = getParent(item);
    var initial = isInitialPlacement(parent);
    if (initial === false && reverts) {
      if (_copy) {
        if (parent) {
          parent.removeChild(_copy);
        }
      } else {
        _source.insertBefore(item, _initialSibling);
      }
    }
    if (initial || reverts) {
      drake.emit('cancel', item, _source, _source);
    } else {
      drake.emit('drop', item, parent, _source, _currentSibling);
    }
    cleanup();
  }

  function cleanup () {
    var item = _copy || _item;
    ungrab();
    removeMirrorImage();
    if (item) {
      classes.rm(item, 'gu-transit');
    }
    if (_renderTimer) {
      clearTimeout(_renderTimer);
    }
    drake.dragging = false;
    if (_lastDropTarget) {
      drake.emit('out', item, _lastDropTarget, _source);
    }
    drake.emit('dragend', item);
    _source = _item = _copy = _initialSibling = _currentSibling = _renderTimer = _lastDropTarget = null;
  }

  function isInitialPlacement (target, s) {
    var sibling;
    if (s !== void 0) {
      sibling = s;
    } else if (_mirror) {
      sibling = _currentSibling;
    } else {
      sibling = nextEl(_copy || _item);
    }
    return target === _source && sibling === _initialSibling;
  }

  function findDropTarget (elementBehindCursor, clientX, clientY) {
    var target = elementBehindCursor;
    while (target && !accepted()) {
      target = getParent(target);
    }
    return target;

    function accepted () {
      var droppable = isContainer(target);
      if (droppable === false) {
        return false;
      }

      var immediate = getImmediateChild(target, elementBehindCursor);
      var reference = getReference(target, immediate, clientX, clientY);
      var initial = isInitialPlacement(target, reference);
      if (initial) {
        return true; // should always be able to drop it right back where it was
      }
      return o.accepts(_item, target, _source, reference);
    }
  }

  function drag (e) {
    if (!_mirror) {
      return;
    }
    e.preventDefault();

    var clientX = getCoord('clientX', e) || 0;
    var clientY = getCoord('clientY', e) || 0;
    var x = clientX - _offsetX;
    var y = clientY - _offsetY;

    _mirror.style.left = x + 'px';
    _mirror.style.top = y + 'px';

    var item = _copy || _item;
    var elementBehindCursor = getElementBehindPoint(_mirror, clientX, clientY);
    var dropTarget = findDropTarget(elementBehindCursor, clientX, clientY);
    var changed = dropTarget !== null && dropTarget !== _lastDropTarget;
    if (changed || dropTarget === null) {
      out();
      _lastDropTarget = dropTarget;
      over();
    }
    var parent = getParent(item);
    if (dropTarget === _source && _copy && !o.copySortSource) {
      if (parent) {
        parent.removeChild(item);
      }
      return;
    }
    var reference;
    var immediate = getImmediateChild(dropTarget, elementBehindCursor);
    if (immediate !== null) {
      reference = getReference(dropTarget, immediate, clientX, clientY);
    } else if (o.revertOnSpill === true && !_copy) {
      reference = _initialSibling;
      dropTarget = _source;
    } else {
      if (_copy && parent) {
        parent.removeChild(item);
      }
      return;
    }
    if (
      (reference === null && changed) ||
      reference !== item &&
      reference !== nextEl(item)
    ) {
      _currentSibling = reference;
      dropTarget.insertBefore(item, reference);
      drake.emit('shadow', item, dropTarget, _source);
    }
    function moved (type) { drake.emit(type, item, _lastDropTarget, _source); }
    function over () { if (changed) { moved('over'); } }
    function out () { if (_lastDropTarget) { moved('out'); } }
  }

  function spillOver (el) {
    classes.rm(el, 'gu-hide');
  }

  function spillOut (el) {
    if (drake.dragging) { classes.add(el, 'gu-hide'); }
  }

  function renderMirrorImage () {
    if (_mirror) {
      return;
    }
    var rect = _item.getBoundingClientRect();
    _mirror = _item.cloneNode(true);
    _mirror.style.width = getRectWidth(rect) + 'px';
    _mirror.style.height = getRectHeight(rect) + 'px';
    classes.rm(_mirror, 'gu-transit');
    classes.add(_mirror, 'gu-mirror');
    o.mirrorContainer.appendChild(_mirror);
    touchy(documentElement, 'add', 'mousemove', drag);
    classes.add(o.mirrorContainer, 'gu-unselectable');
    drake.emit('cloned', _mirror, _item, 'mirror');
  }

  function removeMirrorImage () {
    if (_mirror) {
      classes.rm(o.mirrorContainer, 'gu-unselectable');
      touchy(documentElement, 'remove', 'mousemove', drag);
      getParent(_mirror).removeChild(_mirror);
      _mirror = null;
    }
  }

  function getImmediateChild (dropTarget, target) {
    var immediate = target;
    while (immediate !== dropTarget && getParent(immediate) !== dropTarget) {
      immediate = getParent(immediate);
    }
    if (immediate === documentElement) {
      return null;
    }
    return immediate;
  }

  function getReference (dropTarget, target, x, y) {
    var horizontal = o.direction === 'horizontal';
    var reference = target !== dropTarget ? inside() : outside();
    return reference;

    function outside () { // slower, but able to figure out any position
      var len = dropTarget.children.length;
      var i;
      var el;
      var rect;
      for (i = 0; i < len; i++) {
        el = dropTarget.children[i];
        rect = el.getBoundingClientRect();
        if (horizontal && (rect.left + rect.width / 2) > x) { return el; }
        if (!horizontal && (rect.top + rect.height / 2) > y) { return el; }
      }
      return null;
    }

    function inside () { // faster, but only available if dropped inside a child element
      var rect = target.getBoundingClientRect();
      if (horizontal) {
        return resolve(x > rect.left + getRectWidth(rect) / 2);
      }
      return resolve(y > rect.top + getRectHeight(rect) / 2);
    }

    function resolve (after) {
      return after ? nextEl(target) : target;
    }
  }

  function isCopy (item, container) {
    return typeof o.copy === 'boolean' ? o.copy : o.copy(item, container);
  }
}

function touchy (el, op, type, fn) {
  var touch = {
    mouseup: 'touchend',
    mousedown: 'touchstart',
    mousemove: 'touchmove'
  };
  var pointers = {
    mouseup: 'pointerup',
    mousedown: 'pointerdown',
    mousemove: 'pointermove'
  };
  var microsoft = {
    mouseup: 'MSPointerUp',
    mousedown: 'MSPointerDown',
    mousemove: 'MSPointerMove'
  };
  if (__webpack_require__.g.navigator.pointerEnabled) {
    crossvent[op](el, pointers[type], fn);
  } else if (__webpack_require__.g.navigator.msPointerEnabled) {
    crossvent[op](el, microsoft[type], fn);
  } else {
    crossvent[op](el, touch[type], fn);
    crossvent[op](el, type, fn);
  }
}

function whichMouseButton (e) {
  if (e.touches !== void 0) { return e.touches.length; }
  if (e.which !== void 0 && e.which !== 0) { return e.which; } // see https://github.com/bevacqua/dragula/issues/261
  if (e.buttons !== void 0) { return e.buttons; }
  var button = e.button;
  if (button !== void 0) { // see https://github.com/jquery/jquery/blob/99e8ff1baa7ae341e94bb89c3e84570c7c3ad9ea/src/event.js#L573-L575
    return button & 1 ? 1 : button & 2 ? 3 : (button & 4 ? 2 : 0);
  }
}

function getOffset (el) {
  var rect = el.getBoundingClientRect();
  return {
    left: rect.left + getScroll('scrollLeft', 'pageXOffset'),
    top: rect.top + getScroll('scrollTop', 'pageYOffset')
  };
}

function getScroll (scrollProp, offsetProp) {
  if (typeof __webpack_require__.g[offsetProp] !== 'undefined') {
    return __webpack_require__.g[offsetProp];
  }
  if (documentElement.clientHeight) {
    return documentElement[scrollProp];
  }
  return doc.body[scrollProp];
}

function getElementBehindPoint (point, x, y) {
  point = point || {};
  var state = point.className || '';
  var el;
  point.className += ' gu-hide';
  el = doc.elementFromPoint(x, y);
  point.className = state;
  return el;
}

function never () { return false; }
function always () { return true; }
function getRectWidth (rect) { return rect.width || (rect.right - rect.left); }
function getRectHeight (rect) { return rect.height || (rect.bottom - rect.top); }
function getParent (el) { return el.parentNode === doc ? null : el.parentNode; }
function isInput (el) { return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || isEditable(el); }
function isEditable (el) {
  if (!el) { return false; } // no parents were editable
  if (el.contentEditable === 'false') { return false; } // stop the lookup
  if (el.contentEditable === 'true') { return true; } // found a contentEditable element in the chain
  return isEditable(getParent(el)); // contentEditable is set to 'inherit'
}

function nextEl (el) {
  return el.nextElementSibling || manually();
  function manually () {
    var sibling = el;
    do {
      sibling = sibling.nextSibling;
    } while (sibling && sibling.nodeType !== 1);
    return sibling;
  }
}

function getEventHost (e) {
  // on touchend event, we have to use `e.changedTouches`
  // see http://stackoverflow.com/questions/7192563/touchend-event-properties
  // see https://github.com/bevacqua/dragula/issues/34
  if (e.targetTouches && e.targetTouches.length) {
    return e.targetTouches[0];
  }
  if (e.changedTouches && e.changedTouches.length) {
    return e.changedTouches[0];
  }
  return e;
}

function getCoord (coord, e) {
  var host = getEventHost(e);
  var missMap = {
    pageX: 'clientX', // IE8
    pageY: 'clientY' // IE8
  };
  if (coord in missMap && !(coord in host) && missMap[coord] in host) {
    coord = missMap[coord];
  }
  return host[coord];
}

module.exports = dragula;


/***/ }),

/***/ "./node_modules/ticky/ticky-browser.js":
/*!*********************************************!*\
  !*** ./node_modules/ticky/ticky-browser.js ***!
  \*********************************************/
/***/ ((module) => {

var si = typeof setImmediate === 'function', tick;
if (si) {
  tick = function (fn) { setImmediate(fn); };
} else {
  tick = function (fn) { setTimeout(fn, 0); };
}

module.exports = tick;

/***/ }),

/***/ "./ts/EventListener.ts":
/*!*****************************!*\
  !*** ./ts/EventListener.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EventListener": () => (/* binding */ EventListener)
/* harmony export */ });
//イベントリスナー・クラス
class EventListener {
    constructor() {
        this.listeners = {};
    }
    //イベントリスナーを追加
    add(listnerId, event, element, handler) {
        this.listeners[listnerId] = {
            event,
            element,
            handler,
        };
        element.addEventListener(event, handler);
    }
    //イベントリスナーを削除
    remove(listnerId) {
        const listner = this.listeners[listnerId];
        if (!listner)
            return;
        listner.element.removeEventListener(listner.event, listner.handler);
        delete this.listeners[listnerId];
    }
}


/***/ }),

/***/ "./ts/Task.ts":
/*!********************!*\
  !*** ./ts/Task.ts ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Task": () => (/* binding */ Task),
/* harmony export */   "statusMap": () => (/* binding */ statusMap)
/* harmony export */ });
/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! uuid */ "./node_modules/uuid/dist/esm-browser/v4.js");
 //id自動附番ライブラリ
//ステータス
const statusMap = {
    todo: 'TODO',
    doing: 'DOING',
    done: 'DONE',
};
//タスク・クラス
class Task {
    constructor(properties) {
        this.id = (0,uuid__WEBPACK_IMPORTED_MODULE_0__["default"])();
        this.title = properties.title;
        this.status = statusMap.todo;
    }
    //タスクを更新
    update(properties) {
        this.title = properties.title || this.title;
        this.status = properties.status || this.status;
    }
}


/***/ }),

/***/ "./ts/TaskCollection.ts":
/*!******************************!*\
  !*** ./ts/TaskCollection.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TaskCollection": () => (/* binding */ TaskCollection)
/* harmony export */ });
//タスク・コレクション・クラス
class TaskCollection {
    constructor() {
        this.tasks = [];
    }
    //タスクを追加
    add(task) {
        this.tasks.push(task);
    }
    //タスクを削除
    delete(task) {
        this.tasks = this.tasks.filter(({ id }) => id !== task.id);
    }
    //タスクを検索
    find(id) {
        return this.tasks.find((task) => task.id === id);
    }
    //タスクを更新
    update(task) {
        this.tasks = this.tasks.map((item) => {
            if (item.id === task.id)
                return task;
            return item;
        });
    }
    //ステータスをキーにタスクを抽出
    filter(filterStatus) {
        return this.tasks.filter(({ status }) => status === filterStatus);
    }
}


/***/ }),

/***/ "./ts/TaskRenderer.ts":
/*!****************************!*\
  !*** ./ts/TaskRenderer.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TaskRenderer": () => (/* binding */ TaskRenderer)
/* harmony export */ });
/* harmony import */ var dragula__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! dragula */ "./node_modules/dragula/dragula.js");
/* harmony import */ var dragula__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(dragula__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _Task__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Task */ "./ts/Task.ts");
 //ドラッグ＆ドロップ・ライブラリ

//タスク描画クラス
class TaskRenderer {
    constructor(todoList, doingList, doneList) {
        this.todoList = todoList;
        this.doingList = doingList;
        this.doneList = doneList;
    }
    //TODOリストにタスク要素を追加
    append(task) {
        const { taskEl, deleteButtonEl } = this.render(task);
        this.todoList.append(taskEl);
        return { deleteButtonEl };
    }
    //タスク要素を描画
    render(task) {
        const taskEl = document.createElement('div');
        const spanEl = document.createElement('span');
        const deleteButtonEl = document.createElement('button');
        taskEl.id = task.id;
        taskEl.classList.add('task-item');
        spanEl.textContent = task.title;
        deleteButtonEl.textContent = '削除';
        taskEl.append(spanEl, deleteButtonEl);
        return { taskEl, deleteButtonEl };
    }
    //タスク要素を削除
    remove(task) {
        const taskEl = document.getElementById(task.id);
        if (!taskEl)
            return;
        if (task.status === _Task__WEBPACK_IMPORTED_MODULE_1__.statusMap.todo) {
            this.todoList.removeChild(taskEl);
        }
        if (task.status === _Task__WEBPACK_IMPORTED_MODULE_1__.statusMap.doing) {
            this.doingList.removeChild(taskEl);
        }
        if (task.status === _Task__WEBPACK_IMPORTED_MODULE_1__.statusMap.done) {
            this.doneList.removeChild(taskEl);
        }
    }
    //タスクのドラッグ＆ドロップ
    subscribeDragAndDrop(onDrop) {
        dragula__WEBPACK_IMPORTED_MODULE_0___default()([this.todoList, this.doingList, this.doneList]).on('drop', (el, target, _source, sibling) => {
            let newStatus = _Task__WEBPACK_IMPORTED_MODULE_1__.statusMap.todo;
            if (target.id === 'doingList')
                newStatus = _Task__WEBPACK_IMPORTED_MODULE_1__.statusMap.doing;
            if (target.id === 'doneList')
                newStatus = _Task__WEBPACK_IMPORTED_MODULE_1__.statusMap.done;
            onDrop(el, sibling, newStatus);
            console.log('subscribeDragAndDrop');
            console.log(el);
            console.log(target);
            //console.log(source)
            console.log(sibling);
        });
    }
    //タスクのidを取得
    getId(el) {
        return el.id;
    }
}


/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/regex.js":
/*!*****************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/regex.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i);

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/rng.js":
/*!***************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/rng.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ rng)
/* harmony export */ });
// Unique ID creation requires a high quality random # generator. In the browser we therefore
// require the crypto API and do not support built-in fallback to lower quality random number
// generators (like Math.random()).
var getRandomValues;
var rnds8 = new Uint8Array(16);
function rng() {
  // lazy load so that environments that need to polyfill have a chance to do so
  if (!getRandomValues) {
    // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation. Also,
    // find the complete implementation of crypto (msCrypto) on IE11.
    getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto !== 'undefined' && typeof msCrypto.getRandomValues === 'function' && msCrypto.getRandomValues.bind(msCrypto);

    if (!getRandomValues) {
      throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
    }
  }

  return getRandomValues(rnds8);
}

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/stringify.js":
/*!*********************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/stringify.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _validate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./validate.js */ "./node_modules/uuid/dist/esm-browser/validate.js");

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */

var byteToHex = [];

for (var i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).substr(1));
}

function stringify(arr) {
  var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
  var uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase(); // Consistency check for valid UUID.  If this throws, it's likely due to one
  // of the following:
  // - One or more input array values don't map to a hex octet (leading to
  // "undefined" in the uuid)
  // - Invalid input values for the RFC `version` or `variant` fields

  if (!(0,_validate_js__WEBPACK_IMPORTED_MODULE_0__["default"])(uuid)) {
    throw TypeError('Stringified UUID is invalid');
  }

  return uuid;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (stringify);

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/v4.js":
/*!**************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/v4.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _rng_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rng.js */ "./node_modules/uuid/dist/esm-browser/rng.js");
/* harmony import */ var _stringify_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./stringify.js */ "./node_modules/uuid/dist/esm-browser/stringify.js");



function v4(options, buf, offset) {
  options = options || {};
  var rnds = options.random || (options.rng || _rng_js__WEBPACK_IMPORTED_MODULE_0__["default"])(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

  rnds[6] = rnds[6] & 0x0f | 0x40;
  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

  if (buf) {
    offset = offset || 0;

    for (var i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }

    return buf;
  }

  return (0,_stringify_js__WEBPACK_IMPORTED_MODULE_1__["default"])(rnds);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (v4);

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/validate.js":
/*!********************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/validate.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _regex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./regex.js */ "./node_modules/uuid/dist/esm-browser/regex.js");


function validate(uuid) {
  return typeof uuid === 'string' && _regex_js__WEBPACK_IMPORTED_MODULE_0__["default"].test(uuid);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (validate);

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!*********************!*\
  !*** ./ts/index.ts ***!
  \*********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _EventListener__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./EventListener */ "./ts/EventListener.ts");
/* harmony import */ var _Task__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Task */ "./ts/Task.ts");
/* harmony import */ var _TaskCollection__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./TaskCollection */ "./ts/TaskCollection.ts");
/* harmony import */ var _TaskRenderer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./TaskRenderer */ "./ts/TaskRenderer.ts");




//アプリケーション・クラス
class Application {
    constructor() {
        this.eventListner = new _EventListener__WEBPACK_IMPORTED_MODULE_0__.EventListener();
        this.taskCollection = new _TaskCollection__WEBPACK_IMPORTED_MODULE_2__.TaskCollection();
        this.taskRenderer = new _TaskRenderer__WEBPACK_IMPORTED_MODULE_3__.TaskRenderer(document.getElementById('todoList'), document.getElementById('doingList'), document.getElementById('doneList'));
        //タスクを作成
        this.handleSubmit = (e) => {
            e.preventDefault();
            console.log('submitted');
            const titleInput = document.getElementById('title');
            if (!titleInput.value)
                return;
            const task = new _Task__WEBPACK_IMPORTED_MODULE_1__.Task({ title: titleInput.value });
            this.taskCollection.add(task);
            //this.taskRenderer.append(task)
            const { deleteButtonEl } = this.taskRenderer.append(task);
            this.eventListner.add(task.id, 'click', deleteButtonEl, () => this.handleClickDeleteTask(task));
            titleInput.value = '';
        };
        //タスクを削除
        this.handleClickDeleteTask = (task) => {
            if (!window.confirm(`「${task.title}」を削除してよろしいですか?`))
                return;
            console.log(task);
            this.eventListner.remove(task.id);
            this.taskCollection.delete(task);
            this.taskRenderer.remove(task);
        };
        //タスクをドラッグ&ドロップ
        this.handleDragAndDorp = (el, sibling, newStatus) => {
            const taskId = this.taskRenderer.getId(el);
            if (!taskId)
                return;
            console.log('handleDropAndDrop');
            console.log(taskId);
            console.log(sibling);
            console.log(newStatus);
            const task = this.taskCollection.find(taskId);
            if (!task)
                return;
            task.update({ status: newStatus });
            this.taskCollection.update(task);
        };
        //DONEタスクを一括削除
        this.handleClickDeleteAllDoneTask = () => {
            if (!window.confirm('DONE のタスクを一括削除してよろしいですか?'))
                return;
            const doneTasks = this.taskCollection.filter(_Task__WEBPACK_IMPORTED_MODULE_1__.statusMap.done);
            console.log(doneTasks);
        };
    }
    start() {
        const cerateForm = document.getElementById('createForm');
        const deleteAllDoneTaskButton = document.getElementById('deleteAllDoneTask');
        this.eventListner.add('submit-handler', 'submit', cerateForm, this.handleSubmit);
        this.eventListner.add('click-handler', 'click', deleteAllDoneTaskButton, this.handleClickDeleteAllDoneTask);
        this.taskRenderer.subscribeDragAndDrop(this.handleDragAndDorp);
    }
}
//画面がロードされたらApplication.start()を実行
window.addEventListener('load', () => {
    const app = new Application();
    app.start();
});

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQjtBQUNoQixjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QjtBQUM1QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4QkFBOEI7QUFDOUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNEJBQTRCO0FBQzVCLHVCQUF1QixlQUFlO0FBQ3RDLHNCQUFzQix1QkFBdUI7QUFDN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQkFBMEI7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUU7SUFDakMsTUFBTSxHQUFHLEdBQUcsSUFBSSxXQUFXLEVBQUU7SUFDN0IsR0FBRyxDQUFDLEtBQUssRUFBRTtBQUNmLENBQUMsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2Jyb3dzZXItYXBwLy4vbm9kZV9tb2R1bGVzL2F0b2EvYXRvYS5qcyIsIndlYnBhY2s6Ly9icm93c2VyLWFwcC8uL25vZGVfbW9kdWxlcy9jb250cmEvZGVib3VuY2UuanMiLCJ3ZWJwYWNrOi8vYnJvd3Nlci1hcHAvLi9ub2RlX21vZHVsZXMvY29udHJhL2VtaXR0ZXIuanMiLCJ3ZWJwYWNrOi8vYnJvd3Nlci1hcHAvLi9ub2RlX21vZHVsZXMvY3Jvc3N2ZW50L3NyYy9jcm9zc3ZlbnQuanMiLCJ3ZWJwYWNrOi8vYnJvd3Nlci1hcHAvLi9ub2RlX21vZHVsZXMvY3Jvc3N2ZW50L3NyYy9ldmVudG1hcC5qcyIsIndlYnBhY2s6Ly9icm93c2VyLWFwcC8uL25vZGVfbW9kdWxlcy9jdXN0b20tZXZlbnQvaW5kZXguanMiLCJ3ZWJwYWNrOi8vYnJvd3Nlci1hcHAvLi9ub2RlX21vZHVsZXMvZHJhZ3VsYS9jbGFzc2VzLmpzIiwid2VicGFjazovL2Jyb3dzZXItYXBwLy4vbm9kZV9tb2R1bGVzL2RyYWd1bGEvZHJhZ3VsYS5qcyIsIndlYnBhY2s6Ly9icm93c2VyLWFwcC8uL25vZGVfbW9kdWxlcy90aWNreS90aWNreS1icm93c2VyLmpzIiwid2VicGFjazovL2Jyb3dzZXItYXBwLy4vdHMvRXZlbnRMaXN0ZW5lci50cyIsIndlYnBhY2s6Ly9icm93c2VyLWFwcC8uL3RzL1Rhc2sudHMiLCJ3ZWJwYWNrOi8vYnJvd3Nlci1hcHAvLi90cy9UYXNrQ29sbGVjdGlvbi50cyIsIndlYnBhY2s6Ly9icm93c2VyLWFwcC8uL3RzL1Rhc2tSZW5kZXJlci50cyIsIndlYnBhY2s6Ly9icm93c2VyLWFwcC8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvcmVnZXguanMiLCJ3ZWJwYWNrOi8vYnJvd3Nlci1hcHAvLi9ub2RlX21vZHVsZXMvdXVpZC9kaXN0L2VzbS1icm93c2VyL3JuZy5qcyIsIndlYnBhY2s6Ly9icm93c2VyLWFwcC8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvc3RyaW5naWZ5LmpzIiwid2VicGFjazovL2Jyb3dzZXItYXBwLy4vbm9kZV9tb2R1bGVzL3V1aWQvZGlzdC9lc20tYnJvd3Nlci92NC5qcyIsIndlYnBhY2s6Ly9icm93c2VyLWFwcC8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvdmFsaWRhdGUuanMiLCJ3ZWJwYWNrOi8vYnJvd3Nlci1hcHAvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vYnJvd3Nlci1hcHAvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vYnJvd3Nlci1hcHAvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2Jyb3dzZXItYXBwL3dlYnBhY2svcnVudGltZS9nbG9iYWwiLCJ3ZWJwYWNrOi8vYnJvd3Nlci1hcHAvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9icm93c2VyLWFwcC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2Jyb3dzZXItYXBwLy4vdHMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBhdG9hIChhLCBuKSB7IHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhLCBuKTsgfVxyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgdGlja3kgPSByZXF1aXJlKCd0aWNreScpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkZWJvdW5jZSAoZm4sIGFyZ3MsIGN0eCkge1xyXG4gIGlmICghZm4pIHsgcmV0dXJuOyB9XHJcbiAgdGlja3koZnVuY3Rpb24gcnVuICgpIHtcclxuICAgIGZuLmFwcGx5KGN0eCB8fCBudWxsLCBhcmdzIHx8IFtdKTtcclxuICB9KTtcclxufTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIGF0b2EgPSByZXF1aXJlKCdhdG9hJyk7XHJcbnZhciBkZWJvdW5jZSA9IHJlcXVpcmUoJy4vZGVib3VuY2UnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZW1pdHRlciAodGhpbmcsIG9wdGlvbnMpIHtcclxuICB2YXIgb3B0cyA9IG9wdGlvbnMgfHwge307XHJcbiAgdmFyIGV2dCA9IHt9O1xyXG4gIGlmICh0aGluZyA9PT0gdW5kZWZpbmVkKSB7IHRoaW5nID0ge307IH1cclxuICB0aGluZy5vbiA9IGZ1bmN0aW9uICh0eXBlLCBmbikge1xyXG4gICAgaWYgKCFldnRbdHlwZV0pIHtcclxuICAgICAgZXZ0W3R5cGVdID0gW2ZuXTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGV2dFt0eXBlXS5wdXNoKGZuKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGluZztcclxuICB9O1xyXG4gIHRoaW5nLm9uY2UgPSBmdW5jdGlvbiAodHlwZSwgZm4pIHtcclxuICAgIGZuLl9vbmNlID0gdHJ1ZTsgLy8gdGhpbmcub2ZmKGZuKSBzdGlsbCB3b3JrcyFcclxuICAgIHRoaW5nLm9uKHR5cGUsIGZuKTtcclxuICAgIHJldHVybiB0aGluZztcclxuICB9O1xyXG4gIHRoaW5nLm9mZiA9IGZ1bmN0aW9uICh0eXBlLCBmbikge1xyXG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoO1xyXG4gICAgaWYgKGMgPT09IDEpIHtcclxuICAgICAgZGVsZXRlIGV2dFt0eXBlXTtcclxuICAgIH0gZWxzZSBpZiAoYyA9PT0gMCkge1xyXG4gICAgICBldnQgPSB7fTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHZhciBldCA9IGV2dFt0eXBlXTtcclxuICAgICAgaWYgKCFldCkgeyByZXR1cm4gdGhpbmc7IH1cclxuICAgICAgZXQuc3BsaWNlKGV0LmluZGV4T2YoZm4pLCAxKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGluZztcclxuICB9O1xyXG4gIHRoaW5nLmVtaXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgYXJncyA9IGF0b2EoYXJndW1lbnRzKTtcclxuICAgIHJldHVybiB0aGluZy5lbWl0dGVyU25hcHNob3QoYXJncy5zaGlmdCgpKS5hcHBseSh0aGlzLCBhcmdzKTtcclxuICB9O1xyXG4gIHRoaW5nLmVtaXR0ZXJTbmFwc2hvdCA9IGZ1bmN0aW9uICh0eXBlKSB7XHJcbiAgICB2YXIgZXQgPSAoZXZ0W3R5cGVdIHx8IFtdKS5zbGljZSgwKTtcclxuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciBhcmdzID0gYXRvYShhcmd1bWVudHMpO1xyXG4gICAgICB2YXIgY3R4ID0gdGhpcyB8fCB0aGluZztcclxuICAgICAgaWYgKHR5cGUgPT09ICdlcnJvcicgJiYgb3B0cy50aHJvd3MgIT09IGZhbHNlICYmICFldC5sZW5ndGgpIHsgdGhyb3cgYXJncy5sZW5ndGggPT09IDEgPyBhcmdzWzBdIDogYXJnczsgfVxyXG4gICAgICBldC5mb3JFYWNoKGZ1bmN0aW9uIGVtaXR0ZXIgKGxpc3Rlbikge1xyXG4gICAgICAgIGlmIChvcHRzLmFzeW5jKSB7IGRlYm91bmNlKGxpc3RlbiwgYXJncywgY3R4KTsgfSBlbHNlIHsgbGlzdGVuLmFwcGx5KGN0eCwgYXJncyk7IH1cclxuICAgICAgICBpZiAobGlzdGVuLl9vbmNlKSB7IHRoaW5nLm9mZih0eXBlLCBsaXN0ZW4pOyB9XHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gdGhpbmc7XHJcbiAgICB9O1xyXG4gIH07XHJcbiAgcmV0dXJuIHRoaW5nO1xyXG59O1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgY3VzdG9tRXZlbnQgPSByZXF1aXJlKCdjdXN0b20tZXZlbnQnKTtcclxudmFyIGV2ZW50bWFwID0gcmVxdWlyZSgnLi9ldmVudG1hcCcpO1xyXG52YXIgZG9jID0gZ2xvYmFsLmRvY3VtZW50O1xyXG52YXIgYWRkRXZlbnQgPSBhZGRFdmVudEVhc3k7XHJcbnZhciByZW1vdmVFdmVudCA9IHJlbW92ZUV2ZW50RWFzeTtcclxudmFyIGhhcmRDYWNoZSA9IFtdO1xyXG5cclxuaWYgKCFnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lcikge1xyXG4gIGFkZEV2ZW50ID0gYWRkRXZlbnRIYXJkO1xyXG4gIHJlbW92ZUV2ZW50ID0gcmVtb3ZlRXZlbnRIYXJkO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBhZGQ6IGFkZEV2ZW50LFxyXG4gIHJlbW92ZTogcmVtb3ZlRXZlbnQsXHJcbiAgZmFicmljYXRlOiBmYWJyaWNhdGVFdmVudFxyXG59O1xyXG5cclxuZnVuY3Rpb24gYWRkRXZlbnRFYXN5IChlbCwgdHlwZSwgZm4sIGNhcHR1cmluZykge1xyXG4gIHJldHVybiBlbC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGZuLCBjYXB0dXJpbmcpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBhZGRFdmVudEhhcmQgKGVsLCB0eXBlLCBmbikge1xyXG4gIHJldHVybiBlbC5hdHRhY2hFdmVudCgnb24nICsgdHlwZSwgd3JhcChlbCwgdHlwZSwgZm4pKTtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVtb3ZlRXZlbnRFYXN5IChlbCwgdHlwZSwgZm4sIGNhcHR1cmluZykge1xyXG4gIHJldHVybiBlbC5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGZuLCBjYXB0dXJpbmcpO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZW1vdmVFdmVudEhhcmQgKGVsLCB0eXBlLCBmbikge1xyXG4gIHZhciBsaXN0ZW5lciA9IHVud3JhcChlbCwgdHlwZSwgZm4pO1xyXG4gIGlmIChsaXN0ZW5lcikge1xyXG4gICAgcmV0dXJuIGVsLmRldGFjaEV2ZW50KCdvbicgKyB0eXBlLCBsaXN0ZW5lcik7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBmYWJyaWNhdGVFdmVudCAoZWwsIHR5cGUsIG1vZGVsKSB7XHJcbiAgdmFyIGUgPSBldmVudG1hcC5pbmRleE9mKHR5cGUpID09PSAtMSA/IG1ha2VDdXN0b21FdmVudCgpIDogbWFrZUNsYXNzaWNFdmVudCgpO1xyXG4gIGlmIChlbC5kaXNwYXRjaEV2ZW50KSB7XHJcbiAgICBlbC5kaXNwYXRjaEV2ZW50KGUpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBlbC5maXJlRXZlbnQoJ29uJyArIHR5cGUsIGUpO1xyXG4gIH1cclxuICBmdW5jdGlvbiBtYWtlQ2xhc3NpY0V2ZW50ICgpIHtcclxuICAgIHZhciBlO1xyXG4gICAgaWYgKGRvYy5jcmVhdGVFdmVudCkge1xyXG4gICAgICBlID0gZG9jLmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xyXG4gICAgICBlLmluaXRFdmVudCh0eXBlLCB0cnVlLCB0cnVlKTtcclxuICAgIH0gZWxzZSBpZiAoZG9jLmNyZWF0ZUV2ZW50T2JqZWN0KSB7XHJcbiAgICAgIGUgPSBkb2MuY3JlYXRlRXZlbnRPYmplY3QoKTtcclxuICAgIH1cclxuICAgIHJldHVybiBlO1xyXG4gIH1cclxuICBmdW5jdGlvbiBtYWtlQ3VzdG9tRXZlbnQgKCkge1xyXG4gICAgcmV0dXJuIG5ldyBjdXN0b21FdmVudCh0eXBlLCB7IGRldGFpbDogbW9kZWwgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiB3cmFwcGVyRmFjdG9yeSAoZWwsIHR5cGUsIGZuKSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uIHdyYXBwZXIgKG9yaWdpbmFsRXZlbnQpIHtcclxuICAgIHZhciBlID0gb3JpZ2luYWxFdmVudCB8fCBnbG9iYWwuZXZlbnQ7XHJcbiAgICBlLnRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcclxuICAgIGUucHJldmVudERlZmF1bHQgPSBlLnByZXZlbnREZWZhdWx0IHx8IGZ1bmN0aW9uIHByZXZlbnREZWZhdWx0ICgpIHsgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlOyB9O1xyXG4gICAgZS5zdG9wUHJvcGFnYXRpb24gPSBlLnN0b3BQcm9wYWdhdGlvbiB8fCBmdW5jdGlvbiBzdG9wUHJvcGFnYXRpb24gKCkgeyBlLmNhbmNlbEJ1YmJsZSA9IHRydWU7IH07XHJcbiAgICBlLndoaWNoID0gZS53aGljaCB8fCBlLmtleUNvZGU7XHJcbiAgICBmbi5jYWxsKGVsLCBlKTtcclxuICB9O1xyXG59XHJcblxyXG5mdW5jdGlvbiB3cmFwIChlbCwgdHlwZSwgZm4pIHtcclxuICB2YXIgd3JhcHBlciA9IHVud3JhcChlbCwgdHlwZSwgZm4pIHx8IHdyYXBwZXJGYWN0b3J5KGVsLCB0eXBlLCBmbik7XHJcbiAgaGFyZENhY2hlLnB1c2goe1xyXG4gICAgd3JhcHBlcjogd3JhcHBlcixcclxuICAgIGVsZW1lbnQ6IGVsLFxyXG4gICAgdHlwZTogdHlwZSxcclxuICAgIGZuOiBmblxyXG4gIH0pO1xyXG4gIHJldHVybiB3cmFwcGVyO1xyXG59XHJcblxyXG5mdW5jdGlvbiB1bndyYXAgKGVsLCB0eXBlLCBmbikge1xyXG4gIHZhciBpID0gZmluZChlbCwgdHlwZSwgZm4pO1xyXG4gIGlmIChpKSB7XHJcbiAgICB2YXIgd3JhcHBlciA9IGhhcmRDYWNoZVtpXS53cmFwcGVyO1xyXG4gICAgaGFyZENhY2hlLnNwbGljZShpLCAxKTsgLy8gZnJlZSB1cCBhIHRhZCBvZiBtZW1vcnlcclxuICAgIHJldHVybiB3cmFwcGVyO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZmluZCAoZWwsIHR5cGUsIGZuKSB7XHJcbiAgdmFyIGksIGl0ZW07XHJcbiAgZm9yIChpID0gMDsgaSA8IGhhcmRDYWNoZS5sZW5ndGg7IGkrKykge1xyXG4gICAgaXRlbSA9IGhhcmRDYWNoZVtpXTtcclxuICAgIGlmIChpdGVtLmVsZW1lbnQgPT09IGVsICYmIGl0ZW0udHlwZSA9PT0gdHlwZSAmJiBpdGVtLmZuID09PSBmbikge1xyXG4gICAgICByZXR1cm4gaTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIGV2ZW50bWFwID0gW107XHJcbnZhciBldmVudG5hbWUgPSAnJztcclxudmFyIHJvbiA9IC9eb24vO1xyXG5cclxuZm9yIChldmVudG5hbWUgaW4gZ2xvYmFsKSB7XHJcbiAgaWYgKHJvbi50ZXN0KGV2ZW50bmFtZSkpIHtcclxuICAgIGV2ZW50bWFwLnB1c2goZXZlbnRuYW1lLnNsaWNlKDIpKTtcclxuICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXZlbnRtYXA7XHJcbiIsIlxyXG52YXIgTmF0aXZlQ3VzdG9tRXZlbnQgPSBnbG9iYWwuQ3VzdG9tRXZlbnQ7XHJcblxyXG5mdW5jdGlvbiB1c2VOYXRpdmUgKCkge1xyXG4gIHRyeSB7XHJcbiAgICB2YXIgcCA9IG5ldyBOYXRpdmVDdXN0b21FdmVudCgnY2F0JywgeyBkZXRhaWw6IHsgZm9vOiAnYmFyJyB9IH0pO1xyXG4gICAgcmV0dXJuICAnY2F0JyA9PT0gcC50eXBlICYmICdiYXInID09PSBwLmRldGFpbC5mb287XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gIH1cclxuICByZXR1cm4gZmFsc2U7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcm9zcy1icm93c2VyIGBDdXN0b21FdmVudGAgY29uc3RydWN0b3IuXHJcbiAqXHJcbiAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9DdXN0b21FdmVudC5DdXN0b21FdmVudFxyXG4gKlxyXG4gKiBAcHVibGljXHJcbiAqL1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB1c2VOYXRpdmUoKSA/IE5hdGl2ZUN1c3RvbUV2ZW50IDpcclxuXHJcbi8vIElFID49IDlcclxuJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiBkb2N1bWVudCAmJiAnZnVuY3Rpb24nID09PSB0eXBlb2YgZG9jdW1lbnQuY3JlYXRlRXZlbnQgPyBmdW5jdGlvbiBDdXN0b21FdmVudCAodHlwZSwgcGFyYW1zKSB7XHJcbiAgdmFyIGUgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnQ3VzdG9tRXZlbnQnKTtcclxuICBpZiAocGFyYW1zKSB7XHJcbiAgICBlLmluaXRDdXN0b21FdmVudCh0eXBlLCBwYXJhbXMuYnViYmxlcywgcGFyYW1zLmNhbmNlbGFibGUsIHBhcmFtcy5kZXRhaWwpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBlLmluaXRDdXN0b21FdmVudCh0eXBlLCBmYWxzZSwgZmFsc2UsIHZvaWQgMCk7XHJcbiAgfVxyXG4gIHJldHVybiBlO1xyXG59IDpcclxuXHJcbi8vIElFIDw9IDhcclxuZnVuY3Rpb24gQ3VzdG9tRXZlbnQgKHR5cGUsIHBhcmFtcykge1xyXG4gIHZhciBlID0gZG9jdW1lbnQuY3JlYXRlRXZlbnRPYmplY3QoKTtcclxuICBlLnR5cGUgPSB0eXBlO1xyXG4gIGlmIChwYXJhbXMpIHtcclxuICAgIGUuYnViYmxlcyA9IEJvb2xlYW4ocGFyYW1zLmJ1YmJsZXMpO1xyXG4gICAgZS5jYW5jZWxhYmxlID0gQm9vbGVhbihwYXJhbXMuY2FuY2VsYWJsZSk7XHJcbiAgICBlLmRldGFpbCA9IHBhcmFtcy5kZXRhaWw7XHJcbiAgfSBlbHNlIHtcclxuICAgIGUuYnViYmxlcyA9IGZhbHNlO1xyXG4gICAgZS5jYW5jZWxhYmxlID0gZmFsc2U7XHJcbiAgICBlLmRldGFpbCA9IHZvaWQgMDtcclxuICB9XHJcbiAgcmV0dXJuIGU7XHJcbn1cclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIGNhY2hlID0ge307XHJcbnZhciBzdGFydCA9ICcoPzpefFxcXFxzKSc7XHJcbnZhciBlbmQgPSAnKD86XFxcXHN8JCknO1xyXG5cclxuZnVuY3Rpb24gbG9va3VwQ2xhc3MgKGNsYXNzTmFtZSkge1xyXG4gIHZhciBjYWNoZWQgPSBjYWNoZVtjbGFzc05hbWVdO1xyXG4gIGlmIChjYWNoZWQpIHtcclxuICAgIGNhY2hlZC5sYXN0SW5kZXggPSAwO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBjYWNoZVtjbGFzc05hbWVdID0gY2FjaGVkID0gbmV3IFJlZ0V4cChzdGFydCArIGNsYXNzTmFtZSArIGVuZCwgJ2cnKTtcclxuICB9XHJcbiAgcmV0dXJuIGNhY2hlZDtcclxufVxyXG5cclxuZnVuY3Rpb24gYWRkQ2xhc3MgKGVsLCBjbGFzc05hbWUpIHtcclxuICB2YXIgY3VycmVudCA9IGVsLmNsYXNzTmFtZTtcclxuICBpZiAoIWN1cnJlbnQubGVuZ3RoKSB7XHJcbiAgICBlbC5jbGFzc05hbWUgPSBjbGFzc05hbWU7XHJcbiAgfSBlbHNlIGlmICghbG9va3VwQ2xhc3MoY2xhc3NOYW1lKS50ZXN0KGN1cnJlbnQpKSB7XHJcbiAgICBlbC5jbGFzc05hbWUgKz0gJyAnICsgY2xhc3NOYW1lO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gcm1DbGFzcyAoZWwsIGNsYXNzTmFtZSkge1xyXG4gIGVsLmNsYXNzTmFtZSA9IGVsLmNsYXNzTmFtZS5yZXBsYWNlKGxvb2t1cENsYXNzKGNsYXNzTmFtZSksICcgJykudHJpbSgpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBhZGQ6IGFkZENsYXNzLFxyXG4gIHJtOiBybUNsYXNzXHJcbn07XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBlbWl0dGVyID0gcmVxdWlyZSgnY29udHJhL2VtaXR0ZXInKTtcclxudmFyIGNyb3NzdmVudCA9IHJlcXVpcmUoJ2Nyb3NzdmVudCcpO1xyXG52YXIgY2xhc3NlcyA9IHJlcXVpcmUoJy4vY2xhc3NlcycpO1xyXG52YXIgZG9jID0gZG9jdW1lbnQ7XHJcbnZhciBkb2N1bWVudEVsZW1lbnQgPSBkb2MuZG9jdW1lbnRFbGVtZW50O1xyXG5cclxuZnVuY3Rpb24gZHJhZ3VsYSAoaW5pdGlhbENvbnRhaW5lcnMsIG9wdGlvbnMpIHtcclxuICB2YXIgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcclxuICBpZiAobGVuID09PSAxICYmIEFycmF5LmlzQXJyYXkoaW5pdGlhbENvbnRhaW5lcnMpID09PSBmYWxzZSkge1xyXG4gICAgb3B0aW9ucyA9IGluaXRpYWxDb250YWluZXJzO1xyXG4gICAgaW5pdGlhbENvbnRhaW5lcnMgPSBbXTtcclxuICB9XHJcbiAgdmFyIF9taXJyb3I7IC8vIG1pcnJvciBpbWFnZVxyXG4gIHZhciBfc291cmNlOyAvLyBzb3VyY2UgY29udGFpbmVyXHJcbiAgdmFyIF9pdGVtOyAvLyBpdGVtIGJlaW5nIGRyYWdnZWRcclxuICB2YXIgX29mZnNldFg7IC8vIHJlZmVyZW5jZSB4XHJcbiAgdmFyIF9vZmZzZXRZOyAvLyByZWZlcmVuY2UgeVxyXG4gIHZhciBfbW92ZVg7IC8vIHJlZmVyZW5jZSBtb3ZlIHhcclxuICB2YXIgX21vdmVZOyAvLyByZWZlcmVuY2UgbW92ZSB5XHJcbiAgdmFyIF9pbml0aWFsU2libGluZzsgLy8gcmVmZXJlbmNlIHNpYmxpbmcgd2hlbiBncmFiYmVkXHJcbiAgdmFyIF9jdXJyZW50U2libGluZzsgLy8gcmVmZXJlbmNlIHNpYmxpbmcgbm93XHJcbiAgdmFyIF9jb3B5OyAvLyBpdGVtIHVzZWQgZm9yIGNvcHlpbmdcclxuICB2YXIgX3JlbmRlclRpbWVyOyAvLyB0aW1lciBmb3Igc2V0VGltZW91dCByZW5kZXJNaXJyb3JJbWFnZVxyXG4gIHZhciBfbGFzdERyb3BUYXJnZXQgPSBudWxsOyAvLyBsYXN0IGNvbnRhaW5lciBpdGVtIHdhcyBvdmVyXHJcbiAgdmFyIF9ncmFiYmVkOyAvLyBob2xkcyBtb3VzZWRvd24gY29udGV4dCB1bnRpbCBmaXJzdCBtb3VzZW1vdmVcclxuXHJcbiAgdmFyIG8gPSBvcHRpb25zIHx8IHt9O1xyXG4gIGlmIChvLm1vdmVzID09PSB2b2lkIDApIHsgby5tb3ZlcyA9IGFsd2F5czsgfVxyXG4gIGlmIChvLmFjY2VwdHMgPT09IHZvaWQgMCkgeyBvLmFjY2VwdHMgPSBhbHdheXM7IH1cclxuICBpZiAoby5pbnZhbGlkID09PSB2b2lkIDApIHsgby5pbnZhbGlkID0gaW52YWxpZFRhcmdldDsgfVxyXG4gIGlmIChvLmNvbnRhaW5lcnMgPT09IHZvaWQgMCkgeyBvLmNvbnRhaW5lcnMgPSBpbml0aWFsQ29udGFpbmVycyB8fCBbXTsgfVxyXG4gIGlmIChvLmlzQ29udGFpbmVyID09PSB2b2lkIDApIHsgby5pc0NvbnRhaW5lciA9IG5ldmVyOyB9XHJcbiAgaWYgKG8uY29weSA9PT0gdm9pZCAwKSB7IG8uY29weSA9IGZhbHNlOyB9XHJcbiAgaWYgKG8uY29weVNvcnRTb3VyY2UgPT09IHZvaWQgMCkgeyBvLmNvcHlTb3J0U291cmNlID0gZmFsc2U7IH1cclxuICBpZiAoby5yZXZlcnRPblNwaWxsID09PSB2b2lkIDApIHsgby5yZXZlcnRPblNwaWxsID0gZmFsc2U7IH1cclxuICBpZiAoby5yZW1vdmVPblNwaWxsID09PSB2b2lkIDApIHsgby5yZW1vdmVPblNwaWxsID0gZmFsc2U7IH1cclxuICBpZiAoby5kaXJlY3Rpb24gPT09IHZvaWQgMCkgeyBvLmRpcmVjdGlvbiA9ICd2ZXJ0aWNhbCc7IH1cclxuICBpZiAoby5pZ25vcmVJbnB1dFRleHRTZWxlY3Rpb24gPT09IHZvaWQgMCkgeyBvLmlnbm9yZUlucHV0VGV4dFNlbGVjdGlvbiA9IHRydWU7IH1cclxuICBpZiAoby5taXJyb3JDb250YWluZXIgPT09IHZvaWQgMCkgeyBvLm1pcnJvckNvbnRhaW5lciA9IGRvYy5ib2R5OyB9XHJcblxyXG4gIHZhciBkcmFrZSA9IGVtaXR0ZXIoe1xyXG4gICAgY29udGFpbmVyczogby5jb250YWluZXJzLFxyXG4gICAgc3RhcnQ6IG1hbnVhbFN0YXJ0LFxyXG4gICAgZW5kOiBlbmQsXHJcbiAgICBjYW5jZWw6IGNhbmNlbCxcclxuICAgIHJlbW92ZTogcmVtb3ZlLFxyXG4gICAgZGVzdHJveTogZGVzdHJveSxcclxuICAgIGNhbk1vdmU6IGNhbk1vdmUsXHJcbiAgICBkcmFnZ2luZzogZmFsc2VcclxuICB9KTtcclxuXHJcbiAgaWYgKG8ucmVtb3ZlT25TcGlsbCA9PT0gdHJ1ZSkge1xyXG4gICAgZHJha2Uub24oJ292ZXInLCBzcGlsbE92ZXIpLm9uKCdvdXQnLCBzcGlsbE91dCk7XHJcbiAgfVxyXG5cclxuICBldmVudHMoKTtcclxuXHJcbiAgcmV0dXJuIGRyYWtlO1xyXG5cclxuICBmdW5jdGlvbiBpc0NvbnRhaW5lciAoZWwpIHtcclxuICAgIHJldHVybiBkcmFrZS5jb250YWluZXJzLmluZGV4T2YoZWwpICE9PSAtMSB8fCBvLmlzQ29udGFpbmVyKGVsKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGV2ZW50cyAocmVtb3ZlKSB7XHJcbiAgICB2YXIgb3AgPSByZW1vdmUgPyAncmVtb3ZlJyA6ICdhZGQnO1xyXG4gICAgdG91Y2h5KGRvY3VtZW50RWxlbWVudCwgb3AsICdtb3VzZWRvd24nLCBncmFiKTtcclxuICAgIHRvdWNoeShkb2N1bWVudEVsZW1lbnQsIG9wLCAnbW91c2V1cCcsIHJlbGVhc2UpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZXZlbnR1YWxNb3ZlbWVudHMgKHJlbW92ZSkge1xyXG4gICAgdmFyIG9wID0gcmVtb3ZlID8gJ3JlbW92ZScgOiAnYWRkJztcclxuICAgIHRvdWNoeShkb2N1bWVudEVsZW1lbnQsIG9wLCAnbW91c2Vtb3ZlJywgc3RhcnRCZWNhdXNlTW91c2VNb3ZlZCk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBtb3ZlbWVudHMgKHJlbW92ZSkge1xyXG4gICAgdmFyIG9wID0gcmVtb3ZlID8gJ3JlbW92ZScgOiAnYWRkJztcclxuICAgIGNyb3NzdmVudFtvcF0oZG9jdW1lbnRFbGVtZW50LCAnc2VsZWN0c3RhcnQnLCBwcmV2ZW50R3JhYmJlZCk7IC8vIElFOFxyXG4gICAgY3Jvc3N2ZW50W29wXShkb2N1bWVudEVsZW1lbnQsICdjbGljaycsIHByZXZlbnRHcmFiYmVkKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGRlc3Ryb3kgKCkge1xyXG4gICAgZXZlbnRzKHRydWUpO1xyXG4gICAgcmVsZWFzZSh7fSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBwcmV2ZW50R3JhYmJlZCAoZSkge1xyXG4gICAgaWYgKF9ncmFiYmVkKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdyYWIgKGUpIHtcclxuICAgIF9tb3ZlWCA9IGUuY2xpZW50WDtcclxuICAgIF9tb3ZlWSA9IGUuY2xpZW50WTtcclxuXHJcbiAgICB2YXIgaWdub3JlID0gd2hpY2hNb3VzZUJ1dHRvbihlKSAhPT0gMSB8fCBlLm1ldGFLZXkgfHwgZS5jdHJsS2V5O1xyXG4gICAgaWYgKGlnbm9yZSkge1xyXG4gICAgICByZXR1cm47IC8vIHdlIG9ubHkgY2FyZSBhYm91dCBob25lc3QtdG8tZ29kIGxlZnQgY2xpY2tzIGFuZCB0b3VjaCBldmVudHNcclxuICAgIH1cclxuICAgIHZhciBpdGVtID0gZS50YXJnZXQ7XHJcbiAgICB2YXIgY29udGV4dCA9IGNhblN0YXJ0KGl0ZW0pO1xyXG4gICAgaWYgKCFjb250ZXh0KSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIF9ncmFiYmVkID0gY29udGV4dDtcclxuICAgIGV2ZW50dWFsTW92ZW1lbnRzKCk7XHJcbiAgICBpZiAoZS50eXBlID09PSAnbW91c2Vkb3duJykge1xyXG4gICAgICBpZiAoaXNJbnB1dChpdGVtKSkgeyAvLyBzZWUgYWxzbzogaHR0cHM6Ly9naXRodWIuY29tL2JldmFjcXVhL2RyYWd1bGEvaXNzdWVzLzIwOFxyXG4gICAgICAgIGl0ZW0uZm9jdXMoKTsgLy8gZml4ZXMgaHR0cHM6Ly9naXRodWIuY29tL2JldmFjcXVhL2RyYWd1bGEvaXNzdWVzLzE3NlxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTsgLy8gZml4ZXMgaHR0cHM6Ly9naXRodWIuY29tL2JldmFjcXVhL2RyYWd1bGEvaXNzdWVzLzE1NVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzdGFydEJlY2F1c2VNb3VzZU1vdmVkIChlKSB7XHJcbiAgICBpZiAoIV9ncmFiYmVkKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmICh3aGljaE1vdXNlQnV0dG9uKGUpID09PSAwKSB7XHJcbiAgICAgIHJlbGVhc2Uoe30pO1xyXG4gICAgICByZXR1cm47IC8vIHdoZW4gdGV4dCBpcyBzZWxlY3RlZCBvbiBhbiBpbnB1dCBhbmQgdGhlbiBkcmFnZ2VkLCBtb3VzZXVwIGRvZXNuJ3QgZmlyZS4gdGhpcyBpcyBvdXIgb25seSBob3BlXHJcbiAgICB9XHJcblxyXG4gICAgLy8gdHJ1dGh5IGNoZWNrIGZpeGVzICMyMzksIGVxdWFsaXR5IGZpeGVzICMyMDcsIGZpeGVzICM1MDFcclxuICAgIGlmICgoZS5jbGllbnRYICE9PSB2b2lkIDAgJiYgTWF0aC5hYnMoZS5jbGllbnRYIC0gX21vdmVYKSA8PSAoby5zbGlkZUZhY3RvclggfHwgMCkpICYmXHJcbiAgICAgIChlLmNsaWVudFkgIT09IHZvaWQgMCAmJiBNYXRoLmFicyhlLmNsaWVudFkgLSBfbW92ZVkpIDw9IChvLnNsaWRlRmFjdG9yWSB8fCAwKSkpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChvLmlnbm9yZUlucHV0VGV4dFNlbGVjdGlvbikge1xyXG4gICAgICB2YXIgY2xpZW50WCA9IGdldENvb3JkKCdjbGllbnRYJywgZSkgfHwgMDtcclxuICAgICAgdmFyIGNsaWVudFkgPSBnZXRDb29yZCgnY2xpZW50WScsIGUpIHx8IDA7XHJcbiAgICAgIHZhciBlbGVtZW50QmVoaW5kQ3Vyc29yID0gZG9jLmVsZW1lbnRGcm9tUG9pbnQoY2xpZW50WCwgY2xpZW50WSk7XHJcbiAgICAgIGlmIChpc0lucHV0KGVsZW1lbnRCZWhpbmRDdXJzb3IpKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGdyYWJiZWQgPSBfZ3JhYmJlZDsgLy8gY2FsbCB0byBlbmQoKSB1bnNldHMgX2dyYWJiZWRcclxuICAgIGV2ZW50dWFsTW92ZW1lbnRzKHRydWUpO1xyXG4gICAgbW92ZW1lbnRzKCk7XHJcbiAgICBlbmQoKTtcclxuICAgIHN0YXJ0KGdyYWJiZWQpO1xyXG5cclxuICAgIHZhciBvZmZzZXQgPSBnZXRPZmZzZXQoX2l0ZW0pO1xyXG4gICAgX29mZnNldFggPSBnZXRDb29yZCgncGFnZVgnLCBlKSAtIG9mZnNldC5sZWZ0O1xyXG4gICAgX29mZnNldFkgPSBnZXRDb29yZCgncGFnZVknLCBlKSAtIG9mZnNldC50b3A7XHJcblxyXG4gICAgY2xhc3Nlcy5hZGQoX2NvcHkgfHwgX2l0ZW0sICdndS10cmFuc2l0Jyk7XHJcbiAgICByZW5kZXJNaXJyb3JJbWFnZSgpO1xyXG4gICAgZHJhZyhlKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNhblN0YXJ0IChpdGVtKSB7XHJcbiAgICBpZiAoZHJha2UuZHJhZ2dpbmcgJiYgX21pcnJvcikge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBpZiAoaXNDb250YWluZXIoaXRlbSkpIHtcclxuICAgICAgcmV0dXJuOyAvLyBkb24ndCBkcmFnIGNvbnRhaW5lciBpdHNlbGZcclxuICAgIH1cclxuICAgIHZhciBoYW5kbGUgPSBpdGVtO1xyXG4gICAgd2hpbGUgKGdldFBhcmVudChpdGVtKSAmJiBpc0NvbnRhaW5lcihnZXRQYXJlbnQoaXRlbSkpID09PSBmYWxzZSkge1xyXG4gICAgICBpZiAoby5pbnZhbGlkKGl0ZW0sIGhhbmRsZSkpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgaXRlbSA9IGdldFBhcmVudChpdGVtKTsgLy8gZHJhZyB0YXJnZXQgc2hvdWxkIGJlIGEgdG9wIGVsZW1lbnRcclxuICAgICAgaWYgKCFpdGVtKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB2YXIgc291cmNlID0gZ2V0UGFyZW50KGl0ZW0pO1xyXG4gICAgaWYgKCFzb3VyY2UpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaWYgKG8uaW52YWxpZChpdGVtLCBoYW5kbGUpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgbW92YWJsZSA9IG8ubW92ZXMoaXRlbSwgc291cmNlLCBoYW5kbGUsIG5leHRFbChpdGVtKSk7XHJcbiAgICBpZiAoIW1vdmFibGUpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGl0ZW06IGl0ZW0sXHJcbiAgICAgIHNvdXJjZTogc291cmNlXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY2FuTW92ZSAoaXRlbSkge1xyXG4gICAgcmV0dXJuICEhY2FuU3RhcnQoaXRlbSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBtYW51YWxTdGFydCAoaXRlbSkge1xyXG4gICAgdmFyIGNvbnRleHQgPSBjYW5TdGFydChpdGVtKTtcclxuICAgIGlmIChjb250ZXh0KSB7XHJcbiAgICAgIHN0YXJ0KGNvbnRleHQpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc3RhcnQgKGNvbnRleHQpIHtcclxuICAgIGlmIChpc0NvcHkoY29udGV4dC5pdGVtLCBjb250ZXh0LnNvdXJjZSkpIHtcclxuICAgICAgX2NvcHkgPSBjb250ZXh0Lml0ZW0uY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgICBkcmFrZS5lbWl0KCdjbG9uZWQnLCBfY29weSwgY29udGV4dC5pdGVtLCAnY29weScpO1xyXG4gICAgfVxyXG5cclxuICAgIF9zb3VyY2UgPSBjb250ZXh0LnNvdXJjZTtcclxuICAgIF9pdGVtID0gY29udGV4dC5pdGVtO1xyXG4gICAgX2luaXRpYWxTaWJsaW5nID0gX2N1cnJlbnRTaWJsaW5nID0gbmV4dEVsKGNvbnRleHQuaXRlbSk7XHJcblxyXG4gICAgZHJha2UuZHJhZ2dpbmcgPSB0cnVlO1xyXG4gICAgZHJha2UuZW1pdCgnZHJhZycsIF9pdGVtLCBfc291cmNlKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGludmFsaWRUYXJnZXQgKCkge1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZW5kICgpIHtcclxuICAgIGlmICghZHJha2UuZHJhZ2dpbmcpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdmFyIGl0ZW0gPSBfY29weSB8fCBfaXRlbTtcclxuICAgIGRyb3AoaXRlbSwgZ2V0UGFyZW50KGl0ZW0pKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHVuZ3JhYiAoKSB7XHJcbiAgICBfZ3JhYmJlZCA9IGZhbHNlO1xyXG4gICAgZXZlbnR1YWxNb3ZlbWVudHModHJ1ZSk7XHJcbiAgICBtb3ZlbWVudHModHJ1ZSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZWxlYXNlIChlKSB7XHJcbiAgICB1bmdyYWIoKTtcclxuXHJcbiAgICBpZiAoIWRyYWtlLmRyYWdnaW5nKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHZhciBpdGVtID0gX2NvcHkgfHwgX2l0ZW07XHJcbiAgICB2YXIgY2xpZW50WCA9IGdldENvb3JkKCdjbGllbnRYJywgZSkgfHwgMDtcclxuICAgIHZhciBjbGllbnRZID0gZ2V0Q29vcmQoJ2NsaWVudFknLCBlKSB8fCAwO1xyXG4gICAgdmFyIGVsZW1lbnRCZWhpbmRDdXJzb3IgPSBnZXRFbGVtZW50QmVoaW5kUG9pbnQoX21pcnJvciwgY2xpZW50WCwgY2xpZW50WSk7XHJcbiAgICB2YXIgZHJvcFRhcmdldCA9IGZpbmREcm9wVGFyZ2V0KGVsZW1lbnRCZWhpbmRDdXJzb3IsIGNsaWVudFgsIGNsaWVudFkpO1xyXG4gICAgaWYgKGRyb3BUYXJnZXQgJiYgKChfY29weSAmJiBvLmNvcHlTb3J0U291cmNlKSB8fCAoIV9jb3B5IHx8IGRyb3BUYXJnZXQgIT09IF9zb3VyY2UpKSkge1xyXG4gICAgICBkcm9wKGl0ZW0sIGRyb3BUYXJnZXQpO1xyXG4gICAgfSBlbHNlIGlmIChvLnJlbW92ZU9uU3BpbGwpIHtcclxuICAgICAgcmVtb3ZlKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjYW5jZWwoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGRyb3AgKGl0ZW0sIHRhcmdldCkge1xyXG4gICAgdmFyIHBhcmVudCA9IGdldFBhcmVudChpdGVtKTtcclxuICAgIGlmIChfY29weSAmJiBvLmNvcHlTb3J0U291cmNlICYmIHRhcmdldCA9PT0gX3NvdXJjZSkge1xyXG4gICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQoX2l0ZW0pO1xyXG4gICAgfVxyXG4gICAgaWYgKGlzSW5pdGlhbFBsYWNlbWVudCh0YXJnZXQpKSB7XHJcbiAgICAgIGRyYWtlLmVtaXQoJ2NhbmNlbCcsIGl0ZW0sIF9zb3VyY2UsIF9zb3VyY2UpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZHJha2UuZW1pdCgnZHJvcCcsIGl0ZW0sIHRhcmdldCwgX3NvdXJjZSwgX2N1cnJlbnRTaWJsaW5nKTtcclxuICAgIH1cclxuICAgIGNsZWFudXAoKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJlbW92ZSAoKSB7XHJcbiAgICBpZiAoIWRyYWtlLmRyYWdnaW5nKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHZhciBpdGVtID0gX2NvcHkgfHwgX2l0ZW07XHJcbiAgICB2YXIgcGFyZW50ID0gZ2V0UGFyZW50KGl0ZW0pO1xyXG4gICAgaWYgKHBhcmVudCkge1xyXG4gICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQoaXRlbSk7XHJcbiAgICB9XHJcbiAgICBkcmFrZS5lbWl0KF9jb3B5ID8gJ2NhbmNlbCcgOiAncmVtb3ZlJywgaXRlbSwgcGFyZW50LCBfc291cmNlKTtcclxuICAgIGNsZWFudXAoKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNhbmNlbCAocmV2ZXJ0KSB7XHJcbiAgICBpZiAoIWRyYWtlLmRyYWdnaW5nKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHZhciByZXZlcnRzID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgPyByZXZlcnQgOiBvLnJldmVydE9uU3BpbGw7XHJcbiAgICB2YXIgaXRlbSA9IF9jb3B5IHx8IF9pdGVtO1xyXG4gICAgdmFyIHBhcmVudCA9IGdldFBhcmVudChpdGVtKTtcclxuICAgIHZhciBpbml0aWFsID0gaXNJbml0aWFsUGxhY2VtZW50KHBhcmVudCk7XHJcbiAgICBpZiAoaW5pdGlhbCA9PT0gZmFsc2UgJiYgcmV2ZXJ0cykge1xyXG4gICAgICBpZiAoX2NvcHkpIHtcclxuICAgICAgICBpZiAocGFyZW50KSB7XHJcbiAgICAgICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQoX2NvcHkpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBfc291cmNlLmluc2VydEJlZm9yZShpdGVtLCBfaW5pdGlhbFNpYmxpbmcpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAoaW5pdGlhbCB8fCByZXZlcnRzKSB7XHJcbiAgICAgIGRyYWtlLmVtaXQoJ2NhbmNlbCcsIGl0ZW0sIF9zb3VyY2UsIF9zb3VyY2UpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZHJha2UuZW1pdCgnZHJvcCcsIGl0ZW0sIHBhcmVudCwgX3NvdXJjZSwgX2N1cnJlbnRTaWJsaW5nKTtcclxuICAgIH1cclxuICAgIGNsZWFudXAoKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNsZWFudXAgKCkge1xyXG4gICAgdmFyIGl0ZW0gPSBfY29weSB8fCBfaXRlbTtcclxuICAgIHVuZ3JhYigpO1xyXG4gICAgcmVtb3ZlTWlycm9ySW1hZ2UoKTtcclxuICAgIGlmIChpdGVtKSB7XHJcbiAgICAgIGNsYXNzZXMucm0oaXRlbSwgJ2d1LXRyYW5zaXQnKTtcclxuICAgIH1cclxuICAgIGlmIChfcmVuZGVyVGltZXIpIHtcclxuICAgICAgY2xlYXJUaW1lb3V0KF9yZW5kZXJUaW1lcik7XHJcbiAgICB9XHJcbiAgICBkcmFrZS5kcmFnZ2luZyA9IGZhbHNlO1xyXG4gICAgaWYgKF9sYXN0RHJvcFRhcmdldCkge1xyXG4gICAgICBkcmFrZS5lbWl0KCdvdXQnLCBpdGVtLCBfbGFzdERyb3BUYXJnZXQsIF9zb3VyY2UpO1xyXG4gICAgfVxyXG4gICAgZHJha2UuZW1pdCgnZHJhZ2VuZCcsIGl0ZW0pO1xyXG4gICAgX3NvdXJjZSA9IF9pdGVtID0gX2NvcHkgPSBfaW5pdGlhbFNpYmxpbmcgPSBfY3VycmVudFNpYmxpbmcgPSBfcmVuZGVyVGltZXIgPSBfbGFzdERyb3BUYXJnZXQgPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaXNJbml0aWFsUGxhY2VtZW50ICh0YXJnZXQsIHMpIHtcclxuICAgIHZhciBzaWJsaW5nO1xyXG4gICAgaWYgKHMgIT09IHZvaWQgMCkge1xyXG4gICAgICBzaWJsaW5nID0gcztcclxuICAgIH0gZWxzZSBpZiAoX21pcnJvcikge1xyXG4gICAgICBzaWJsaW5nID0gX2N1cnJlbnRTaWJsaW5nO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2libGluZyA9IG5leHRFbChfY29weSB8fCBfaXRlbSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGFyZ2V0ID09PSBfc291cmNlICYmIHNpYmxpbmcgPT09IF9pbml0aWFsU2libGluZztcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGZpbmREcm9wVGFyZ2V0IChlbGVtZW50QmVoaW5kQ3Vyc29yLCBjbGllbnRYLCBjbGllbnRZKSB7XHJcbiAgICB2YXIgdGFyZ2V0ID0gZWxlbWVudEJlaGluZEN1cnNvcjtcclxuICAgIHdoaWxlICh0YXJnZXQgJiYgIWFjY2VwdGVkKCkpIHtcclxuICAgICAgdGFyZ2V0ID0gZ2V0UGFyZW50KHRhcmdldCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGFyZ2V0O1xyXG5cclxuICAgIGZ1bmN0aW9uIGFjY2VwdGVkICgpIHtcclxuICAgICAgdmFyIGRyb3BwYWJsZSA9IGlzQ29udGFpbmVyKHRhcmdldCk7XHJcbiAgICAgIGlmIChkcm9wcGFibGUgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgaW1tZWRpYXRlID0gZ2V0SW1tZWRpYXRlQ2hpbGQodGFyZ2V0LCBlbGVtZW50QmVoaW5kQ3Vyc29yKTtcclxuICAgICAgdmFyIHJlZmVyZW5jZSA9IGdldFJlZmVyZW5jZSh0YXJnZXQsIGltbWVkaWF0ZSwgY2xpZW50WCwgY2xpZW50WSk7XHJcbiAgICAgIHZhciBpbml0aWFsID0gaXNJbml0aWFsUGxhY2VtZW50KHRhcmdldCwgcmVmZXJlbmNlKTtcclxuICAgICAgaWYgKGluaXRpYWwpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gc2hvdWxkIGFsd2F5cyBiZSBhYmxlIHRvIGRyb3AgaXQgcmlnaHQgYmFjayB3aGVyZSBpdCB3YXNcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gby5hY2NlcHRzKF9pdGVtLCB0YXJnZXQsIF9zb3VyY2UsIHJlZmVyZW5jZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBkcmFnIChlKSB7XHJcbiAgICBpZiAoIV9taXJyb3IpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgIHZhciBjbGllbnRYID0gZ2V0Q29vcmQoJ2NsaWVudFgnLCBlKSB8fCAwO1xyXG4gICAgdmFyIGNsaWVudFkgPSBnZXRDb29yZCgnY2xpZW50WScsIGUpIHx8IDA7XHJcbiAgICB2YXIgeCA9IGNsaWVudFggLSBfb2Zmc2V0WDtcclxuICAgIHZhciB5ID0gY2xpZW50WSAtIF9vZmZzZXRZO1xyXG5cclxuICAgIF9taXJyb3Iuc3R5bGUubGVmdCA9IHggKyAncHgnO1xyXG4gICAgX21pcnJvci5zdHlsZS50b3AgPSB5ICsgJ3B4JztcclxuXHJcbiAgICB2YXIgaXRlbSA9IF9jb3B5IHx8IF9pdGVtO1xyXG4gICAgdmFyIGVsZW1lbnRCZWhpbmRDdXJzb3IgPSBnZXRFbGVtZW50QmVoaW5kUG9pbnQoX21pcnJvciwgY2xpZW50WCwgY2xpZW50WSk7XHJcbiAgICB2YXIgZHJvcFRhcmdldCA9IGZpbmREcm9wVGFyZ2V0KGVsZW1lbnRCZWhpbmRDdXJzb3IsIGNsaWVudFgsIGNsaWVudFkpO1xyXG4gICAgdmFyIGNoYW5nZWQgPSBkcm9wVGFyZ2V0ICE9PSBudWxsICYmIGRyb3BUYXJnZXQgIT09IF9sYXN0RHJvcFRhcmdldDtcclxuICAgIGlmIChjaGFuZ2VkIHx8IGRyb3BUYXJnZXQgPT09IG51bGwpIHtcclxuICAgICAgb3V0KCk7XHJcbiAgICAgIF9sYXN0RHJvcFRhcmdldCA9IGRyb3BUYXJnZXQ7XHJcbiAgICAgIG92ZXIoKTtcclxuICAgIH1cclxuICAgIHZhciBwYXJlbnQgPSBnZXRQYXJlbnQoaXRlbSk7XHJcbiAgICBpZiAoZHJvcFRhcmdldCA9PT0gX3NvdXJjZSAmJiBfY29weSAmJiAhby5jb3B5U29ydFNvdXJjZSkge1xyXG4gICAgICBpZiAocGFyZW50KSB7XHJcbiAgICAgICAgcGFyZW50LnJlbW92ZUNoaWxkKGl0ZW0pO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHZhciByZWZlcmVuY2U7XHJcbiAgICB2YXIgaW1tZWRpYXRlID0gZ2V0SW1tZWRpYXRlQ2hpbGQoZHJvcFRhcmdldCwgZWxlbWVudEJlaGluZEN1cnNvcik7XHJcbiAgICBpZiAoaW1tZWRpYXRlICE9PSBudWxsKSB7XHJcbiAgICAgIHJlZmVyZW5jZSA9IGdldFJlZmVyZW5jZShkcm9wVGFyZ2V0LCBpbW1lZGlhdGUsIGNsaWVudFgsIGNsaWVudFkpO1xyXG4gICAgfSBlbHNlIGlmIChvLnJldmVydE9uU3BpbGwgPT09IHRydWUgJiYgIV9jb3B5KSB7XHJcbiAgICAgIHJlZmVyZW5jZSA9IF9pbml0aWFsU2libGluZztcclxuICAgICAgZHJvcFRhcmdldCA9IF9zb3VyY2U7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAoX2NvcHkgJiYgcGFyZW50KSB7XHJcbiAgICAgICAgcGFyZW50LnJlbW92ZUNoaWxkKGl0ZW0pO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmIChcclxuICAgICAgKHJlZmVyZW5jZSA9PT0gbnVsbCAmJiBjaGFuZ2VkKSB8fFxyXG4gICAgICByZWZlcmVuY2UgIT09IGl0ZW0gJiZcclxuICAgICAgcmVmZXJlbmNlICE9PSBuZXh0RWwoaXRlbSlcclxuICAgICkge1xyXG4gICAgICBfY3VycmVudFNpYmxpbmcgPSByZWZlcmVuY2U7XHJcbiAgICAgIGRyb3BUYXJnZXQuaW5zZXJ0QmVmb3JlKGl0ZW0sIHJlZmVyZW5jZSk7XHJcbiAgICAgIGRyYWtlLmVtaXQoJ3NoYWRvdycsIGl0ZW0sIGRyb3BUYXJnZXQsIF9zb3VyY2UpO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gbW92ZWQgKHR5cGUpIHsgZHJha2UuZW1pdCh0eXBlLCBpdGVtLCBfbGFzdERyb3BUYXJnZXQsIF9zb3VyY2UpOyB9XHJcbiAgICBmdW5jdGlvbiBvdmVyICgpIHsgaWYgKGNoYW5nZWQpIHsgbW92ZWQoJ292ZXInKTsgfSB9XHJcbiAgICBmdW5jdGlvbiBvdXQgKCkgeyBpZiAoX2xhc3REcm9wVGFyZ2V0KSB7IG1vdmVkKCdvdXQnKTsgfSB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzcGlsbE92ZXIgKGVsKSB7XHJcbiAgICBjbGFzc2VzLnJtKGVsLCAnZ3UtaGlkZScpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc3BpbGxPdXQgKGVsKSB7XHJcbiAgICBpZiAoZHJha2UuZHJhZ2dpbmcpIHsgY2xhc3Nlcy5hZGQoZWwsICdndS1oaWRlJyk7IH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJlbmRlck1pcnJvckltYWdlICgpIHtcclxuICAgIGlmIChfbWlycm9yKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHZhciByZWN0ID0gX2l0ZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICBfbWlycm9yID0gX2l0ZW0uY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgX21pcnJvci5zdHlsZS53aWR0aCA9IGdldFJlY3RXaWR0aChyZWN0KSArICdweCc7XHJcbiAgICBfbWlycm9yLnN0eWxlLmhlaWdodCA9IGdldFJlY3RIZWlnaHQocmVjdCkgKyAncHgnO1xyXG4gICAgY2xhc3Nlcy5ybShfbWlycm9yLCAnZ3UtdHJhbnNpdCcpO1xyXG4gICAgY2xhc3Nlcy5hZGQoX21pcnJvciwgJ2d1LW1pcnJvcicpO1xyXG4gICAgby5taXJyb3JDb250YWluZXIuYXBwZW5kQ2hpbGQoX21pcnJvcik7XHJcbiAgICB0b3VjaHkoZG9jdW1lbnRFbGVtZW50LCAnYWRkJywgJ21vdXNlbW92ZScsIGRyYWcpO1xyXG4gICAgY2xhc3Nlcy5hZGQoby5taXJyb3JDb250YWluZXIsICdndS11bnNlbGVjdGFibGUnKTtcclxuICAgIGRyYWtlLmVtaXQoJ2Nsb25lZCcsIF9taXJyb3IsIF9pdGVtLCAnbWlycm9yJyk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZW1vdmVNaXJyb3JJbWFnZSAoKSB7XHJcbiAgICBpZiAoX21pcnJvcikge1xyXG4gICAgICBjbGFzc2VzLnJtKG8ubWlycm9yQ29udGFpbmVyLCAnZ3UtdW5zZWxlY3RhYmxlJyk7XHJcbiAgICAgIHRvdWNoeShkb2N1bWVudEVsZW1lbnQsICdyZW1vdmUnLCAnbW91c2Vtb3ZlJywgZHJhZyk7XHJcbiAgICAgIGdldFBhcmVudChfbWlycm9yKS5yZW1vdmVDaGlsZChfbWlycm9yKTtcclxuICAgICAgX21pcnJvciA9IG51bGw7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRJbW1lZGlhdGVDaGlsZCAoZHJvcFRhcmdldCwgdGFyZ2V0KSB7XHJcbiAgICB2YXIgaW1tZWRpYXRlID0gdGFyZ2V0O1xyXG4gICAgd2hpbGUgKGltbWVkaWF0ZSAhPT0gZHJvcFRhcmdldCAmJiBnZXRQYXJlbnQoaW1tZWRpYXRlKSAhPT0gZHJvcFRhcmdldCkge1xyXG4gICAgICBpbW1lZGlhdGUgPSBnZXRQYXJlbnQoaW1tZWRpYXRlKTtcclxuICAgIH1cclxuICAgIGlmIChpbW1lZGlhdGUgPT09IGRvY3VtZW50RWxlbWVudCkge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIHJldHVybiBpbW1lZGlhdGU7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRSZWZlcmVuY2UgKGRyb3BUYXJnZXQsIHRhcmdldCwgeCwgeSkge1xyXG4gICAgdmFyIGhvcml6b250YWwgPSBvLmRpcmVjdGlvbiA9PT0gJ2hvcml6b250YWwnO1xyXG4gICAgdmFyIHJlZmVyZW5jZSA9IHRhcmdldCAhPT0gZHJvcFRhcmdldCA/IGluc2lkZSgpIDogb3V0c2lkZSgpO1xyXG4gICAgcmV0dXJuIHJlZmVyZW5jZTtcclxuXHJcbiAgICBmdW5jdGlvbiBvdXRzaWRlICgpIHsgLy8gc2xvd2VyLCBidXQgYWJsZSB0byBmaWd1cmUgb3V0IGFueSBwb3NpdGlvblxyXG4gICAgICB2YXIgbGVuID0gZHJvcFRhcmdldC5jaGlsZHJlbi5sZW5ndGg7XHJcbiAgICAgIHZhciBpO1xyXG4gICAgICB2YXIgZWw7XHJcbiAgICAgIHZhciByZWN0O1xyXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICBlbCA9IGRyb3BUYXJnZXQuY2hpbGRyZW5baV07XHJcbiAgICAgICAgcmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIGlmIChob3Jpem9udGFsICYmIChyZWN0LmxlZnQgKyByZWN0LndpZHRoIC8gMikgPiB4KSB7IHJldHVybiBlbDsgfVxyXG4gICAgICAgIGlmICghaG9yaXpvbnRhbCAmJiAocmVjdC50b3AgKyByZWN0LmhlaWdodCAvIDIpID4geSkgeyByZXR1cm4gZWw7IH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbnNpZGUgKCkgeyAvLyBmYXN0ZXIsIGJ1dCBvbmx5IGF2YWlsYWJsZSBpZiBkcm9wcGVkIGluc2lkZSBhIGNoaWxkIGVsZW1lbnRcclxuICAgICAgdmFyIHJlY3QgPSB0YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgIGlmIChob3Jpem9udGFsKSB7XHJcbiAgICAgICAgcmV0dXJuIHJlc29sdmUoeCA+IHJlY3QubGVmdCArIGdldFJlY3RXaWR0aChyZWN0KSAvIDIpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiByZXNvbHZlKHkgPiByZWN0LnRvcCArIGdldFJlY3RIZWlnaHQocmVjdCkgLyAyKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiByZXNvbHZlIChhZnRlcikge1xyXG4gICAgICByZXR1cm4gYWZ0ZXIgPyBuZXh0RWwodGFyZ2V0KSA6IHRhcmdldDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGlzQ29weSAoaXRlbSwgY29udGFpbmVyKSB7XHJcbiAgICByZXR1cm4gdHlwZW9mIG8uY29weSA9PT0gJ2Jvb2xlYW4nID8gby5jb3B5IDogby5jb3B5KGl0ZW0sIGNvbnRhaW5lcik7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiB0b3VjaHkgKGVsLCBvcCwgdHlwZSwgZm4pIHtcclxuICB2YXIgdG91Y2ggPSB7XHJcbiAgICBtb3VzZXVwOiAndG91Y2hlbmQnLFxyXG4gICAgbW91c2Vkb3duOiAndG91Y2hzdGFydCcsXHJcbiAgICBtb3VzZW1vdmU6ICd0b3VjaG1vdmUnXHJcbiAgfTtcclxuICB2YXIgcG9pbnRlcnMgPSB7XHJcbiAgICBtb3VzZXVwOiAncG9pbnRlcnVwJyxcclxuICAgIG1vdXNlZG93bjogJ3BvaW50ZXJkb3duJyxcclxuICAgIG1vdXNlbW92ZTogJ3BvaW50ZXJtb3ZlJ1xyXG4gIH07XHJcbiAgdmFyIG1pY3Jvc29mdCA9IHtcclxuICAgIG1vdXNldXA6ICdNU1BvaW50ZXJVcCcsXHJcbiAgICBtb3VzZWRvd246ICdNU1BvaW50ZXJEb3duJyxcclxuICAgIG1vdXNlbW92ZTogJ01TUG9pbnRlck1vdmUnXHJcbiAgfTtcclxuICBpZiAoZ2xvYmFsLm5hdmlnYXRvci5wb2ludGVyRW5hYmxlZCkge1xyXG4gICAgY3Jvc3N2ZW50W29wXShlbCwgcG9pbnRlcnNbdHlwZV0sIGZuKTtcclxuICB9IGVsc2UgaWYgKGdsb2JhbC5uYXZpZ2F0b3IubXNQb2ludGVyRW5hYmxlZCkge1xyXG4gICAgY3Jvc3N2ZW50W29wXShlbCwgbWljcm9zb2Z0W3R5cGVdLCBmbik7XHJcbiAgfSBlbHNlIHtcclxuICAgIGNyb3NzdmVudFtvcF0oZWwsIHRvdWNoW3R5cGVdLCBmbik7XHJcbiAgICBjcm9zc3ZlbnRbb3BdKGVsLCB0eXBlLCBmbik7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiB3aGljaE1vdXNlQnV0dG9uIChlKSB7XHJcbiAgaWYgKGUudG91Y2hlcyAhPT0gdm9pZCAwKSB7IHJldHVybiBlLnRvdWNoZXMubGVuZ3RoOyB9XHJcbiAgaWYgKGUud2hpY2ggIT09IHZvaWQgMCAmJiBlLndoaWNoICE9PSAwKSB7IHJldHVybiBlLndoaWNoOyB9IC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vYmV2YWNxdWEvZHJhZ3VsYS9pc3N1ZXMvMjYxXHJcbiAgaWYgKGUuYnV0dG9ucyAhPT0gdm9pZCAwKSB7IHJldHVybiBlLmJ1dHRvbnM7IH1cclxuICB2YXIgYnV0dG9uID0gZS5idXR0b247XHJcbiAgaWYgKGJ1dHRvbiAhPT0gdm9pZCAwKSB7IC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vanF1ZXJ5L2pxdWVyeS9ibG9iLzk5ZThmZjFiYWE3YWUzNDFlOTRiYjg5YzNlODQ1NzBjN2MzYWQ5ZWEvc3JjL2V2ZW50LmpzI0w1NzMtTDU3NVxyXG4gICAgcmV0dXJuIGJ1dHRvbiAmIDEgPyAxIDogYnV0dG9uICYgMiA/IDMgOiAoYnV0dG9uICYgNCA/IDIgOiAwKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldE9mZnNldCAoZWwpIHtcclxuICB2YXIgcmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gIHJldHVybiB7XHJcbiAgICBsZWZ0OiByZWN0LmxlZnQgKyBnZXRTY3JvbGwoJ3Njcm9sbExlZnQnLCAncGFnZVhPZmZzZXQnKSxcclxuICAgIHRvcDogcmVjdC50b3AgKyBnZXRTY3JvbGwoJ3Njcm9sbFRvcCcsICdwYWdlWU9mZnNldCcpXHJcbiAgfTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0U2Nyb2xsIChzY3JvbGxQcm9wLCBvZmZzZXRQcm9wKSB7XHJcbiAgaWYgKHR5cGVvZiBnbG9iYWxbb2Zmc2V0UHJvcF0gIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICByZXR1cm4gZ2xvYmFsW29mZnNldFByb3BdO1xyXG4gIH1cclxuICBpZiAoZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCkge1xyXG4gICAgcmV0dXJuIGRvY3VtZW50RWxlbWVudFtzY3JvbGxQcm9wXTtcclxuICB9XHJcbiAgcmV0dXJuIGRvYy5ib2R5W3Njcm9sbFByb3BdO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRFbGVtZW50QmVoaW5kUG9pbnQgKHBvaW50LCB4LCB5KSB7XHJcbiAgcG9pbnQgPSBwb2ludCB8fCB7fTtcclxuICB2YXIgc3RhdGUgPSBwb2ludC5jbGFzc05hbWUgfHwgJyc7XHJcbiAgdmFyIGVsO1xyXG4gIHBvaW50LmNsYXNzTmFtZSArPSAnIGd1LWhpZGUnO1xyXG4gIGVsID0gZG9jLmVsZW1lbnRGcm9tUG9pbnQoeCwgeSk7XHJcbiAgcG9pbnQuY2xhc3NOYW1lID0gc3RhdGU7XHJcbiAgcmV0dXJuIGVsO1xyXG59XHJcblxyXG5mdW5jdGlvbiBuZXZlciAoKSB7IHJldHVybiBmYWxzZTsgfVxyXG5mdW5jdGlvbiBhbHdheXMgKCkgeyByZXR1cm4gdHJ1ZTsgfVxyXG5mdW5jdGlvbiBnZXRSZWN0V2lkdGggKHJlY3QpIHsgcmV0dXJuIHJlY3Qud2lkdGggfHwgKHJlY3QucmlnaHQgLSByZWN0LmxlZnQpOyB9XHJcbmZ1bmN0aW9uIGdldFJlY3RIZWlnaHQgKHJlY3QpIHsgcmV0dXJuIHJlY3QuaGVpZ2h0IHx8IChyZWN0LmJvdHRvbSAtIHJlY3QudG9wKTsgfVxyXG5mdW5jdGlvbiBnZXRQYXJlbnQgKGVsKSB7IHJldHVybiBlbC5wYXJlbnROb2RlID09PSBkb2MgPyBudWxsIDogZWwucGFyZW50Tm9kZTsgfVxyXG5mdW5jdGlvbiBpc0lucHV0IChlbCkgeyByZXR1cm4gZWwudGFnTmFtZSA9PT0gJ0lOUFVUJyB8fCBlbC50YWdOYW1lID09PSAnVEVYVEFSRUEnIHx8IGVsLnRhZ05hbWUgPT09ICdTRUxFQ1QnIHx8IGlzRWRpdGFibGUoZWwpOyB9XHJcbmZ1bmN0aW9uIGlzRWRpdGFibGUgKGVsKSB7XHJcbiAgaWYgKCFlbCkgeyByZXR1cm4gZmFsc2U7IH0gLy8gbm8gcGFyZW50cyB3ZXJlIGVkaXRhYmxlXHJcbiAgaWYgKGVsLmNvbnRlbnRFZGl0YWJsZSA9PT0gJ2ZhbHNlJykgeyByZXR1cm4gZmFsc2U7IH0gLy8gc3RvcCB0aGUgbG9va3VwXHJcbiAgaWYgKGVsLmNvbnRlbnRFZGl0YWJsZSA9PT0gJ3RydWUnKSB7IHJldHVybiB0cnVlOyB9IC8vIGZvdW5kIGEgY29udGVudEVkaXRhYmxlIGVsZW1lbnQgaW4gdGhlIGNoYWluXHJcbiAgcmV0dXJuIGlzRWRpdGFibGUoZ2V0UGFyZW50KGVsKSk7IC8vIGNvbnRlbnRFZGl0YWJsZSBpcyBzZXQgdG8gJ2luaGVyaXQnXHJcbn1cclxuXHJcbmZ1bmN0aW9uIG5leHRFbCAoZWwpIHtcclxuICByZXR1cm4gZWwubmV4dEVsZW1lbnRTaWJsaW5nIHx8IG1hbnVhbGx5KCk7XHJcbiAgZnVuY3Rpb24gbWFudWFsbHkgKCkge1xyXG4gICAgdmFyIHNpYmxpbmcgPSBlbDtcclxuICAgIGRvIHtcclxuICAgICAgc2libGluZyA9IHNpYmxpbmcubmV4dFNpYmxpbmc7XHJcbiAgICB9IHdoaWxlIChzaWJsaW5nICYmIHNpYmxpbmcubm9kZVR5cGUgIT09IDEpO1xyXG4gICAgcmV0dXJuIHNpYmxpbmc7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRFdmVudEhvc3QgKGUpIHtcclxuICAvLyBvbiB0b3VjaGVuZCBldmVudCwgd2UgaGF2ZSB0byB1c2UgYGUuY2hhbmdlZFRvdWNoZXNgXHJcbiAgLy8gc2VlIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNzE5MjU2My90b3VjaGVuZC1ldmVudC1wcm9wZXJ0aWVzXHJcbiAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9iZXZhY3F1YS9kcmFndWxhL2lzc3Vlcy8zNFxyXG4gIGlmIChlLnRhcmdldFRvdWNoZXMgJiYgZS50YXJnZXRUb3VjaGVzLmxlbmd0aCkge1xyXG4gICAgcmV0dXJuIGUudGFyZ2V0VG91Y2hlc1swXTtcclxuICB9XHJcbiAgaWYgKGUuY2hhbmdlZFRvdWNoZXMgJiYgZS5jaGFuZ2VkVG91Y2hlcy5sZW5ndGgpIHtcclxuICAgIHJldHVybiBlLmNoYW5nZWRUb3VjaGVzWzBdO1xyXG4gIH1cclxuICByZXR1cm4gZTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Q29vcmQgKGNvb3JkLCBlKSB7XHJcbiAgdmFyIGhvc3QgPSBnZXRFdmVudEhvc3QoZSk7XHJcbiAgdmFyIG1pc3NNYXAgPSB7XHJcbiAgICBwYWdlWDogJ2NsaWVudFgnLCAvLyBJRThcclxuICAgIHBhZ2VZOiAnY2xpZW50WScgLy8gSUU4XHJcbiAgfTtcclxuICBpZiAoY29vcmQgaW4gbWlzc01hcCAmJiAhKGNvb3JkIGluIGhvc3QpICYmIG1pc3NNYXBbY29vcmRdIGluIGhvc3QpIHtcclxuICAgIGNvb3JkID0gbWlzc01hcFtjb29yZF07XHJcbiAgfVxyXG4gIHJldHVybiBob3N0W2Nvb3JkXTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBkcmFndWxhO1xyXG4iLCJ2YXIgc2kgPSB0eXBlb2Ygc2V0SW1tZWRpYXRlID09PSAnZnVuY3Rpb24nLCB0aWNrO1xyXG5pZiAoc2kpIHtcclxuICB0aWNrID0gZnVuY3Rpb24gKGZuKSB7IHNldEltbWVkaWF0ZShmbik7IH07XHJcbn0gZWxzZSB7XHJcbiAgdGljayA9IGZ1bmN0aW9uIChmbikgeyBzZXRUaW1lb3V0KGZuLCAwKTsgfTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB0aWNrOyIsIi8v44Oq44K544OK44O86YWN5YiX44Gu5Z6L5a6a576pXHJcbnR5cGUgTGlzdGVuZXJzID0ge1xyXG4gICAgW2lkOiBzdHJpbmddOiB7XHJcbiAgICAgICAgZXZlbnQ6IHN0cmluZ1xyXG4gICAgICAgIGVsZW1lbnQ6IEhUTUxFbGVtZW50XHJcbiAgICAgICAgaGFuZGxlcjogKGU6IEV2ZW50KSA9PiB2b2lkXHJcbiAgICB9XHJcbn1cclxuXHJcbi8v44Kk44OZ44Oz44OI44Oq44K544OK44O844O744Kv44Op44K5XHJcbmV4cG9ydCBjbGFzcyBFdmVudExpc3RlbmVyIHtcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgbGlzdGVuZXJzOiBMaXN0ZW5lcnMgPSB7fVxyXG5cclxuICAgIC8v44Kk44OZ44Oz44OI44Oq44K544OK44O844KS6L+95YqgXHJcbiAgICBhZGQobGlzdG5lcklkOiBzdHJpbmcsIGV2ZW50OiBzdHJpbmcsIGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBoYW5kbGVyOiAoZTogRXZlbnQpID0+IHZvaWQpe1xyXG4gICAgICAgIHRoaXMubGlzdGVuZXJzW2xpc3RuZXJJZF0gPSB7XHJcbiAgICAgICAgICAgIGV2ZW50LFxyXG4gICAgICAgICAgICBlbGVtZW50LFxyXG4gICAgICAgICAgICBoYW5kbGVyLFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZXIpXHJcbiAgICB9XHJcblxyXG4gICAgLy/jgqTjg5njg7Pjg4jjg6rjgrnjg4rjg7zjgpLliYrpmaRcclxuICAgIHJlbW92ZShsaXN0bmVySWQ6IHN0cmluZykge1xyXG4gICAgICAgIGNvbnN0IGxpc3RuZXIgPSB0aGlzLmxpc3RlbmVyc1tsaXN0bmVySWRdXHJcbiAgICAgICAgaWYoIWxpc3RuZXIpIHJldHVyblxyXG4gICAgICAgIGxpc3RuZXIuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGxpc3RuZXIuZXZlbnQsIGxpc3RuZXIuaGFuZGxlcilcclxuICAgICAgICBkZWxldGUgdGhpcy5saXN0ZW5lcnNbbGlzdG5lcklkXVxyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgdjQgYXMgdXVpZCB9IGZyb20gJ3V1aWQnICAvL2lk6Ieq5YuV6ZmE55Wq44Op44Kk44OW44Op44OqXHJcblxyXG4vL+OCueODhuODvOOCv+OCuVxyXG5leHBvcnQgY29uc3Qgc3RhdHVzTWFwID0ge1xyXG4gICAgdG9kbzogJ1RPRE8nLFxyXG4gICAgZG9pbmc6ICdET0lORycsXHJcbiAgICBkb25lOiAnRE9ORScsXHJcbn0gYXMgY29uc3RcclxuXHJcbi8v44K544OG44O844K/44K544Gu5Z6LXHJcbmV4cG9ydCB0eXBlIFN0YXR1cyA9IHR5cGVvZiBzdGF0dXNNYXBba2V5b2YgdHlwZW9mIHN0YXR1c01hcF1cclxuXHJcbi8v44K/44K544Kv44O744Kv44Op44K5XHJcbmV4cG9ydCBjbGFzcyBUYXNrIHtcclxuICAgIHJlYWRvbmx5IGlkXHJcbiAgICB0aXRsZVxyXG4gICAgc3RhdHVzOiBTdGF0dXNcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihwcm9wZXJ0aWVzOiB7dGl0bGU6IHN0cmluZ30pe1xyXG4gICAgICAgIHRoaXMuaWQgPSB1dWlkKClcclxuICAgICAgICB0aGlzLnRpdGxlID0gcHJvcGVydGllcy50aXRsZVxyXG4gICAgICAgIHRoaXMuc3RhdHVzID0gc3RhdHVzTWFwLnRvZG9cclxuICAgIH1cclxuXHJcbiAgICAvL+OCv+OCueOCr+OCkuabtOaWsFxyXG4gICAgdXBkYXRlKHByb3BlcnRpZXM6IHsgdGl0bGU/OiBzdHJpbmcsIHN0YXR1cz86IFN0YXR1cyB9KSB7XHJcbiAgICAgICAgdGhpcy50aXRsZSA9IHByb3BlcnRpZXMudGl0bGUgfHwgdGhpcy50aXRsZVxyXG4gICAgICAgIHRoaXMuc3RhdHVzID0gcHJvcGVydGllcy5zdGF0dXMgfHwgdGhpcy5zdGF0dXNcclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQgeyBTdGF0dXMsIFRhc2sgfSBmcm9tICcuL1Rhc2snXHJcblxyXG4vL+OCv+OCueOCr+ODu+OCs+ODrOOCr+OCt+ODp+ODs+ODu+OCr+ODqeOCuVxyXG5leHBvcnQgY2xhc3MgVGFza0NvbGxlY3Rpb24ge1xyXG4gICAgcHJpdmF0ZSB0YXNrczogVGFza1tdID0gW11cclxuXHJcbiAgICAvL+OCv+OCueOCr+OCkui/veWKoFxyXG4gICAgYWRkKHRhc2s6IFRhc2spIHtcclxuICAgICAgICB0aGlzLnRhc2tzLnB1c2godGFzaylcclxuICAgIH1cclxuXHJcbiAgICAvL+OCv+OCueOCr+OCkuWJiumZpFxyXG4gICAgZGVsZXRlKHRhc2s6IFRhc2spIHtcclxuICAgICAgICB0aGlzLnRhc2tzID0gdGhpcy50YXNrcy5maWx0ZXIoKHtpZH0pID0+IGlkICE9PSB0YXNrLmlkKVxyXG4gICAgfVxyXG5cclxuICAgIC8v44K/44K544Kv44KS5qSc57SiXHJcbiAgICBmaW5kKGlkOiBzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy50YXNrcy5maW5kKCh0YXNrKSA9PiB0YXNrLmlkID09PSBpZClcclxuICAgIH1cclxuXHJcbiAgICAvL+OCv+OCueOCr+OCkuabtOaWsFxyXG4gICAgdXBkYXRlKHRhc2s6IFRhc2spIHtcclxuICAgICAgICB0aGlzLnRhc2tzID0gdGhpcy50YXNrcy5tYXAoKGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgaWYgKGl0ZW0uaWQgPT09IHRhc2suaWQpIHJldHVybiB0YXNrXHJcbiAgICAgICAgICAgIHJldHVybiBpdGVtXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICAvL+OCueODhuODvOOCv+OCueOCkuOCreODvOOBq+OCv+OCueOCr+OCkuaKveWHulxyXG4gICAgZmlsdGVyKGZpbHRlclN0YXR1czogU3RhdHVzKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudGFza3MuZmlsdGVyKCh7IHN0YXR1cyB9KSA9PiBzdGF0dXMgPT09IGZpbHRlclN0YXR1cylcclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQgZHJhZ3VsYSBmcm9tICdkcmFndWxhJyAgLy/jg4njg6njg4PjgrDvvIbjg4njg63jg4Pjg5fjg7vjg6njgqTjg5bjg6njg6pcclxuaW1wb3J0IHsgU3RhdHVzLCBUYXNrLCBzdGF0dXNNYXAgfSBmcm9tICcuL1Rhc2snXHJcblxyXG4vL+OCv+OCueOCr+aPj+eUu+OCr+ODqeOCuVxyXG5leHBvcnQgY2xhc3MgVGFza1JlbmRlcmVyIHtcclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgcmVhZG9ubHkgdG9kb0xpc3Q6IEhUTUxFbGVtZW50LFxyXG4gICAgICAgIHByaXZhdGUgcmVhZG9ubHkgZG9pbmdMaXN0OiBIVE1MRWxlbWVudCxcclxuICAgICAgICBwcml2YXRlIHJlYWRvbmx5IGRvbmVMaXN0OiBIVE1MRWxlbWVudCxcclxuICAgICkgeyB9XHJcblxyXG4gICAgLy9UT0RP44Oq44K544OI44Gr44K/44K544Kv6KaB57Sg44KS6L+95YqgXHJcbiAgICBhcHBlbmQodGFzazogVGFzaykge1xyXG4gICAgICAgIGNvbnN0IHsgdGFza0VsLCBkZWxldGVCdXR0b25FbCB9ID0gdGhpcy5yZW5kZXIodGFzaylcclxuICAgICAgICB0aGlzLnRvZG9MaXN0LmFwcGVuZCh0YXNrRWwpXHJcbiAgICAgICAgcmV0dXJuIHsgZGVsZXRlQnV0dG9uRWwgfVxyXG4gICAgfVxyXG5cclxuICAgIC8v44K/44K544Kv6KaB57Sg44KS5o+P55S7XHJcbiAgICBwcml2YXRlIHJlbmRlcih0YXNrOiBUYXNrKSB7XHJcbiAgICAgICAgY29uc3QgdGFza0VsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuICAgICAgICBjb25zdCBzcGFuRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcclxuICAgICAgICBjb25zdCBkZWxldGVCdXR0b25FbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpXHJcblxyXG4gICAgICAgIHRhc2tFbC5pZCA9IHRhc2suaWRcclxuICAgICAgICB0YXNrRWwuY2xhc3NMaXN0LmFkZCgndGFzay1pdGVtJylcclxuXHJcbiAgICAgICAgc3BhbkVsLnRleHRDb250ZW50ID0gdGFzay50aXRsZVxyXG4gICAgICAgIGRlbGV0ZUJ1dHRvbkVsLnRleHRDb250ZW50ID0gJ+WJiumZpCdcclxuXHJcbiAgICAgICAgdGFza0VsLmFwcGVuZChzcGFuRWwsIGRlbGV0ZUJ1dHRvbkVsKVxyXG5cclxuICAgICAgICByZXR1cm4geyB0YXNrRWwsIGRlbGV0ZUJ1dHRvbkVsIH1cclxuICAgIH1cclxuXHJcbiAgICAvL+OCv+OCueOCr+imgee0oOOCkuWJiumZpFxyXG4gICAgcmVtb3ZlKHRhc2s6IFRhc2spIHtcclxuICAgICAgICBjb25zdCB0YXNrRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0YXNrLmlkKVxyXG4gICAgICAgIGlmICghdGFza0VsKSByZXR1cm5cclxuXHJcbiAgICAgICAgaWYgKHRhc2suc3RhdHVzID09PSBzdGF0dXNNYXAudG9kbykge1xyXG4gICAgICAgICAgICB0aGlzLnRvZG9MaXN0LnJlbW92ZUNoaWxkKHRhc2tFbClcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRhc2suc3RhdHVzID09PSBzdGF0dXNNYXAuZG9pbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5kb2luZ0xpc3QucmVtb3ZlQ2hpbGQodGFza0VsKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGFzay5zdGF0dXMgPT09IHN0YXR1c01hcC5kb25lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZG9uZUxpc3QucmVtb3ZlQ2hpbGQodGFza0VsKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvL+OCv+OCueOCr+OBruODieODqeODg+OCsO+8huODieODreODg+ODl1xyXG4gICAgc3Vic2NyaWJlRHJhZ0FuZERyb3Aob25Ecm9wOiAoZWw6IEVsZW1lbnQsIHNpYmxpbmc6IEVsZW1lbnQgfCBudWxsLCBuZXdTdGF0dXM6IFN0YXR1cykgPT4gdm9pZCkge1xyXG4gICAgICAgIGRyYWd1bGEoW3RoaXMudG9kb0xpc3QsIHRoaXMuZG9pbmdMaXN0LCB0aGlzLmRvbmVMaXN0XSkub24oJ2Ryb3AnLCAoZWwsIHRhcmdldCwgX3NvdXJjZSwgc2libGluZykgPT4ge1xyXG4gICAgICAgICAgICBsZXQgbmV3U3RhdHVzOiBTdGF0dXMgPSBzdGF0dXNNYXAudG9kb1xyXG5cclxuICAgICAgICAgICAgaWYgKHRhcmdldC5pZCA9PT0gJ2RvaW5nTGlzdCcpIG5ld1N0YXR1cyA9IHN0YXR1c01hcC5kb2luZ1xyXG4gICAgICAgICAgICBpZiAodGFyZ2V0LmlkID09PSAnZG9uZUxpc3QnKSBuZXdTdGF0dXMgPSBzdGF0dXNNYXAuZG9uZVxyXG5cclxuICAgICAgICAgICAgb25Ecm9wKGVsLCBzaWJsaW5nLCBuZXdTdGF0dXMpXHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnc3Vic2NyaWJlRHJhZ0FuZERyb3AnKVxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlbClcclxuICAgICAgICAgICAgY29uc29sZS5sb2codGFyZ2V0KVxyXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKHNvdXJjZSlcclxuICAgICAgICAgICAgY29uc29sZS5sb2coc2libGluZylcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIC8v44K/44K544Kv44GuaWTjgpLlj5blvpdcclxuICAgIGdldElkKGVsOiBFbGVtZW50KSB7XHJcbiAgICAgICAgcmV0dXJuIGVsLmlkXHJcbiAgICB9XHJcbn1cclxuIiwiZXhwb3J0IGRlZmF1bHQgL14oPzpbMC05YS1mXXs4fS1bMC05YS1mXXs0fS1bMS01XVswLTlhLWZdezN9LVs4OWFiXVswLTlhLWZdezN9LVswLTlhLWZdezEyfXwwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDApJC9pOyIsIi8vIFVuaXF1ZSBJRCBjcmVhdGlvbiByZXF1aXJlcyBhIGhpZ2ggcXVhbGl0eSByYW5kb20gIyBnZW5lcmF0b3IuIEluIHRoZSBicm93c2VyIHdlIHRoZXJlZm9yZVxuLy8gcmVxdWlyZSB0aGUgY3J5cHRvIEFQSSBhbmQgZG8gbm90IHN1cHBvcnQgYnVpbHQtaW4gZmFsbGJhY2sgdG8gbG93ZXIgcXVhbGl0eSByYW5kb20gbnVtYmVyXG4vLyBnZW5lcmF0b3JzIChsaWtlIE1hdGgucmFuZG9tKCkpLlxudmFyIGdldFJhbmRvbVZhbHVlcztcbnZhciBybmRzOCA9IG5ldyBVaW50OEFycmF5KDE2KTtcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJuZygpIHtcbiAgLy8gbGF6eSBsb2FkIHNvIHRoYXQgZW52aXJvbm1lbnRzIHRoYXQgbmVlZCB0byBwb2x5ZmlsbCBoYXZlIGEgY2hhbmNlIHRvIGRvIHNvXG4gIGlmICghZ2V0UmFuZG9tVmFsdWVzKSB7XG4gICAgLy8gZ2V0UmFuZG9tVmFsdWVzIG5lZWRzIHRvIGJlIGludm9rZWQgaW4gYSBjb250ZXh0IHdoZXJlIFwidGhpc1wiIGlzIGEgQ3J5cHRvIGltcGxlbWVudGF0aW9uLiBBbHNvLFxuICAgIC8vIGZpbmQgdGhlIGNvbXBsZXRlIGltcGxlbWVudGF0aW9uIG9mIGNyeXB0byAobXNDcnlwdG8pIG9uIElFMTEuXG4gICAgZ2V0UmFuZG9tVmFsdWVzID0gdHlwZW9mIGNyeXB0byAhPT0gJ3VuZGVmaW5lZCcgJiYgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyAmJiBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzLmJpbmQoY3J5cHRvKSB8fCB0eXBlb2YgbXNDcnlwdG8gIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBtc0NyeXB0by5nZXRSYW5kb21WYWx1ZXMgPT09ICdmdW5jdGlvbicgJiYgbXNDcnlwdG8uZ2V0UmFuZG9tVmFsdWVzLmJpbmQobXNDcnlwdG8pO1xuXG4gICAgaWYgKCFnZXRSYW5kb21WYWx1ZXMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignY3J5cHRvLmdldFJhbmRvbVZhbHVlcygpIG5vdCBzdXBwb3J0ZWQuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vdXVpZGpzL3V1aWQjZ2V0cmFuZG9tdmFsdWVzLW5vdC1zdXBwb3J0ZWQnKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZ2V0UmFuZG9tVmFsdWVzKHJuZHM4KTtcbn0iLCJpbXBvcnQgdmFsaWRhdGUgZnJvbSAnLi92YWxpZGF0ZS5qcyc7XG4vKipcbiAqIENvbnZlcnQgYXJyYXkgb2YgMTYgYnl0ZSB2YWx1ZXMgdG8gVVVJRCBzdHJpbmcgZm9ybWF0IG9mIHRoZSBmb3JtOlxuICogWFhYWFhYWFgtWFhYWC1YWFhYLVhYWFgtWFhYWFhYWFhYWFhYXG4gKi9cblxudmFyIGJ5dGVUb0hleCA9IFtdO1xuXG5mb3IgKHZhciBpID0gMDsgaSA8IDI1NjsgKytpKSB7XG4gIGJ5dGVUb0hleC5wdXNoKChpICsgMHgxMDApLnRvU3RyaW5nKDE2KS5zdWJzdHIoMSkpO1xufVxuXG5mdW5jdGlvbiBzdHJpbmdpZnkoYXJyKSB7XG4gIHZhciBvZmZzZXQgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IDA7XG4gIC8vIE5vdGU6IEJlIGNhcmVmdWwgZWRpdGluZyB0aGlzIGNvZGUhICBJdCdzIGJlZW4gdHVuZWQgZm9yIHBlcmZvcm1hbmNlXG4gIC8vIGFuZCB3b3JrcyBpbiB3YXlzIHlvdSBtYXkgbm90IGV4cGVjdC4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS91dWlkanMvdXVpZC9wdWxsLzQzNFxuICB2YXIgdXVpZCA9IChieXRlVG9IZXhbYXJyW29mZnNldCArIDBdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMV1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAyXV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDNdXSArICctJyArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgNF1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyA1XV0gKyAnLScgKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDZdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgN11dICsgJy0nICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyA4XV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDldXSArICctJyArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMTBdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMTFdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMTJdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMTNdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMTRdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMTVdXSkudG9Mb3dlckNhc2UoKTsgLy8gQ29uc2lzdGVuY3kgY2hlY2sgZm9yIHZhbGlkIFVVSUQuICBJZiB0aGlzIHRocm93cywgaXQncyBsaWtlbHkgZHVlIHRvIG9uZVxuICAvLyBvZiB0aGUgZm9sbG93aW5nOlxuICAvLyAtIE9uZSBvciBtb3JlIGlucHV0IGFycmF5IHZhbHVlcyBkb24ndCBtYXAgdG8gYSBoZXggb2N0ZXQgKGxlYWRpbmcgdG9cbiAgLy8gXCJ1bmRlZmluZWRcIiBpbiB0aGUgdXVpZClcbiAgLy8gLSBJbnZhbGlkIGlucHV0IHZhbHVlcyBmb3IgdGhlIFJGQyBgdmVyc2lvbmAgb3IgYHZhcmlhbnRgIGZpZWxkc1xuXG4gIGlmICghdmFsaWRhdGUodXVpZCkpIHtcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ1N0cmluZ2lmaWVkIFVVSUQgaXMgaW52YWxpZCcpO1xuICB9XG5cbiAgcmV0dXJuIHV1aWQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHN0cmluZ2lmeTsiLCJpbXBvcnQgcm5nIGZyb20gJy4vcm5nLmpzJztcbmltcG9ydCBzdHJpbmdpZnkgZnJvbSAnLi9zdHJpbmdpZnkuanMnO1xuXG5mdW5jdGlvbiB2NChvcHRpb25zLCBidWYsIG9mZnNldCkge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIHJuZHMgPSBvcHRpb25zLnJhbmRvbSB8fCAob3B0aW9ucy5ybmcgfHwgcm5nKSgpOyAvLyBQZXIgNC40LCBzZXQgYml0cyBmb3IgdmVyc2lvbiBhbmQgYGNsb2NrX3NlcV9oaV9hbmRfcmVzZXJ2ZWRgXG5cbiAgcm5kc1s2XSA9IHJuZHNbNl0gJiAweDBmIHwgMHg0MDtcbiAgcm5kc1s4XSA9IHJuZHNbOF0gJiAweDNmIHwgMHg4MDsgLy8gQ29weSBieXRlcyB0byBidWZmZXIsIGlmIHByb3ZpZGVkXG5cbiAgaWYgKGJ1Zikge1xuICAgIG9mZnNldCA9IG9mZnNldCB8fCAwO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxNjsgKytpKSB7XG4gICAgICBidWZbb2Zmc2V0ICsgaV0gPSBybmRzW2ldO1xuICAgIH1cblxuICAgIHJldHVybiBidWY7XG4gIH1cblxuICByZXR1cm4gc3RyaW5naWZ5KHJuZHMpO1xufVxuXG5leHBvcnQgZGVmYXVsdCB2NDsiLCJpbXBvcnQgUkVHRVggZnJvbSAnLi9yZWdleC5qcyc7XG5cbmZ1bmN0aW9uIHZhbGlkYXRlKHV1aWQpIHtcbiAgcmV0dXJuIHR5cGVvZiB1dWlkID09PSAnc3RyaW5nJyAmJiBSRUdFWC50ZXN0KHV1aWQpO1xufVxuXG5leHBvcnQgZGVmYXVsdCB2YWxpZGF0ZTsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gKG1vZHVsZVsnZGVmYXVsdCddKSA6XG5cdFx0KCkgPT4gKG1vZHVsZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLmcgPSAoZnVuY3Rpb24oKSB7XG5cdGlmICh0eXBlb2YgZ2xvYmFsVGhpcyA9PT0gJ29iamVjdCcpIHJldHVybiBnbG9iYWxUaGlzO1xuXHR0cnkge1xuXHRcdHJldHVybiB0aGlzIHx8IG5ldyBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSByZXR1cm4gd2luZG93O1xuXHR9XG59KSgpOyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBFdmVudExpc3RlbmVyIH0gZnJvbSAnLi9FdmVudExpc3RlbmVyJ1xyXG5pbXBvcnQgeyBTdGF0dXMsIFRhc2ssIHN0YXR1c01hcCB9IGZyb20gJy4vVGFzaydcclxuaW1wb3J0IHsgVGFza0NvbGxlY3Rpb24gfSBmcm9tICcuL1Rhc2tDb2xsZWN0aW9uJ1xyXG5pbXBvcnQgeyBUYXNrUmVuZGVyZXIgfSBmcm9tICcuL1Rhc2tSZW5kZXJlcidcclxuXHJcbi8v44Ki44OX44Oq44Kx44O844K344On44Oz44O744Kv44Op44K5XHJcbmNsYXNzIEFwcGxpY2F0aW9uIHtcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgZXZlbnRMaXN0bmVyID0gbmV3IEV2ZW50TGlzdGVuZXIoKVxyXG4gICAgcHJpdmF0ZSByZWFkb25seSB0YXNrQ29sbGVjdGlvbiA9IG5ldyBUYXNrQ29sbGVjdGlvbigpXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IHRhc2tSZW5kZXJlciA9IG5ldyBUYXNrUmVuZGVyZXIoXHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RvZG9MaXN0JykgYXMgSFRNTEVsZW1lbnQsXHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RvaW5nTGlzdCcpIGFzIEhUTUxFbGVtZW50LFxyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkb25lTGlzdCcpIGFzIEhUTUxFbGVtZW50LFxyXG4gICAgKVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIGNvbnN0IGNlcmF0ZUZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY3JlYXRlRm9ybScpIGFzIEhUTUxFbGVtZW50XHJcbiAgICAgICAgY29uc3QgZGVsZXRlQWxsRG9uZVRhc2tCdXR0b24gID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RlbGV0ZUFsbERvbmVUYXNrJykgYXMgSFRNTEVsZW1lbnRcclxuICAgICAgICB0aGlzLmV2ZW50TGlzdG5lci5hZGQoJ3N1Ym1pdC1oYW5kbGVyJywgJ3N1Ym1pdCcsIGNlcmF0ZUZvcm0sIHRoaXMuaGFuZGxlU3VibWl0KVxyXG4gICAgICAgIHRoaXMuZXZlbnRMaXN0bmVyLmFkZCgnY2xpY2staGFuZGxlcicsICdjbGljaycsIGRlbGV0ZUFsbERvbmVUYXNrQnV0dG9uLCB0aGlzLmhhbmRsZUNsaWNrRGVsZXRlQWxsRG9uZVRhc2spXHJcbiAgICAgICAgdGhpcy50YXNrUmVuZGVyZXIuc3Vic2NyaWJlRHJhZ0FuZERyb3AodGhpcy5oYW5kbGVEcmFnQW5kRG9ycClcclxuICAgIH1cclxuXHJcbiAgICAvL+OCv+OCueOCr+OCkuS9nOaIkFxyXG4gICAgcHJpdmF0ZSBoYW5kbGVTdWJtaXQgPSAoZTogRXZlbnQpID0+IHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICBjb25zb2xlLmxvZygnc3VibWl0dGVkJylcclxuXHJcbiAgICAgICAgY29uc3QgdGl0bGVJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0aXRsZScpIGFzIEhUTUxJbnB1dEVsZW1lbnRcclxuXHJcbiAgICAgICAgaWYoIXRpdGxlSW5wdXQudmFsdWUpIHJldHVyblxyXG5cclxuICAgICAgICBjb25zdCB0YXNrID0gbmV3IFRhc2soeyB0aXRsZTogdGl0bGVJbnB1dC52YWx1ZSB9KVxyXG4gICAgICAgIHRoaXMudGFza0NvbGxlY3Rpb24uYWRkKHRhc2spXHJcbiAgICAgICAgLy90aGlzLnRhc2tSZW5kZXJlci5hcHBlbmQodGFzaylcclxuICAgICAgICBjb25zdCB7IGRlbGV0ZUJ1dHRvbkVsIH0gPSB0aGlzLnRhc2tSZW5kZXJlci5hcHBlbmQodGFzaylcclxuXHJcbiAgICAgICAgdGhpcy5ldmVudExpc3RuZXIuYWRkKFxyXG4gICAgICAgICAgICB0YXNrLmlkLFxyXG4gICAgICAgICAgICAnY2xpY2snLFxyXG4gICAgICAgICAgICBkZWxldGVCdXR0b25FbCxcclxuICAgICAgICAgICAgKCkgPT4gdGhpcy5oYW5kbGVDbGlja0RlbGV0ZVRhc2sodGFzayksXHJcbiAgICAgICAgKVxyXG5cclxuICAgICAgICB0aXRsZUlucHV0LnZhbHVlID0gJydcclxuICAgIH1cclxuXHJcbiAgICAvL+OCv+OCueOCr+OCkuWJiumZpFxyXG4gICAgcHJpdmF0ZSBoYW5kbGVDbGlja0RlbGV0ZVRhc2sgPSAodGFzazogVGFzaykgPT4ge1xyXG4gICAgICAgIGlmICghd2luZG93LmNvbmZpcm0oYOOAjCR7dGFzay50aXRsZX3jgI3jgpLliYrpmaTjgZfjgabjgojjgo3jgZfjgYTjgafjgZnjgYs/YCkpIHJldHVyblxyXG4gICAgICAgIGNvbnNvbGUubG9nKHRhc2spXHJcbiAgICAgICAgdGhpcy5ldmVudExpc3RuZXIucmVtb3ZlKHRhc2suaWQpXHJcbiAgICAgICAgdGhpcy50YXNrQ29sbGVjdGlvbi5kZWxldGUodGFzaylcclxuICAgICAgICB0aGlzLnRhc2tSZW5kZXJlci5yZW1vdmUodGFzaylcclxuICAgIH1cclxuXHJcbiAgICAvL+OCv+OCueOCr+OCkuODieODqeODg+OCsCbjg4njg63jg4Pjg5dcclxuICAgIHByaXZhdGUgaGFuZGxlRHJhZ0FuZERvcnAgPSAoZWw6IEVsZW1lbnQsIHNpYmxpbmc6IEVsZW1lbnQgfCBudWxsLCBuZXdTdGF0dXM6IFN0YXR1cykgPT4ge1xyXG4gICAgICAgIGNvbnN0IHRhc2tJZCA9IHRoaXMudGFza1JlbmRlcmVyLmdldElkKGVsKVxyXG4gICAgICAgIGlmICghdGFza0lkKSByZXR1cm5cclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ2hhbmRsZURyb3BBbmREcm9wJylcclxuICAgICAgICBjb25zb2xlLmxvZyh0YXNrSWQpXHJcbiAgICAgICAgY29uc29sZS5sb2coc2libGluZylcclxuICAgICAgICBjb25zb2xlLmxvZyhuZXdTdGF0dXMpXHJcblxyXG4gICAgICAgIGNvbnN0IHRhc2sgPSB0aGlzLnRhc2tDb2xsZWN0aW9uLmZpbmQodGFza0lkKVxyXG4gICAgICAgIGlmICghdGFzaykgcmV0dXJuXHJcblxyXG4gICAgICAgIHRhc2sudXBkYXRlKHsgc3RhdHVzOiBuZXdTdGF0dXMgfSlcclxuICAgICAgICB0aGlzLnRhc2tDb2xsZWN0aW9uLnVwZGF0ZSh0YXNrKVxyXG4gICAgfVxyXG5cclxuICAgIC8vRE9OReOCv+OCueOCr+OCkuS4gOaLrOWJiumZpFxyXG4gICAgcHJpdmF0ZSBoYW5kbGVDbGlja0RlbGV0ZUFsbERvbmVUYXNrID0gKCkgPT4ge1xyXG4gICAgICAgIGlmICghd2luZG93LmNvbmZpcm0oJ0RPTkUg44Gu44K/44K544Kv44KS5LiA5ous5YmK6Zmk44GX44Gm44KI44KN44GX44GE44Gn44GZ44GLPycpKSByZXR1cm5cclxuXHJcbiAgICAgICAgY29uc3QgZG9uZVRhc2tzID0gdGhpcy50YXNrQ29sbGVjdGlvbi5maWx0ZXIoc3RhdHVzTWFwLmRvbmUpXHJcbiAgICAgICAgY29uc29sZS5sb2coZG9uZVRhc2tzKVxyXG4gICAgfVxyXG59XHJcblxyXG4vL+eUu+mdouOBjOODreODvOODieOBleOCjOOBn+OCiUFwcGxpY2F0aW9uLnN0YXJ0KCnjgpLlrp/ooYxcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKSA9PiB7XHJcbiAgICBjb25zdCBhcHAgPSBuZXcgQXBwbGljYXRpb24oKVxyXG4gICAgYXBwLnN0YXJ0KClcclxufSlcclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9