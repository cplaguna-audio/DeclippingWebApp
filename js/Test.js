/*****************************************************************************\
 *                                   Test.js                                 *
 *                                                                           *
 *  Unit tests. TODO.                                                        *
 *                                                                           *
 *****************************************************************************/

function RunTests() {
  var tests_pass = true;
  tests_pass = TestFileDetectClipping();
  tests_pass = tests_pass && TestFileSignalProcessing();
  tests_pass = tests_pass && TestFileBlocking();
  tests_pass = tests_pass && TestFileCubicSplineInterpolation();
  tests_pass = tests_pass && TestFileClipIntervalUtilities();

  if(tests_pass) {
    alert("All tests passed!");
  }
  else {
    alert("One or more tests failed. Check the console for details.");
  }
}

///////////////////////////////////
//       DetectClipping.js       //
///////////////////////////////////
function TestFileDetectClipping() {
  var tests_pass = true;
  tests_pass = TestMergeClipIntervals();
  return tests_pass;
}

function TestMergeClipIntervals() {
  var tests_pass = true;

  var ci1 = { 'start': 10, 'stop': 15 };
  var ci2 = { 'start': 13, 'stop': 19 };
  var ci3 = { 'start': 1, 'stop': 5 };
  var clip_intervals = [ci1, ci2, ci3];
  
  var cr1 = { 'start': 1, 'stop': 5 };
  var cr2 = { 'start': 10, 'stop': 19 };
  var correct1 = [cr1, cr2];

  var result = MergeClipIntervals(clip_intervals);

  if(!ClipIntervalEquality(correct1, result)) {
    console.log('Test Failed: MergeClipIntervals() #1');
    tests_pass = false;
  }

  return tests_pass;
}

///////////////////////////////////
//      SignalProcessing.js      //
///////////////////////////////////
function TestFileSignalProcessing() {
  var tests_pass = true;  
  tests_pass = tests_pass && TestZeroMatrix();
  tests_pass = tests_pass && TestHannWindow();
  tests_pass = tests_pass && TestExponentialSmoothingForwardBack();
  tests_pass = tests_pass && TestSignalScale();
  tests_pass = tests_pass && TestSignalAdd();
  tests_pass = tests_pass && TestSignalSubtract();
  tests_pass = tests_pass && TestFindPeaks();
  tests_pass = tests_pass && TestHistogram();
  tests_pass = tests_pass && TestFindBin();
  tests_pass = tests_pass && TestMyMax();
  tests_pass = tests_pass && TestMyMin();
  tests_pass = tests_pass && TestMyAverage();
  return tests_pass;
}

function TestZeroMatrix() {
  var tests_pass = true;
 
  var correct = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];

  var result = ZeroMatrix(4, 4);
  if(!MatrixEquality(result, correct)) {
    console.log('Test failed: TestZeroMatrix() #1');
    console.log(result);
    tests_pass = false;
  }
  return tests_pass;
}

function TestHannWindow() {
  var tests_pass = true;
 
  var TOLERANCE = 0.001;
  var x1 = 4;
  var correct1 = [0, 0.75, 0.75, 0];

  var result1 = HannWindow(x1);
  if(!ArrayEqualityTolerance(result1, correct1, TOLERANCE)) {
    console.log('Test failed: HannWindow() #1');
    tests_pass = false;
  }

  var x2 = 8;
  var correct2 = [0, 0.1883, 0.6113, 0.9505, 0.9505, 0.6113, 0.1883, 0];

  var result2 = HannWindow(x2);
  if(!ArrayEqualityTolerance(result2, correct2, TOLERANCE)) {
    console.log('Test failed: HannWindow() #2');
    tests_pass = false;
  }

  return tests_pass;
}

