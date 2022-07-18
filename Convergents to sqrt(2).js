import { ExponentialCost, FirstFreeCost } from "../api/Costs";
import { Localization } from "../api/Localization";
import { parseBigNumber, BigNumber } from "../api/BigNumber";
import { theory } from "../api/Theory";
import { Utils } from "../api/Utils";
//Credit to XLII and Playspout for simulating this theory. Also, to Snaeky and Peanut for creating Euler's Formula Theory - a theory that was released with this theory in the update. 
var id = "convergents_to_sqrt(2)"
var name = "Convergents to √2";
var description = "Use the convergents to √2 to increase your ρ. The first few convergents to √2 are as follows: 1, 3/2, 7/5, 17/12. N(n) here is the numerator of the nth convergent to √2, and D(n) is the nth denominator, taking the 0th convergent to be 1/1. In the limit, these converge on √2. The convergents oscillate above and below √2. The rate of change of q is based on the closeness of the approximation.";
var authors = "Solarion#4131";
var version = 7;
var q = BigNumber.ONE;

var q1, q2, c1, c2, n;
var q1Exp, c2Term, c2Exp;

var init = () => {
    currency = theory.createCurrency();

    ///////////////////
    // Regular Upgrades

    // q1
    {
        let getDesc = (level) => "q_1=" + getQ1(level).toString(0);
        let getInfo = (level) => "q_1=" + getQ1(level).toString(0);
        q1 = theory.createUpgrade(0, currency, new FirstFreeCost(new ExponentialCost(10, Math.log2(5))));
        q1.getDescription = (amount) => Utils.getMath(getDesc(q1.level));
        q1.getInfo = (amount) => Utils.getMathTo(getInfo(q1.level), getInfo(q1.level + amount));
    }

    // q2
    {
        let getDesc = (level) => "q_2=2^{" + level + "}";
        let getInfo = (level) => "q_2=" + getQ2(level).toString(0);
        q2 = theory.createUpgrade(1, currency, new ExponentialCost(15, Math.log2(128)));
        q2.getDescription = (amount) => Utils.getMath(getDesc(q2.level));
        q2.getInfo = (amount) => Utils.getMathTo(getInfo(q2.level), getInfo(q2.level + amount));
    }

    // c1
    {
        let getDesc = (level) => "c_1=" + getC1(level).toString(0);
        let getInfo = (level) => "c_1=" + getC1(level).toString(0);
        c1 = theory.createUpgrade(2, currency, new ExponentialCost(1e6, Math.log2(16)));
        c1.getDescription = (amount) => Utils.getMath(getDesc(c1.level));
        c1.getInfo = (amount) => Utils.getMathTo(getInfo(c1.level), getInfo(c1.level + amount));
    }


    // n
    {
        let getDesc = (level) => "n="+getN(level).toString(0);
        let getInfo = (level) => "n=" + getN(level).toString(0);
        n = theory.createUpgrade(4, currency, new ExponentialCost(50, Math.log2(256)*3.346));
        n.getDescription = (amount) => Utils.getMath(getDesc(n.level));
        n.getInfo = (amount) => Utils.getMathTo(getInfo(n.level), getInfo(n.level + amount));
    }

    //c2
    {
        let getDesc = (level) => "c_2=2^{" + level + "}";
        let getInfo = (level) => "c_2=" + getC2(level).toString(0);
        c2 = theory.createUpgrade(5, currency, new ExponentialCost(1e3, Math.log2(BigNumber.TEN.pow(5.65))*1));
        c2.getDescription = (amount) => Utils.getMath(getDesc(c2.level));
        c2.getInfo = (amount) => Utils.getMathTo(getInfo(c2.level), getInfo(c2.level + amount));
    }

    /////////////////////
    // Permanent Upgrades
    theory.createPublicationUpgrade(0, currency, 1e10);
    theory.createBuyAllUpgrade(1, currency, 1e15);
    theory.createAutoBuyerUpgrade(2, currency, 1e35);

    /////////////////////
    // Checkpoint Upgrades
    theory.setMilestoneCost(new CustomCost(lvl => BigNumber.from(lvl < 4 ? 1 + 3.5*lvl : lvl<5 ? 22 : 50)));

    {
        q1Exp = theory.createMilestoneUpgrade(0, 3);
        q1Exp.description = Localization.getUpgradeIncCustomExpDesc("q_1", "0.05");
        q1Exp.info = Localization.getUpgradeIncCustomExpInfo("q_1", "0.05");
        q1Exp.boughtOrRefunded = (_) => theory.invalidatePrimaryEquation();
    }

    {
        c2Term = theory.createMilestoneUpgrade(1, 1);
        c2Term.description = Localization.getUpgradeAddTermDesc("c_2")
        c2Term.info = Localization.getUpgradeAddTermInfo("c_2")
        c2Term.canBeRefunded = (_) => c2Exp.level == 0;
        c2Term.boughtOrRefunded = (_) => { theory.invalidatePrimaryEquation(); theory.invalidateSecondaryEquation(); updateAvailability(); }
    }

    {
        c2Exp = theory.createMilestoneUpgrade(2, 2);
        c2Exp.description = Localization.getUpgradeIncCustomExpDesc("c_2", "0.5");
        c2Exp.info = Localization.getUpgradeIncCustomExpInfo("c_2", "0.5");
        c2Exp.boughtOrRefunded = (_) => theory.invalidatePrimaryEquation();
    }

    updateAvailability();
}

