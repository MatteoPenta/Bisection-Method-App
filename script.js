/*

  Metodo di bisezione
  Solo numeri razionali

  estremi funzione in un array extremes[]
  - verifica se teorema degli zeri è applicabile
    -> se gli estremi hanno segno opposto

*/

var inputFunc = document.getElementById('eq').value;
var isSolutionShown = false;

// Runs math.eval to the compiled function, using the given value
// to build a usable scope object
function evalFunc(compiledFuncDef, scope) {
  this.scope = {
    x: scope
  };
  return compiledFuncDef.eval(this.scope);
}

// Object for the current function
// includes a method to update it with the new input
var func = {
  def: math.compile(inputFunc),
  raw: inputFunc,
  update: function(newDef) {
    this.def = math.compile(newDef);
    this.raw = newDef;
  }
}

var extremes = [];
var isSmallEnough = n => {
  return evalFunc(func.def, n) < 0.001 && evalFunc(func.def, n) > -0.001;
};

/* Metodo di bisezione
  * se f( (a+b)/2 ) > 0 -> a = (a+b)/2 , b = b
  * se f( (a+b)/2 ) < 0 -> a = a , b = (a+b)/2
  * Ripeti finchè non ottieni un valore abbastanza preciso
*/
function bisection(a, b) {
  var average = (a + b)/2;

  // end the research if the average is small enough
  if (isSmallEnough(average)) return average;

  /*
    1) f( (a+b)/2 ) è maggiore di 0
      -> ricorsione funzione con valori adeguati alla media
    2) f( (a+b)/2 ) è minore di 0
      -> ricorsione funzione con valori adeguati alla media
  */
  if (evalFunc(func.def, average) > 0) {
    if (evalFunc(func.def, a) > 0) {
      return bisection(average, b);
    } else {
      return bisection(a, average);
    }
  } else {
    if (evalFunc(func.def, a) > 0) {
      return bisection(a, average);
    } else {
      return bisection(average, b);
    }
  }
}

function startBisection() {
  if (!isSolutionShown) {
    // Controlla se esiston Estremi
    if (extremes.length === 2) {
      // Controlla se gli estremi hanno segno opposto
      if (evalFunc(func.def, extremes[0]) * evalFunc(func.def, extremes[1]) < 0) {
        var sol = [bisection(extremes[0], extremes[1]), 0];
        drawSolution(sol);
      }
      else {
        alert("La funzione non assume valori di segno opposto agli estremi.");
      }
    } else {
      alert("Per avviare il metodo di bisezione occorre impostare degli estremi alla funzione");
    }

  }

}


var funcOptions = {
  target: '#plot',
  grid: true,
  height: 450,
  data: [{
    fn: func.raw,
    sampler: 'builtIn',
    graphType: 'polyline'
  }],
  xAxis: {
    label: 'asse x'
  },
  yAxis: {
    label: 'asse y'
  }
}

function drawSolution(sol) {
  funcOptions.data[1] = {
    points: [
      sol
    ],
    fnType: 'points',
    graphType: 'scatter'
  }
  document.getElementById('sol-span').innerHTML = sol[0].toFixed(2);
  $('#sol-par').animate({height: 'toggle'}, "slow");
  isSolutionShown = true;
  drawFunc();
}

function removeSolution() {
  if (funcOptions.data[1] !== undefined) {
    if (funcOptions.data[1].points.length === 1) {
      funcOptions.data[1].points = [];
      $('#sol-par').animate({height: 'toggle'}, "slow");
      isSolutionShown = false;
    }
  }
}

function drawFunc() {
  try {
    funcOptions.data[0].fn = func.raw;
    functionPlot(funcOptions);
  } catch (e) {
    console.log(e);
    alert(e);
  }
}


function changeRange(min, max) {

  removeSolution();
  this.min = Number(min);
  this.max = Number(max);

  // Check whether the input is valid for the given function
  // If the function evaluated with the min and max values
  //  returns an object as a result, it means that it is a real
  //  number, hence it is not valid.
  const minAndMaxAreValid = typeof evalFunc(func.def, this.min) !== 'object' && typeof evalFunc(func.def, this.max) !== 'object';

  if (minAndMaxAreValid && this.min < this.max) {
    funcOptions.data[0].range = [this.min,this.max];
    // extremes array used in the bisection
    extremes[0] = this.min;
    extremes[1] = this.max;
    // reloads the plot with the new options (updated range)
    drawFunc();
  }
  else {
    alert("Estremi inaccettabili.");
  }

}

function resetExtremes() {
  extremes = [];
  document.getElementById("xmin").value = 0;
  document.getElementById("xmax").value = 0;
  document.getElementById("xmin-label").innerHTML = 0;
  document.getElementById("xmax-label").innerHTML = 0;

}

function removeRange() {
  delete funcOptions.data[0].range;
  removeSolution();
  resetExtremes();
  drawFunc();
}

document.getElementById('form').onsubmit = function(event) {
  event.preventDefault();
  func.update(document.getElementById('eq').value);
  removeRange();
  drawFunc();
}

drawFunc();