function TestExponentialSmoothingForwardBack() {
  var tests_pass = true;

  var x1 = [0, 1, 0];
  var a1 = 0.5;
  var correct1 = [0.1875, 0.375, 0.25];

  var result = ExponentialSmoothingForwardBack(x1, a1);
  if(!ArrayEquality(result, correct1)) {
    console.log('Test failed: ExponentialSmoothingForwardBack() #1');
    tests_pass = false;
  }

  return tests_pass;
}

function TestSignalScale() {
  var tests_pass = true;

  var x1 = [0, 1, -2, 3, 4];
  var a1 = 1.5;
  var correct1 = [0, 1.5, -3, 4.5, 6];

  var result = SignalScale(x1, a1);
  if(!ArrayEquality(result, correct1)) {
    console.log('Test Failed: SignalScale() #1');
    tests_pass = false;
  }

  var x2 = [];
  var a2 = 10;
  var correct2 = [];

  var result = SignalScale(x2, a2);
  if(!ArrayEquality(result, correct2)) {
    console.log('Test Failed: SignalScale() #2');
    tests_pass = false;
  }  

  return tests_pass;
}

function TestSignalAdd() {
  var tests_pass = true;

  var x1 = [0, 1, 2, 3];
  var y1 = [4, 6, 8, 10];
  var correct1 = [4, 7, 10, 13];

  var result = SignalAdd(x1, y1);
  if(!ArrayEquality(result, correct1)) {
    console.log('Test Failed: SignalAdd() #1.1');
    tests_pass = false;
  }

  var correct2 = [4, 7, 10, 13];
  result = SignalAdd(y1, x1);
  if(!ArrayEquality(result, correct2)) {
    console.log('Test Failed: SignalAdd() #1.2');
    tests_pass = false;
  }

  var x2 = [1,  2,  3,  4,  5,  6,  7,  8];
  var y2 = [-1, -2, -3, -4, -5, -6, -7, -8];
  var correct3 = [0, 0, 0, 0, 0, 0, 0, 0];

  result = SignalAdd(x2, y2);
  if(!ArrayEquality(result, correct3)) {
    console.log('Test Failed: SignalAdd() #2');
    tests_pass = false;
  }

  var x3 = [1, 2, 3, 4, 5];
  var y3 = [1, 2, 1];
  var correct4 = [2, 4, 4];

  result = SignalAdd(x3, y3);
  if(!ArrayEquality(result, correct4)) {
    console.log('Test Failed: SignalAdd() #3');
    tests_pass = false;
  }

  return tests_pass;
}

function TestSignalSubtract() {
  var tests_pass = true;

  var x1 = [0, 1, 2, 3];
  var y1 = [4, 6, 8, 10];
  var correct1 = [-4, -5, -6, -7];

  var result = SignalSubtract(x1, y1);
  if(!ArrayEquality(result, correct1)) {
    console.log('Test Failed: SignalSubtract() #1.1');
    tests_pass = false;
  }

  var correct2 = [4, 5, 6, 7];
  result = SignalSubtract(y1, x1);
  if(!ArrayEquality(result, correct2)) {
    console.log('Test Failed: SignalSubtract() #1.2');
    tests_pass = false;
  }

  var x2 = [1,  2,  3,  4,  5,  6,  7,  8];
  var y2 = [-1, -2, -3, -4, -5, -6, -7, -8];
  var correct3 = [2, 4, 6, 8, 10, 12, 14, 16];

  result = SignalSubtract(x2, y2);
  if(!ArrayEquality(result, correct3)) {
    console.log('Test Failed: SignalSubtract() #2');
    tests_pass = false;
  }

  var x3 = [1, 2, 3, 4, 5];
  var y3 = [1, 2, 1];
  var correct4 = [0, 0, 2];

  result = SignalSubtract(x3, y3);
  if(!ArrayEquality(result, correct4)) {
    console.log('Test Failed: SignalSubtract() #3');
    tests_pass = false;
  }

  return tests_pass;
}

