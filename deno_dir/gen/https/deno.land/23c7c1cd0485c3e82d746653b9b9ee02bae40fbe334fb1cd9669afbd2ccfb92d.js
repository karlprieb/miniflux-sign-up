export class Tokenizer {
    constructor(rules = []) {
        this.rules = rules;
    }
    addRule(test, fn) {
        this.rules.push({ test, fn });
        return this;
    }
    tokenize(string, receiver = (token) => token) {
        function* generator(rules) {
            let index = 0;
            for (const rule of rules) {
                const result = rule.test(string);
                if (result) {
                    const { value, length } = result;
                    index += length;
                    string = string.slice(length);
                    const token = { ...rule.fn(value), index };
                    yield receiver(token);
                    yield* generator(rules);
                }
            }
        }
        const tokenGenerator = generator(this.rules);
        const tokens = [];
        for (const token of tokenGenerator) {
            tokens.push(token);
        }
        if (string.length) {
            throw new Error(`parser error: string not fully parsed! ${string.slice(0, 25)}`);
        }
        return tokens;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW5pemVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidG9rZW5pemVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQTZCQSxNQUFNLE9BQU8sU0FBUztJQUdwQixZQUFZLFFBQWdCLEVBQUU7UUFDNUIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDckIsQ0FBQztJQUVELE9BQU8sQ0FBQyxJQUFrQixFQUFFLEVBQW9CO1FBQzlDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDOUIsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsUUFBUSxDQUNOLE1BQWMsRUFDZCxXQUFXLENBQUMsS0FBWSxFQUFrQixFQUFFLENBQUMsS0FBSztRQUVsRCxRQUFRLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBYTtZQUMvQixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7WUFDZCxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtnQkFDeEIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDakMsSUFBSSxNQUFNLEVBQUU7b0JBQ1YsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUM7b0JBQ2pDLEtBQUssSUFBSSxNQUFNLENBQUM7b0JBQ2hCLE1BQU0sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUM5QixNQUFNLEtBQUssR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQztvQkFDM0MsTUFBTSxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ3RCLEtBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDekI7YUFDRjtRQUNILENBQUM7UUFDRCxNQUFNLGNBQWMsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRTdDLE1BQU0sTUFBTSxHQUFxQixFQUFFLENBQUM7UUFFcEMsS0FBSyxNQUFNLEtBQUssSUFBSSxjQUFjLEVBQUU7WUFDbEMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNwQjtRQUVELElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRTtZQUNqQixNQUFNLElBQUksS0FBSyxDQUNiLDBDQUEwQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUNoRSxDQUFDO1NBQ0g7UUFFRCxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDO0NBQ0YifQ==