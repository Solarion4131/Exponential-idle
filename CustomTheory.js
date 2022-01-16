import { ExponentialCost, FreeCost, LinearCost } from "./api/Costs";
import { Localization } from "./api/Localization";
import { BigNumber } from "./api/BigNumber";
import { theory } from "./api/Theory";
import { Utils } from "./api/Utils";

var id = "my_custom_theory_id";
var name = "Function composition";
var description = "2 functions";
var authors = "Solarion";
var version = 1;

var currency;
var c1, c2, x1, x2;
var x1Exp, x2Exp;

var achievement1, achievement2;
var x = BigNumber.ONE;

var init = () => {
    currency = theory.createCurrency();

    ///////////////////
    // Regular Upgrades

    // c1
    {
        let getDesc = (level) => "c_1=" + getC1(level).toString(0);
        c1 = theory.createUpgrade(0, currency, new FirstFreeCost(new ExponentialCost(25, Math.log2(10))))
        c1.getDescription = (_) => Utils.getMath(getDesc(c1.level));
        c1.getInfo = (amount) => Utils.getMathTo(getDesc(c1.level), getDesc(c1.level + amount));
    }

    // c2
    {
        let getDesc = (level) => "c_2=2^{" + level + "}";
        let getInfo = (level) => "c_2=" + getC2(level).toString(0);
        c2 = theory.createUpgrade(1, currency, new ExponentialCost(1, Math.log2(70)));
        c2.getDescription = (_) => Utils.getMath(getDesc(c2.level));
        c2.getInfo = (amount) => Utils.getMathTo(getInfo(c2.level), getInfo(c2.level + amount));
    }
    // x1
    {
        let getDesc = (level) => "x_1=" + getx1(level).toString(0);
        let getInfo = (level) => "x_1=" + getx1(level).toString(0);
        x1 = theory.createUpgrade(2, currency, new ExponentialCost(15, Math.log2(10)));
        x1.getDescription = (_) => Utils.getMath(getDesc(x1.level));
        x1.getInfo = (amount) => Utils.getMathTo(getInfo(x1.level), getInfo(x1.level + amount));
    }

    // x2
    {
        
            let getDesc = (level) => "x_2=2^{" + level + "}";
            let getInfo = (level) => "x_2=" + getx2(level).toString(0);
            x2 = theory.createUpgrade(3, currency,  (new ExponentialCost(100, Math.log2(100))));
            x2.getDescription = (_) => Utils.getMath(getDesc(x2.level));
            x2.getInfo = (amount) => Utils.getMathTo(getInfo(x2.level), getInfo(x2.level + amount));
        
    }
    /////////////////////
    // Permanent Upgrades
    theory.createPublicationUpgrade(0, currency, 1e10);
    theory.createBuyAllUpgrade(1, currency, 1e13);
    theory.createAutoBuyerUpgrade(2, currency, 1e30);

    ///////////////////////
    //// Milestone Upgrades
    theory.setMilestoneCost(new LinearCost(10, 20));
    {
        x2Exp = theory.createMilestoneUpgrade(1, 4);
        x2Exp.description = Localization.getUpgradeIncCustomExpDesc("x_2", "0.34");
        x2Exp.info = Localization.getUpgradeIncCustomExpInfo("x_2", "0.34");
        x2Exp.boughtOrRefunded = (_) => theory.invalidatePrimaryEquation();
    }
    {
        x1Exp = theory.createMilestoneUpgrade(0, 16);
        x1Exp.description = Localization.getUpgradeIncCustomExpDesc("x_1", "0.05");
        x1Exp.info = Localization.getUpgradeIncCustomExpInfo("x_1", "0.05");
        x1Exp.boughtOrRefunded = (_) => theory.invalidatePrimaryEquation();
    }

    

    
    
    /////////////////
    //// Achievements
    

  //  updateAvailability();
}

var updateAvailability = () => {
    x2Exp.isAvailable = 1;
    x1Exp.isAvailable = 1; 
}

var tick = (elapsedTime, multiplier) => {
    
    
    let dt = BigNumber.from(elapsedTime * multiplier);
    let bonus = theory.publicationMultiplier;
    //var xlogged = log(x);
    x = BigNumber.from(x)
    currency.value += dt * bonus * getC1(c1.level) *
                                   getC2(c2.level) * (x.pow(1.5)).pow(1.1) *((currency.value).pow(0.3)+1);
    x += getx1(x1.level).pow(getx1Exponent(x1Exp.level))*getx2(x2.level).pow(getx2Exponent(x2Exp.level))
    theory.invalidateTertiaryEquation()
    theory.invalidateSecondaryEquation()
    theory.invalidatePrimaryEquation()
    
}

//var getInternalState = () => `${x}`

var getPrimaryEquation = () => {
   /* let result = "\\dot{\\rho} = c_1";

    if (x1Exp.level == 1) result += "^{0.05}";
    if (x1Exp.level == 2) result += "^{0.1}";
    if (x1Exp.level == 3) result += "^{0.15}";

    result += "c_2";

    if (x2Exp.level == 1) result += "^{0.05}";
    if (x2Exp.level == 2) result += "^{0.1}";
    if (x2Exp.level == 3) result += "^{0.15}";

    return result;*/
    let result = "\\dot {\\rho} = f(g(x))";            
    //result += "f(n) = {\\rho_n}^{0.3} * x^{1.1}";
    return result
}

var getTertiaryEquation = () => theory.latexSymbol + "=\\max\\rho^{0.2}, \\dot x = x1x2, x = "+x;
var getSecondaryEquation = () => "f(n) = ({\\rho_{n-1}}^{0.3}+1) * n^{1.1},  g(n) = n^{1.5}+ln(n)*n^{1.49}";
var getPublicationMultiplier = (tau) => tau.pow(0.156) * BigNumber(10000);
var getPublicationMultiplierFormula = (symbol) => "\\{10000}*{" + symbol + "}^{0.156}";
var getTau = () => currency.value.pow(0.5);
var get2DGraphValue = () => currency.value.sign * (BigNumber.ONE + currency.value.abs()).log10().toNumber();

var getC1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getC2 = (level) => BigNumber.TWO.pow(level);
var getx1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getx2 = (level) => BigNumber.TWO.pow(level);
var getx1Exponent = (level) => BigNumber.from(1 + 0.01 * level);
var getx2Exponent = (level) => BigNumber.from(1 + 0.02 * level);
// var getx1Exponent = (level) => BigNumber.from(1 + 0.00 * level);

init();