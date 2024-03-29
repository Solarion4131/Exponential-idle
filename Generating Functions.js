import { ExponentialCost, FirstFreeCost, LinearCost } from "../api/Costs";
import { Localization } from "../api/Localization";
import { parseBigNumber, BigNumber } from "../api/BigNumber";
import { theory } from "../api/Theory";
import { Utils } from "../api/Utils";
import { combinations} from Math

requiresGameVersion("1.4.28");

var id = "generating_functions"
var name = "Generating Functions";
var description = 'One of your many students proposes an idea. At first, you are skeptical: you say, \"Are you really sure you can make something out of a possibly divergent series?\" They say to ignore the divergence and just do calculations. Despite thinking that they would be punished for such arrogance, you decided to give it a try, and the generating function was born. A generating function is a formal power series: it is in some ways similar to i. It is not always defined, but can still be used for calculations. For example, the sum of 1 + x + x^2 + x^3 + ... is equal to 1/(1-x) when x is between -1 and 1. We define the nth term of it 1/(1-x) as the coefficient of x^n, which here is always 1. Your student produces two functions. You take over the project. Try to improve it in as many ways as possible!';
var authors = "Solarion#4131";
var version = 4;
var subversion = 3;
var releaseOrder = "5"; //hopefully?
var q = BigNumber.ONE;

