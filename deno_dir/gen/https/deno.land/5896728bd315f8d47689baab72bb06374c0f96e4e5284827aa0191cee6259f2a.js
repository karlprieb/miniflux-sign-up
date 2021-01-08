import { Tokenizer, } from "./tokenizer.ts";
function digits(value, count = 2) {
    return String(value).padStart(count, "0");
}
function createLiteralTestFunction(value) {
    return (string) => {
        return string.startsWith(value)
            ? { value, length: value.length }
            : undefined;
    };
}
function createMatchTestFunction(match) {
    return (string) => {
        const result = match.exec(string);
        if (result)
            return { value: result, length: result[0].length };
    };
}
const defaultRules = [
    {
        test: createLiteralTestFunction("yyyy"),
        fn: () => ({ type: "year", value: "numeric" }),
    },
    {
        test: createLiteralTestFunction("yy"),
        fn: () => ({ type: "year", value: "2-digit" }),
    },
    {
        test: createLiteralTestFunction("MM"),
        fn: () => ({ type: "month", value: "2-digit" }),
    },
    {
        test: createLiteralTestFunction("M"),
        fn: () => ({ type: "month", value: "numeric" }),
    },
    {
        test: createLiteralTestFunction("dd"),
        fn: () => ({ type: "day", value: "2-digit" }),
    },
    {
        test: createLiteralTestFunction("d"),
        fn: () => ({ type: "day", value: "numeric" }),
    },
    {
        test: createLiteralTestFunction("HH"),
        fn: () => ({ type: "hour", value: "2-digit" }),
    },
    {
        test: createLiteralTestFunction("H"),
        fn: () => ({ type: "hour", value: "numeric" }),
    },
    {
        test: createLiteralTestFunction("hh"),
        fn: () => ({
            type: "hour",
            value: "2-digit",
            hour12: true,
        }),
    },
    {
        test: createLiteralTestFunction("h"),
        fn: () => ({
            type: "hour",
            value: "numeric",
            hour12: true,
        }),
    },
    {
        test: createLiteralTestFunction("mm"),
        fn: () => ({ type: "minute", value: "2-digit" }),
    },
    {
        test: createLiteralTestFunction("m"),
        fn: () => ({ type: "minute", value: "numeric" }),
    },
    {
        test: createLiteralTestFunction("ss"),
        fn: () => ({ type: "second", value: "2-digit" }),
    },
    {
        test: createLiteralTestFunction("s"),
        fn: () => ({ type: "second", value: "numeric" }),
    },
    {
        test: createLiteralTestFunction("SSS"),
        fn: () => ({ type: "fractionalSecond", value: 3 }),
    },
    {
        test: createLiteralTestFunction("SS"),
        fn: () => ({ type: "fractionalSecond", value: 2 }),
    },
    {
        test: createLiteralTestFunction("S"),
        fn: () => ({ type: "fractionalSecond", value: 1 }),
    },
    {
        test: createLiteralTestFunction("a"),
        fn: (value) => ({
            type: "dayPeriod",
            value: value,
        }),
    },
    {
        test: createMatchTestFunction(/^(')(?<value>\\.|[^\']*)\1/),
        fn: (match) => ({
            type: "literal",
            value: match.groups.value,
        }),
    },
    {
        test: createMatchTestFunction(/^.+?\s*/),
        fn: (match) => ({
            type: "literal",
            value: match[0],
        }),
    },
];
export class DateTimeFormatter {
    constructor(formatString, rules = defaultRules) {
        const tokenizer = new Tokenizer(rules);
        this.#format = tokenizer.tokenize(formatString, ({ type, value, hour12 }) => {
            const result = {
                type,
                value,
            };
            if (hour12)
                result.hour12 = hour12;
            return result;
        });
    }
    #format;
    format(date, options = {}) {
        let string = "";
        const utc = options.timeZone === "UTC";
        for (const token of this.#format) {
            const type = token.type;
            switch (type) {
                case "year": {
                    const value = utc ? date.getUTCFullYear() : date.getFullYear();
                    switch (token.value) {
                        case "numeric": {
                            string += value;
                            break;
                        }
                        case "2-digit": {
                            string += digits(value, 2).slice(-2);
                            break;
                        }
                        default:
                            throw Error(`FormatterError: value "${token.value}" is not supported`);
                    }
                    break;
                }
                case "month": {
                    const value = (utc ? date.getUTCMonth() : date.getMonth()) + 1;
                    switch (token.value) {
                        case "numeric": {
                            string += value;
                            break;
                        }
                        case "2-digit": {
                            string += digits(value, 2);
                            break;
                        }
                        default:
                            throw Error(`FormatterError: value "${token.value}" is not supported`);
                    }
                    break;
                }
                case "day": {
                    const value = utc ? date.getUTCDate() : date.getDate();
                    switch (token.value) {
                        case "numeric": {
                            string += value;
                            break;
                        }
                        case "2-digit": {
                            string += digits(value, 2);
                            break;
                        }
                        default:
                            throw Error(`FormatterError: value "${token.value}" is not supported`);
                    }
                    break;
                }
                case "hour": {
                    let value = utc ? date.getUTCHours() : date.getHours();
                    value -= token.hour12 && date.getHours() > 12 ? 12 : 0;
                    switch (token.value) {
                        case "numeric": {
                            string += value;
                            break;
                        }
                        case "2-digit": {
                            string += digits(value, 2);
                            break;
                        }
                        default:
                            throw Error(`FormatterError: value "${token.value}" is not supported`);
                    }
                    break;
                }
                case "minute": {
                    const value = utc ? date.getUTCMinutes() : date.getMinutes();
                    switch (token.value) {
                        case "numeric": {
                            string += value;
                            break;
                        }
                        case "2-digit": {
                            string += digits(value, 2);
                            break;
                        }
                        default:
                            throw Error(`FormatterError: value "${token.value}" is not supported`);
                    }
                    break;
                }
                case "second": {
                    const value = utc ? date.getUTCSeconds() : date.getSeconds();
                    switch (token.value) {
                        case "numeric": {
                            string += value;
                            break;
                        }
                        case "2-digit": {
                            string += digits(value, 2);
                            break;
                        }
                        default:
                            throw Error(`FormatterError: value "${token.value}" is not supported`);
                    }
                    break;
                }
                case "fractionalSecond": {
                    const value = utc
                        ? date.getUTCMilliseconds()
                        : date.getMilliseconds();
                    string += digits(value, Number(token.value));
                    break;
                }
                case "timeZoneName": {
                    break;
                }
                case "dayPeriod": {
                    string += token.value ? (date.getHours() >= 12 ? "PM" : "AM") : "";
                    break;
                }
                case "literal": {
                    string += token.value;
                    break;
                }
                default:
                    throw Error(`FormatterError: { ${token.type} ${token.value} }`);
            }
        }
        return string;
    }
    parseToParts(string) {
        const parts = [];
        for (const token of this.#format) {
            const type = token.type;
            let value = "";
            switch (token.type) {
                case "year": {
                    switch (token.value) {
                        case "numeric": {
                            value = /^\d{1,4}/.exec(string)?.[0];
                            break;
                        }
                        case "2-digit": {
                            value = /^\d{1,2}/.exec(string)?.[0];
                            break;
                        }
                    }
                    break;
                }
                case "month": {
                    switch (token.value) {
                        case "numeric": {
                            value = /^\d{1,2}/.exec(string)?.[0];
                            break;
                        }
                        case "2-digit": {
                            value = /^\d{2}/.exec(string)?.[0];
                            break;
                        }
                        case "narrow": {
                            value = /^[a-zA-Z]+/.exec(string)?.[0];
                            break;
                        }
                        case "short": {
                            value = /^[a-zA-Z]+/.exec(string)?.[0];
                            break;
                        }
                        case "long": {
                            value = /^[a-zA-Z]+/.exec(string)?.[0];
                            break;
                        }
                        default:
                            throw Error(`ParserError: value "${token.value}" is not supported`);
                    }
                    break;
                }
                case "day": {
                    switch (token.value) {
                        case "numeric": {
                            value = /^\d{1,2}/.exec(string)?.[0];
                            break;
                        }
                        case "2-digit": {
                            value = /^\d{2}/.exec(string)?.[0];
                            break;
                        }
                        default:
                            throw Error(`ParserError: value "${token.value}" is not supported`);
                    }
                    break;
                }
                case "hour": {
                    switch (token.value) {
                        case "numeric": {
                            value = /^\d{1,2}/.exec(string)?.[0];
                            if (token.hour12 && parseInt(value) > 12) {
                                console.error(`Trying to parse hour greater than 12. Use 'H' instead of 'h'.`);
                            }
                            break;
                        }
                        case "2-digit": {
                            value = /^\d{2}/.exec(string)?.[0];
                            if (token.hour12 && parseInt(value) > 12) {
                                console.error(`Trying to parse hour greater than 12. Use 'HH' instead of 'hh'.`);
                            }
                            break;
                        }
                        default:
                            throw Error(`ParserError: value "${token.value}" is not supported`);
                    }
                    break;
                }
                case "minute": {
                    switch (token.value) {
                        case "numeric": {
                            value = /^\d{1,2}/.exec(string)?.[0];
                            break;
                        }
                        case "2-digit": {
                            value = /^\d{2}/.exec(string)?.[0];
                            break;
                        }
                        default:
                            throw Error(`ParserError: value "${token.value}" is not supported`);
                    }
                    break;
                }
                case "second": {
                    switch (token.value) {
                        case "numeric": {
                            value = /^\d{1,2}/.exec(string)?.[0];
                            break;
                        }
                        case "2-digit": {
                            value = /^\d{2}/.exec(string)?.[0];
                            break;
                        }
                        default:
                            throw Error(`ParserError: value "${token.value}" is not supported`);
                    }
                    break;
                }
                case "fractionalSecond": {
                    value = new RegExp(`^\\d{${token.value}}`).exec(string)?.[0];
                    break;
                }
                case "timeZoneName": {
                    value = token.value;
                    break;
                }
                case "dayPeriod": {
                    value = /^(A|P)M/.exec(string)?.[0];
                    break;
                }
                case "literal": {
                    if (!string.startsWith(token.value)) {
                        throw Error(`Literal "${token.value}" not found "${string.slice(0, 25)}"`);
                    }
                    value = token.value;
                    break;
                }
                default:
                    throw Error(`${token.type} ${token.value}`);
            }
            if (!value) {
                throw Error(`value not valid for token { ${type} ${value} } ${string.slice(0, 25)}`);
            }
            parts.push({ type, value });
            string = string.slice(value.length);
        }
        if (string.length) {
            throw Error(`datetime string was not fully parsed! ${string.slice(0, 25)}`);
        }
        return parts;
    }
    sortDateTimeFormatPart(parts) {
        let result = [];
        const typeArray = [
            "year",
            "month",
            "day",
            "hour",
            "minute",
            "second",
            "fractionalSecond",
        ];
        for (const type of typeArray) {
            const current = parts.findIndex((el) => el.type === type);
            if (current !== -1) {
                result = result.concat(parts.splice(current, 1));
            }
        }
        result = result.concat(parts);
        return result;
    }
    partsToDate(parts) {
        const date = new Date();
        const utc = parts.find((part) => part.type === "timeZoneName" && part.value === "UTC");
        utc ? date.setUTCHours(0, 0, 0, 0) : date.setHours(0, 0, 0, 0);
        for (const part of parts) {
            switch (part.type) {
                case "year": {
                    const value = Number(part.value.padStart(4, "20"));
                    utc ? date.setUTCFullYear(value) : date.setFullYear(value);
                    break;
                }
                case "month": {
                    const value = Number(part.value) - 1;
                    utc ? date.setUTCMonth(value) : date.setMonth(value);
                    break;
                }
                case "day": {
                    const value = Number(part.value);
                    utc ? date.setUTCDate(value) : date.setDate(value);
                    break;
                }
                case "hour": {
                    let value = Number(part.value);
                    const dayPeriod = parts.find((part) => part.type === "dayPeriod");
                    if (dayPeriod?.value === "PM")
                        value += 12;
                    utc ? date.setUTCHours(value) : date.setHours(value);
                    break;
                }
                case "minute": {
                    const value = Number(part.value);
                    utc ? date.setUTCMinutes(value) : date.setMinutes(value);
                    break;
                }
                case "second": {
                    const value = Number(part.value);
                    utc ? date.setUTCSeconds(value) : date.setSeconds(value);
                    break;
                }
                case "fractionalSecond": {
                    const value = Number(part.value);
                    utc ? date.setUTCMilliseconds(value) : date.setMilliseconds(value);
                    break;
                }
            }
        }
        return date;
    }
    parse(string) {
        const parts = this.parseToParts(string);
        const sortParts = this.sortDateTimeFormatPart(parts);
        return this.partsToDate(sortParts);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZm9ybWF0dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFNTCxTQUFTLEdBQ1YsTUFBTSxnQkFBZ0IsQ0FBQztBQUV4QixTQUFTLE1BQU0sQ0FBQyxLQUFzQixFQUFFLEtBQUssR0FBRyxDQUFDO0lBQy9DLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDNUMsQ0FBQztBQTRCRCxTQUFTLHlCQUF5QixDQUFDLEtBQWE7SUFDOUMsT0FBTyxDQUFDLE1BQWMsRUFBYyxFQUFFO1FBQ3BDLE9BQU8sTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUM7WUFDN0IsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ2pDLENBQUMsQ0FBQyxTQUFTLENBQUM7SUFDaEIsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQUVELFNBQVMsdUJBQXVCLENBQUMsS0FBYTtJQUM1QyxPQUFPLENBQUMsTUFBYyxFQUFjLEVBQUU7UUFDcEMsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNsQyxJQUFJLE1BQU07WUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ2pFLENBQUMsQ0FBQztBQUNKLENBQUM7QUFHRCxNQUFNLFlBQVksR0FBRztJQUNuQjtRQUNFLElBQUksRUFBRSx5QkFBeUIsQ0FBQyxNQUFNLENBQUM7UUFDdkMsRUFBRSxFQUFFLEdBQW1CLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUM7S0FDL0Q7SUFDRDtRQUNFLElBQUksRUFBRSx5QkFBeUIsQ0FBQyxJQUFJLENBQUM7UUFDckMsRUFBRSxFQUFFLEdBQW1CLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUM7S0FDL0Q7SUFFRDtRQUNFLElBQUksRUFBRSx5QkFBeUIsQ0FBQyxJQUFJLENBQUM7UUFDckMsRUFBRSxFQUFFLEdBQW1CLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUM7S0FDaEU7SUFDRDtRQUNFLElBQUksRUFBRSx5QkFBeUIsQ0FBQyxHQUFHLENBQUM7UUFDcEMsRUFBRSxFQUFFLEdBQW1CLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUM7S0FDaEU7SUFDRDtRQUNFLElBQUksRUFBRSx5QkFBeUIsQ0FBQyxJQUFJLENBQUM7UUFDckMsRUFBRSxFQUFFLEdBQW1CLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUM7S0FDOUQ7SUFDRDtRQUNFLElBQUksRUFBRSx5QkFBeUIsQ0FBQyxHQUFHLENBQUM7UUFDcEMsRUFBRSxFQUFFLEdBQW1CLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUM7S0FDOUQ7SUFFRDtRQUNFLElBQUksRUFBRSx5QkFBeUIsQ0FBQyxJQUFJLENBQUM7UUFDckMsRUFBRSxFQUFFLEdBQW1CLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUM7S0FDL0Q7SUFDRDtRQUNFLElBQUksRUFBRSx5QkFBeUIsQ0FBQyxHQUFHLENBQUM7UUFDcEMsRUFBRSxFQUFFLEdBQW1CLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUM7S0FDL0Q7SUFDRDtRQUNFLElBQUksRUFBRSx5QkFBeUIsQ0FBQyxJQUFJLENBQUM7UUFDckMsRUFBRSxFQUFFLEdBQW1CLEVBQUUsQ0FBQyxDQUFDO1lBQ3pCLElBQUksRUFBRSxNQUFNO1lBQ1osS0FBSyxFQUFFLFNBQVM7WUFDaEIsTUFBTSxFQUFFLElBQUk7U0FDYixDQUFDO0tBQ0g7SUFDRDtRQUNFLElBQUksRUFBRSx5QkFBeUIsQ0FBQyxHQUFHLENBQUM7UUFDcEMsRUFBRSxFQUFFLEdBQW1CLEVBQUUsQ0FBQyxDQUFDO1lBQ3pCLElBQUksRUFBRSxNQUFNO1lBQ1osS0FBSyxFQUFFLFNBQVM7WUFDaEIsTUFBTSxFQUFFLElBQUk7U0FDYixDQUFDO0tBQ0g7SUFDRDtRQUNFLElBQUksRUFBRSx5QkFBeUIsQ0FBQyxJQUFJLENBQUM7UUFDckMsRUFBRSxFQUFFLEdBQW1CLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUM7S0FDakU7SUFDRDtRQUNFLElBQUksRUFBRSx5QkFBeUIsQ0FBQyxHQUFHLENBQUM7UUFDcEMsRUFBRSxFQUFFLEdBQW1CLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUM7S0FDakU7SUFDRDtRQUNFLElBQUksRUFBRSx5QkFBeUIsQ0FBQyxJQUFJLENBQUM7UUFDckMsRUFBRSxFQUFFLEdBQW1CLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUM7S0FDakU7SUFDRDtRQUNFLElBQUksRUFBRSx5QkFBeUIsQ0FBQyxHQUFHLENBQUM7UUFDcEMsRUFBRSxFQUFFLEdBQW1CLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUM7S0FDakU7SUFDRDtRQUNFLElBQUksRUFBRSx5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