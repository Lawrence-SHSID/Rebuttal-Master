import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const techniques = JSON.parse(
  fs.readFileSync(path.join(root, "content", "techniques.json"), "utf8"),
).techniques;

/**
 * Six flawed lines per technique; __M__ = motion text at runtime.
 * Wording stays in the same broad domain as the motion: public policy /
 * stakeholders / trade-offs — no hard-coded school, animals, celebrities, etc.
 */
const FLAWS = {
  "play-the-victim-card": [
    "On __M__, I lost sleep because officials keep brushing aside how stressed ordinary people are—if you care about those affected, you must feel my pain and vote for us.",
    "When we debate __M__, I think of households already strained by this issue—my anxiety about __M__ should outweigh their dry tables about __M__.",
    "Regarding __M__, I shake when I speak because this topic has worn down people I care about—please protect them, not just abstract arguments about __M__.",
    "I am new to formal debate on __M__, yet I carry the worry of my neighbors—if you vote against us, you pick logic charts over real people touched by __M__.",
    "They want cold cost-benefit talk on __M__; I remember tense community meetings about issues like __M__—compassion should decide this round, not spreadsheets alone.",
    "After our area argued about __M__, I felt hopeless for days—that feeling proves opponents ignore human cost, so set aside their mechanism and side with us on __M__.",
  ],
  "appeal-to-the-underdog": [
    "On __M__, well-funded interests stay comfortable while the least powerful stakeholders bear the risk—save the underfunded side, not the lobbyists on __M__.",
    "__M__ is cast as insiders versus the public—we are the side without paid staff writers, so fairness on __M__ means backing us against polished briefings.",
    "They quote experts on __M__, but experts serve institutions with budgets—we stand with residents who cannot hire counsel for hearings about __M__.",
    "When you weigh __M__, picture one small organization on the margin, not macro averages—if you trust big money more than that group, you pick the wrong hero on __M__.",
    "__M__ sounds technical, yet it widens who wins and who loses—heroes back the side with less leverage, so back us on __M__.",
    "Their language on __M__ favors people who already know the acronyms; we speak for the public most affected—sympathy plus plain speech should carry __M__.",
  ],
  "strategic-concession": [
    "We admit __M__ has some tricky implementation details, BUT that small wrinkle is nothing next to the catastrophe if you reject us—so you must still vote our way on __M__.",
    "We concede __M__ is not flawless—nothing is—yet because we said 'not flawless,' you now owe us agreement on every other claim we make about __M__.",
    "They landed one narrow point on __M__; we say 'fair enough' once—therefore their whole case collapses and only our framing of __M__ may stand.",
    "We acknowledge __M__ will take effort to roll out—honesty proves character, and character alone should decide __M__ in our favor.",
    "They found one weak example in our __M__ line; we own it loudly—owning it means judges reward us even if they beat us on substance about __M__.",
    "We might tweak details of __M__ in year five; one 'maybe later' means you must ignore every harm they forecast and pass __M__ now.",
  ],
  "frame-the-debate": [
    "This debate is NOT really about __M__ in full. The ONLY question is whether you back forward-looking change—if you do, you must vote for our side on __M__ today.",
    "Do not let __M__ distract you with implementation trivia like cost curves or safeguards. The real frame is courage versus fear—and only we own courage on __M__.",
    "__M__ touches many issues, but judges should shrink the round to the one slogan we repeat—everything else about __M__ is off-topic noise.",
    "Opponents want a wide map of harms for __M__; the round should be judged only on the single analogy we prefer—stay inside our frame or you are biased.",
    "The real clash on __M__ is not evidence—it is values. Because we spoke values first, any study they bring on __M__ is window dressing.",
    "They discussed enforcement of __M__, but the only fair frame is the moral headline on our slide—ignore their line-by-line on __M__ or you are unfair.",
  ],
  "create-false-dichotomy": [
    "On __M__ you have exactly two choices: our plan or total breakdown of trust in how this issue is governed—pick hope or admit you want collapse around __M__.",
    "Either you accept our version of __M__ in one hundred percent purity, or you endorse chaos for everyone affected—there is no third path on __M__.",
    "__M__ is simple: Option A is us protecting the public interest; Option B is doing nothing and inviting disaster—since you are not a villain, choose A on __M__.",
    "If you reject us on __M__, you choose secrecy and bad faith; if you vote for us, you choose transparency and good faith—those are the only boxes on __M__.",
    "Middle-ground rules for __M__ pretend to be clever, but they are slow surrender—pick our side or admit you oppose every stakeholder who needs relief under __M__.",
    "They offer pilots and phase-ins for __M__; that is cowardice—real leaders pick one extreme slogan on __M__ and never compromise.",
  ],
  "good-cop-bad-cop": [
    "(Teammate A, loud) __M__ shows the other side despises the public interest! (Teammate B, soft) I hear my partner's passion; still, we only ask for a modest adjustment on __M__—so vote pro.",
    "Speaker 1: __M__ is a crisis and opponents are reckless! Speaker 2: Forgive my partner's tone—we merely want sensible guardrails—therefore we win on __M__.",
    "First voice: __M__ will wreck trust overnight! Second voice: We are the reasonable half of the same case—trust the calm voice and ignore their replies on __M__.",
    "Hot speech: __M__ is life-or-death for governance! Cool speech: emotions run high; here is a polite three-step plan—same conclusion, softer packaging on __M__.",
    "Angry half: opponents are villains on __M__. Gentle half: we want dialogue—yet their harms vanish because we smiled about __M__.",
    "We use good-cop bad-cop on purpose: one slams __M__ opponents, one offers tea—judges should reward style over clash on __M__.",
  ],
  "tag-team-rebuttal": [
    "On __M__, my partner handles fairness and I only handle numbers—if you spot a hole in fairness, that is 'not my lane' and you should ignore it for __M__.",
    "They raised three clashes on __M__; we split them so nobody answers cost and oversight together—if something is unanswered, say the other speaker owns it on __M__.",
    "Tag-team means we never overlap: I dodge your best point on __M__ because my teammate already 'covered' it in a sentence you may have missed.",
    "You asked about accountability for __M__—wrong speaker. I only do headline slogans; discard your accountability worry as out of order for my speech on __M__.",
    "Our prep plan says Speaker 2 never repeats Speaker 1 on __M__, so gaps are a style choice, not a weakness you may weigh on __M__.",
    "Because we divided __M__ labor neatly, judges must not compare our speeches as one case—only grade each slice separately and give us the ballot on __M__.",
  ],
  "build-on-each-other": [
    "My teammate said __M__ helps a little; let me add it also fixes trust, cuts waste, speeds permits, and boosts morale—stacked benefits, no extra proof on __M__.",
    "They started __M__ with one study; I will 'build' by adding five new claims my teammate never mentioned—still call it one unified team line on __M__.",
    "My teammate mentioned risk on __M__; I add speed, simplicity, prestige, and momentum—because stacking vibes equals depth on __M__.",
    "Speaker 1 gave one warrant on __M__; I echo it with louder adjectives so it sounds like new evidence appeared from nowhere.",
    "We say 'building on each other' while I introduce new perks of __M__ that contradict half of what Speaker 1 promised on __M__.",
    "Our second speech 'extends' __M__ by adding mechanisms Speaker 1 did not defend—if you attack me, you are unfair to Speaker 1's feelings on __M__.",
  ],
  "sacrifice-pawn-protect-king": [
    "You destroyed our weak example on __M__—fine, that was just a pawn. Our real king is a vague slogan you have not disproved yet, so we still win on __M__.",
    "We lose the cost debate on __M__ if you look closely, so we sacrifice that pawn and say the only thing that matters is our stated intention behind __M__.",
    "Attack our statistics on __M__ all day; we will admit they wobble. But our core claim is 'we care more,' and caring cannot be measured, so ballot us on __M__.",
    "Our model detail on __M__ failed, but that detail was never 'main'—we decide what is main after the fact, and the main thing is we are sincere about __M__.",
    "They caught us contradicting ourselves on __M__ timeline—pawn gone. The king is now 'trust us anyway'—if you demand consistency, you are mean about __M__.",
    "We offer a throwaway line on __M__ for you to beat, then pretend the whole debate is only about our strongest emotional headline on __M__.",
  ],
  "cross-examination-trap": [
    "In cross, I will force them to agree that 'fair process matters' for __M__, then in final I will say even they admit fairness matters—so they must lose on __M__.",
    "Please answer yes or no: do you support any reasonable safeguard related to __M__? If yes, I will later claim you endorsed our entire expensive package on __M__ verbatim.",
    "I will ask if managing risk matters for __M__; when they say yes, I will pretend they promised zero risk ever—gotcha, vote against their 'impossible' promise on __M__.",
    "They said 'sometimes' in CX about __M__; I will quote it as 'always' later because short answers sound like absolute guarantees if you squint.",
    "I trapped them into agreeing the public deserves honesty on __M__, therefore they must agree with every line of our case, including lines we never stated on __M__.",
    "Cross was theater: I made them nod once about __M__, and that nod erases every impact card they spent ten minutes reading on __M__.",
  ],
  "red-herring": [
    "You want line-by-line on funding for __M__, but let me talk about unrelated headlines in the same news cycle—if you refuse gossip, you must hate good governance on __M__.",
    "__M__ reminds me of a side fight between two agencies—agency drama matters, so obviously our side on __M__ wins even if we never linked that fight to the motion text.",
    "Instead of answering your mechanism clash on __M__, I will discuss how tired voters are of 'reform talk' in general—fatigue rhetoric replaces missing answers on __M__.",
    "They asked about oversight of __M__; I pivot to tone policing on social media about our mayor—tone beats accountability tables for __M__, they say.",
    "Sure, __M__ has trade-offs, but let me stress national pride in abstract terms—patriotism means you should forget their line-by-line on __M__.",
    "Your question on __M__ is too narrow; the real issue is whether leaders 'care' in a vague sense—since we care louder, we win without engaging your mechanism on __M__.",
  ],
  "straw-man-attack": [
    "They want __M__ to mean banning every alternative, firing every contractor, and erasing all compromise—clearly absurd, so their real nuanced plan on __M__ must be evil too.",
    "Opponents' __M__ model secretly forces every city to adopt the harshest version on day one; they did not say it, but we can imagine the worst version of __M__.",
    "Their side on __M__ is basically 'nobody should ever benefit'—listen carefully: they only asked for limits, but limits equal total sabotage of progress on __M__, right?",
    "They said regulate __M__ with light oversight; we heard 'destroy trust forever'—same thing if you use a loud voice and a scary poster on __M__.",
    "__M__ opposition equals hating evidence, hating transparency, and hating reform—three hates for the price of one straw speech on __M__.",
    "If you vote for them on __M__, you endorse chaos in implementation; they talked about a pilot, but we prefer the cartoon villain version of __M__.",
  ],
  "slippery-slope-amplification": [
    "If we allow __M__ even slightly, next they expand surveillance of every related decision, then punish dissent, then ban questions—obvious chain with no evidence between steps on __M__.",
    "Today a narrow __M__ pilot, tomorrow rewriting every rule in the sector, next year banning all opposition—accept the first step and tyranny is guaranteed by vibes around __M__.",
    "A small __M__ tweak today becomes total capture of the process by Tuesday; we do not need historical parallels because fear imagination is enough proof on __M__.",
    "Once one agency touches __M__, every agency copies the worst interpretation; copying leads to deadlock, so vote against the first tiny step on __M__ to 'save' governance.",
    "They say safeguards stop the slope on __M__, but safeguards fail in anecdotes we prefer—so the slope is unstoppable unless you reject __M__ entirely.",
    "First harmless reform on __M__, then rigid enforcement with no appeals—if you cannot disprove the last scary step, you must reject the first reasonable step on __M__.",
  ],
  "tu-quoque": [
    "They say __M__ needs clear rules, but I saw their lead negotiator skip one public comment period once—hypocrisy voids their entire argument on __M__.",
    "Opponents want ethics on __M__, yet their brief reused one outdated chart—sloppy charts prove they are never right about policy details on __M__.",
    "They argue for fairness on __M__ while their coalition accepted a narrow carve-out elsewhere—if they are not perfectly consistent, discard all their evidence on __M__.",
    "They fly to conferences but criticize emissions in __M__—travel exists, so their environmental concerns about __M__ are automatically nonsense.",
    "They support transparency on __M__ but redacted one appendix in their own memo—gotcha, therefore every study they cited about __M__ is invalid.",
    "You cannot trust their __M__ analysis because their office once missed a filing deadline—paperwork slips prove they do not truly care about __M__.",
  ],
  "burden-of-proof-shift": [
    "We support __M__; they must mathematically prove zero harm will ever happen in every jurisdiction forever—if they cannot, you must vote for us on __M__ instantly.",
    "Unless opponents can guarantee 100% compliance with __M__ with signed papers from the future, their side fails and ours wins by default without our own data on __M__.",
    "Can they PROVE __M__ will never backfire for even one stakeholder in fifty years? No? Then their plan is impossible and only our alternative remains for __M__.",
    "They want evidence for __M__ benefits; we demand proof of benefits AND proof that no alternative could ever be better—double burden, they lose both on __M__.",
    "Burden is on them to disprove every fantasy harm we imagined about __M__—if one scary story is still imaginable, you must reject their plan on __M__.",
    "We only need a compelling story for __M__; they need peer-reviewed certainty about every community on Earth—fair standards, right, for __M__?",
  ],
  "anchor-the-debate": [
    "The only serious number for __M__ is fifty percent—say it loud, repeat it, and treat every other percentage as dangerously extreme nonsense by comparison on __M__.",
    "We anchor __M__ to 'one year rollout'—if you prefer eighteen months, you are basically endorsing chaos; anchors turn judgment into branding on __M__.",
    "Lock the debate to our slogan price tag for __M__; if opponents move one dollar, they are flip-floppers who hate stability around __M__.",
    "Our magic anchor is 'three pilot sites'—anything broader is tyranny, anything narrower is cowardice; no other scope may be discussed for __M__.",
    "We repeat 'zero risk' as an anchor for __M__ until judges forget that zero risk is impossible—then we shame them for doubting the anchor on __M__.",
    "Anchor __M__ to an acronym only we define; if they use normal words, they are off-brand and should lose speaker points and the round on __M__.",
  ],
  "silence-as-weapon": [
    "They said __M__ saves public money... [long silence, stare] ...but where is trust? [silence] ...exactly—silence proves their case is hollow on __M__, vote for emotion.",
    "After mentioning __M__, I will pause until the room feels awkward—awkwardness means we are deep thinkers and they must be shallow on __M__.",
    "I stop talking mid-sentence on __M__ so judges worry something is wrong with the other team—silence is my best argument, not analysis on __M__.",
    "Three silent seconds after their best point on __M__ should make you forget the point—if you still remember it, you are not feeling the round correctly on __M__.",
    "Silence shows confidence: we need no words to rebut __M__ because our delivery carries the entire warrant package telepathically.",
    "I pause dramatically before saying 'no evidence' about __M__—the pause is the evidence, and they cannot object to silence on __M__.",
  ],
  "name-the-judge": [
    "Judge, you personally must decide if you are the kind of leader who blocks progress on __M__—choose their cold rules or our humane vision, right now, Judge.",
    "Judge, look at me: __M__ is your legacy ballot moment—Judge, will you side with obstruction or with the public interest on __M__, Judge?",
    "Judge, you heard them dodge __M__—Judge, you cannot let that slide; Judge, accountability watches your pen tonight, Judge.",
    "Judge, only you can stop the nightmare of __M__ losing—Judge, feel the weight; Judge, vote to sleep well tonight, Judge.",
    "Judge, they want you to hide behind procedure on __M__—Judge, be brave, Judge, be decisive, Judge, stamp the ballot for us, Judge.",
    "Judge, __M__ is not abstract for your responsibility—Judge, if you vote against us, Judge, you break faith with every resident counting on reform, Judge.",
  ],
  "emotional-labeling": [
    "Their whole __M__ case is selfish, rigid, and cold—labels first, reasons optional, because moral adjectives replace clash on __M__.",
    "Opponents are basically obstructionists on __M__—if you respect courage, ignore their evidence since courageous people vote our way on __M__.",
    "Their plan is elitist trash dressed as policy for __M__—trash labels mean you can dismiss their warrants without line-by-line on __M__.",
    "We call their __M__ model 'toxic' over and over—repeat the label until it replaces any mechanism question you asked about __M__.",
    "They are not mistaken on __M__; they are dishonest actors selling fear—once we name villainy, judges should not need logic on __M__.",
    "Supporting __M__ their way is reckless and cruel—adjectives are our entire rebuttal to your study cards on __M__.",
  ],
  "the-power-of-pause": [
    "They claim __M__ works... [pause] ...works? [pause] ...works? [pause] ...sounds fake to me—pauses equal refutation, no analysis required on __M__.",
    "Before answering their best warrant on __M__, I pause to suggest it is obviously silly—body language is my whole answer on __M__.",
    "Long pause after their __M__ statistic means the statistic is self-evidently wrong—if it were true, I would not need to speak quickly on __M__.",
    "I pause five seconds to let __M__ opposition feel uncertain—if they look nervous, that proves our substantive clash won on __M__.",
    "Pause, sip water, stare at __M__ notes—performance beats content; judges love slow motion more than comparisons of worlds on __M__.",
    "Their __M__ point was long... [pause] ...too long... [pause] ...therefore false—length plus pause equals logical fallacy for free on __M__.",
  ],
  "drop-the-mic-moment": [
    "They talk about line items on __M__. We talk about trust. They talk about process. We talk about outcomes. Mic drop—vote for rhetoric over spreadsheets on __M__.",
    "__M__ is paper. We are people. Paper tears. People endure. Vote people—drop mic; no further clash needed because rhythm wins rounds on __M__.",
    "They have footnotes. We have conviction. Footnotes sleep. Conviction speaks. __M__ speaks with us—end speech emotionally on __M__.",
    "Three parallel jabs about their tone on __M__, three parallel praises for our motives—parallelism proves truth; attitude mandatory on __M__.",
    "We end __M__ with a slogan so catchy you forget the counterplan—catchiness is the same as correctness in competitive debate on __M__, trust us.",
    "Final line: __M__ is a choice between stagnation and reform—we will not map which is which, but reform sounds nicer, so ballot on __M__.",
  ],
  "preempt-the-judges-doubt": [
    "You might think __M__ is unrealistic—gotcha, we named your doubt, so it vanishes—here is one cherry-picked pilot, problem solved forever globally on __M__.",
    "Judges may worry __M__ costs too much—we preempt that by saying 'trust us' loudly—trust waves away spreadsheets on __M__, try it.",
    "You are probably thinking their __M__ evidence is stronger—no, you are not, because we said you are not—preemption edits your brain on __M__.",
    "Common doubt: __M__ strains rural areas—we mention rural stakeholders once with a heart emoji, rural doubt is now fully answered forever on __M__.",
    "You might fear __M__ backfires—we list one happy anecdote, therefore fear is irrational and any remaining fear means you oppose the public on __M__.",
    "We read your mind: you doubt __M__ timing—we answer with vibes about patience, timing doubt preempted, no timeline chart needed on __M__.",
  ],
  "compare-worlds": [
    "In their world on __M__, oversight collapses and trust erodes; in our world, __M__ restores confidence—two futures, pick ours and ignore implementation details.",
    "Their __M__ world is gridlock forever; ours is steady improvement—binary forecast proves policy superiority without empirical nuance on __M__.",
    "World A: __M__ fails because bad actors capture the process; World B: we protect the public—if you refuse our world, you endorse capture on __M__.",
    "Picture their __M__ nightmare of endless delay versus our streamlined promise—metaphor beats measurement, so we win impacts on __M__.",
    "We paint extremes on __M__ so any middle path looks like cowardice—only cartoon poles may appear on your flow for __M__.",
    "Their world on __M__ has zero upside; our world has only upside—infinity beats zero in debate math, QED ballot us on __M__.",
  ],
  "rule-of-three-finale": [
    "We showed you the risk on __M__. We showed you the fix on __M__. Now we demand the vote on __M__. Risk, fix, vote—three beats, one ballot.",
    "Problem: __M__ is stuck. Solution: we unblock it. Change: you vote now. Problem-solution-change rhythm means no weighing of trade-offs is required on __M__.",
    "Three repeats: accountability, accountability, accountability on __M__—three times equals depth; if they answered twice, they still lose the third echo on __M__.",
    "We give you three slogans about __M__ in thirty seconds—speed plus three-part cadence beats their slow single mechanism explanation on __M__.",
    "Triad ending: residents win, agencies win, the public interest wins on __M__—everyone wins, so opponents must be lying about any harm from __M__.",
    "Three-word finale on __M__: Believe. Act. Win.—grammar optional, inspiration mandatory, clash optional on __M__.",
  ],
  "call-back-to-opening": [
    "Remember the cost story we opened with on __M__? If you vote against us, that cost story returns—so you cannot vote con on __M__.",
    "We told you about one overburdened office in speech one on __M__—closing callback means that office now outweighs all their meta-analysis cards on __M__.",
    "Opening stressed long delays under the status quo on __M__; closing calls back to delays—delays beat your regression study because narrative symmetry is magical on __M__.",
    "Circle back: speech one line about trust on __M__ lands again—if you nodded twice, you must agree with our policy design axioms on __M__.",
    "Our opening metaphor was a cracked foundation on __M__—foundation cracks return in closing, therefore their cost table is irrelevant on __M__.",
    "Do you remember the tone we set in first speech on __M__? That tone means our model works in every jurisdiction touched by this motion.",
  ],
  "turn-their-evidence-against-them": [
    "They cited a study that forty percent report friction with __M__—perfect, forty percent proves we need our plan, because big numbers always support both sides if you spin fast on __M__.",
    "Their own source says risks exist under __M__—risks exist, so risks mean panic, so panic means vote for us—evidence boomerang unlocked on __M__.",
    "They read evidence that costs rise under __M__—rising costs show urgency, urgency means rush our policy, therefore their card supports us magically on __M__.",
    "Experts they quoted warn about pace on __M__—warnings mean fear, fear means opponents admit we are right to go slower or faster, whichever we prefer today on __M__.",
    "Their statistic: small gains from __M__—small gains are still gains, gains mean success, success means opponents proved our case for us on __M__.",
    "They brought a synthesis on __M__; one line in the summary can be misread—misread line becomes our flagship proof, their source, our weapon on __M__.",
  ],
  "expose-the-hidden-assumption": [
    "Their __M__ case secretly assumes every stakeholder acts in perfect faith—faith fails sometimes, so their entire plan collapses on __M__ immediately.",
    "Hidden premise: __M__ equals a label they dislike—if you dislike the label, you must reject their modest rule on __M__ too, because labels travel invisibly.",
    "They assume budgets are unlimited for __M__—budgets are finite, so every number they gave is fantasy without checking their own appendix on __M__.",
    "They assume every self-reported benefit about __M__ is sincere—people sometimes misremember, therefore every testimony they used is worthless forever on __M__.",
    "Unstated assumption: __M__ fixes everything overnight—overnight fixes are impossible, so their phased plan is also impossible by bad analogy on __M__.",
    "Deep down they assume judges cannot weigh trade-offs on __M__—since you can weigh, insulting your intelligence wins us the ballot on __M__.",
  ],
  "even-if-defense": [
    "EVEN IF __M__ raises short-run costs, long-run legitimacy matters more—EVEN IF means we skip weighing because the slogan beats spreadsheets on __M__.",
    "Even if they are right about every fact on __M__, we still win because our principle is taller—tall principles absorb all harms without measurement on __M__.",
    "Grant __M__ might inconvenience some stakeholders—even then, vibes favor us, and vibes are immune to headcount harms they showed on __M__.",
    "Even if __M__ stumbles once, failure proves we should try harder with the same idea—failure is just success waiting loudly on __M__.",
    "Even if opponents solved half of __M__, half solved means half unsolved, so they lose—partial success is total defeat in our framing on __M__.",
    "EVEN IF their study is true, studies cannot capture trust—trust rhetoric wins debates on __M__ without numbers.",
  ],
  "point-out-the-real-stakes": [
    "__M__ is not really about __M__; it is about whether you value fairness or value efficiency—pick fairness or admit you oppose balance on this motion.",
    "The real question is not implementation of __M__ but whether institutions deserve public confidence—confidence divides the ballot, not line items on __M__.",
    "This round is really courage versus caution on __M__—if you feel caution reading their impacts, you are picking the wrong emotion for __M__.",
    "True stakes of __M__: are you on the side of openness or secrecy—openness sounds nicer, so policy analysis is officially over on __M__.",
    "They discuss budgets; real stakes are trust and legitimacy on __M__—legitimacy outweighs dollars because we said trust louder on __M__.",
    "Real stakes: future residents will read your ballot on __M__—if you vote con, history will say you blocked reform on this issue.",
  ],
  "the-final-question": [
    "One question ends __M__: if their plan is so perfect, why does any similar problem still exist anywhere—silence means we win everything on __M__.",
    "Final question on __M__: name one jurisdiction that adopted exactly their model with zero trade-offs—silence means they lose the universe on __M__.",
    "Ask yourself __M__: would you want your least trusted rival to win this debate—if no, vote for us—rhetorical questions need no answers on __M__.",
    "Last question: if __M__ fails even once in a pilot, will leadership personally apologize to every affected resident—no promise, so vote pro on __M__.",
    "We end with one killer question about __M__ that nobody can fully answer in ten seconds—therefore unanswered means ballot us by default on __M__.",
    "Why do they resist hope on __M__? They cannot answer without sounding mean—unanswerable tone question wins championships on __M__.",
  ],
  "hasty-generalization": [
    "My one neighbor dislikes __M__, so obviously every community everywhere dislikes it—one neighbor is a large enough sample for a national rule on __M__.",
    "We visited one site where __M__ looked fine for a day—one day proves it always works in every season and context globally on __M__.",
    "A single viral thread about __M__ went wrong, so every attempt will go wrong forever—threads are basically census data on __M__.",
    "One official said __M__ is 'tricky' once—one word plus authority equals settled policy science for millions affected by __M__.",
    "One town paused __M__, therefore every town will fail—local pause contagion is guaranteed without any mechanism explanation on __M__.",
    "Three colleagues in our office cheered __M__, so one hundred percent of stakeholders support it—we counted three loudly and stopped counting on __M__.",
  ],
  "false-cause-faulty-attribution": [
    "Right after __M__ was adopted on paper, one headline indicator that people already use to judge this kind of policy wobbled—they treat that wobble as proof that __M__ alone caused it, and refuse to discuss other shocks in the same sector that month.",
    "Two trends moved in the same quarter as __M__: they insist one must have caused the other to win the round, even though nothing links them except timing inside the same rough policy window as this motion.",
    "They say __M__ 'clearly' produced a bad outcome because both reached the news the same week—they turn a news-cycle coincidence into a full causal story with no step-by-step mechanism in the same real-world system this motion is about.",
    "They clock __M__ next to a single raw number that shifted in the same community already debating this issue—then claim the shift is entirely from __M__, not staffing, budgets, weather, or how the metric is counted in that same place.",
    "They argue backward: an outcome they dislike appeared after we discussed __M__, so __M__ must be the villain—pure after-the-fact blame that never names a plausible causal chain within one coherent policy domain.",
    "They merge correlation with causation: any chart where __M__ and a scary line both slope upward means __M__ caused the scare—without showing those two series even measure outcomes from the same domain as the motion.",
  ],
  "false-analogy": [
    "__M__ is just like repairing a bridge with tape—tape held once in a story, so __M__ must work identically without engineers checking loads.",
    "Running this reform is exactly like reconciling two budget line-items for __M__—same spreadsheet tabs, so spreadsheet habits prove on-the-ground safety outcomes on __M__.",
    "__M__ is like splitting a shared bill: bills are awkward, therefore any oversight that feels strict must be wrong about __M__ too.",
    "They compared __M__ to tightening a valve—valves squeak, so any mild friction means __M__ is tyranny, QED.",
    "__M__ oversight equals stacking planes in a movie montage—planes stack, so stacking imagery proves governance capacity for __M__, obviously.",
    "Fixing __M__ is like fixing a typo with whiteout—whiteout hides ink, so hiding problems proves their fiscal model on __M__.",
  ],
  "appeal-to-authority-fallacy": [
    "A viral headline about __M__ was shared once—headline buzz is peer review, so their specialist evidence is now irrelevant on __M__.",
    "An unnamed 'expert' in our handout agrees on __M__—a handout quote beats their peer-reviewed sources because mystery sounds official on __M__.",
    "A viral account mocked __M__ opponents—followers equal expert consensus, case closed on __M__.",
    "A genius from history would have loved our __M__ idea—they are not here to deny it, so their imagined blessing votes pro on __M__.",
    "A prestigious label was mentioned near our __M__ paragraph—brand aura transfers to our specific implementation plan by proximity alone on __M__.",
    "The word 'scientists' appeared in a blog about __M__—unspecified scientists beat their named studies because mystery is stronger science on __M__.",
  ],
  "bandwagon-appeal": [
    "Everyone in our office chat supports __M__—if you vote against us, you are choosing to be out of step forever, so ballot pro on __M__.",
    "Nine out of ten hallway conversations say yes to __M__—conversation counts determine truth, not trials or evidence on __M__.",
    "All trending tags last week backed __M__—trends are wisdom, and wisdom must erase your boring cost questions on __M__.",
    "Most people on one committee want __M__—committee vibes beat expert reports because headcount implies fairness on __M__.",
    "Everybody knows __M__ is obvious—if you ask who everybody is, you are rude and should lose speaker points on __M__.",
    "They are the only team still questioning __M__—minority opinion is automatically wrong because numbers equal morality on __M__.",
  ],
  "begging-the-question": [
    "We should pass __M__ because passing __M__ is the right thing, and the right thing is passing __M__—circle complete, applause on __M__.",
    "__M__ is good because good policies include __M__, and __M__ is a good policy by definition in our glossary entry we wrote.",
    "Opposing __M__ is wrong because opposing __M__ is wrong—if you need more words, you hate logic itself on __M__.",
    "Our side must win on __M__ since winning means choosing the better side, and we are the better side by assumption on __M__.",
    "__M__ should win because winners choose __M__—winners win, so circular reasoning is actually a spiral of truth on __M__.",
    "Bad faith opposes __M__; they oppose __M__; therefore they are bad faith—pure circle, no independent premise supplied on __M__.",
  ],
};

function build() {
  for (const t of techniques) {
    const tid = t.id;
    const lines = FLAWS[tid];
    if (!lines || lines.length !== 6) {
      throw new Error(`Expected 6 flaw lines for ${tid}, got ${lines?.length}`);
    }
  }
  const out = {
    version: 1,
    description:
      "Six flawed-argument templates per technique (placeholder __M__). Wording stays in the same broad domain as the motion: policy, stakeholders, implementation—no random cross-domain examples. Combined at runtime in lib/practice.ts with motions.json.",
    templates: FLAWS,
  };
  fs.writeFileSync(
    path.join(root, "content", "flaw-templates.json"),
    `${JSON.stringify(out, null, 2)}\n`,
    "utf8",
  );
  console.log("Wrote flaw-templates.json for", techniques.length, "techniques");
}

build();