function TestFindPeaks() {
  var tests_pass = true;

  var x = [0, 0.2, 0.6, 0.7, 0.4, 0.1, 0.0, 0.2, 0.0, 0.9, 0.6];
  var thresh = 0.5;
  var peaks = FindPeaks(x, thresh, false);

  if(!(peaks[0].val == 0.7 && peaks[1].val == 0.9)) {
    console.log('Test Failed: TestFindPeaks() #2.1');
    tests_pass = false;
  }
  if(!(peaks[0].loc == 3 && peaks[1].loc == 9)) {
    console.log('Test Failed: TestFindPeaks() #2.2');
    tests_pass = false;
  }

  peaks = FindPeaks(x, thresh, true);
  if(!(peaks[0].val == 0.9 && peaks[1].val == 0.7)) {
    console.log('Test Failed: TestFindPeaks() #2.1');
    tests_pass = false;
  }
  if(!(peaks[0].loc == 9 && peaks[1].loc == 3)) {
    console.log('Test Failed: TestFindPeaks() #2.2');
    tests_pass = false;
  }
  return tests_pass;
}

function TestHistogram() {
  var tests_pass = true;

  var x1 = [-1, -0.5, 0.1, 0.5, 1];
  var b1 = 2;
  var correct_edges = [-1, 0, 1];
  var correct_vals = [2, 3];

  var result = Histogram(x1, b1);
  var result_values = result[0];
  var result_edges = result[1];
  if(!ArrayEquality(result_edges, correct_edges)) {
    console.log('Test Failed: TestHistogram() #1.1');
    tests_pass = false;
  }

  if(!ArrayEquality(result_values, correct_vals)) {
    console.log('Test Failed: TestHistogram() #1.2');
    tests_pass = false;
  }

  return tests_pass;
}

function TestFindBin() {
  var tests_pass = true;

  var edges = [0.0, 1.0, 2.0, 3.0, 4.0, 5.0];
  var x1 = 0.6;
  var result = FindBin(x1, edges);
  if(result != 0) {
    console.log('Test Failed: TestFindBin() #1');
    tests_pass = false;
  }

  var x2 = 4.1;
  var result = FindBin(x2, edges);
  if(result != 4) {
    console.log('Test Failed: TestFindBin() #2');
    tests_pass = false;
  }

  // Input directly on an edge can go into the left or right bin.
  var x3 = 3.0;
  var result = FindBin(x3, edges);
  if(result != 2 && result != 3) {
    console.log('Test Failed: TestFindBin() #3');
    tests_pass = false;
  }

  var x4 = -1;
  var result = FindBin(x4, edges);
  if(result != -1) {
    console.log('Test Failed: TestFindBin() #4');
    tests_pass = false;
  }

  return tests_pass;
}

function TestMyMax() {
  var tests_pass = true;

  var x1 = [1, 2, 3, 4, 9, 2];
  var result = MyMax(x1);
  if(result != 9) {
    console.log('Test Failed: TestMyMax() #1');
    tests_pass = false;
  }

  var x2 = [-1, -3, -5, -4, -2];
  result = MyMax(x2);
  if(result != -1) {
    console.log('Test Failed: TestMyMax() #2');
    tests_pass = false;
  }

  var x3 = [];
  result = MyMax(x3);
  if(result != -Infinity) {
    console.log('Test Failed: TestMyMax() #3');
    tests_pass = false;
  }

  return tests_pass;
}

function TestMyMin() {
  var tests_pass = true;

  var x1 = [1, 2, 3, 4, 9, 2];
  var result = MyMin(x1);
  if(result != 1) {
    console.log('Test Failed: TestMyMin() #1');
    tests_pass = false;
  }

  var x2 = [-1, -3, -5, -4, -2];
  result = MyMin(x2);
  if(result != -5) {
    console.log('Test Failed: TestMyMin() #2');
    tests_pass = false;
  }

  var x3 = [];
  result = MyMin(x3);
  if(result != Infinity) {
    console.log('Test Failed: TestMyMin() #3');
    tests_pass = false;
  }

  return tests_pass;
}

