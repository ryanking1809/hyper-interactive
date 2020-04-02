konami -> combo __ konami {% function(d) {
    const items = [d[0], ...(d[2].konami || [d[2]])]
    const string = items.map(i => i.string).join(" ")
    const keys = items.flatMap(i => i.keys)
    return {konami: items, keys, string}  
} %}
 | or {% function(d) {return d[0] } %}

or -> combo "|" or {% function(d) {
    const items = [d[0], ...(d[2].or || [d[2]])]
    const string = items.map(i => i.string).join("|")
    const keys = items.flatMap(i => i.keys)
    return {or: items, keys, string}  
} %}
| combo  {% function(d) {return d[0] } %}

combo -> modifiers "+" combo {% function(d) {
    const items = [d[0], ...(d[2].combo || [d[2]])]
    const string = items.map(i => i.string).join("+")
    const keys = items.flatMap(i => i.keys)
    return {combo: items, keys, string}
} %}
 | multiplier {% function(d) {return d[0] } %}
 
multiplier -> modifiers "*" num {% function(d) {return {multiplier: parseInt(d[2]), ...d[0], string: `${d[0].string}*${d[2]}` }} %}
| modifiers {% function(d) {return d[0]} %}

modifiers -> "!" ("^"|"_") p {% function(d) {return {not: true, direction: d[1][0], ...d[2], string: `!${d[1][0]}${d[2].string}` }} %}
| ("^"|"_") "!" p {% function(d) {return {not: true, direction: d[0][0], ...d[2], string: `${d[0][0]}!${d[2].string}`  }} %}
| "!" p {% function(d) {return {not: true, ...d[1], string: `!${d[1].string}` }} %}
| ("^"|"_") p {% function(d) {return {direction: d[0][0], ...d[1], string: `${d[0][0]}${d[1].string}` }} %}
| p {% function(d) {return d[0]} %}

p -> "(" konami ")" {% function(d) {return {...d[1], string: `(${d[1].string})`} } %}
 | key {% function(d) {return d[0] } %}
 
key -> (escapedChar | any | num) {% function(d) {return {key: d[0][0], keys: [d[0][0]], string: d[0][0] }} %}
escapedChar -> "\\" [()|!+_^*] {% function(d) {return d[1] } %}
any -> [^()|!+_^*0-9\s]:+    {% function(d) {return d[0].join("") } %}
num -> [0-9]:+        {% function(d) {return d[0].join("") } %}

__ -> [\s]:+    {% function(d) {return d[0].join("") } %}