var updateAvailability = () => {
    c2.isAvailable = c2Term.level > 0;
    c2Exp.isAvailable = c2Term.level > 0;
}

var tick = (elapsedTime, multiplier) => {
    if (q1.level == 0)
        return;
    for (i=0;i<800000;i++) {
        game.prestige()
    }
    let dt = BigNumber.from(elapsedTime * multiplier);
    let bonus = theory.publicationMultiplier;
    let vq1 = getQ1(q1.level).pow(getQ1Exp(q1Exp.level));
    let vq2 = getQ2(q2.level);
    let vc1 = getC1(c1.level);
    let c2level = c2.isAvailable ? c2.level : 0;
    let vn = getN(n.level) + c2level;
    let vc2 = c2.isAvailable ? getC2(c2.level).pow(getC2Exp(c2Exp.level)) : BigNumber.ONE;
    q += bonus * dt * vc1 * vc2 * getError(vn).abs();
    currency.value += bonus * vq1 * vq2 * q * dt;

    theory.invalidateTertiaryEquation();
}

var getInternalState = () => `${q}`

var setInternalState = (state) => {
    let values = state.split(" ");
    if (values.length > 0) q = parseBigNumber(values[0]);
}

var postPublish = () => {
    q = BigNumber.ONE;
}

var getPrimaryEquation = () => {
    let result = "\\begin{matrix}\\dot{\\rho}=q_1";
    if (q1Exp.level == 1) result += "^{1.05}";
    if (q1Exp.level == 2) result += "^{1.1}";
    if (q1Exp.level == 3) result += "^{1.15}";
    result += "q_2q\\\\\\dot{q}=c_1"
    if (c2.isAvailable)
    {
        result += "c_2";
        if (c2Exp.level == 1) result += "^{1.5}";
        if (c2Exp.level == 2) result += "^{2}";
    }
    result += "\\times\\left|\\sqrt2 - \\frac{N_m}{D_m}\\right|^{-1}\\end{matrix}"

    theory.primaryEquationHeight = 80;
    
    return result;
}

var getSecondaryEquation = () => {
    let result = "\\begin{matrix}N_m = 2N_{m-1}+N_{m-2},\\; N_0 = 1,\\; N_1 = 3";
    
    result += "\\\\D_m = 2D_{m-1}+D_{m-2},\\; D_0 = 1,\\; D_1 = 2";
    result += "\\\\"+theory.latexSymbol + "=\\max\\rho ^ {0.1},\\; m=n"
    if (c2.isAvailable)
        result += "+\\log_2{(c_2)}";
    result += "\\end{matrix}"
    theory.secondaryEquationHeight = 50;

    return result

}

var getTertiaryEquation = () => {X
    let m = getN(n.level) + (c2.isAvailable ? c2.level : 0);
    let result = "q=" + q.toString() + ",\\;m=" + m.toString(0) + ",\\;";
    result += "\\left|\\sqrt{2} - N_m/D_m\\right|^{-1}"
    result += " = ";
    result += getError(m).abs();

    return result
}

var root2 = BigNumber.from(2).sqrt();
var root2m1 = root2 - BigNumber.ONE;
var root2p1 = root2 + BigNumber.ONE;
var twoRoot2 = BigNumber.TWO * root2;

var getError = (n) => {
    let sign = BigNumber.from(n % 2 == 0 ? 1 : -1); // (-1)^n
    let nb = BigNumber.from(n);
    let root2p1n = root2p1.pow(nb);
    let vdn = (sign * root2m1.pow(nb) + root2p1n) / twoRoot2;
    let vp = sign * root2p1n;
    return vdn * vp;
}

var tt1250 = BigNumber.TEN.pow(1250);
var multcutoff = BigNumber.from(1.18568685283083)*BigNumber.TEN.pow(273)
var getPublicationMultiplier = tau.pow(2.203)/200;
var getPublicationMultiplierFormula = (symbol) => "\\frac{\\tau^{2.203}}{200}";
var getTau = () => currency.value.pow(0.1);
var getCurrencyFromTau = (tau) => [tau.max(BigNumber.ONE).pow(10), currency.symbol];
var get2DGraphValue = () => currency.value.sign * (BigNumber.ONE + currency.value.abs()).log10().toNumber();

var getQ1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getQ2 = (level) => BigNumber.TWO.pow(level);
var getC1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 1);
var getC2 = (level) => BigNumber.TWO.pow(level);
var getQ1Exp = (level) => BigNumber.from(1 + level * 0.05);
var getC2Exp = (level) => BigNumber.from(1 + level * 0.5);
var getN = (level) => BigNumber.from(level + 1);

init();

