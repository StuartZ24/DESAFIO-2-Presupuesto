// Controller presupuesto
var controlPresupuesto = (function(){

  
  
  // egresos
  var Expense = function(id,descripcion,value){
    this.id = id;
    this.descripcion = descripcion;
    this.value = value;
    this.percentage = -1;
  };


  //calculo del porcentaje en los egresos
  Expense.prototype.calcPercentage = function(totalIncome){
    if(totalIncome > 0){
      this.percentage = Math.round((this.value / totalIncome) * 100);
 
    } else {
      this.percentage = -1;
    }
  };
//funcion porcentaje
  Expense.prototype.getPercentage = function(){
    return this.percentage;
  };
 
  //ingresos
  var Income = function(id,descripcion,value){
    this.id = id;
    this.descripcion = descripcion;
    this.value = value;
  };

  //calculo total
  var calculateTotal = function(type){
    var sum = 0;
    data.allItems[type].forEach(function(el){
      sum += el.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, des, val){
      var newItem,
          ID;
      
      // Creando nuevo ID
      if(data.allItems[type].length>0){
        ID = data.allItems[type][data.allItems[type].length-1].id+1;
      } else {
        ID = 0;
      }

      // Creando un objeto nuevo basado en "inc" o en "exp", es decir ingreso o egreso
      if(type === "exp"){
        newItem = new Expense(ID,des,val);
      } else if(type === "inc") {
        newItem = new Income(ID,des,val);
      }

      // push en la estructura de datos
      data.allItems[type].push(newItem);

      // Retornar el nuevo elemento
      return newItem;
    },

    deleteItem: function(type,id){
      var ids,
          index;

      ids = data.allItems[type].map(function(el){
        return el.id;
      });

      index = ids.indexOf(id);

      if(index !== -1){
        data.allItems[type].splice(index, 1);
      }

    },

    calculateBudget: function(){

      // Calcular total de ingresos y egresos
      calculateTotal('exp');
      calculateTotal('inc');
      // Calcular presupesto: total ingresos - total egresos
      data.budget = data.totals.inc - data.totals.exp;
      // Calcular el porcentaje del ingreso que se ha gastado
      if(data.totals.inc>0){
        data.percentage = ((data.totals.exp / data.totals.inc) * 100);
        dtpercentage= data.percentage.toFixed(2);

      } else {
        data.percentage = -1;
      }
    },

    calculatePercentage: function(){
      data.allItems.exp.forEach(function(el){
        el.calcPercentage(data.totals.inc);
      });
    },

    getPercentage: function(){
      var allPerc = data.allItems.exp.map(function(el){
        return el.getPercentage();
      });
      return allPerc;
    },

    getBudget: function(){
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: dtpercentage
      }
    },

    testitem: function(){
      console.log(data);
    }
  }

})();


