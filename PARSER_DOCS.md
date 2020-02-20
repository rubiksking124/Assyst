<!-- markdownlint-disable MD022 -->
# Assyst tag parser
(Written by matmen)

The general tag layout is `{name:arg1|arg2|...|argN}`  

---

## Users

### `{id:query}`
Returns a users ID  
If no query is provided, the invoking user will be used  

### `{user:query}`
Returns a users username  
If no query is provided, the invoking user will be used  

### `{nick:query}`
Returns a users nickname (or their username if they don't have a nickname)  
If no query is provided, the invoking user will be used  

### `{discrim:query}`
Returns a users discriminator  
If no query is provided, the invoking user will be used  

### `{tag:query}`
Returns a users tag (`Username#1234`)  
If no query is provided, the invoking user will be used  

### `{avatar:query}`
Returns a users avatar URL  
If no query is provided, the invoking user will be used  

### `{randuser}`
Returns a random users username

### `{tagowner}`
Returns the tag owners tag (if applicable)  

### `{me}`
Returns the bots username  

---

## Channels

### `{randchannel}`
Returns a random channels name  

### `{channelid}`
Returns the current channel's ID  

### `{channel}`
Returns the current channel's name  

---

## Servers

### `{channels}`
Returns the count of channels on the current server  

### `{members}`
Returns the count of members on the current server  

### `{owner}`
Returns the server owner's tag  

### `{serverid}`
Returns the servers ID  

### `{server}`
Returns the servers name  

---

## Messages

### `{dm}`
Returns whether the message was sent in DMs  

### `{messageid}`
Returns the messages ID  

### `{prefix}`
Returns the prefix used to invoke the command (if applicable)  

### `{tagname}`
Returns the name of the invoked tag (if applicable)  

### `{nsfw}`
Marks the tag as NSFW  

---

## Logic

### `{range:min|max}`
Returns an integer in the given range  

### `{choose:item1|item2|...|itemN}`
Returns a random given item

### `{select:x|item1|item2|...|itemN}`
Returns the xth item  

### `{set:name|value}`
Sets a temporary variable  

### `{get:name}`
Retrieves a temporary variable and returns it  

### `{iscript:script contents|filename override}`
Runs an image script. See [the ImageScript docs](https://gitlab.com/snippets/1736663) for more info  
`filename override`: An alternative file name to use

### `{note:content}`
Adds a note to a tag which will not be executed  

### `{ignore:content}`
Returns the given content without parsing it  

### `{eval:content}`
Executes the given contents using the tag parser.  
Useful with {ignore}  

### `{args}`
Fetches all comamnd arguments

### `{argsfrom:x}`
Returns all arguments starting from parameter x

### `{argsto:x}`
Returns all arguments starting from the first to the xth

### `{argsrange:x|y}`
Returns arguments in given range (starting from x, ending at y)

### `{arg:x}`
Returns the xth argument given by the invoking user (if applicable)  

### `{argslen}`
Returns the count of arguments given by the invoking user

### `{if:expression|then:match content|else:non-match content}`
Returns the `match content` if the given expression is truthy or the `non-match content` otherwise  

---

## Text Operations

### {replace:pattern|replacement|text}
Returns the given text with all `pattern` occurences replaced with the given `replacement`  

### `{replaceregex:pattern|replacement|text}`
Returns the given text with all `pattern` occurences replaced with the given `replacement`  
`pattern` needs to be a valid regular expression  

### `{upper:text}`
Returns the given text but in uppercase letters  

### `{lower:text}`
Returns the given text but in lowercase letters  

### `{trim:text}`
Trims whitespaces from the given text and returns it  

### `{url:content}`
URL encodes the given content and returns it  

### `{urlc:query}`
URL encodes the given content as a URL component and returns it  

### `{codeblock:text}`
Returns the given text in a codeblock  

### `{code:text}`
Returns the given text in code markup (in between backticks)  

### `{bold:text}`
Returns the given text as bold text  

### `{strikethrough:text}`
Returns the given text as strikethrough  

### `{length:text}`
Returns the length of the given text  

### `{limit:text|max_chars}`
Returns the first `max_chars` characters of the given text (defaults to 2000 characters)

---

## Time

### `{date:format|offset|override}`
Returns the current UTC time (if no offset and override is set) to match the given format  
Usable `format` keywords:  

- `unix`: Unix time
- `ssss`: Milliseconds
- `s`: Seconds (no padding)
- `ss`: Seconds
- `m`: Minutes (no padding)
- `mm`: Minutes
- `h`: Hours (no padding)
- `hh`: Hours
- `D`: Day (no padding)
- `DD`: Day
- `DDD`: Shortened Day Name
- `DDDD`: Day Name
- `M`: Month (no padding)
- `MM`: Month
- `MMM`: Shortened Month Name
- `MMMM`: Month Name
- `YY`: Last Two Digits Of The Year
- `YYYY`: Year
- `CCCC`: Century

`offset`: A valid timespan (e.g. `1d5h21s`)  
`override`: A valid time override (in unix ms), useful with `{joined}` (e.g. `{date:MMMM DD, YYYY hh:mm:ss|0|{joined:discord}}`)  

### `{joined:type|user}`
Returns the join timestamp of the given user (or the invoking user if no user is given)  
`type`: Either `discord` or `server`

---

## Math

### `{abs:value}`
Returns the absolute value  

### `{pi}`
Returns the constant Pi  

### `{e}`
Returns Euler's constant  

### `{min:val1|val2|...|valN}`
Returns the minimum value of the given arguments  

### `{max:val1|val2|...|valN}`
Returns the maximum value of the given arguments  

### `{round:value}`
Returns the rounded value  

### `{ceil:value}`
Returns the ceiled value  

### `{floor:value}`
Returns the floored value  

### `{sign:value}`
Returns either `1` or `-1`, matching the sign of the value  

### `{sin:value}`
Returns the sine of the value  

### `{cos:value}`
Returns the cosine of the value  

### `{tan:value}`
Returns the tangent of the value  

### `{sqrt:value}`
Returns the square root of the value  

### `{root:n|value}`
Returns the nth root of the value  

### `{math:expression}`
Calculates the given expression and returns it  

---

## Misc

### `{ping}`
Returns the ping time  

### `{haste:content}`
Uploads the given content to hastebin and returns the haste URL  

### `{haste:id}`
Retrieves the given haste ID (or URL) and returns the content  

### Code tags (`{language:code}`)
Code tags run code on gocodeit (e.g. `{js:console.log('hello world')}`)  
[Available languages available on gocodeit website](https://gocode.it/)  