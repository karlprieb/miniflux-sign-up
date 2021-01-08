import { bold, gray, green, red, stripColor, white } from "../fmt/colors.ts";
import { diff, DiffType } from "./_diff.ts";
const CAN_NOT_DISPLAY = "[Cannot display]";
export class AssertionError extends Error {
    constructor(message) {
        super(message);
        this.name = "AssertionError";
    }
}
export function _format(v) {
    return globalThis.Deno
        ? Deno.inspect(v, {
            depth: Infinity,
            sorted: true,
            trailingComma: true,
            compact: false,
            iterableLimit: Infinity,
        })
        : `"${String(v).replace(/(?=["\\])/g, "\\")}"`;
}
function createColor(diffType) {
    switch (diffType) {
        case DiffType.added:
            return (s) => green(bold(s));
        case DiffType.removed:
            return (s) => red(bold(s));
        default:
            return white;
    }
}
function createSign(diffType) {
    switch (diffType) {
        case DiffType.added:
            return "+   ";
        case DiffType.removed:
            return "-   ";
        default:
            return "    ";
    }
}
function buildMessage(diffResult) {
    const messages = [];
    messages.push("");
    messages.push("");
    messages.push(`    ${gray(bold("[Diff]"))} ${red(bold("Actual"))} / ${green(bold("Expected"))}`);
    messages.push("");
    messages.push("");
    diffResult.forEach((result) => {
        const c = createColor(result.type);
        messages.push(c(`${createSign(result.type)}${result.value}`));
    });
    messages.push("");
    return messages;
}
function isKeyedCollection(x) {
    return [Symbol.iterator, "size"].every((k) => k in x);
}
export function equal(c, d) {
    const seen = new Map();
    return (function compare(a, b) {
        if (a &&
            b &&
            ((a instanceof RegExp && b instanceof RegExp) ||
                (a instanceof URL && b instanceof URL))) {
            return String(a) === String(b);
        }
        if (a instanceof Date && b instanceof Date) {
            const aTime = a.getTime();
            const bTime = b.getTime();
            if (Number.isNaN(aTime) && Number.isNaN(bTime)) {
                return true;
            }
            return a.getTime() === b.getTime();
        }
        if (Object.is(a, b)) {
            return true;
        }
        if (a && typeof a === "object" && b && typeof b === "object") {
            if (seen.get(a) === b) {
                return true;
            }
            if (Object.keys(a || {}).length !== Object.keys(b || {}).length) {
                return false;
            }
            if (isKeyedCollection(a) && isKeyedCollection(b)) {
                if (a.size !== b.size) {
                    return false;
                }
                let unmatchedEntries = a.size;
                for (const [aKey, aValue] of a.entries()) {
                    for (const [bKey, bValue] of b.entries()) {
                        if ((aKey === aValue && bKey === bValue && compare(aKey, bKey)) ||
                            (compare(aKey, bKey) && compare(aValue, bValue))) {
                            unmatchedEntries--;
                        }
                    }
                }
                return unmatchedEntries === 0;
            }
            const merged = { ...a, ...b };
            for (const key in merged) {
                if (!compare(a && a[key], b && b[key])) {
                    return false;
                }
            }
            seen.set(a, b);
            return true;
        }
        return false;
    })(c, d);
}
export function assert(expr, msg = "") {
    if (!expr) {
        throw new AssertionError(msg);
    }
}
export function assertEquals(actual, expected, msg) {
    if (equal(actual, expected)) {
        return;
    }
    let message = "";
    const actualString = _format(actual);
    const expectedString = _format(expected);
    try {
        const diffResult = diff(actualString.split("\n"), expectedString.split("\n"));
        const diffMsg = buildMessage(diffResult).join("\n");
        message = `Values are not equal:\n${diffMsg}`;
    }
    catch (e) {
        message = `\n${red(CAN_NOT_DISPLAY)} + \n\n`;
    }
    if (msg) {
        message = msg;
    }
    throw new AssertionError(message);
}
export function assertNotEquals(actual, expected, msg) {
    if (!equal(actual, expected)) {
        return;
    }
    let actualString;
    let expectedString;
    try {
        actualString = String(actual);
    }
    catch (e) {
        actualString = "[Cannot display]";
    }
    try {
        expectedString = String(expected);
    }
    catch (e) {
        expectedString = "[Cannot display]";
    }
    if (!msg) {
        msg = `actual: ${actualString} expected: ${expectedString}`;
    }
    throw new AssertionError(msg);
}
export function assertStrictEquals(actual, expected, msg) {
    if (actual === expected) {
        return;
    }
    let message;
    if (msg) {
        message = msg;
    }
    else {
        const actualString = _format(actual);
        const expectedString = _format(expected);
        if (actualString === expectedString) {
            const withOffset = actualString
                .split("\n")
                .map((l) => `    ${l}`)
                .join("\n");
            message =
                `Values have the same structure but are not reference-equal:\n\n${red(withOffset)}\n`;
        }
        else {
            try {
                const diffResult = diff(actualString.split("\n"), expectedString.split("\n"));
                const diffMsg = buildMessage(diffResult).join("\n");
                message = `Values are not strictly equal:\n${diffMsg}`;
            }
            catch (e) {
                message = `\n${red(CAN_NOT_DISPLAY)} + \n\n`;
            }
        }
    }
    throw new AssertionError(message);
}
export function assertNotStrictEquals(actual, expected, msg) {
    if (actual !== expected) {
        return;
    }
    throw new AssertionError(msg ?? `Expected "actual" to be strictly unequal to: ${_format(actual)}\n`);
}
export function assertExists(actual, msg) {
    if (actual === undefined || actual === null) {
        if (!msg) {
            msg =
                `actual: "${actual}" expected to match anything but null or undefined`;
        }
        throw new AssertionError(msg);
    }
}
export function assertStringIncludes(actual, expected, msg) {
    if (!actual.includes(expected)) {
        if (!msg) {
            msg = `actual: "${actual}" expected to contain: "${expected}"`;
        }
        throw new AssertionError(msg);
    }
}
export function assertArrayIncludes(actual, expected, msg) {
    const missing = [];
    for (let i = 0; i < expected.length; i++) {
        let found = false;
        for (let j = 0; j < actual.length; j++) {
            if (equal(expected[i], actual[j])) {
                found = true;
                break;
            }
        }
        if (!found) {
            missing.push(expected[i]);
        }
    }
    if (missing.length === 0) {
        return;
    }
    if (!msg) {
        msg = `actual: "${_format(actual)}" expected to include: "${_format(expected)}"\nmissing: ${_format(missing)}`;
    }
    throw new AssertionError(msg);
}
export function assertMatch(actual, expected, msg) {
    if (!expected.test(actual)) {
        if (!msg) {
            msg = `actual: "${actual}" expected to match: "${expected}"`;
        }
        throw new AssertionError(msg);
    }
}
export function assertNotMatch(actual, expected, msg) {
    if (expected.test(actual)) {
        if (!msg) {
            msg = `actual: "${actual}" expected to not match: "${expected}"`;
        }
        throw new AssertionError(msg);
    }
}
export function assertObjectMatch(actual, expected) {
    const seen = new WeakMap();
    return assertEquals((function filter(a, b) {
        if ((seen.has(a)) && (seen.get(a) === b)) {
            return a;
        }
        seen.set(a, b);
        const filtered = {};
        const entries = [
            ...Object.getOwnPropertyNames(a),
            ...Object.getOwnPropertySymbols(a),
        ]
            .filter((key) => key in b)
            .map((key) => [key, a[key]]);
        for (const [key, value] of entries) {
            if (typeof value === "object") {
                const subset = b[key];
                if ((typeof subset === "object") && (subset)) {
                    filtered[key] = filter(value, subset);
                    continue;
                }
            }
            filtered[key] = value;
        }
        return filtered;
    })(actual, expected), expected);
}
export function fail(msg) {
    assert(false, `Failed assertion${msg ? `: ${msg}` : "."}`);
}
export function assertThrows(fn, ErrorClass, msgIncludes = "", msg) {
    let doesThrow = false;
    let error = null;
    try {
        fn();
    }
    catch (e) {
        if (e instanceof Error === false) {
            throw new AssertionError("A non-Error object was thrown.");
        }
        if (ErrorClass && !(e instanceof ErrorClass)) {
            msg =
                `Expected error to be instance of "${ErrorClass.name}", but was "${e.constructor.name}"${msg ? `: ${msg}` : "."}`;
            throw new AssertionError(msg);
        }
        if (msgIncludes &&
            !stripColor(e.message).includes(stripColor(msgIncludes))) {
            msg =
                `Expected error message to include "${msgIncludes}", but got "${e.message}"${msg ? `: ${msg}` : "."}`;
            throw new AssertionError(msg);
        }
        doesThrow = true;
        error = e;
    }
    if (!doesThrow) {
        msg = `Expected function to throw${msg ? `: ${msg}` : "."}`;
        throw new AssertionError(msg);
    }
    return error;
}
export async function assertThrowsAsync(fn, ErrorClass, msgIncludes = "", msg) {
    let doesThrow = false;
    let error = null;
    try {
        await fn();
    }
    catch (e) {
        if (e instanceof Error === false) {
            throw new AssertionError("A non-Error object was thrown or rejected.");
        }
        if (ErrorClass && !(e instanceof ErrorClass)) {
            msg =
                `Expected error to be instance of "${ErrorClass.name}", but got "${e.name}"${msg ? `: ${msg}` : "."}`;
            throw new AssertionError(msg);
        }
        if (msgIncludes &&
            !stripColor(e.message).includes(stripColor(msgIncludes))) {
            msg =
                `Expected error message to include "${msgIncludes}", but got "${e.message}"${msg ? `: ${msg}` : "."}`;
            throw new AssertionError(msg);
        }
        doesThrow = true;
        error = e;
    }
    if (!doesThrow) {
        msg = `Expected function to throw${msg ? `: ${msg}` : "."}`;
        throw new AssertionError(msg);
    }
    return error;
}
export function unimplemented(msg) {
    throw new AssertionError(msg || "unimplemented");
}
export function unreachable() {
    throw new AssertionError("unreachable");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXJ0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFzc2VydHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBSUEsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDN0UsT0FBTyxFQUFFLElBQUksRUFBYyxRQUFRLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFeEQsTUFBTSxlQUFlLEdBQUcsa0JBQWtCLENBQUM7QUFPM0MsTUFBTSxPQUFPLGNBQWUsU0FBUSxLQUFLO0lBQ3ZDLFlBQVksT0FBZTtRQUN6QixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDZixJQUFJLENBQUMsSUFBSSxHQUFHLGdCQUFnQixDQUFDO0lBQy9CLENBQUM7Q0FDRjtBQU9ELE1BQU0sVUFBVSxPQUFPLENBQUMsQ0FBVTtJQUNoQyxPQUFPLFVBQVUsQ0FBQyxJQUFJO1FBQ3BCLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRTtZQUNoQixLQUFLLEVBQUUsUUFBUTtZQUNmLE1BQU0sRUFBRSxJQUFJO1lBQ1osYUFBYSxFQUFFLElBQUk7WUFDbkIsT0FBTyxFQUFFLEtBQUs7WUFDZCxhQUFhLEVBQUUsUUFBUTtTQUN4QixDQUFDO1FBQ0YsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQztBQUNuRCxDQUFDO0FBTUQsU0FBUyxXQUFXLENBQUMsUUFBa0I7SUFDckMsUUFBUSxRQUFRLEVBQUU7UUFDaEIsS0FBSyxRQUFRLENBQUMsS0FBSztZQUNqQixPQUFPLENBQUMsQ0FBUyxFQUFVLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0MsS0FBSyxRQUFRLENBQUMsT0FBTztZQUNuQixPQUFP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