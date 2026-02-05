import { calculateWilsonScore } from "./wilsonScore";

function assert(condition: boolean, message: string) {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}

function testWilsonScore() {
    console.log("Testing Wilson Score...");

    // Case 1: No votes
    assert(calculateWilsonScore(0, 0) === 0, "0/0 should be 0");

    // Case 2: Only upvotes (100% positive)
    // 1 up, 0 down. n=1, p=1.
    // Lower bound should be somewhat high but less than 1.
    const score1 = calculateWilsonScore(1, 0);
    console.log(`1 up, 0 down: ${score1}`);
    assert(score1 > 0 && score1 < 1, "1/0 should be > 0 and < 1");

    // Case 3: More data = higher confidence
    // 10 up, 0 down vs 1 up, 0 down
    const score2 = calculateWilsonScore(10, 0);
    console.log(`10 up, 0 down: ${score2}`);
    assert(score2 > score1, "10/0 should be > 1/0");

    // Case 4: Equal up/down (50%)
    const score3 = calculateWilsonScore(5, 5);
    console.log(`5 up, 5 down: ${score3}`);
    // Should be significantly lower than 50% because of lower bound logic?
    // Actually Wilson score for 50% p converges to 0.5 with large n, but for small n it might be lower.
    // But wait, Wilson score is lower bound of CI.
    // Center is p.
    // If p = 0.5, lower bound is < 0.5.
    assert(score3 < 0.5, "5/5 should be < 0.5 (lower bound)");

    // Case 5: 100 up, 100 down
    const score4 = calculateWilsonScore(100, 100);
    console.log(`100 up, 100 down: ${score4}`);
    assert(score4 > score3, "100/100 should be > 5/5 (closer to 0.5)");

    console.log("All tests passed!");
}

testWilsonScore();