// Control para la UI o interfaz de usuario
var UIController = (function(){
  
  var DOMstrings = {
    inputType: ".add__type",
    inputDescripcion: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel: ".item__percentage",
    dateLabel: ".budget__title--month"
  };

  var formatNumber = function(num,type){
    var numSplit,
        int,
        dec,
        sign;

    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split(".");
    int = numSplit[0];
    if(int.length>3){
      int = int.substr(0,int.length - 3)+"," + int.substr(int.length - 3,int.length);
    }

    dec = numSplit[1];

    return (type === "exp" ? sign = "-" : sign = "+") + " " + int + "." + dec;

  };

  var nodeListForEach = function(list,callback){
    for(var i=0; i<list.length; i++){
      callback(list[i],i);
    }
  };

  return {
    getInput: function(){
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        descripcion: document.querySelector(DOMstrings.inputDescripcion).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },

    addListItem: function(obj,type){
      var html,
          newHtml,
          element;

      // Crear string HTML con placeholder text
      if(type === "inc"){
        element = DOMstrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%descripcion%</div><div class="balance"><div class="item__value">%value%</div></div></div></div>';
      } else if(type === "exp"){
        element = DOMstrings.expensesContainer;
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%descripcion%</div><div class="balance"><div class="item__value">%value%</div><div class="item__percentage">%</div></button></div></div></div>'
      }

      // Reemplazando el placeholder text con los verdaderos datos
      newHtml = html.replace("%id%",obj.id);
      newHtml = newHtml.replace("%descripcion%",obj.descripcion);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value,type));

      // Insertando el HTMl en el DOC
      document.querySelector(element).insertAdjacentHTML("beforeend",newHtml);
    },


    clearFields: function(){
      var fields,
          fieldsArr;

      fields = document.querySelectorAll(DOMstrings.inputDescripcion+', '+DOMstrings.inputValue);
      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(function(el,i,arr){
        el.value = "";
      });
      fieldsArr[0].focus();
    },

    displayBudget: function(obj){
      var type;
      obj.budget > 0 ? type = "inc" : type = "exp";

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,"inc");
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp,"exp");

      if(obj.percentage>0){
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage+"%";
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = "---";
      }

    },

    displayPercentages: function(percentages) {
      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      nodeListForEach(fields, function(el,i){
        if(percentages[i]>0){
          el.textContent = percentages[i] + "%";
        } else {
          el.textContent = "---";
        }
      });

    },
    //Función para los meses
    displayMonth: function() {
      var now,
          month,
          months,
          year;

      now = new Date();

      months = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
      month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(DOMstrings.dateLabel).textContent = months[month] + " " + year;
    },
    
    //Tipos de transacción
    changedType: function(){
      var fields = document.querySelectorAll(
        DOMstrings.inputType + "," +
        DOMstrings.inputDescripcion + ',' +
        DOMstrings.inputValue
      );

      nodeListForEach(fields, function(el){
        el.classList.toggle("col-focus");
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle("col");

    },

    getDOMstrings: function(){
      return DOMstrings;
    }
  };

})();


//Control de la aplicación general
var controller = (function(budgetCtrl,UICtrl){

  var setupEventListeners = function(){
    var DOM = UICtrl.getDOMstrings();
    
    document.querySelector(DOM.inputBtn).addEventListener("click",ctrlAddItem);

    document.addEventListener("keypress",function(event){
      if(event.keyCode === 13 || event.which === 13){
        ctrlAddItem();
      }
    });

    document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);
    document.querySelector(DOM.inputType).addEventListener("change",UICtrl.changedType);
  };

  var updateBudget = function(){
    // 1) Calcular el presupuesto
    controlPresupuesto.calculateBudget();

    // 2) Regresar el presupuesto
    var budget = controlPresupuesto.getBudget();

    // 3) Mostrar el presupuesto en la UI o interfaz de usuario
    UICtrl.displayBudget(budget);
  };

  var updatePercentages = function(){
    // 1) Calculando porcentajes
    budgetCtrl.calculatePercentage();
    // 2) Leyendo lo porcentajes del control de presupuesto
    var percentages = budgetCtrl.getPercentage();
    // 3) Actualizando la UI con los nuevos porcentajes
    UICtrl.displayPercentages(percentages);
  };

  var ctrlAddItem = function(){
    var input,
        newItem,
        addItem;

    // 1) Atrapar los datos de entrada 
    input = UICtrl.getInput();

    if(input.descripcion !== "" && !isNaN(input.value) && input.value>0){
      // 2) Agregando el objeto en el control de presupuesto
      newItem = budgetCtrl.addItem(input.type,input.descripcion,input.value);
      // 3) Agregando el objeto a la UI
      addItem = UICtrl.addListItem(newItem,input.type);
      // 4) Limpiando los campos
      UICtrl.clearFields();
      // 5) Calcular y actualizar presupuesto
      updateBudget();
      // 6) Calcular y actualizar los porcentajes
      updatePercentages();
    }
  };

  return {
    init: function(){
      console.log("La aplicación se ha iniciado");
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setupEventListeners();
    }
  }

})(controlPresupuesto,UIController);



controller.init();