function TestMyAverage() {
  var tests_pass = true;

  var x1 = [1, 2, 3, 4, 9, 2];
  var result1 = MyAverage(x1);
  var correct1 = 3.5
  if(result1 != correct1) {
    console.log('Test Failed: TestMyAverage() #1');
    console.log(result1);
    tests_pass = false;
  }

  var x2 = [-1, -3, -5, -4, -2];
  var result2 = MyAverage(x2);
  var correct2 = -3
  if(result2 != correct2) {
    console.log('Test Failed: TestMyAverage() #2');
    console.log(result2);
    tests_pass = false;
  }

  return tests_pass;
}

///////////////////////////////////
//          Blocking.js          //
///////////////////////////////////
function TestFileBlocking() {
  var tests_pass = true;  
  tests_pass = tests_pass && TestCopyToBlock();
  tests_pass = tests_pass && TestCopyToChannel();
  tests_pass = tests_pass && TestOverlapAndAdd();

  return tests_pass;
}


function TestCopyToBlock() {
  var tests_pass = true;

  var channel = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  var channel_length = channel.length;
  var block_1 = [];
  var block_length = 4;
  var start_idx = 2;
  var stop_idx = 5;
  CopyToBlock(channel, channel_length, start_idx, stop_idx, block_1, block_length);
  
  var correct_1 = [2, 3, 4, 5];
  if(!ArrayEquality(block_1, correct_1)) {
    console.log('Test Failed: TestCopyToBlock() #1');
    tests_pass = false;
  }

  channel = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  channel_length = channel.length;
  var block_2 = [];
  block_length = 10;
  start_idx = 5;
  stop_idx = 14;
  var correct_2 = [5, 6, 7, 8, 9, 10, 11, 0, 0, 0];
  CopyToBlock(channel, channel_length, start_idx, stop_idx, block_2, block_length);
  if(!ArrayEquality(block_2, correct_2)) {
    console.log('Test Failed: TestCopyToBlock() #2');
    console.log(block_2);
    tests_pass = false;
  }

  channel = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  channel_length = channel.length;
  var block_3 = [];
  block_length = 4;
  start_idx = 5;
  stop_idx = 14;
  var correct_3 = [5, 6, 7, 8];
  CopyToBlock(channel, channel_length, start_idx, stop_idx, block_3, block_length);
  if(!ArrayEquality(block_3, correct_3)) {
    console.log('Test Failed: TestCopyToBlock() #3');
    console.log(block_3);
    tests_pass = false;
  }

  return tests_pass;
}


function TestCopyToChannel() {
  var tests_pass = true;

  var channel_1 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  var channel_length = channel_1.length;
  var block_1 = [50, 51, 52, 53];
  var block_length_1 = block_1.length;
  var start_idx = 7;
  var stop_idx = 10;
  CopyToChannel(channel_1, channel_length, start_idx, stop_idx, block_1, block_length_1);
  
  correct_1 = [0, 1, 2, 3, 4, 5, 6, 50, 51, 52, 53, 11];
  if(!ArrayEquality(channel_1, correct_1)) {
    console.log('Test Failed: TestCopyToChannel() #1');
    console.log(channel_1);
    tests_pass = false;
  }

  channel_2 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  channel_length = channel_2.length;
  var block_2 = [50, 51, 52, 53];
  var block_length_2 = block_2.length;
  start_idx = 5;
  stop_idx = 10;
  var correct_2 = [0, 1, 2, 3, 4, 50, 51, 52, 53, 0, 0, 11];
  CopyToChannel(channel_2, channel_length, start_idx, stop_idx, block_2, block_length_2);
  if(!ArrayEquality(channel_2, correct_2)) {
    console.log('Test Failed: TestCopyToChannel() #2');
    console.log(channel_2);
    tests_pass = false;
  }

  channel_3 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  channel_length = channel_3.length;
  var block_3 = [50, 51, 52, 53, 54];
  block_length_3 = block_3.length;
  start_idx = 10;
  stop_idx = 14;
  var correct_3 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 50, 51];
  CopyToChannel(channel_3, channel_length, start_idx, stop_idx, block_3, block_length_3);
  if(!ArrayEquality(channel_3, correct_3)) {
    console.log('Test Failed: TestCopyToChannel() #3');
    console.log(channel_3);
    tests_pass = false;
  }

  return tests_pass;
}