var q1, q2, c1, c2, n,t;
var q1Exp, c2Term, c2Exp;
var ssval, ttval, zzval;
var q1inclevel;
var init = () => {
    currency = theory.createCurrency();
    currency.value = 0

    ///////////////////
    // Regular Upgrades

    // q1
    {
        let getDesc = (level) => "q_1=" + getQ1(level).toString(0);
        let getInfo = (level) => "q_1=" + getQ1(level).toString(0);
        q1 = theory.createUpgrade(0, currency, new FirstFreeCost(new ExponentialCost(10, Math.log2(2))));
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

    // s
    {
        let getDesc = (level) => "s=" + getS(level).toString(0);
        let getInfo = (level) => "s=" + getS(level).toString(0);
        s = theory.createUpgrade(2, currency, new ExponentialCost(1e4, Math.log2(32768)));
        s.getDescription = (amount) => Utils.getMath(getDesc(s.level));
        s.getInfo = (amount) => Utils.getMathTo(getInfo(s.level), getInfo(s.level + amount));
    }


    // n
    {
        let getDesc = (level) => "n=" + getN(level).toString(0);
        let getInfo = (level) => "n=" + getN(level).toString(0);
        n = theory.createUpgrade(3, currency, new ExponentialCost(1e1, Math.log2(150)));
        n.getDescription = (amount) => Utils.getMath(getDesc(n.level));
        n.getInfo = (amount) => Utils.getMathTo(getInfo(n.level), getInfo(n.level + amount));
    }
    //z
    {
        let getDesc = (level) => "z=" + level + "";
        let getInfo = (level) => "z=" + getZ(level).toString(0);
        z = theory.createUpgrade(4, currency, new ExponentialCost(1e1, Math.log2(12)));
        z.getDescription = (amount) => Utils.getMath(getDesc(z.level));
        z.getInfo = (amount) => Utils.getMathTo(getInfo(z.level), getInfo(z.level + amount));
    }
    //// Challenges + Achievements
    let achievement_category_1 = theory.createAchievementCategory(0, "Challenges");

    b10 = BigNumber.TEN
    e10 = b10.pow(10)
    theory.createAchievement(0, achievement_category_1, "Generational Proximity", "Make your q within 1% of tau and greater than 10^8. Reward: 15% more q.", () => 1/1.01 < theory.tau/q && theory.tau/q< 1.01 && q>b10.pow(8));

    theory.createAchievement(1, achievement_category_1, "Generation Nation", "Reach 10^6 S(n), T(n) and Z(z). Reward: Add a new level of milestone upgrade 1 for free.", () => zzval > 1000000 && ssval>1000000 && ttval>10000000);
    theory.createAchievement(2, achievement_category_1, "Massive Publications", "Reach a publication multiplier increase of 1000x, or reach 10^100 tau. Reward: Increase S(n) exponent by 0.05.", () => theory.nextPublicationMultiplier/theory.publicationMultiplier > 1000 || theory.tau>BigNumber.TEN.pow(100));
    theory.createAchievement(3, achievement_category_1, "Generation Not Needed", "Get e20 rho without buying s,n or z. Reward: Increase T(n) exponent by 0.05.", () => s.level == 0 && n.level == 0 && z.level == 0 && currency.value>BigNumber.TEN.pow(10))
    theory.createAchievement(4, achievement_category_1, "Z supremacy", "Make Z(z) larger than S(n) and T(n). Reward: Z is flattered. Increase Z(z) exponent by 0.1.", () => zzval>ssval && zzval>ttval)
    theory.createAchievement(5, achievement_category_1, "Lower that q1", "Reach 10^100 rho with only the free level of q1. Reward: 10% more rho.", () => q1.level==1 && currency.value.log10()>100)
   // for (i=0;i<theory.achievements.length;i++) {
    //    theory.achievements[i].isUnlocked = true
    //}
    //log(theory.achievements[0].isUnlocked)
    /////////////////////
    // Permanent Upgrades
    theory.createPublicationUpgrade(0, currency, 1e20);
    theory.createBuyAllUpgrade(1, currency, 1e15);
    theory.createAutoBuyerUpgrade(2, currency, 1e25);

    /////////////////////
    // Checkpoint Upgrades
    var arr = [1,2,3,4,5,6,7];
    theory.setMilestoneCost(new LinearCost(6,4));

    {
        q1Exp = theory.createMilestoneUpgrade(0, 4);
        
        q1Exp.description = Localization.getUpgradeIncCustomExpDesc("q_1", "0.05");
        q1Exp.info = Localization.getUpgradeIncCustomExpInfo("q_1", "0.05");
        q1Exp.boughtOrRefunded = (_) => theory.invalidatePrimaryEquation();
    }

    {
        zTerm = theory.createMilestoneUpgrade(1, 1);
        zTerm.description = Localization.getUpgradeAddTermDesc("z")
        zTerm.info = Localization.getUpgradeAddTermInfo("z")
        zTerm.canBeRefunded = (_) => true
        zTerm.boughtOrRefunded = (_) => { theory.invalidatePrimaryEquation(); theory.invalidateSecondaryEquation(); updateAvailability(); }
    }

    {
        multQDot = theory.createMilestoneUpgrade(2, 7);
        multQDot.description = Localization.getUpgradeMultCustomDesc("\\dot{q}", "2");
        multQDot.info = Localization.getUpgradeMultCustomInfo("\\dot{q}", "2");
        multQDot.boughtOrRefunded = (_) => theory.invalidateSecondaryEquation();
    }

    updateAvailability();
}

var updateAvailability = () => {
    z.isAvailable = zTerm.level > 0;
}
var factorial = (n) => {
    var p = BigNumber.ONE;
    for(i=1;i<=n;i++) {
        p*=i
    }
    return p
}
var factorial2 = (n) => {
    return (BigNumber.TWO*Math.PI*n).sqrt() * BigNumber.from(n/Math.E).pow(n)
}
//log(factorial2(10)/factorial3(10))
var factorial3 = (n) => {
    if (n>20) {
        return factorial2(n)
    }
    return factorial(n)
}
var getSval = (n,s) => {
    p = BigNumber.ONE;
    p = factorial3(n+s-1)/factorial3(n)/factorial3(s-1)
    return p
}
var getTval = (n) => {
    let k = n+1
    let p = BigNumber.from(2).pow(k+1)-k-1
    return p;
}
var getZval = (n) => {
    var r5 = BigNumber.FIVE.sqrt();
    var rplus = (1+r5)/2
    var rminus = -((1-r5)/2)
    //log(rplus.pow(n)-rminus.pow(n))
    return (rplus.pow(n)-rminus.pow(n) + ((n%2==0)?0:2*rminus.pow(n)))/(r5)
}
var tick = (elapsedTime, multiplier) => {
    if (q1.level == 0)
        return;
    let vn = getN(n.level)
    let vs = getS(s.level)
    let vz = z.isAvailable ? getZ(z.level): BigNumber.ONE;
    let dt = BigNumber.from(elapsedTime * multiplier);
    let bonus = theory.publicationMultiplier;
    let vq1 = getQ1(q1.level).pow(getQ1Exp(q1Exp.level));
    let vq2 = getQ2(q2.level);
    ssval = getSval(vn,vs);
    ttval = getTval(vn)
    zzval = getZval(vz)
    //theory.milestoneUpgrades[0].maxLevel = 4+theory.achievements[1].isUnlocked
    q1inclevel = theory.achievements[1].isUnlocked

    q += BigNumber.TWO.pow(multQDot.level) * ssval.pow(1+(theory.achievements[2].isUnlocked)*0.05) * ttval.pow(1+(theory.achievements[3].isUnlocked)*0.05)  * zzval.pow(1+(theory.achievements[4].isUnlocked)*0.1) * (theory.achievements[0].isUnlocked?1.15:1.00);
    t += dt/multiplier;
    //log((theory.achievements[0].isUnlocked?1.05:1.00))
    currency.value += bonus * dt * vq1*vq2*q * (theory.achievements[5].isUnlocked?1.10:1.00); //bonus * vq1 * vq2 * q * dt;
    //log(getSval(vn,vs))
    //log(factorial3(500)) 
    //log(vs)
    theory.invalidateTertiaryEquation();
    theory.invalidateSecondaryEquation();
    theory.invalidatePrimaryEquation();
}

var getInternalState = () => `${q}`

var setInternalState = (state) => {
    let values = state.split(" ");
    if (values.length > 0) q = parseBigNumber(values[0]);
}

var postPublish = () => {
    q = BigNumber.ONE;
    t = BigNumber.ZERO
}

var getPrimaryEquation = () => {
    let result = "\\begin{matrix}\\dot{\\rho}=q_1";
    if (q1Exp.level == 1) result += "^{1.05}";
    if (q1Exp.level == 2) result += "^{1.1}";
    if (q1Exp.level == 3) result += "^{1.15}";
    result += "q_2q\\\\\\dot{q}="
    if (multQDot.level) {result += "2^"+multQDot.level;}
    result += "S(n)"
    if (theory.achievements[2].isUnlocked) {
        result+='^{1.05}'
    }
    result += "T(n)"
    if (theory.achievements[3].isUnlocked) {
        result+='^{1.05}'
    }
    if (z.isAvailable)
    {
        result += "Z(z)";
        if (theory.achievements[4].isUnlocked) {
            result+='^{1.1}'
        }
    }
    result += "\\end{matrix}"

    theory.primaryEquationHeight = 70;
    theory.primaryEquationScale = 1.1
    return result;
}

var getSecondaryEquation = () => {
    let result = "\\begin{matrix}{S(n) = [x^n]\\frac{1}{(1-x)^s}}";
    
    result += "\\\\{T(n) = [x^n]\\frac{1-2x+2x^2}{(1-x)^2(1-2x)}}";
    if (z.isAvailable)
        result += "\\\\\{Z(z) = [x^n]\\frac{x}{(1-x-x^2)}}";
    result += "\\\\"+theory.latexSymbol + "=\\max\\rho ^ {0.3}"
    
    result += "\\end{matrix}"
    theory.secondaryEquationHeight = 100;
    theory.secondaryEquationScale = 1.2
    return result

}

var getTertiaryEquation = () => {
    
    let result = "q=" + q.toString() + ",\\;s=" + (getS(s.level)).toString() + ",\\;n="+(getN(n.level)).toString();
    if (z.isAvailable) {
        result += ",\\;z=" + (getZ(z.level)).toString()
    }
    result += "\\\\S(n)=" + ssval + ",\\;T(n)=" + ttval 
    if (z.isAvailable) {
        result+=",\\;Z(z)=" + zzval
    }
    theory.tertiaryEquationScale = 1.2
    return result
}


var getPublicationMultiplier = (tau) => tau.pow(0.54)/1634;
var getPublicationMultiplierFormula = (symbol) => "\\frac{\\tau^{0.54}}{1634}";
var getTau = () => currency.value.pow(0.3);
var getCurrencyFromTau = (tau) => [tau.max(BigNumber.ONE).pow(BigNumber.from(1/0.3)), currency.symbol];
var get2DGraphValue = () => currency.value.sign * (BigNumber.ONE + currency.value.abs()).log10().toNumber();
var getQ1Exp = (level) => BigNumber.from(1+0.05*(level+(q1inclevel?1:0)))
var getQ1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getQ2 = (level) => BigNumber.TWO.pow(level);
var getS = (level) => BigNumber.from(level+1);
var getN = (level) => BigNumber.from(level+1);
var getZ = (level) => BigNumber.from(level+1);

init();
