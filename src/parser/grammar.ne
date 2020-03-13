konami -> combo __ konami {% function(d) {
    const items = [d[0], ...(d[2].konami || [d[2]])]
    const string = items.map(i => i.string).join(" ")
    const maxKeys = items.map(i => i.maxKeys).reduce((a, b) => a + b, 0)
    return {konami: items, maxKeys, string}  
} %}
 | or {% function(d) {return d[0] } %}

or -> combo "|" or {% function(d) {
    const items = [d[0], ...(d[2].or || [d[2]])]
    const string = items.map(i => i.string).join("|")
    const maxKeys = Math.max(...items.map(i => i.maxKeys))
    return {or: items, maxKeys, string}  
} %}
| combo  {% function(d) {return d[0] } %}

combo -> not "+" combo {% function(d) {
    const items = [d[0], ...(d[2].combo || [d[2]])]
    const string = items.map(i => i.string).join("+")
    const maxKeys = items.map(i => i.maxKeys).reduce((a, b) => a + b, 0)
    return {combo: items, maxKeys, string}
} %}
 | not {% function(d) {return d[0] } %}
 
not -> "!" not  {% function(d) {return {not: d[1], maxKeys: d[1].maxKeys, string: `!${d[1].string}` }} %}
| p {% function(d) {return d[0] } %}

p -> "(" konami ")" {% function(d) {return {...d[1], string: `(${d[1].string})`} } %}
 | key {% function(d) {return d[0] } %}
 
key -> (escapedChar | any) {% function(d) {return {key: d[0][0], maxKeys: 1, string: d[0][0] }} %}
escapedChar -> "\\" [()|!+] {% function(d) {return d[1] } %}
any -> [^()|!+\s]:+    {% function(d) {return d[0].join("") } %}

__ -> [\s]:+    {% function(d) {return d[0].join("") } %}