function TestOverlapAndAdd() {
  var tests_pass = true;

  var channel_1 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  var channel_length = channel_1.length;
  var block_1 = [50, 51, 52, 53];
  var block_length_1 = block_1.length;
  var start_idx = 7;
  var stop_idx = 10;
  OverlapAndAdd(channel_1, channel_length, start_idx, stop_idx, block_1, block_length_1);
  
  correct_1 = [0, 1, 2, 3, 4, 5, 6, 57, 59, 61, 63, 11];
  if(!ArrayEquality(channel_1, correct_1)) {
    console.log('Test Failed: TestOverlapAndAdd() #1');
    console.log(channel_1);
    tests_pass = false;
  }

  channel_2 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  channel_length = channel_2.length;
  var block_2 = [50, 51, 52, 53];
  var block_length_2 = block_2.length;
  start_idx = 5;
  stop_idx = 10;
  var correct_2 = [0, 1, 2, 3, 4, 55, 57, 59, 61, 9, 10, 11];
  OverlapAndAdd(channel_2, channel_length, start_idx, stop_idx, block_2, block_length_2);
  if(!ArrayEquality(channel_2, correct_2)) {
    console.log('Test Failed: TestOverlapAndAdd() #2');
    console.log(channel_2);
    tests_pass = false;
  }

  channel_3 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  channel_length = channel_3.length;
  var block_3 = [50, 51, 52, 53, 54];
  block_length_3 = block_3.length;
  start_idx = 10;
  stop_idx = 14;
  var correct_3 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 60, 62];
  OverlapAndAdd(channel_3, channel_length, start_idx, stop_idx, block_3, block_length_3);
  if(!ArrayEquality(channel_3, correct_3)) {
    console.log('Test Failed: TestOverlapAndAdd() #3');
    console.log(channel_3);
    tests_pass = false;
  }

  return tests_pass;
}

///////////////////////////////////
//  CubicSplineInterpolation.js  //
///////////////////////////////////
function TestFileCubicSplineInterpolation() {
  var tests_pass = true;  
  tests_pass = tests_pass && TestMyCubicEval();
  tests_pass = tests_pass && TestValueFromVectors();
  tests_pass = tests_pass && TestSolveTridiagonal();
  tests_pass = tests_pass && TestCubicSplineInterpolation();

  return tests_pass;
}

function TestCubicSplineInterpolation() {
  var tests_pass = true;
  var TOLERANCE = 0.004;

  var left_xs = [1, 2, 3, 4, 5];
  var right_xs = [11, 12, 13, 14, 15];
  var left_ys = [0.9937, 0.2187, 0.1058, 0.1097, 0.0636];
  var right_ys = [0.4046, 0.4484, 0.3658, 0.7635, 0.6279];
  var interp_xs = [6, 7, 8, 9, 10];
  var correct_interp_ys = [0.0413, 0.0606, 0.1142, 0.1943, 0.2936];

  var result_interp_ys = CubicSplineInterpolation(left_xs, left_ys, right_xs, right_ys, interp_xs);
  if(!ArrayEqualityTolerance(correct_interp_ys, result_interp_ys, TOLERANCE)) {
    console.log('Test Failed: TestCubicSplineInterpolation() #1');
    console.log(result_interp_ys);
    tests_pass = false;
  }

  return tests_pass;
}

