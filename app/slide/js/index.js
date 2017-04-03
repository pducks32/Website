'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

var Radians = (function () {
  function Radians() {
    _classCallCheck(this, Radians);
  }

  Radians.fromDegrees = function fromDegrees(degrees) {
    return degrees * Math.PI / 180;
  };

  return Radians;
})();

var RelativePosition = (function () {
  function RelativePosition(_ref) {
    var width = _ref.width;
    var height = _ref.height;
    var deltas = _ref.deltas;
    var _ref$angle = _ref.angle;
    var angle = _ref$angle === undefined ? 0 : _ref$angle;

    _classCallCheck(this, RelativePosition);

    this.width = width;
    this.height = height;
    this.angle = angle;
    this.deltas = deltas;
  }

  RelativePosition.prototype.from = function from(_ref2) {
    var width = _ref2.width;
    var height = _ref2.height;

    return {
      x: this.calculateRelativePoint(width, this.deltas.x, this.width, Math.sin(this.angle)),
      y: this.calculateRelativePoint(height, this.deltas.y, this.height, Math.cos(this.angle))
    };
  };

  RelativePosition.prototype.calculateRelativePoint = function calculateRelativePoint(anchorValue, delta, objectValue, difference) {
    return anchorValue * delta + objectValue * difference;
  };

  return RelativePosition;
})();

var Ball = function Ball(_ref3) {
  var x = _ref3.x;
  var y = _ref3.y;
  var radius = _ref3.radius;
  var restitution = _ref3.restitution;
  var mass = _ref3.mass;
  var styles = _ref3.styles;

  _classCallCheck(this, Ball);

  return Physics.body('circle', {
    x: x, y: y,
    radius: radius,
    restitution: restitution,
    mass: mass,
    styles: styles
  });
};

var Rectangle = function Rectangle(_ref4) {
  var x = _ref4.x;
  var y = _ref4.y;
  var angle = _ref4.angle;
  var width = _ref4.width;
  var height = _ref4.height;
  var mass = _ref4.mass;

  var other = _objectWithoutProperties(_ref4, ['x', 'y', 'angle', 'width', 'height', 'mass']);

  _classCallCheck(this, Rectangle);

  return Physics.body('rectangle', _extends({
    x: x,
    y: y,
    angle: angle,
    width: width,
    height: height,
    mass: mass
  }, other));
};

var TopLeftFixedRectangle = (function (_Rectangle) {
  _inherits(TopLeftFixedRectangle, _Rectangle);

  function TopLeftFixedRectangle(args) {
    _classCallCheck(this, TopLeftFixedRectangle);

    var position = args.position;

    var props = _objectWithoutProperties(args, ['position']);

    var point = new RelativePosition({
      width: props.width,
      height: props.height,
      angle: props.angle,
      deltas: {
        x: position.left,
        y: position.top
      }
    });

    var _point$from = point.from(position.from);

    var x = _point$from.x;
    var y = _point$from.y;

    return _Rectangle.call(this, _extends({ treatment: "static", x: x, y: y }, props));
  }

  return TopLeftFixedRectangle;
})(Rectangle);

var TopRightFixedRectangle = (function (_Rectangle2) {
  _inherits(TopRightFixedRectangle, _Rectangle2);

  function TopRightFixedRectangle(args) {
    _classCallCheck(this, TopRightFixedRectangle);

    var position = args.position;

    var props = _objectWithoutProperties(args, ['position']);

    var point = new RelativePosition({
      width: props.width,
      height: props.height,
      angle: props.angle,
      deltas: {
        x: 1 - position.right,
        y: position.top
      }
    });

    var _point$from2 = point.from(position.from);

    var x = _point$from2.x;
    var y = _point$from2.y;

    return _Rectangle2.call(this, _extends({ treatment: "static", x: x, y: y }, props));
  }

  return TopRightFixedRectangle;
})(Rectangle);

var LanguageBall = (function (_Ball) {
  _inherits(LanguageBall, _Ball);

  function LanguageBall(_ref5) {
    var text = _ref5.text;
    var ballOpts = _ref5.ballOpts;

    _classCallCheck(this, LanguageBall);

    var properSrc = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/103968/' + text + '_ball.svg';
    var defaults = {
      x: 0,
      y: 0,
      radius: 30,
      restitution: getRandomInt(25, 75) / 100,
      mass: 2,
      styles: {
        src: properSrc
      }
    };
    return _Ball.call.apply(_Ball, [this].concat(defaults));
  }

  return LanguageBall;
})(Ball);

function newWorld() {
  return Physics(function (world) {

    // create a renderer
    var renderer = Physics.renderer('canvas', {
      el: 'viewport'
    });
    // add the renderer
    world.add(renderer);

    // render on each step
    world.on('step', function () {
      world.render();
    });

    // constrain objects to these bounds
    var edgeBounce = Physics.behavior('edge-collision-detection', {
      aabb: Physics.aabb(0, -100, renderer.width, renderer.height),
      restitution: 0.99,
      cof: 0.8
    });

    // resize events
    window.addEventListener('resize', function () {
      edgeBounce.setAABB(Physics.aabb(0, 0, renderer.width, renderer.height));
    }, true);

    var languages = ["ruby", "swift", "js", "css", "html"];
    var numberOfBalls = 0;
    var addBallInterval = setInterval(function () {
      numberOfBalls++
      if (numberOfBalls < 20) {
        world.add(new LanguageBall({ text: languages[getRandomInt(0, languages.length)] }));
      }
    }, 2000);

    world.add(new TopLeftFixedRectangle({
      width: 100,
      height: 40,
      angle: Radians.fromDegrees(20),
      mass: 60,
      position: {
        top: 0.15,
        left: 0,
        from: renderer
      },
      styles: {
        fillStyle: "#34495e"
      }
    }));

    world.add(new TopLeftFixedRectangle({
      width: 80,
      height: 40,
      angle: Radians.fromDegrees(10),
      mass: 60,
      position: {
        top: 0.85,
        left: 0.2,
        from: renderer
      },
      styles: {
        fillStyle: "#34495e"
      }
    }));

    world.add(new TopRightFixedRectangle({
      width: 100,
      height: 40,
      angle: Radians.fromDegrees(-18),
      mass: 60,
      position: {
        top: 0.45,
        right: 0.15,
        from: renderer
      },
      styles: {
        fillStyle: "#34495e"
      }
    }));

    // add things to the world
    world.add([Physics.behavior('interactive', { el: renderer.container }), Physics.behavior('constant-acceleration'), Physics.behavior('body-impulse-response'), Physics.behavior('body-collision-detection'), Physics.behavior('sweep-prune'), edgeBounce]);

    // subscribe to ticker to advance the simulation
    Physics.util.ticker.on(function (time) {
      world.step(time);
    });
  });
}

window.physicsWorld = newWorld();

window.addEventListener('resize', function () {
  window.physicsWorld = newWorld();
}, true);
