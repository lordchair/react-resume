var React = require('react');
var Resizable = require('react-component-resizable');
var Tappable = require('react-tappable');
var dateFormat = require('dateFormat');


var Timeline = React.createClass({
  propTypes: {
    content: React.PropTypes.array,
    toNumber: React.PropTypes.func,
    numberToString: React.PropTypes.func,
    generateAxes: React.PropTypes.func,
    axesTics: React.PropTypes.number,
    title: React.PropTypes.string,
    lower: React.PropTypes.number,
    higher: React.PropTypes.number
  },
  getDefaultProps: function() {
    return {
      toNumber: function(numericalData) {
        //assuming date
        return new Date(numericalData).getTime();
      },
      axesTics: function() { return Math.floor(20 * window.innerWidth / 1200)}
    };
  },

  numberToString: function(numericalData) {
    if (this.props.numberToString) { return this.props.numberToString(numericalData); }
    if (this.props.toNumber('1/12/1993') == '726825600000') {
      //we're dealing with dates here
      return dateFormat(new Date(numericalData), 'mmm yyyy');
    }
    return numericalData;
  },

  handleResize: function(e) {
    this.gennedAxesOutput = false;
    this.forceUpdate();
  },


  generateAxes: function(lower, higher) {
    if (this.props.generateAxes) { return this.props.generateAxes(lower, higher); }
    if (this.gennedAxesOutput) { return this.gennedAxesOutput; }
    var out = [];

    if (this.props.toNumber('1/12/1993') == '726825600000') {
      // dates
      var counter = new Date(lower);
      while (counter.getTime() < higher) {
        out.push(counter.getTime())
        counter.setMonth(counter.getMonth() + 1);
      }
    } else {
      var size = higher - lower;
      var chunk = size / (this.props.axesTics() + 1);
      for (var i = 1; i <= this.props.axesTics(); i++) {
        out.push(Math.round(lower + chunk * i));
      }
    }

    while (out.length > this.props.axesTics()) {
      var temp = [];
      var count = 0;
      out.forEach(function(me) {
        if (count % 2 == 0) {
          temp.push(me);
        }
        count++;
      });
      out = temp;
    }

    var self = this;
    var processed = [];
    out.forEach(function(datum) {
      processed.push({
        start: datum,
        end: datum,
        header: self.numberToString(datum)
      });
    })
    this.gennedAxesOutput = processed;
    return processed;
  },


  getInitialState: function() {
    return { order: 0 };
  },
  reorder: function() {
    this.setState({ order: ((this.state.order + 1) % 3) });
  },
  render: function() {
    var content = this.props.content;
    if (this.props.content && this.props.content[0] && this.props.content[0].start) {
      content = [this.props.content];
    }

    var lower = this.props.lower || Number.MAX_SAFE_INTEGER;
    var higher = this.props.higher || Number.MIN_SAFE_INTEGER;
    var self = this;
    if (!this.props.higher || !this.props.lower) {
      content.forEach(function(timeline) {
        timeline.forEach(function(datum) {
          if (!self.props.higher) {
            var _hi = self.props.toNumber(datum.end);
            if (_hi > higher) {
              higher = _hi;
            }
          }
          if (!self.props.lower) {
            var _low = self.props.toNumber(datum.start);
            if (_low < lower) {
              lower = _low;
            }
          }
        })
      });
    }
          // <TimeRow numberToString={this.numberToString} toNumber={tonum} content={this.generateAxes(lower, higher)} lower={lower} higher={higher} />
    var tonum = this.props.toNumber;
    return (
      <div className='timeline'>
        {content.map(function(rowContent) {
          return (<TimeRow toNumber={tonum} content={rowContent} lower={lower} higher={higher} />);
        })}
        <Resizable onResize={this.handleResize.bind(this)} className='axis'>
          <TimeSlider numberToString={this.props.numberToString} lower={this.props.lower} higher={this.props.higher} />
        </Resizable>
      </div>
    );
  }
});

var TimeRow = React.createClass({
  propTypes: {
    content: React.PropTypes.array,
    toNumber: React.PropTypes.func,
    numberToString: React.PropTypes.func,
    lower: React.PropTypes.number,
    higher: React.PropTypes.number,
  },

  render: function() {
    var self = this;
    var lowerNum = this.props.toNumber(this.props.lower);
    var higherNum = this.props.toNumber(this.props.higher);
    var tonum = this.props.toNumber;
    return (
      <div className='time_row' style={{ position: 'relative' }} clasName='time_row'>
        {this.props.content.map(function(datum) { return (<TimeTic data={datum} toNumber={tonum} lower={lowerNum} higher={higherNum} />); })}
      </div>
    );
  }
});

var TimeTic = React.createClass({
  propTypes: {
    toNumber: React.PropTypes.func,
    data: React.PropTypes.object,
    lower: React.PropTypes.number,
    higher: React.PropTypes.number
  },
  render: function() {
    var sizeNum = this.props.higher - this.props.lower;
    var myLower = this.props.toNumber(this.props.data.start);
    var myUpper = this.props.toNumber(this.props.data.end);
    var style = {};
    style.position = 'absolute';
    style.backgroundColor = this.props.data.backgroundColor || 'black';
    style.left = 100 * ((myLower - this.props.lower) / (sizeNum));
    style.right = 100 * ((myUpper - this.props.lower) / (sizeNum));
    style.width = style.right - style.left;
    style.left += '%'; style.right += '%'; style.width += '%';
    return (
      <div className='time_tic' style={style}>{this.props.data.header}<Tooltip data={this.props.data} /></div>
      );
  },
});

var TimeSlider = React.createClass({
  propTypes: {
    toNumber: React.PropTypes.func,
    numberToString: React.PropTypes.func,
    lower: React.PropTypes.number,
    higher: React.PropTypes.number
  },
  getInitialState: function() {
    return {
      isShowing: false
    };
  },
  mouseMove: function(e) {
    this.setState({ isShowing: true });
    debugger;
    this.setState(xPos, e);
    return true;
  },
  mouseLeave: function() {
    this.setState({ isShowing: false });
  },
  render: function() {
    var wrapperStyle = {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    }
    if (!this.state.isShowing) { return (<div style={wrapperStyle} onMouseLeave={this.mouseLeave} onMouseMove={this.mouseMove} className='slider_wrapper' />); }
    var sizeNum = this.props.higher - this.props.lower;
    var myLower = this.props.toNumber(this.props.data.start);
    var myUpper = this.props.toNumber(this.props.data.end);
    var style = {};
    style.position = 'absolute';
    style.backgroundColor = this.props.data.backgroundColor || 'black';
    style.left = 100 * ((myLower - this.props.lower) / (sizeNum));
    style.right = 100 * ((myUpper - this.props.lower) / (sizeNum));
    style.width = style.right - style.left;
    style.left += '%'; style.right += '%'; style.width += '%';
    return (
      <div style={wrapperStyle} onMouseLeave={this.mouseLeave} onMouseMove={this.mouseMove} className='slider_wrapper'>
        <div className='slider'></div>
      </div>
      );
  },
});


var Tooltip = React.createClass({
  propTypes: {
    data: React.PropTypes.object
  },
  render: function() {
    return (
      <div className='time_tooltip'>
        {this.props.data.header} <br/>
        {this.props.data.subheader} <br/>
        {this.props.data.start} - {this.props.data.end} <br/>
      </div>
    )
  }
});

module.exports = Timeline;