function TestMyCubicEval() {
  var TOLERANCE = 0.0005;
  var tests_pass = true;

  var d = 0.8147;
  var c = 0.9058;
  var b = 0.1270;
  var a = 0.9134;
  var t = 0.6324;

  var correct = 1.5619;
  var result = MyCubicEval(d, c, b, a, t);
  if(Math.abs(correct - result) > TOLERANCE) {
    console.log('Test Failed: TestMyCubicEval() #1');
    console.log(result);
    tests_pass = false;
  }

  return tests_pass;
}

//ValueFromVectors(left_x, right_x, idx)
function TestValueFromVectors() {
  var tests_pass = true;

  var left = [0, 1, 2, 3, 4];
  var right = [5, 6, 7, 8, 9];

  var correct_0 = 0;
  var result_0 = ValueFromVectors(left, right, 0);
  if(correct_0 != result_0) {
    console.log('Test Failed: TestValueFromVectors() #0');
    console.log(result_0);
    tests_pass = false;
  }

  var correct_1 = 2;
  var result_1 = ValueFromVectors(left, right, 2);
  if(correct_1 != result_1) {
    console.log('Test Failed: TestValueFromVectors() #1');
    console.log(result_1);
    tests_pass = false;
  }

  var correct_2 = 4;
  var result_2 = ValueFromVectors(left, right, 4);
  if(correct_2 != result_2) {
    console.log('Test Failed: TestValueFromVectors() #2');
    console.log(result_2);
    tests_pass = false;
  }

  var correct_3 = 5;
  var result_3 = ValueFromVectors(left, right, 5);
  if(correct_3 != result_3) {
    console.log('Test Failed: TestValueFromVectors() #3');
    console.log(result_3);
    tests_pass = false;
  }

  var correct_4 = 8;
  var result_4 = ValueFromVectors(left, right, 8);
  if(correct_4 != result_4) {
    console.log('Test Failed: TestValueFromVectors() #4');
    console.log(result);
    tests_pass = false;
  }

  var correct_5 = 9;
  var result_5 = ValueFromVectors(left, right, 9);
  if(correct_5 != result_5) {
    console.log('Test Failed: TestValueFromVectors() #5');
    console.log(result_5);
    tests_pass = false;
  }
  return tests_pass;
}

function TestSolveTridiagonal() {
  var tests_pass = true;
  var TOLERANCE = 0.008;

  var x = ZeroMatrix(5, 5);
  x[0][0] = 0.8235;
  x[0][1] = 0.4387;
  x[0][2] = 0;
  x[0][3] = 0;
  x[0][4] = 0;

  x[1][0] = 0.6948;
  x[1][1] = 0.3816;
  x[1][2] = 0.4456;
  x[1][3] = 0;
  x[1][4] = 0;

  x[2][0] = 0;
  x[2][1] = 0.7655;
  x[2][2] = 0.6463;
  x[2][3] = 0.6551;
  x[2][4] = 0;

  x[3][0] = 0;
  x[3][1] = 0;
  x[3][2] = 0.7094;
  x[3][3] = 0.1626;
  x[3][4] = 0.5853;

  x[4][0] = 0;
  x[4][1] = 0;
  x[4][2] = 0;
  x[4][3] = 0.1190;
  x[4][4] = 0.2238;

  var d = [0.7060, 0.0318, 0.2769, 0.0462, 0.0971];

  var correct = [-2.4355, 6.1804, -1.4230, -5.3955, 3.3027];

  var result = SolveTridiagonal(x, d);
  if(!ArrayEqualityTolerance(correct, result, TOLERANCE)) {
    console.log('Test Failed: TestSolveTridiagonal() #1');
    console.log('result: ' + result.toString());
    console.log('d: ' + d.toString());
    for(var r = 0; r < 5; r++) {
      var str = "";
      for(var c = 0; c < 5; c++) {
        str = str + x[r][c].toString() + " "
      }
      console.log(str);
    }

    tests_pass = false;
  }

  return tests_pass;
}

///////////////////////////////////
//   ClipIntervalUtilities.js    //
///////////////////////////////////
function TestFileClipIntervalUtilities() {
  var tests_pass = true;  
  tests_pass = tests_pass && TestSplitClipIntervals();
  tests_pass = tests_pass && TestRangeToIndices();


  return tests_pass;
}

function TestSplitClipIntervals() {
  var tests_pass = true;

  var cutoff = 6;
  var c1 = {start: 1, stop: 1};
  var c2 = {start: 4, stop: 8};
  var c3 = {start: 12, stop: 21};
  var c4 = {start: 60, stop: 63};
  var c5 = {start: 100 , stop: 150};
  var clip_intervals = [c1, c2, c3, c4, c5];

  var correct_short = [c1, c2, c4];
  var correct_long = [c3, c5];

  var result = SplitClipIntervals(clip_intervals, cutoff);
  var result_short = result[0];
  var result_long = result[1];

  if(!ClipIntervalEquality(result_short, correct_short) || !ClipIntervalEquality(result_long, correct_long)) {
    console.log('Test Failed: SplitClipIntervals() #1');
    console.log(result_1);
    tests_pass = false;
  }

  return tests_pass;
}

function TestRangeToIndices() {
  var tests_pass = true;

  var start_idx_1 = 4;
  var stop_idx_1 = 8;
  var correct_1 = [4, 5, 6, 7, 8];

  var result_1 = [];
  RangeToIndices(result_1, start_idx_1, stop_idx_1); 
  if(!ArrayEquality(result_1, correct_1)) {
    console.log('Test Failed: TestRangeToIndices() #1');
    console.log(result_1);
    tests_pass = false;
  }

  var start_idx_2 = 0;
  var stop_idx_2 = 1;
  var correct_2 = [0, 1];

  var result_2 = [];
  RangeToIndices(result_2, start_idx_2, stop_idx_2); 
  if(!ArrayEquality(result_2, correct_2)) {
    console.log('Test Failed: TestRangeToIndices() #2');
    console.log(result_2);
    tests_pass = false;
  }

  return tests_pass;
}


///////////////////////////////////
//            Helpers            //
///////////////////////////////////
function MatrixEquality(x, y) {
  if(x.length != y.length) {
    return false;
  }

  for(var row_idx = 0; row_idx < x.length; row_idx++) {
    var cur_x_col = x[row_idx];
    var cur_y_col = y[row_idx];

    if(cur_x_col.length !== cur_y_col.length) {
      return false;
    }

    for(var col_idx = 0; col_idx < cur_x_col.length; col_idx++) {
      var cur_x = cur_x_col[col_idx];
      var cur_y = cur_y_col[col_idx];
      if(cur_x !== cur_y) {
        return false;
      }
    }
  }
  return true;
}

function ArrayEquality(x, y) {
  if(x.length != y.length) {
    return false;
  }

  for(var idx = 0; idx < x.length; idx++) {
    var cur_x = x[idx];
    var cur_y = y[idx];
    if(cur_x != cur_y) {
      return false;
    }
  }

  return true;
}

function ArrayEqualityTolerance(x, y, t) {
  if(x.length != y.length) {
    return false;
  }

  for(var idx = 0; idx < x.length; idx++) {
    var cur_x = x[idx];
    var cur_y = y[idx];
    if(Math.abs(cur_x - cur_y) > t) {
      return false;
    }
  }

  return true;
}

function ClipIntervalEquality(x, y) {
  if(x.length != y.length) {
    return false;
  }

  for(var idx = 0; idx < x.length; idx++) {
    var cur_x = x[idx];
    var cur_y = y[idx];
    if(cur_x.start != cur_y.start) {
      return false;
    }
    if(cur_x.stop != cur_y.stop) {
      return false;
    }
  }

  return true;
}
